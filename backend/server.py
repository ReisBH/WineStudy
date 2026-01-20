from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request, status
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'winestudy-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DAYS = 7

app = FastAPI(title="WineStudy API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ======================== MODELS ========================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    preferred_language: str = "pt"
    created_at: datetime

class CountryResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    country_id: str
    name_pt: str
    name_en: str
    world_type: str  # old_world or new_world
    flag_emoji: str
    description_pt: str
    description_en: str
    image_url: Optional[str] = None

class RegionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    region_id: str
    country_id: str
    name: str
    description_pt: str
    description_en: str
    terroir: Dict[str, Any]
    climate: Dict[str, Any]
    appellations: List[str]
    main_grapes: List[str]
    wine_styles: List[str]

class GrapeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    grape_id: str
    name: str
    grape_type: str  # white or red
    origin_country: str
    description_pt: str
    description_en: str
    aromatic_notes: List[str]
    flavor_notes: List[str]
    structure: Dict[str, Any]
    aging_potential: str
    best_regions: List[str]
    climate_preference: str
    image_url: Optional[str] = None

class AromaTagResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    tag_id: str
    name_pt: str
    name_en: str
    category: str
    emoji: str

class TastingNoteCreate(BaseModel):
    wine_name: str
    vintage: Optional[int] = None
    grape_ids: List[str] = []
    region_id: Optional[str] = None
    appearance: Dict[str, Any]
    nose: Dict[str, Any]
    palate: Dict[str, Any]
    conclusion: Dict[str, Any]
    notes: Optional[str] = None

class TastingNoteResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    tasting_id: str
    user_id: str
    wine_name: str
    vintage: Optional[int] = None
    grape_ids: List[str]
    region_id: Optional[str] = None
    appearance: Dict[str, Any]
    nose: Dict[str, Any]
    palate: Dict[str, Any]
    conclusion: Dict[str, Any]
    notes: Optional[str] = None
    created_at: datetime

class StudyTrackResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    track_id: str
    level: str  # basic, intermediate, advanced
    title_pt: str
    title_en: str
    description_pt: str
    description_en: str
    lessons_count: int
    image_url: Optional[str] = None

class LessonResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    lesson_id: str
    track_id: str
    order: int
    title_pt: str
    title_en: str
    content_pt: str
    content_en: str
    duration_minutes: int

class QuizQuestionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    question_id: str
    lesson_id: Optional[str] = None
    track_id: str
    question_type: str  # multiple_choice, true_false, case_study
    question_pt: str
    question_en: str
    options_pt: List[str]
    options_en: List[str]
    correct_answer: int
    explanation_pt: str
    explanation_en: str

class QuizAnswerSubmit(BaseModel):
    question_id: str
    selected_answer: int

class UserProgressResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    completed_lessons: List[str]
    quiz_scores: Dict[str, int]
    total_tastings: int
    current_streak: int
    badges: List[str]

# ======================== AUTHENTICATION ========================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_jwt_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    # Check cookie first
    session_token = request.cookies.get("session_token")
    
    # Then check Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if it's a session token (Google OAuth)
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if session:
        expires_at = session.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        
        user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    
    # Try JWT token
    try:
        payload = jwt.decode(session_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ======================== AUTH ROUTES ========================

@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, response: Response):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hash_password(user_data.password),
        "picture": None,
        "preferred_language": "pt",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create JWT token
    token = create_jwt_token(user_id)
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_DAYS * 24 * 60 * 60
    )
    
    # Initialize user progress
    await db.user_progress.insert_one({
        "user_id": user_id,
        "completed_lessons": [],
        "quiz_scores": {},
        "total_tastings": 0,
        "current_streak": 0,
        "badges": [],
        "last_activity": datetime.now(timezone.utc).isoformat()
    })
    
    return UserResponse(
        user_id=user_id,
        email=user_data.email,
        name=user_data.name,
        picture=None,
        preferred_language="pt",
        created_at=datetime.now(timezone.utc)
    )

@api_router.post("/auth/login")
async def login(user_data: UserLogin, response: Response):
    user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user_data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["user_id"])
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_DAYS * 24 * 60 * 60
    )
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
        "preferred_language": user.get("preferred_language", "pt"),
        "token": token
    }

# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
@api_router.post("/auth/session")
async def process_google_session(request: Request, response: Response):
    """Process Google OAuth session_id and create local session"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Exchange session_id for user data from Emergent Auth
    async with httpx.AsyncClient() as client_http:
        try:
            auth_response = await client_http.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            auth_data = auth_response.json()
        except Exception as e:
            logger.error(f"Auth error: {e}")
            raise HTTPException(status_code=401, detail="Authentication failed")
    
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    # Find or create user
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "preferred_language": "pt",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        
        # Initialize user progress
        await db.user_progress.insert_one({
            "user_id": user_id,
            "completed_lessons": [],
            "quiz_scores": {},
            "total_tastings": 0,
            "current_streak": 0,
            "badges": [],
            "last_activity": datetime.now(timezone.utc).isoformat()
        })
    
    # Store session
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "preferred_language": "pt"
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(user: dict = Depends(get_current_user)):
    created_at = user.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        picture=user.get("picture"),
        preferred_language=user.get("preferred_language", "pt"),
        created_at=created_at
    )

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out successfully"}

@api_router.put("/auth/language")
async def update_language(request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    language = body.get("language", "pt")
    if language not in ["pt", "en"]:
        raise HTTPException(status_code=400, detail="Invalid language")
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"preferred_language": language}}
    )
    return {"message": "Language updated", "language": language}

# ======================== WINE DATA ROUTES ========================

@api_router.get("/countries", response_model=List[CountryResponse])
async def get_countries(world_type: Optional[str] = None):
    query = {}
    if world_type:
        query["world_type"] = world_type
    
    countries = await db.countries.find(query, {"_id": 0}).to_list(100)
    return countries

@api_router.get("/countries/{country_id}", response_model=CountryResponse)
async def get_country(country_id: str):
    country = await db.countries.find_one({"country_id": country_id}, {"_id": 0})
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    return country

@api_router.get("/regions", response_model=List[RegionResponse])
async def get_regions(country_id: Optional[str] = None, grape: Optional[str] = None):
    query = {}
    if country_id:
        query["country_id"] = country_id
    if grape:
        query["main_grapes"] = grape
    
    regions = await db.regions.find(query, {"_id": 0}).to_list(500)
    return regions

@api_router.get("/regions/{region_id}", response_model=RegionResponse)
async def get_region(region_id: str):
    region = await db.regions.find_one({"region_id": region_id}, {"_id": 0})
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    return region

@api_router.get("/grapes", response_model=List[GrapeResponse])
async def get_grapes(
    grape_type: Optional[str] = None,
    aroma: Optional[str] = None,
    region: Optional[str] = None
):
    query = {}
    if grape_type:
        query["grape_type"] = grape_type
    if aroma:
        query["$or"] = [{"aromatic_notes": aroma}, {"flavor_notes": aroma}]
    if region:
        query["best_regions"] = region
    
    grapes = await db.grapes.find(query, {"_id": 0}).to_list(200)
    return grapes

@api_router.get("/grapes/{grape_id}", response_model=GrapeResponse)
async def get_grape(grape_id: str):
    grape = await db.grapes.find_one({"grape_id": grape_id}, {"_id": 0})
    if not grape:
        raise HTTPException(status_code=404, detail="Grape not found")
    return grape

@api_router.get("/aromas", response_model=List[AromaTagResponse])
async def get_aromas(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    
    aromas = await db.aroma_tags.find(query, {"_id": 0}).to_list(100)
    return aromas

@api_router.get("/aromas/{tag_id}/grapes", response_model=List[GrapeResponse])
async def get_grapes_by_aroma(tag_id: str):
    """Get all grapes that have this aromatic note"""
    aroma = await db.aroma_tags.find_one({"tag_id": tag_id}, {"_id": 0})
    if not aroma:
        raise HTTPException(status_code=404, detail="Aroma not found")
    
    grapes = await db.grapes.find(
        {"$or": [{"aromatic_notes": aroma["name_en"]}, {"flavor_notes": aroma["name_en"]}]},
        {"_id": 0}
    ).to_list(200)
    return grapes

# ======================== TASTING ROUTES ========================

@api_router.post("/tastings", response_model=TastingNoteResponse, status_code=201)
async def create_tasting(tasting: TastingNoteCreate, user: dict = Depends(get_current_user)):
    tasting_id = f"tasting_{uuid.uuid4().hex[:12]}"
    tasting_doc = {
        "tasting_id": tasting_id,
        "user_id": user["user_id"],
        **tasting.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tastings.insert_one(tasting_doc)
    
    # Update user progress
    await db.user_progress.update_one(
        {"user_id": user["user_id"]},
        {"$inc": {"total_tastings": 1}}
    )
    
    tasting_doc["created_at"] = datetime.now(timezone.utc)
    return TastingNoteResponse(**tasting_doc)

@api_router.get("/tastings", response_model=List[TastingNoteResponse])
async def get_tastings(user: dict = Depends(get_current_user)):
    tastings = await db.tastings.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for t in tastings:
        if isinstance(t.get("created_at"), str):
            t["created_at"] = datetime.fromisoformat(t["created_at"])
    
    return tastings

@api_router.get("/tastings/{tasting_id}", response_model=TastingNoteResponse)
async def get_tasting(tasting_id: str, user: dict = Depends(get_current_user)):
    tasting = await db.tastings.find_one(
        {"tasting_id": tasting_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    if not tasting:
        raise HTTPException(status_code=404, detail="Tasting not found")
    
    if isinstance(tasting.get("created_at"), str):
        tasting["created_at"] = datetime.fromisoformat(tasting["created_at"])
    
    return TastingNoteResponse(**tasting)

@api_router.delete("/tastings/{tasting_id}")
async def delete_tasting(tasting_id: str, user: dict = Depends(get_current_user)):
    result = await db.tastings.delete_one(
        {"tasting_id": tasting_id, "user_id": user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tasting not found")
    
    await db.user_progress.update_one(
        {"user_id": user["user_id"]},
        {"$inc": {"total_tastings": -1}}
    )
    
    return {"message": "Tasting deleted"}

# ======================== STUDY ROUTES ========================

@api_router.get("/study/tracks", response_model=List[StudyTrackResponse])
async def get_study_tracks():
    tracks = await db.study_tracks.find({}, {"_id": 0}).to_list(10)
    return tracks

@api_router.get("/study/tracks/{track_id}", response_model=StudyTrackResponse)
async def get_study_track(track_id: str):
    track = await db.study_tracks.find_one({"track_id": track_id}, {"_id": 0})
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    return track

@api_router.get("/study/tracks/{track_id}/lessons", response_model=List[LessonResponse])
async def get_track_lessons(track_id: str):
    lessons = await db.lessons.find(
        {"track_id": track_id},
        {"_id": 0}
    ).sort("order", 1).to_list(50)
    return lessons

@api_router.get("/study/lessons/{lesson_id}", response_model=LessonResponse)
async def get_lesson(lesson_id: str):
    lesson = await db.lessons.find_one({"lesson_id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@api_router.post("/study/lessons/{lesson_id}/complete")
async def complete_lesson(lesson_id: str, user: dict = Depends(get_current_user)):
    lesson = await db.lessons.find_one({"lesson_id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    await db.user_progress.update_one(
        {"user_id": user["user_id"]},
        {
            "$addToSet": {"completed_lessons": lesson_id},
            "$set": {"last_activity": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    return {"message": "Lesson completed", "lesson_id": lesson_id}

# ======================== QUIZ ROUTES ========================

@api_router.get("/quiz/tracks/{track_id}/questions", response_model=List[QuizQuestionResponse])
async def get_quiz_questions(track_id: str, limit: int = 10):
    questions = await db.quiz_questions.find(
        {"track_id": track_id},
        {"_id": 0}
    ).to_list(limit)
    return questions

@api_router.post("/quiz/submit")
async def submit_quiz_answer(answer: QuizAnswerSubmit, user: dict = Depends(get_current_user)):
    question = await db.quiz_questions.find_one(
        {"question_id": answer.question_id},
        {"_id": 0}
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    is_correct = answer.selected_answer == question["correct_answer"]
    
    # Update quiz scores
    if is_correct:
        await db.user_progress.update_one(
            {"user_id": user["user_id"]},
            {"$inc": {f"quiz_scores.{question['track_id']}": 1}}
        )
    
    return {
        "correct": is_correct,
        "correct_answer": question["correct_answer"],
        "explanation_pt": question["explanation_pt"],
        "explanation_en": question["explanation_en"]
    }

# ======================== USER PROGRESS ========================

@api_router.get("/progress", response_model=UserProgressResponse)
async def get_user_progress(user: dict = Depends(get_current_user)):
    progress = await db.user_progress.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    if not progress:
        progress = {
            "user_id": user["user_id"],
            "completed_lessons": [],
            "quiz_scores": {},
            "total_tastings": 0,
            "current_streak": 0,
            "badges": []
        }
    return UserProgressResponse(**progress)

# ======================== SEARCH ========================

@api_router.get("/search")
async def search(q: str, category: Optional[str] = None):
    """Global search across grapes, regions, and countries"""
    results = {"grapes": [], "regions": [], "countries": []}
    
    search_filter = {"$regex": q, "$options": "i"}
    
    if not category or category == "grapes":
        grapes = await db.grapes.find(
            {"$or": [{"name": search_filter}, {"description_pt": search_filter}, {"description_en": search_filter}]},
            {"_id": 0}
        ).to_list(20)
        results["grapes"] = grapes
    
    if not category or category == "regions":
        regions = await db.regions.find(
            {"$or": [{"name": search_filter}, {"description_pt": search_filter}, {"description_en": search_filter}]},
            {"_id": 0}
        ).to_list(20)
        results["regions"] = regions
    
    if not category or category == "countries":
        countries = await db.countries.find(
            {"$or": [{"name_pt": search_filter}, {"name_en": search_filter}]},
            {"_id": 0}
        ).to_list(20)
        results["countries"] = countries
    
    return results

# ======================== SEED DATA ENDPOINT ========================

@api_router.post("/seed")
async def seed_database():
    """Seed the database with initial wine data"""
    
    # Check if already seeded
    existing = await db.countries.find_one({})
    if existing:
        return {"message": "Database already seeded"}
    
    # Seed Countries
    countries = [
        {"country_id": "france", "name_pt": "França", "name_en": "France", "world_type": "old_world", "flag_emoji": "🇫🇷", "description_pt": "Berço da vinicultura moderna, com regiões icônicas como Bordeaux, Borgonha e Champagne.", "description_en": "Birthplace of modern viticulture, with iconic regions like Bordeaux, Burgundy and Champagne.", "image_url": "https://images.unsplash.com/photo-1499063078284-f78f7d89616a"},
        {"country_id": "italy", "name_pt": "Itália", "name_en": "Italy", "world_type": "old_world", "flag_emoji": "🇮🇹", "description_pt": "Maior diversidade de castas autóctones do mundo, com tradições milenares.", "description_en": "Greatest diversity of indigenous grape varieties in the world, with millennia-old traditions.", "image_url": "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216"},
        {"country_id": "spain", "name_pt": "Espanha", "name_en": "Spain", "world_type": "old_world", "flag_emoji": "🇪🇸", "description_pt": "Maior área plantada de vinhas do mundo, famosa por Rioja e Jerez.", "description_en": "Largest planted vineyard area in the world, famous for Rioja and Sherry.", "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64"},
        {"country_id": "portugal", "name_pt": "Portugal", "name_en": "Portugal", "world_type": "old_world", "flag_emoji": "🇵🇹", "description_pt": "Rico em castas autóctones, berço do vinho do Porto e Madeira.", "description_en": "Rich in indigenous varieties, birthplace of Port and Madeira wines.", "image_url": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b"},
        {"country_id": "germany", "name_pt": "Alemanha", "name_en": "Germany", "world_type": "old_world", "flag_emoji": "🇩🇪", "description_pt": "Mestre em vinhos brancos elegantes, especialmente Riesling.", "description_en": "Master of elegant white wines, especially Riesling.", "image_url": "https://images.unsplash.com/photo-1569071354277-ffe06f81bbd5"},
        {"country_id": "usa", "name_pt": "Estados Unidos", "name_en": "United States", "world_type": "new_world", "flag_emoji": "🇺🇸", "description_pt": "Quarto maior produtor mundial, com destaque para Califórnia e Oregon.", "description_en": "Fourth largest producer worldwide, with California and Oregon leading.", "image_url": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb"},
        {"country_id": "argentina", "name_pt": "Argentina", "name_en": "Argentina", "world_type": "new_world", "flag_emoji": "🇦🇷", "description_pt": "Quinto maior produtor, famosa pelo Malbec de Mendoza.", "description_en": "Fifth largest producer, famous for Mendoza Malbec.", "image_url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3"},
        {"country_id": "chile", "name_pt": "Chile", "name_en": "Chile", "world_type": "new_world", "flag_emoji": "🇨🇱", "description_pt": "Vinhedos isolados por montanhas, oceano e deserto. Terroir único.", "description_en": "Vineyards isolated by mountains, ocean and desert. Unique terroir.", "image_url": "https://images.unsplash.com/photo-1474722883778-792e7990302f"},
        {"country_id": "australia", "name_pt": "Austrália", "name_en": "Australia", "world_type": "new_world", "flag_emoji": "🇦🇺", "description_pt": "Shiraz potente e técnicas inovadoras de vinificação.", "description_en": "Powerful Shiraz and innovative winemaking techniques.", "image_url": "https://images.unsplash.com/photo-1566903451935-7e8835ed3e97"},
        {"country_id": "south_africa", "name_pt": "África do Sul", "name_en": "South Africa", "world_type": "new_world", "flag_emoji": "🇿🇦", "description_pt": "Tradição desde 1659, berço da Pinotage.", "description_en": "Tradition since 1659, birthplace of Pinotage.", "image_url": "https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6"},
    ]
    await db.countries.insert_many(countries)
    
    # Seed Regions
    regions = [
        {"region_id": "bordeaux", "country_id": "france", "name": "Bordeaux", "description_pt": "A região mais prestigiada do mundo para vinhos tintos, conhecida por seus blends de Cabernet Sauvignon e Merlot.", "description_en": "The most prestigious region in the world for red wines, known for its Cabernet Sauvignon and Merlot blends.", "terroir": {"soil": "Cascalho, argila, calcário", "altitude": "0-100m", "maritime_influence": True}, "climate": {"type": "Oceânico", "temperature": "Moderado", "rainfall": "Alta"}, "appellations": ["Médoc", "Saint-Émilion", "Pomerol", "Graves", "Sauternes"], "main_grapes": ["Cabernet Sauvignon", "Merlot", "Cabernet Franc", "Sémillon", "Sauvignon Blanc"], "wine_styles": ["Tinto seco", "Branco seco", "Doce"]},
        {"region_id": "burgundy", "country_id": "france", "name": "Bourgogne", "description_pt": "Terra da Pinot Noir e Chardonnay, com sistema único de classificação por terroir.", "description_en": "Land of Pinot Noir and Chardonnay, with unique terroir classification system.", "terroir": {"soil": "Calcário, argila", "altitude": "200-400m", "maritime_influence": False}, "climate": {"type": "Continental", "temperature": "Frio a moderado", "rainfall": "Moderada"}, "appellations": ["Côte de Nuits", "Côte de Beaune", "Chablis", "Mâconnais"], "main_grapes": ["Pinot Noir", "Chardonnay", "Aligoté"], "wine_styles": ["Tinto seco", "Branco seco"]},
        {"region_id": "champagne", "country_id": "france", "name": "Champagne", "description_pt": "Única região autorizada a produzir o verdadeiro Champagne pelo método tradicional.", "description_en": "Only region authorized to produce true Champagne by the traditional method.", "terroir": {"soil": "Giz, calcário", "altitude": "90-300m", "maritime_influence": False}, "climate": {"type": "Continental frio", "temperature": "Frio", "rainfall": "Moderada"}, "appellations": ["Montagne de Reims", "Vallée de la Marne", "Côte des Blancs"], "main_grapes": ["Chardonnay", "Pinot Noir", "Pinot Meunier"], "wine_styles": ["Espumante"]},
        {"region_id": "tuscany", "country_id": "italy", "name": "Toscana", "description_pt": "Coração da vinicultura italiana, lar do Sangiovese e dos Super Toscanos.", "description_en": "Heart of Italian winemaking, home of Sangiovese and Super Tuscans.", "terroir": {"soil": "Galestro, alberese, argila", "altitude": "200-500m", "maritime_influence": True}, "climate": {"type": "Mediterrâneo", "temperature": "Quente", "rainfall": "Baixa a moderada"}, "appellations": ["Chianti", "Brunello di Montalcino", "Bolgheri", "Vino Nobile di Montepulciano"], "main_grapes": ["Sangiovese", "Cabernet Sauvignon", "Merlot", "Vernaccia"], "wine_styles": ["Tinto seco", "Branco seco"]},
        {"region_id": "piedmont", "country_id": "italy", "name": "Piemonte", "description_pt": "Região dos grandes Barolo e Barbaresco, feitos com a nobre Nebbiolo.", "description_en": "Region of great Barolo and Barbaresco, made with noble Nebbiolo.", "terroir": {"soil": "Marga calcária, argila", "altitude": "200-450m", "maritime_influence": False}, "climate": {"type": "Continental", "temperature": "Frio a moderado", "rainfall": "Moderada"}, "appellations": ["Barolo", "Barbaresco", "Asti", "Gavi"], "main_grapes": ["Nebbiolo", "Barbera", "Dolcetto", "Moscato", "Cortese"], "wine_styles": ["Tinto seco", "Espumante doce", "Branco seco"]},
        {"region_id": "rioja", "country_id": "spain", "name": "Rioja", "description_pt": "A região mais famosa da Espanha, conhecida por Tempranillo envelhecido em carvalho americano.", "description_en": "Spain's most famous region, known for Tempranillo aged in American oak.", "terroir": {"soil": "Argila ferruginosa, calcário, aluvial", "altitude": "300-700m", "maritime_influence": False}, "climate": {"type": "Continental com influência atlântica", "temperature": "Moderado", "rainfall": "Baixa a moderada"}, "appellations": ["Rioja Alta", "Rioja Alavesa", "Rioja Oriental"], "main_grapes": ["Tempranillo", "Garnacha", "Graciano", "Viura"], "wine_styles": ["Tinto seco", "Branco seco", "Rosé"]},
        {"region_id": "douro", "country_id": "portugal", "name": "Douro", "description_pt": "Região demarcada mais antiga do mundo, berço do vinho do Porto.", "description_en": "Oldest demarcated wine region in the world, birthplace of Port wine.", "terroir": {"soil": "Xisto", "altitude": "100-900m", "maritime_influence": False}, "climate": {"type": "Continental mediterrâneo", "temperature": "Quente", "rainfall": "Baixa"}, "appellations": ["Porto", "Douro DOC"], "main_grapes": ["Touriga Nacional", "Touriga Franca", "Tinta Roriz", "Tinta Barroca"], "wine_styles": ["Tinto seco", "Fortificado"]},
        {"region_id": "napa_valley", "country_id": "usa", "name": "Napa Valley", "description_pt": "A mais prestigiada região dos EUA, conhecida por Cabernet Sauvignon de classe mundial.", "description_en": "The most prestigious US region, known for world-class Cabernet Sauvignon.", "terroir": {"soil": "Vulcânico, aluvial", "altitude": "0-600m", "maritime_influence": True}, "climate": {"type": "Mediterrâneo", "temperature": "Quente", "rainfall": "Baixa"}, "appellations": ["Oakville", "Rutherford", "Stags Leap", "Howell Mountain"], "main_grapes": ["Cabernet Sauvignon", "Merlot", "Chardonnay", "Sauvignon Blanc"], "wine_styles": ["Tinto seco", "Branco seco"]},
        {"region_id": "mendoza", "country_id": "argentina", "name": "Mendoza", "description_pt": "Capital mundial do Malbec, com vinhedos em altitudes extremas.", "description_en": "World capital of Malbec, with vineyards at extreme altitudes.", "terroir": {"soil": "Aluvial, arenoso", "altitude": "600-1500m", "maritime_influence": False}, "climate": {"type": "Continental desértico", "temperature": "Quente com amplitude térmica", "rainfall": "Muito baixa"}, "appellations": ["Luján de Cuyo", "Valle de Uco", "Maipú"], "main_grapes": ["Malbec", "Cabernet Sauvignon", "Bonarda", "Torrontés"], "wine_styles": ["Tinto seco", "Branco aromático"]},
        {"region_id": "barossa", "country_id": "australia", "name": "Barossa Valley", "description_pt": "Lar de algumas das vinhas mais antigas do mundo, famosa pelo Shiraz potente.", "description_en": "Home to some of the world's oldest vines, famous for powerful Shiraz.", "terroir": {"soil": "Argila vermelha, areia", "altitude": "200-400m", "maritime_influence": False}, "climate": {"type": "Mediterrâneo continental", "temperature": "Quente", "rainfall": "Baixa"}, "appellations": ["Barossa Valley", "Eden Valley"], "main_grapes": ["Shiraz", "Grenache", "Mourvèdre", "Riesling"], "wine_styles": ["Tinto seco", "Branco seco", "Fortificado"]},
    ]
    await db.regions.insert_many(regions)
    
    # Seed Grapes
    grapes = [
        {"grape_id": "cabernet_sauvignon", "name": "Cabernet Sauvignon", "grape_type": "red", "origin_country": "france", "description_pt": "A uva tinta mais plantada do mundo, conhecida por sua estrutura tânica e potencial de envelhecimento.", "description_en": "The most planted red grape in the world, known for its tannic structure and aging potential.", "aromatic_notes": ["Cassis", "Cedar", "Tobacco", "Green pepper"], "flavor_notes": ["Black currant", "Mint", "Dark chocolate"], "structure": {"acidity": "Média-alta", "tannin": "Alto", "body": "Encorpado", "alcohol": "13-15%"}, "aging_potential": "15-30+ anos", "best_regions": ["Bordeaux", "Napa Valley", "Coonawarra"], "climate_preference": "Quente"},
        {"grape_id": "merlot", "name": "Merlot", "grape_type": "red", "origin_country": "france", "description_pt": "Uva versátil que produz vinhos macios e frutados, frequentemente usada em blends.", "description_en": "Versatile grape producing soft, fruity wines, often used in blends.", "aromatic_notes": ["Plum", "Cherry", "Chocolate", "Herbs"], "flavor_notes": ["Red fruits", "Vanilla", "Spice"], "structure": {"acidity": "Média", "tannin": "Médio", "body": "Médio a encorpado", "alcohol": "12-14%"}, "aging_potential": "5-15 anos", "best_regions": ["Bordeaux", "Tuscany", "Chile"], "climate_preference": "Moderado a quente"},
        {"grape_id": "pinot_noir", "name": "Pinot Noir", "grape_type": "red", "origin_country": "france", "description_pt": "A uva mais difícil de cultivar, produz vinhos elegantes e complexos na Borgonha.", "description_en": "The most difficult grape to grow, producing elegant and complex wines in Burgundy.", "aromatic_notes": ["Cherry", "Raspberry", "Rose", "Earth"], "flavor_notes": ["Red berries", "Mushroom", "Forest floor"], "structure": {"acidity": "Alta", "tannin": "Baixo a médio", "body": "Leve a médio", "alcohol": "12-14%"}, "aging_potential": "5-20+ anos", "best_regions": ["Burgundy", "Oregon", "New Zealand"], "climate_preference": "Frio a moderado"},
        {"grape_id": "sangiovese", "name": "Sangiovese", "grape_type": "red", "origin_country": "italy", "description_pt": "A alma da Toscana, produz Chianti e Brunello di Montalcino.", "description_en": "The soul of Tuscany, producing Chianti and Brunello di Montalcino.", "aromatic_notes": ["Cherry", "Tomato leaf", "Herbs", "Leather"], "flavor_notes": ["Sour cherry", "Tea", "Dried herbs"], "structure": {"acidity": "Alta", "tannin": "Médio-alto", "body": "Médio", "alcohol": "12-14%"}, "aging_potential": "5-20+ anos", "best_regions": ["Tuscany", "Romagna"], "climate_preference": "Quente"},
        {"grape_id": "tempranillo", "name": "Tempranillo", "grape_type": "red", "origin_country": "spain", "description_pt": "Principal uva da Rioja, versátil e expressiva com notas de couro e tabaco.", "description_en": "Main grape of Rioja, versatile and expressive with leather and tobacco notes.", "aromatic_notes": ["Cherry", "Leather", "Tobacco", "Vanilla"], "flavor_notes": ["Plum", "Fig", "Cedar"], "structure": {"acidity": "Média", "tannin": "Médio", "body": "Médio a encorpado", "alcohol": "13-14%"}, "aging_potential": "5-25+ anos", "best_regions": ["Rioja", "Ribera del Duero", "Toro"], "climate_preference": "Moderado a quente"},
        {"grape_id": "malbec", "name": "Malbec", "grape_type": "red", "origin_country": "france", "description_pt": "Originária de Cahors, encontrou sua expressão máxima na Argentina.", "description_en": "Originally from Cahors, found its maximum expression in Argentina.", "aromatic_notes": ["Blackberry", "Plum", "Violet", "Cocoa"], "flavor_notes": ["Dark fruits", "Chocolate", "Spice"], "structure": {"acidity": "Média", "tannin": "Médio-alto", "body": "Encorpado", "alcohol": "13-15%"}, "aging_potential": "5-15 anos", "best_regions": ["Mendoza", "Cahors"], "climate_preference": "Quente com altitude"},
        {"grape_id": "nebbiolo", "name": "Nebbiolo", "grape_type": "red", "origin_country": "italy", "description_pt": "A nobre uva do Piemonte, produz Barolo e Barbaresco.", "description_en": "The noble grape of Piedmont, producing Barolo and Barbaresco.", "aromatic_notes": ["Rose", "Tar", "Cherry", "Truffle"], "flavor_notes": ["Red cherry", "Licorice", "Dried herbs"], "structure": {"acidity": "Alta", "tannin": "Muito alto", "body": "Médio a encorpado", "alcohol": "13-15%"}, "aging_potential": "15-40+ anos", "best_regions": ["Piedmont"], "climate_preference": "Frio a moderado"},
        {"grape_id": "syrah", "name": "Syrah / Shiraz", "grape_type": "red", "origin_country": "france", "description_pt": "Produz vinhos potentes e especiados no Rhône e na Austrália.", "description_en": "Produces powerful, spicy wines in the Rhône and Australia.", "aromatic_notes": ["Blackberry", "Black pepper", "Smoke", "Bacon"], "flavor_notes": ["Dark fruits", "Olive", "Leather"], "structure": {"acidity": "Média", "tannin": "Médio-alto", "body": "Encorpado", "alcohol": "13-15%"}, "aging_potential": "5-20+ anos", "best_regions": ["Rhône", "Barossa", "Stellenbosch"], "climate_preference": "Quente"},
        {"grape_id": "chardonnay", "name": "Chardonnay", "grape_type": "white", "origin_country": "france", "description_pt": "A uva branca mais versátil, do Chablis mineral ao estilo amanteigado californiano.", "description_en": "The most versatile white grape, from mineral Chablis to buttery California style.", "aromatic_notes": ["Apple", "Citrus", "Butter", "Oak"], "flavor_notes": ["Tropical fruits", "Vanilla", "Toast"], "structure": {"acidity": "Média a alta", "tannin": "N/A", "body": "Médio a encorpado", "alcohol": "12-14%"}, "aging_potential": "2-10+ anos", "best_regions": ["Burgundy", "Champagne", "California"], "climate_preference": "Frio a quente"},
        {"grape_id": "sauvignon_blanc", "name": "Sauvignon Blanc", "grape_type": "white", "origin_country": "france", "description_pt": "Aromática e refrescante, com notas herbáceas e cítricas marcantes.", "description_en": "Aromatic and refreshing, with striking herbaceous and citrus notes.", "aromatic_notes": ["Grapefruit", "Grass", "Gooseberry", "Passion fruit"], "flavor_notes": ["Citrus", "Green apple", "Mineral"], "structure": {"acidity": "Alta", "tannin": "N/A", "body": "Leve a médio", "alcohol": "11-13%"}, "aging_potential": "1-5 anos", "best_regions": ["Loire", "Marlborough", "Bordeaux"], "climate_preference": "Frio a moderado"},
        {"grape_id": "riesling", "name": "Riesling", "grape_type": "white", "origin_country": "germany", "description_pt": "Rainha das uvas brancas alemãs, do seco ao doce, sempre com acidez vibrante.", "description_en": "Queen of German white grapes, from dry to sweet, always with vibrant acidity.", "aromatic_notes": ["Lime", "Peach", "Petrol", "Honey"], "flavor_notes": ["Apple", "Apricot", "Mineral", "Slate"], "structure": {"acidity": "Muito alta", "tannin": "N/A", "body": "Leve a médio", "alcohol": "8-13%"}, "aging_potential": "5-30+ anos", "best_regions": ["Mosel", "Alsace", "Clare Valley"], "climate_preference": "Frio"},
        {"grape_id": "touriga_nacional", "name": "Touriga Nacional", "grape_type": "red", "origin_country": "portugal", "description_pt": "A mais nobre uva portuguesa, base dos melhores vinhos do Porto e Douro.", "description_en": "The noblest Portuguese grape, base of the best Port and Douro wines.", "aromatic_notes": ["Violet", "Blackberry", "Rock rose", "Mint"], "flavor_notes": ["Dark fruits", "Chocolate", "Herbs"], "structure": {"acidity": "Média-alta", "tannin": "Alto", "body": "Encorpado", "alcohol": "13-15%"}, "aging_potential": "10-30+ anos", "best_regions": ["Douro", "Dão"], "climate_preference": "Quente"},
    ]
    await db.grapes.insert_many(grapes)
    
    # Seed Aroma Tags
    aroma_tags = [
        {"tag_id": "citrus", "name_pt": "Cítrico", "name_en": "Citrus", "category": "fruit", "emoji": "🍋"},
        {"tag_id": "green_apple", "name_pt": "Maçã verde", "name_en": "Green apple", "category": "fruit", "emoji": "🍏"},
        {"tag_id": "stone_fruit", "name_pt": "Fruta de caroço", "name_en": "Stone fruit", "category": "fruit", "emoji": "🍑"},
        {"tag_id": "tropical", "name_pt": "Tropical", "name_en": "Tropical", "category": "fruit", "emoji": "🥭"},
        {"tag_id": "red_berries", "name_pt": "Frutas vermelhas", "name_en": "Red berries", "category": "fruit", "emoji": "🍒"},
        {"tag_id": "black_berries", "name_pt": "Frutas negras", "name_en": "Black berries", "category": "fruit", "emoji": "🫐"},
        {"tag_id": "floral", "name_pt": "Floral", "name_en": "Floral", "category": "floral", "emoji": "🌸"},
        {"tag_id": "rose", "name_pt": "Rosa", "name_en": "Rose", "category": "floral", "emoji": "🌹"},
        {"tag_id": "violet", "name_pt": "Violeta", "name_en": "Violet", "category": "floral", "emoji": "💜"},
        {"tag_id": "herbal", "name_pt": "Herbal", "name_en": "Herbal", "category": "vegetal", "emoji": "🌿"},
        {"tag_id": "grass", "name_pt": "Gramíneas", "name_en": "Grass", "category": "vegetal", "emoji": "🌱"},
        {"tag_id": "pepper", "name_pt": "Pimenta", "name_en": "Pepper", "category": "spice", "emoji": "🌶️"},
        {"tag_id": "vanilla", "name_pt": "Baunilha", "name_en": "Vanilla", "category": "oak", "emoji": "🍦"},
        {"tag_id": "oak", "name_pt": "Carvalho", "name_en": "Oak", "category": "oak", "emoji": "🪵"},
        {"tag_id": "toast", "name_pt": "Tostado", "name_en": "Toast", "category": "oak", "emoji": "🍞"},
        {"tag_id": "butter", "name_pt": "Manteiga", "name_en": "Butter", "category": "dairy", "emoji": "🧈"},
        {"tag_id": "chocolate", "name_pt": "Chocolate", "name_en": "Chocolate", "category": "sweet", "emoji": "🍫"},
        {"tag_id": "coffee", "name_pt": "Café", "name_en": "Coffee", "category": "roasted", "emoji": "☕"},
        {"tag_id": "leather", "name_pt": "Couro", "name_en": "Leather", "category": "earth", "emoji": "👞"},
        {"tag_id": "earth", "name_pt": "Terra", "name_en": "Earth", "category": "earth", "emoji": "🌍"},
        {"tag_id": "mineral", "name_pt": "Mineral", "name_en": "Mineral", "category": "mineral", "emoji": "🪨"},
        {"tag_id": "smoke", "name_pt": "Defumado", "name_en": "Smoke", "category": "roasted", "emoji": "💨"},
        {"tag_id": "honey", "name_pt": "Mel", "name_en": "Honey", "category": "sweet", "emoji": "🍯"},
        {"tag_id": "nuts", "name_pt": "Nozes", "name_en": "Nuts", "category": "nuts", "emoji": "🥜"},
    ]
    await db.aroma_tags.insert_many(aroma_tags)
    
    # Seed Study Tracks
    study_tracks = [
        {"track_id": "basic", "level": "basic", "title_pt": "Fundamentos do Vinho", "title_en": "Wine Fundamentals", "description_pt": "Aprenda os conceitos básicos: tipos de vinho, principais uvas e como ler um rótulo.", "description_en": "Learn the basics: wine types, main grapes and how to read a label.", "lessons_count": 5, "image_url": "https://images.unsplash.com/photo-1474722883778-792e7990302f"},
        {"track_id": "intermediate", "level": "intermediate", "title_pt": "Terroir e Regiões", "title_en": "Terroir and Regions", "description_pt": "Explore o conceito de terroir e as principais regiões vinícolas do mundo.", "description_en": "Explore the concept of terroir and the main wine regions of the world.", "lessons_count": 8, "image_url": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb"},
        {"track_id": "advanced", "level": "advanced", "title_pt": "Mestria em Vinhos", "title_en": "Wine Mastery", "description_pt": "Estudo avançado: comparação de regiões, técnicas de vinificação e envelhecimento.", "description_en": "Advanced study: region comparison, winemaking techniques and aging.", "lessons_count": 10, "image_url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3"},
    ]
    await db.study_tracks.insert_many(study_tracks)
    
    # Seed Lessons
    lessons = [
        {"lesson_id": "basic_1", "track_id": "basic", "order": 1, "title_pt": "O que é Vinho?", "title_en": "What is Wine?", "content_pt": "Vinho é uma bebida alcoólica produzida pela fermentação do suco de uvas. A levedura consome o açúcar das uvas e o transforma em álcool e dióxido de carbono. Este processo milenar resulta em uma das bebidas mais complexas e apreciadas do mundo.\n\nExistem três tipos principais de vinho:\n- **Vinho Tinto**: Feito com uvas tintas, fermentado com as cascas\n- **Vinho Branco**: Geralmente de uvas brancas, sem contato com cascas\n- **Vinho Rosé**: Breve contato com cascas de uvas tintas", "content_en": "Wine is an alcoholic beverage produced by fermenting grape juice. Yeast consumes the sugar in grapes and transforms it into alcohol and carbon dioxide. This ancient process results in one of the most complex and appreciated beverages in the world.\n\nThere are three main types of wine:\n- **Red Wine**: Made from red grapes, fermented with the skins\n- **White Wine**: Usually from white grapes, without skin contact\n- **Rosé Wine**: Brief contact with red grape skins", "duration_minutes": 10},
        {"lesson_id": "basic_2", "track_id": "basic", "order": 2, "title_pt": "Principais Castas Tintas", "title_en": "Main Red Grape Varieties", "content_pt": "As castas são as variedades de uva usadas para fazer vinho. Cada casta tem características únicas de aroma, sabor e estrutura.\n\n**Cabernet Sauvignon**: A rainha das uvas tintas. Produz vinhos encorpados com taninos firmes e aromas de cassis, cedro e pimentão verde.\n\n**Merlot**: Mais macia e frutada que a Cabernet, com notas de ameixa e chocolate.\n\n**Pinot Noir**: Elegante e delicada, com aromas de cereja, framboesa e terra úmida.\n\n**Syrah/Shiraz**: Potente e especiada, com pimenta preta e frutas negras.", "content_en": "Grape varieties are the types of grapes used to make wine. Each variety has unique characteristics of aroma, flavor and structure.\n\n**Cabernet Sauvignon**: The queen of red grapes. Produces full-bodied wines with firm tannins and aromas of blackcurrant, cedar and green pepper.\n\n**Merlot**: Softer and fruitier than Cabernet, with plum and chocolate notes.\n\n**Pinot Noir**: Elegant and delicate, with cherry, raspberry and earthy aromas.\n\n**Syrah/Shiraz**: Powerful and spicy, with black pepper and dark fruits.", "duration_minutes": 15},
        {"lesson_id": "basic_3", "track_id": "basic", "order": 3, "title_pt": "Principais Castas Brancas", "title_en": "Main White Grape Varieties", "content_pt": "As uvas brancas produzem vinhos que variam do leve e refrescante ao rico e cremoso.\n\n**Chardonnay**: A mais versátil das brancas. Pode ser mineral e fresca (Chablis) ou amanteigada e rica (Califórnia).\n\n**Sauvignon Blanc**: Aromática e refrescante, com notas de grapefruit, maracujá e capim-limão.\n\n**Riesling**: Rainha da Alemanha, com acidez vibrante e aromas de lima, pêssego e notas de petróleo com a idade.\n\n**Pinot Grigio/Gris**: Leve e neutra na Itália, mais rica na Alsácia.", "content_en": "White grapes produce wines ranging from light and refreshing to rich and creamy.\n\n**Chardonnay**: The most versatile white grape. Can be mineral and fresh (Chablis) or buttery and rich (California).\n\n**Sauvignon Blanc**: Aromatic and refreshing, with grapefruit, passion fruit and lemongrass notes.\n\n**Riesling**: Queen of Germany, with vibrant acidity and aromas of lime, peach and petrol notes with age.\n\n**Pinot Grigio/Gris**: Light and neutral in Italy, richer in Alsace.", "duration_minutes": 15},
        {"lesson_id": "basic_4", "track_id": "basic", "order": 4, "title_pt": "Como Ler um Rótulo", "title_en": "How to Read a Wine Label", "content_pt": "O rótulo do vinho contém informações essenciais:\n\n**Produtor/Vinícola**: Quem fez o vinho\n**Região/Denominação**: De onde vem (ex: Bordeaux AOC)\n**Safra/Vintage**: O ano da colheita\n**Casta**: A variedade de uva (nem sempre presente)\n**Teor Alcoólico**: Percentual de álcool\n\n**Classificações importantes:**\n- França: AOC/AOP, Vin de Pays\n- Itália: DOCG, DOC, IGT\n- Espanha: DOCa, DO, Vino de la Tierra\n- Portugal: DOC, Vinho Regional", "content_en": "The wine label contains essential information:\n\n**Producer/Winery**: Who made the wine\n**Region/Appellation**: Where it comes from (e.g., Bordeaux AOC)\n**Vintage**: The harvest year\n**Grape Variety**: The grape type (not always present)\n**Alcohol Content**: Percentage of alcohol\n\n**Important classifications:**\n- France: AOC/AOP, Vin de Pays\n- Italy: DOCG, DOC, IGT\n- Spain: DOCa, DO, Vino de la Tierra\n- Portugal: DOC, Vinho Regional", "duration_minutes": 12},
        {"lesson_id": "basic_5", "track_id": "basic", "order": 5, "title_pt": "Influência do Clima", "title_en": "Climate Influence", "content_pt": "O clima é fundamental para o estilo do vinho:\n\n**Clima Frio** (Borgonha, Alemanha):\n- Acidez mais alta\n- Álcool mais baixo\n- Aromas mais delicados e florais\n- Corpo mais leve\n\n**Clima Quente** (Austrália, Argentina):\n- Mais açúcar, mais álcool\n- Frutas mais maduras e concentradas\n- Taninos mais macios\n- Corpo mais encorpado\n\n**Clima Moderado** (Bordeaux, Califórnia):\n- Equilíbrio entre acidez e fruta\n- Potencial de envelhecimento\n- Complexidade aromática", "content_en": "Climate is fundamental to wine style:\n\n**Cool Climate** (Burgundy, Germany):\n- Higher acidity\n- Lower alcohol\n- More delicate and floral aromas\n- Lighter body\n\n**Warm Climate** (Australia, Argentina):\n- More sugar, more alcohol\n- Riper, more concentrated fruits\n- Softer tannins\n- Fuller body\n\n**Moderate Climate** (Bordeaux, California):\n- Balance between acidity and fruit\n- Aging potential\n- Aromatic complexity", "duration_minutes": 12},
    ]
    await db.lessons.insert_many(lessons)
    
    # Seed Quiz Questions
    quiz_questions = [
        {"question_id": "q1", "track_id": "basic", "lesson_id": "basic_1", "question_type": "multiple_choice", "question_pt": "Qual é o processo principal na produção de vinho?", "question_en": "What is the main process in wine production?", "options_pt": ["Destilação", "Fermentação", "Pasteurização", "Carbonatação"], "options_en": ["Distillation", "Fermentation", "Pasteurization", "Carbonation"], "correct_answer": 1, "explanation_pt": "A fermentação é o processo onde as leveduras transformam o açúcar das uvas em álcool e CO2.", "explanation_en": "Fermentation is the process where yeast transforms grape sugar into alcohol and CO2."},
        {"question_id": "q2", "track_id": "basic", "lesson_id": "basic_2", "question_type": "multiple_choice", "question_pt": "Qual casta é conhecida como a 'rainha das uvas tintas'?", "question_en": "Which grape is known as the 'queen of red grapes'?", "options_pt": ["Merlot", "Pinot Noir", "Cabernet Sauvignon", "Syrah"], "options_en": ["Merlot", "Pinot Noir", "Cabernet Sauvignon", "Syrah"], "correct_answer": 2, "explanation_pt": "Cabernet Sauvignon é a uva tinta mais plantada do mundo e produz vinhos de grande longevidade.", "explanation_en": "Cabernet Sauvignon is the most planted red grape in the world and produces wines with great aging potential."},
        {"question_id": "q3", "track_id": "basic", "lesson_id": "basic_3", "question_type": "true_false", "question_pt": "Riesling é uma uva originária da Alemanha.", "question_en": "Riesling is a grape variety originating from Germany.", "options_pt": ["Verdadeiro", "Falso"], "options_en": ["True", "False"], "correct_answer": 0, "explanation_pt": "Riesling é de fato originária da região do Reno na Alemanha, sendo a uva branca mais nobre do país.", "explanation_en": "Riesling indeed originates from the Rhine region in Germany, being the noblest white grape of the country."},
        {"question_id": "q4", "track_id": "basic", "lesson_id": "basic_4", "question_type": "multiple_choice", "question_pt": "O que significa DOC em vinhos italianos?", "question_en": "What does DOC mean in Italian wines?", "options_pt": ["Denominação de Origem Controlada", "Denominação Original Certificada", "Documento de Origem do Cultivo", "Destino Original Conhecido"], "options_en": ["Controlled Designation of Origin", "Certified Original Designation", "Cultivation Origin Document", "Known Original Destination"], "correct_answer": 0, "explanation_pt": "DOC (Denominazione di Origine Controllata) é uma classificação de qualidade italiana que garante a origem e métodos de produção.", "explanation_en": "DOC (Denominazione di Origine Controllata) is an Italian quality classification that guarantees origin and production methods."},
        {"question_id": "q5", "track_id": "basic", "lesson_id": "basic_5", "question_type": "multiple_choice", "question_pt": "Em climas frios, os vinhos tendem a ter:", "question_en": "In cool climates, wines tend to have:", "options_pt": ["Mais álcool e taninos fortes", "Acidez alta e corpo leve", "Baixa acidez e muito açúcar residual", "Aromas de frutas tropicais"], "options_en": ["More alcohol and strong tannins", "High acidity and light body", "Low acidity and lots of residual sugar", "Tropical fruit aromas"], "correct_answer": 1, "explanation_pt": "Climas frios resultam em uvas com mais acidez e menos açúcar, produzindo vinhos mais leves e frescos.", "explanation_en": "Cool climates result in grapes with more acidity and less sugar, producing lighter, fresher wines."},
        {"question_id": "q6", "track_id": "basic", "lesson_id": "basic_2", "question_type": "multiple_choice", "question_pt": "Qual característica é típica da Pinot Noir?", "question_en": "What characteristic is typical of Pinot Noir?", "options_pt": ["Taninos muito altos", "Cor escura e densa", "Elegância e delicadeza", "Alta produtividade"], "options_en": ["Very high tannins", "Dark, dense color", "Elegance and delicacy", "High productivity"], "correct_answer": 2, "explanation_pt": "Pinot Noir é conhecida por produzir vinhos elegantes e delicados, com taninos suaves e cor clara.", "explanation_en": "Pinot Noir is known for producing elegant and delicate wines, with soft tannins and light color."},
    ]
    await db.quiz_questions.insert_many(quiz_questions)
    
    return {"message": "Database seeded successfully", "counts": {
        "countries": len(countries),
        "regions": len(regions),
        "grapes": len(grapes),
        "aroma_tags": len(aroma_tags),
        "study_tracks": len(study_tracks),
        "lessons": len(lessons),
        "quiz_questions": len(quiz_questions)
    }}

# ======================== ROOT ========================

@api_router.get("/")
async def root():
    return {"message": "WineStudy API v1.0", "status": "healthy"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

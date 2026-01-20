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
from grape_data import COMPLETE_GRAPES
from region_data import COMPLETE_REGIONS

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
    name_pt: Optional[str] = None
    name_en: Optional[str] = None
    description_pt: Optional[str] = ""
    description_en: Optional[str] = ""
    terroir: Optional[Dict[str, Any]] = None
    climate: Optional[Any] = None
    appellations: Optional[List[str]] = []
    main_grapes: Optional[List[str]] = []
    key_grapes: Optional[List[str]] = []
    wine_styles: Optional[List[str]] = []

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
    producer: Optional[str] = None
    vintage: Optional[int] = None
    region: Optional[str] = None  # Free text region field
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
    producer: Optional[str] = None
    vintage: Optional[int] = None
    region: Optional[str] = None
    grape_ids: List[str] = []
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

# ======================== EXPAND CONTENT ENDPOINT ========================

@api_router.post("/seed/expand")
async def expand_content():
    """Expand the database with more lessons and quiz questions"""
    
    # Check if lessons already expanded
    lesson_count = await db.lessons.count_documents({})
    if lesson_count > 10:
        return {"message": "Content already expanded", "lesson_count": lesson_count}
    
    # Intermediate Lessons
    intermediate_lessons = [
        {
            "lesson_id": "intermediate_1", "track_id": "intermediate", "order": 1,
            "title_pt": "O Conceito de Terroir", "title_en": "The Concept of Terroir",
            "content_pt": """Terroir é um conceito francês que engloba todos os fatores naturais que influenciam o vinho final. Não existe tradução exata, mas podemos entendê-lo como a "expressão do lugar".

**Componentes do Terroir:**

**1. Solo (Géologie)**
O tipo de solo influencia diretamente a videira:
- **Calcário**: Confere mineralidade e elegância (Borgonha, Champagne)
- **Cascalho**: Excelente drenagem, concentra sabores (Médoc, Graves)
- **Xisto**: Retém calor, ideal para Douro e Priorat
- **Argila**: Retenção de água, vinhos mais encorpados
- **Arenoso**: Vinhos mais leves e aromáticos

**2. Clima (Climat)**
- **Macroclima**: Condições gerais da região
- **Mesoclima**: Influência de colinas, rios, florestas
- **Microclima**: Condições específicas do vinhedo

**3. Topografia**
- Altitude: Maior altitude = maior amplitude térmica
- Exposição solar: Encostas sul (hemisfério norte) recebem mais sol
- Inclinação: Afeta drenagem e exposição

**4. O Fator Humano**
Embora controverso, muitos consideram que as práticas vitícolas e de vinificação tradicionais também fazem parte do terroir.""",
            "content_en": """Terroir is a French concept that encompasses all natural factors influencing the final wine. There's no exact translation, but we can understand it as the "expression of place".

**Components of Terroir:**

**1. Soil (Géologie)**
Soil type directly influences the vine:
- **Limestone**: Provides minerality and elegance (Burgundy, Champagne)
- **Gravel**: Excellent drainage, concentrates flavors (Médoc, Graves)
- **Schist**: Retains heat, ideal for Douro and Priorat
- **Clay**: Water retention, fuller-bodied wines
- **Sandy**: Lighter, more aromatic wines

**2. Climate (Climat)**
- **Macroclimate**: General regional conditions
- **Mesoclimate**: Influence of hills, rivers, forests
- **Microclimate**: Specific vineyard conditions

**3. Topography**
- Altitude: Higher altitude = greater temperature variation
- Sun exposure: South-facing slopes (northern hemisphere) receive more sun
- Slope: Affects drainage and exposure

**4. The Human Factor**
Although controversial, many consider traditional viticultural and winemaking practices part of terroir.""",
            "duration_minutes": 20
        },
        {
            "lesson_id": "intermediate_2", "track_id": "intermediate", "order": 2,
            "title_pt": "Bordeaux: A Região Clássica", "title_en": "Bordeaux: The Classic Region",
            "content_pt": """Bordeaux é sinônimo de excelência em vinhos tintos. Localizada no sudoeste da França, é a maior região de vinhos finos do mundo.

**Margem Esquerda vs Margem Direita**

O rio Gironda divide Bordeaux em duas margens distintas:

**Margem Esquerda (Médoc, Graves)**
- Solos de cascalho
- Clima mais moderado
- Cabernet Sauvignon domina
- Vinhos mais estruturados e tânicos
- Appellations: Margaux, Pauillac, Saint-Julien, Saint-Estèphe

**Margem Direita (Saint-Émilion, Pomerol)**
- Solos de argila e calcário
- Merlot domina
- Vinhos mais macios e frutados
- Châteaux menores e mais artesanais

**Classificação de 1855**
O sistema de classificação ainda usado hoje foi criado para a Exposição Universal de Paris:
- 5 níveis de Crus Classés (Premier Cru a Cinquième Cru)
- Apenas 61 châteaux do Médoc e 1 de Graves (Haut-Brion)
- Sauternes também classificado separadamente

**O Blend Bordalês**
A maioria dos vinhos de Bordeaux são blends:
- Tintos: Cabernet Sauvignon + Merlot + Cabernet Franc (+ Petit Verdot, Malbec)
- Brancos: Sauvignon Blanc + Sémillon
- Doces (Sauternes): Sémillon + Sauvignon Blanc afetados por Botrytis""",
            "content_en": """Bordeaux is synonymous with red wine excellence. Located in southwestern France, it's the world's largest fine wine region.

**Left Bank vs Right Bank**

The Gironde river divides Bordeaux into two distinct banks:

**Left Bank (Médoc, Graves)**
- Gravel soils
- More moderate climate
- Cabernet Sauvignon dominates
- More structured and tannic wines
- Appellations: Margaux, Pauillac, Saint-Julien, Saint-Estèphe

**Right Bank (Saint-Émilion, Pomerol)**
- Clay and limestone soils
- Merlot dominates
- Softer, fruitier wines
- Smaller, more artisanal châteaux

**1855 Classification**
The classification system still used today was created for the Paris Universal Exhibition:
- 5 levels of Crus Classés (Premier Cru to Cinquième Cru)
- Only 61 châteaux from Médoc and 1 from Graves (Haut-Brion)
- Sauternes also classified separately

**The Bordeaux Blend**
Most Bordeaux wines are blends:
- Reds: Cabernet Sauvignon + Merlot + Cabernet Franc (+ Petit Verdot, Malbec)
- Whites: Sauvignon Blanc + Sémillon
- Sweet (Sauternes): Sémillon + Sauvignon Blanc affected by Botrytis""",
            "duration_minutes": 18
        },
        {
            "lesson_id": "intermediate_3", "track_id": "intermediate", "order": 3,
            "title_pt": "Borgonha: O Berço do Terroir", "title_en": "Burgundy: The Birthplace of Terroir",
            "content_pt": """A Borgonha é onde o conceito de terroir foi desenvolvido. Com apenas duas uvas principais, a região demonstra como o lugar define o vinho.

**Sistema de Classificação**

A Borgonha usa um sistema hierárquico baseado em vinhedos (climats):

**1. Grand Cru (1-2% da produção)**
- Os melhores vinhedos
- Nome do vinhedo no rótulo (ex: "Romanée-Conti")
- 33 Grand Crus para tintos e brancos

**2. Premier Cru (10-12%)**
- Vinhedos de alta qualidade
- Nome da vila + "Premier Cru" + nome do vinhedo

**3. Village (35-40%)**
- Vinhos da vila específica
- Ex: "Gevrey-Chambertin", "Meursault"

**4. Régional (50%)**
- Denominações regionais
- Ex: "Bourgogne Rouge", "Bourgogne Blanc"

**As Sub-regiões**

- **Chablis**: Chardonnay mineral, sem madeira
- **Côte de Nuits**: Pinot Noir de grande longevidade
- **Côte de Beaune**: Chardonnay elegante + bons tintos
- **Côte Chalonnaise**: Excelente custo-benefício
- **Mâconnais**: Chardonnay acessível

**Pinot Noir na Borgonha**
- Expressa nuances sutis do terroir
- Taninos delicados, acidez vibrante
- Aromas de cereja, framboesa, terra, cogumelos
- Grande potencial de envelhecimento""",
            "content_en": """Burgundy is where the concept of terroir was developed. With only two main grapes, the region demonstrates how place defines wine.

**Classification System**

Burgundy uses a hierarchical system based on vineyards (climats):

**1. Grand Cru (1-2% of production)**
- The best vineyards
- Vineyard name on label (e.g., "Romanée-Conti")
- 33 Grand Crus for reds and whites

**2. Premier Cru (10-12%)**
- High-quality vineyards
- Village name + "Premier Cru" + vineyard name

**3. Village (35-40%)**
- Wines from specific village
- E.g., "Gevrey-Chambertin", "Meursault"

**4. Régional (50%)**
- Regional denominations
- E.g., "Bourgogne Rouge", "Bourgogne Blanc"

**The Sub-regions**

- **Chablis**: Mineral Chardonnay, no oak
- **Côte de Nuits**: Age-worthy Pinot Noir
- **Côte de Beaune**: Elegant Chardonnay + good reds
- **Côte Chalonnaise**: Excellent value
- **Mâconnais**: Accessible Chardonnay

**Pinot Noir in Burgundy**
- Expresses subtle terroir nuances
- Delicate tannins, vibrant acidity
- Aromas of cherry, raspberry, earth, mushrooms
- Great aging potential""",
            "duration_minutes": 18
        },
        {
            "lesson_id": "intermediate_4", "track_id": "intermediate", "order": 4,
            "title_pt": "Métodos de Vinificação: Tintos", "title_en": "Winemaking Methods: Reds",
            "content_pt": """A vinificação de tintos envolve etapas específicas que definem o estilo final do vinho.

**Etapas da Vinificação**

**1. Recepção e Desengace**
- Seleção das uvas (manual ou ótica)
- Desengace: remoção dos engaços (hastes)
- Opção de manter engaços: mais tanino e frescor

**2. Maceração e Fermentação**
A maceração extrai cor, taninos e aromas das cascas:

- **Maceração a frio (5-10°C)**: Extrai cor e aromas sem taninos
- **Fermentação (20-30°C)**: Leveduras convertem açúcar em álcool
- **Remontagem**: Bombear o mosto sobre as cascas
- **Pigeage**: Afundar as cascas manualmente

**3. Fermentação Malolática**
- Converte ácido málico em ácido lático
- Reduz acidez, adiciona cremosidade
- Essencial para tintos, opcional para brancos

**4. Envelhecimento**
Opções de recipiente:
- **Inox**: Preserva frescor e fruta
- **Carvalho novo**: Adiciona baunilha, especiarias, taninos
- **Carvalho usado**: Oxigenação suave sem sabores de madeira
- **Concreto/Ânfora**: Neutralidade com micro-oxigenação

**5. Clarificação e Filtração**
- Colagem com bentonita, clara de ovo ou outros agentes
- Filtração para remover partículas
- Alguns produtores optam por não filtrar

**Maceração Carbônica**
- Uvas inteiras em ambiente de CO2
- Fermentação intracelular
- Produz vinhos frutados e leves
- Típico do Beaujolais Nouveau""",
            "content_en": """Red winemaking involves specific stages that define the wine's final style.

**Winemaking Stages**

**1. Reception and Destemming**
- Grape selection (manual or optical)
- Destemming: removing stems
- Option to keep stems: more tannin and freshness

**2. Maceration and Fermentation**
Maceration extracts color, tannins and aromas from skins:

- **Cold maceration (5-10°C)**: Extracts color and aromas without tannins
- **Fermentation (20-30°C)**: Yeasts convert sugar to alcohol
- **Pump-over**: Pumping must over the skins
- **Punch-down**: Manually submerging skins

**3. Malolactic Fermentation**
- Converts malic acid to lactic acid
- Reduces acidity, adds creaminess
- Essential for reds, optional for whites

**4. Aging**
Vessel options:
- **Stainless steel**: Preserves freshness and fruit
- **New oak**: Adds vanilla, spice, tannins
- **Used oak**: Gentle oxygenation without wood flavors
- **Concrete/Amphora**: Neutrality with micro-oxygenation

**5. Fining and Filtration**
- Fining with bentonite, egg white or other agents
- Filtration to remove particles
- Some producers choose not to filter

**Carbonic Maceration**
- Whole grapes in CO2 environment
- Intracellular fermentation
- Produces fruity, light wines
- Typical of Beaujolais Nouveau""",
            "duration_minutes": 20
        },
        {
            "lesson_id": "intermediate_5", "track_id": "intermediate", "order": 5,
            "title_pt": "Métodos de Vinificação: Brancos", "title_en": "Winemaking Methods: Whites",
            "content_pt": """A vinificação de brancos difere dos tintos principalmente pela ausência de maceração prolongada.

**Etapas da Vinificação de Brancos**

**1. Colheita e Prensagem**
- Colheita mais cedo para preservar acidez
- Prensagem rápida para evitar oxidação
- Separação do mosto das cascas antes da fermentação

**2. Clarificação do Mosto**
- Débourbage: decantação a frio (12-24h)
- Remove partículas sólidas
- Resulta em vinhos mais limpos

**3. Fermentação**
- Temperatura mais baixa (12-18°C) para preservar aromas
- Pode ser em inox (frescor) ou barrica (complexidade)
- Fermentação mais longa que tintos

**Técnicas Especiais**

**Bâtonnage (Batimento das Borras)**
- Agitar as borras finas durante envelhecimento
- Adiciona textura cremosa e complexidade
- Típico de Borgonha branca

**Fermentação em Barrica**
- Fermentação em carvalho novo ou usado
- Integração mais harmoniosa da madeira
- Adiciona notas de baunilha, noz, manteiga

**Maceração Pelicular**
- Contato breve com as cascas (2-24h)
- Adiciona textura e aromas
- Base dos "Orange Wines"

**Estilos de Chardonnay**

- **Chablis**: Inox, mineral, cítrico
- **Borgonha**: Barrica, amanteigado, noz
- **Novo Mundo**: Carvalho intenso, tropical

**Preservação da Acidez**
- Fermentação a frio
- Evitar ou controlar FML
- Colheita antecipada""",
            "content_en": """White winemaking differs from reds mainly by the absence of prolonged maceration.

**White Winemaking Stages**

**1. Harvest and Pressing**
- Earlier harvest to preserve acidity
- Quick pressing to avoid oxidation
- Separation of must from skins before fermentation

**2. Must Clarification**
- Débourbage: cold settling (12-24h)
- Removes solid particles
- Results in cleaner wines

**3. Fermentation**
- Lower temperature (12-18°C) to preserve aromas
- Can be in stainless (freshness) or barrel (complexity)
- Longer fermentation than reds

**Special Techniques**

**Bâtonnage (Lees Stirring)**
- Stirring fine lees during aging
- Adds creamy texture and complexity
- Typical of white Burgundy

**Barrel Fermentation**
- Fermentation in new or used oak
- More harmonious wood integration
- Adds vanilla, nut, butter notes

**Skin Contact**
- Brief contact with skins (2-24h)
- Adds texture and aromas
- Basis of "Orange Wines"

**Chardonnay Styles**

- **Chablis**: Stainless, mineral, citrus
- **Burgundy**: Barrel, buttery, nutty
- **New World**: Intense oak, tropical

**Acidity Preservation**
- Cold fermentation
- Avoid or control MLF
- Early harvest""",
            "duration_minutes": 18
        },
        {
            "lesson_id": "intermediate_6", "track_id": "intermediate", "order": 6,
            "title_pt": "Espumantes: Métodos de Produção", "title_en": "Sparkling: Production Methods",
            "content_pt": """Os vinhos espumantes são definidos pelo seu método de produção, que determina a qualidade e o estilo das bolhas.

**Método Tradicional (Champenoise)**
Usado em: Champagne, Cava, Crémant, Franciacorta

1. **Vinho Base**: Fermentação normal de uvas
2. **Tiragem**: Adição de leveduras e açúcar
3. **Segunda Fermentação**: Na garrafa, produz CO2
4. **Sur Lie**: Envelhecimento sobre borras (mínimo 15 meses para Champagne)
5. **Remuage**: Girar garrafas para concentrar borras no gargalo
6. **Dégorgement**: Remover borras congeladas
7. **Dosage**: Adicionar licor de expedição (define doçura)

**Níveis de Doçura**
- Brut Nature: 0-3 g/L
- Extra Brut: 0-6 g/L
- Brut: 0-12 g/L
- Extra Dry: 12-17 g/L
- Sec: 17-32 g/L
- Demi-Sec: 32-50 g/L

**Método Charmat (Tanque)**
Usado em: Prosecco, Lambrusco

- Segunda fermentação em tanques pressurizados
- Mais rápido e econômico
- Bolhas maiores, menos persistentes
- Preserva frescor e aromas primários

**Método Ancestral**
- Apenas uma fermentação
- Engarrafamento antes do fim da fermentação
- Leve turvação natural
- Usado em Pét-Nat

**Champagne: Especificidades**
- Apenas 3 uvas: Chardonnay, Pinot Noir, Pinot Meunier
- Blanc de Blancs: 100% Chardonnay
- Blanc de Noirs: Uvas tintas vinificadas em branco
- Rosé: Blend ou maceração curta""",
            "content_en": """Sparkling wines are defined by their production method, which determines the quality and style of bubbles.

**Traditional Method (Champenoise)**
Used in: Champagne, Cava, Crémant, Franciacorta

1. **Base Wine**: Normal fermentation of grapes
2. **Tirage**: Addition of yeast and sugar
3. **Second Fermentation**: In bottle, produces CO2
4. **Sur Lie**: Aging on lees (minimum 15 months for Champagne)
5. **Riddling**: Rotating bottles to concentrate lees in neck
6. **Disgorgement**: Removing frozen lees
7. **Dosage**: Adding expedition liquor (defines sweetness)

**Sweetness Levels**
- Brut Nature: 0-3 g/L
- Extra Brut: 0-6 g/L
- Brut: 0-12 g/L
- Extra Dry: 12-17 g/L
- Sec: 17-32 g/L
- Demi-Sec: 32-50 g/L

**Charmat Method (Tank)**
Used in: Prosecco, Lambrusco

- Second fermentation in pressurized tanks
- Faster and more economical
- Larger, less persistent bubbles
- Preserves freshness and primary aromas

**Ancestral Method**
- Only one fermentation
- Bottling before fermentation ends
- Light natural cloudiness
- Used in Pét-Nat

**Champagne: Specifics**
- Only 3 grapes: Chardonnay, Pinot Noir, Pinot Meunier
- Blanc de Blancs: 100% Chardonnay
- Blanc de Noirs: Red grapes vinified as white
- Rosé: Blend or short maceration""",
            "duration_minutes": 20
        },
        {
            "lesson_id": "intermediate_7", "track_id": "intermediate", "order": 7,
            "title_pt": "Vinhos Doces e Fortificados", "title_en": "Sweet and Fortified Wines",
            "content_pt": """Vinhos doces e fortificados representam algumas das maiores expressões da arte vinícola.

**Métodos para Vinhos Doces**

**1. Colheita Tardia (Late Harvest)**
- Uvas colhidas após maturação completa
- Concentração natural de açúcar
- Exemplos: Spätlese, Auslese (Alemanha)

**2. Botrytis Cinerea (Podridão Nobre)**
- Fungo que desidrata as uvas
- Concentra açúcares e adiciona aromas únicos (mel, damasco)
- Regiões: Sauternes, Tokaji, Trockenbeerenauslese
- Condições específicas: manhãs úmidas, tardes secas

**3. Vinho de Gelo (Icewine/Eiswein)**
- Uvas congeladas naturalmente na videira (-7°C a -8°C)
- Prensagem congela a água, concentrando açúcar
- Produzido no Canadá, Alemanha, Áustria

**4. Passificação**
- Secagem das uvas após colheita
- Perde água, concentra açúcar
- Exemplos: Amarone, Vin Santo, Passito

**Vinhos Fortificados**

**Porto**
- Fortificado durante fermentação (77% aguardente vínica)
- Estilos: Ruby, Tawny, Vintage, LBV, Vintage
- Colheita e Vintage: envelhecidos em garrafa
- Tawny: envelhecido em barrica (oxidativo)

**Jerez (Sherry)**
- Produzido em Jerez, Espanha
- Sistema Solera: blend de várias safras
- Estilos: Fino, Manzanilla (sob flor), Oloroso, PX

**Madeira**
- Fortificado e aquecido (estufagem)
- Indestrutível: pode durar séculos
- Estilos por uva: Sercial, Verdelho, Bual, Malmsey""",
            "content_en": """Sweet and fortified wines represent some of the greatest expressions of winemaking art.

**Methods for Sweet Wines**

**1. Late Harvest**
- Grapes harvested after full ripeness
- Natural sugar concentration
- Examples: Spätlese, Auslese (Germany)

**2. Botrytis Cinerea (Noble Rot)**
- Fungus that dehydrates grapes
- Concentrates sugars and adds unique aromas (honey, apricot)
- Regions: Sauternes, Tokaji, Trockenbeerenauslese
- Specific conditions: humid mornings, dry afternoons

**3. Ice Wine (Icewine/Eiswein)**
- Grapes naturally frozen on vine (-7°C to -8°C)
- Pressing freezes water, concentrating sugar
- Produced in Canada, Germany, Austria

**4. Dried Grape Wines**
- Drying grapes after harvest
- Loses water, concentrates sugar
- Examples: Amarone, Vin Santo, Passito

**Fortified Wines**

**Port**
- Fortified during fermentation (77% grape spirit)
- Styles: Ruby, Tawny, Vintage, LBV, Vintage
- Vintage: bottle-aged
- Tawny: barrel-aged (oxidative)

**Sherry**
- Produced in Jerez, Spain
- Solera system: blend of multiple vintages
- Styles: Fino, Manzanilla (under flor), Oloroso, PX

**Madeira**
- Fortified and heated (estufagem)
- Indestructible: can last centuries
- Styles by grape: Sercial, Verdelho, Bual, Malmsey""",
            "duration_minutes": 22
        },
        {
            "lesson_id": "intermediate_8", "track_id": "intermediate", "order": 8,
            "title_pt": "Itália e Espanha: Tradições Mediterrâneas", "title_en": "Italy and Spain: Mediterranean Traditions",
            "content_pt": """Itália e Espanha compartilham clima mediterrâneo mas possuem tradições vinícolas distintas.

**ITÁLIA**

**Sistema de Classificação**
- DOCG: Denominação de Origem Controlada e Garantida (mais alto)
- DOC: Denominação de Origem Controlada
- IGT: Indicação Geográfica Típica (permite mais liberdade)
- Vino: Vinho de mesa

**Principais Regiões**
- **Piemonte**: Nebbiolo (Barolo, Barbaresco), Barbera, Moscato
- **Toscana**: Sangiovese (Chianti, Brunello), Super Toscanos
- **Vêneto**: Corvina (Amarone, Valpolicella), Prosecco
- **Trentino-Alto Ádige**: Pinot Grigio, Gewürztraminer

**Castas Importantes**
- Nebbiolo: Taninos firmes, aromas de rosa e alcatrão
- Sangiovese: Acidez alta, cereja, ervas
- Corvina: Base do Amarone e Valpolicella

**ESPANHA**

**Sistema de Classificação**
- DOCa/DOQ: Denominação de Origem Qualificada (Rioja, Priorat)
- DO: Denominação de Origem
- Vino de Pago: Vinhedos únicos de alta qualidade

**Sistema de Envelhecimento**
- Joven: Sem envelhecimento obrigatório
- Crianza: 2 anos (6 meses em carvalho)
- Reserva: 3 anos (1 ano em carvalho)
- Gran Reserva: 5 anos (18 meses em carvalho)

**Principais Regiões**
- **Rioja**: Tempranillo, estilo clássico com carvalho americano
- **Ribera del Duero**: Tempranillo potente e moderno
- **Priorat**: Garnacha e Cariñena em xisto, vinhos concentrados
- **Rías Baixas**: Albariño, brancos aromáticos""",
            "content_en": """Italy and Spain share a Mediterranean climate but have distinct wine traditions.

**ITALY**

**Classification System**
- DOCG: Controlled and Guaranteed Designation of Origin (highest)
- DOC: Controlled Designation of Origin
- IGT: Typical Geographic Indication (allows more freedom)
- Vino: Table wine

**Main Regions**
- **Piedmont**: Nebbiolo (Barolo, Barbaresco), Barbera, Moscato
- **Tuscany**: Sangiovese (Chianti, Brunello), Super Tuscans
- **Veneto**: Corvina (Amarone, Valpolicella), Prosecco
- **Trentino-Alto Adige**: Pinot Grigio, Gewürztraminer

**Important Grapes**
- Nebbiolo: Firm tannins, rose and tar aromas
- Sangiovese: High acidity, cherry, herbs
- Corvina: Base for Amarone and Valpolicella

**SPAIN**

**Classification System**
- DOCa/DOQ: Qualified Designation of Origin (Rioja, Priorat)
- DO: Designation of Origin
- Vino de Pago: Single high-quality vineyard estates

**Aging System**
- Joven: No mandatory aging
- Crianza: 2 years (6 months in oak)
- Reserva: 3 years (1 year in oak)
- Gran Reserva: 5 years (18 months in oak)

**Main Regions**
- **Rioja**: Tempranillo, classic style with American oak
- **Ribera del Duero**: Powerful, modern Tempranillo
- **Priorat**: Grenache and Carignan on slate, concentrated wines
- **Rías Baixas**: Albariño, aromatic whites""",
            "duration_minutes": 20
        }
    ]
    
    # Advanced Lessons
    advanced_lessons = [
        {
            "lesson_id": "advanced_1", "track_id": "advanced", "order": 1,
            "title_pt": "Comparação de Terroirs: Pinot Noir", "title_en": "Terroir Comparison: Pinot Noir",
            "content_pt": """A Pinot Noir é a uva mais sensível ao terroir, tornando-a ideal para estudar como o lugar influencia o vinho.

**Borgonha, França**
- **Solo**: Calcário e argila
- **Clima**: Continental frio
- **Estilo**: Elegante, terroso, floral
- **Aromas**: Cereja, framboesa, cogumelo, terra úmida
- **Estrutura**: Taninos finos, acidez alta, corpo médio
- **Envelhecimento**: 10-30+ anos (Grand Cru)

**Oregon, EUA**
- **Solo**: Vulcânico, sedimentar
- **Clima**: Marítimo frio (similar à Borgonha)
- **Estilo**: Frutado com terrosidade
- **Aromas**: Frutas vermelhas, especiarias, terroso
- **Estrutura**: Taninos médios, acidez média-alta
- **Envelhecimento**: 5-15 anos

**Califórnia (Sonoma Coast)**
- **Solo**: Variado
- **Clima**: Marítimo com neblina
- **Estilo**: Mais rico e maduro
- **Aromas**: Cereja preta, cola, especiarias
- **Estrutura**: Corpo mais cheio, álcool mais alto
- **Envelhecimento**: 5-12 anos

**Marlborough, Nova Zelândia**
- **Solo**: Aluvial, cascalho
- **Clima**: Marítimo fresco
- **Estilo**: Vibrante e expressivo
- **Aromas**: Cereja, ameixa, herbal
- **Estrutura**: Acidez alta, taninos sedosos
- **Envelhecimento**: 5-10 anos

**Análise Comparativa**
Ao degustar Pinot Noir de diferentes regiões, observe:
1. Cor: Borgonha tende a ser mais clara
2. Nariz: Terroso vs frutado
3. Paladar: Acidez, taninos, corpo
4. Final: Mineralidade vs fruta""",
            "content_en": """Pinot Noir is the most terroir-sensitive grape, making it ideal for studying how place influences wine.

**Burgundy, France**
- **Soil**: Limestone and clay
- **Climate**: Cold continental
- **Style**: Elegant, earthy, floral
- **Aromas**: Cherry, raspberry, mushroom, wet earth
- **Structure**: Fine tannins, high acidity, medium body
- **Aging**: 10-30+ years (Grand Cru)

**Oregon, USA**
- **Soil**: Volcanic, sedimentary
- **Climate**: Cold maritime (similar to Burgundy)
- **Style**: Fruity with earthiness
- **Aromas**: Red fruits, spices, earthy
- **Structure**: Medium tannins, medium-high acidity
- **Aging**: 5-15 years

**California (Sonoma Coast)**
- **Soil**: Varied
- **Climate**: Maritime with fog
- **Style**: Richer and riper
- **Aromas**: Black cherry, cola, spices
- **Structure**: Fuller body, higher alcohol
- **Aging**: 5-12 years

**Marlborough, New Zealand**
- **Soil**: Alluvial, gravel
- **Climate**: Cool maritime
- **Style**: Vibrant and expressive
- **Aromas**: Cherry, plum, herbal
- **Structure**: High acidity, silky tannins
- **Aging**: 5-10 years

**Comparative Analysis**
When tasting Pinot Noir from different regions, observe:
1. Color: Burgundy tends to be lighter
2. Nose: Earthy vs fruity
3. Palate: Acidity, tannins, body
4. Finish: Minerality vs fruit""",
            "duration_minutes": 25
        },
        {
            "lesson_id": "advanced_2", "track_id": "advanced", "order": 2,
            "title_pt": "O Impacto das Decisões Humanas", "title_en": "The Impact of Human Decisions",
            "content_pt": """Além do terroir, as escolhas do viticultor e enólogo definem o estilo final do vinho.

**Decisões no Vinhedo**

**Poda e Condução**
- Guyot, Gobelet, Cordon: afetam vigor e exposição
- Maior produtividade = menos concentração
- Desfolha: expõe cachos ao sol

**Irrigação**
- Proibida em muitas regiões europeias
- Comum no Novo Mundo
- Déficit hídrico controlado: concentra sabores

**Viticultura Orgânica e Biodinâmica**
- Orgânica: Sem químicos sintéticos
- Biodinâmica: Segue calendário lunar, preparados especiais
- Natural: Mínima intervenção na adega

**Decisões na Adega**

**Leveduras**
- Selvagens: Mais complexidade, risco de defeitos
- Selecionadas: Consistência, aromas específicos

**Maceração**
- Curta: Vinhos leves, frutados
- Longa: Mais extração, taninos, cor
- A frio: Preserva aromas primários

**Recipientes de Fermentação/Envelhecimento**
- Inox: Neutralidade, frescor
- Carvalho novo: Taninos, especiarias, baunilha
- Carvalho usado: Oxigenação suave
- Concreto: Textura sem sabores de madeira
- Ânfora: Estilo ancestral, textural

**Origem do Carvalho**
- Francês: Mais sutil, especiarias finas
- Americano: Mais agressivo, coco, baunilha
- Húngaro, Esloveno: Intermediário

**Clarificação e Filtração**
- Filtrado: Mais limpo, menos complexo
- Não filtrado: Mais textura, risco de instabilidade""",
            "content_en": """Beyond terroir, winemaker choices define the wine's final style.

**Vineyard Decisions**

**Pruning and Training**
- Guyot, Gobelet, Cordon: affect vigor and exposure
- Higher yields = less concentration
- Leaf pulling: exposes clusters to sun

**Irrigation**
- Prohibited in many European regions
- Common in New World
- Controlled water deficit: concentrates flavors

**Organic and Biodynamic Viticulture**
- Organic: No synthetic chemicals
- Biodynamic: Follows lunar calendar, special preparations
- Natural: Minimal intervention in winery

**Winery Decisions**

**Yeasts**
- Wild: More complexity, risk of faults
- Selected: Consistency, specific aromas

**Maceration**
- Short: Light, fruity wines
- Long: More extraction, tannins, color
- Cold: Preserves primary aromas

**Fermentation/Aging Vessels**
- Stainless: Neutrality, freshness
- New oak: Tannins, spices, vanilla
- Used oak: Gentle oxygenation
- Concrete: Texture without wood flavors
- Amphora: Ancestral style, textural

**Oak Origin**
- French: More subtle, fine spices
- American: More aggressive, coconut, vanilla
- Hungarian, Slovenian: Intermediate

**Fining and Filtration**
- Filtered: Cleaner, less complex
- Unfiltered: More texture, risk of instability""",
            "duration_minutes": 22
        },
        {
            "lesson_id": "advanced_3", "track_id": "advanced", "order": 3,
            "title_pt": "Envelhecimento e Evolução do Vinho", "title_en": "Aging and Wine Evolution",
            "content_pt": """Entender como o vinho evolui é essencial para saber quando abrir suas garrafas.

**O que acontece durante o envelhecimento?**

**Reações Químicas**
- Polimerização de taninos: Ficam mais suaves
- Esterificação: Aromas mais complexos
- Oxidação lenta: Mudança de cor e sabor
- Precipitação: Formação de sedimentos

**Fatores que afetam a longevidade**

**Estrutura do Vinho**
- Acidez: Alta acidez = maior longevidade
- Taninos: Mais taninos = mais potencial
- Álcool: Preserva, mas em excesso desequilibra
- Açúcar residual: Atua como conservante

**Condições de Armazenamento**
- Temperatura: 12-14°C ideal, constante
- Umidade: 70-80% para manter a rolha
- Luz: Ausência de luz direta
- Posição: Horizontal para rolhas naturais
- Vibração: Evitar movimentos constantes

**Curva de Evolução**

**Fase de Desenvolvimento**
- Vinho jovem, aromas primários
- Taninos podem ser agressivos
- Acidez pode parecer alta

**Fase de Maturidade**
- Integração de componentes
- Aromas secundários e terciários
- Taninos sedosos
- Complexidade máxima

**Fase de Declínio**
- Perda de fruta
- Aromas de oxidação (nozes, caramelo)
- Acidez proeminente
- Taninos secos

**Potencial de Guarda por Estilo**
- Beaujolais: 1-3 anos
- Rioja Crianza: 5-10 anos
- Bordeaux Cru Classé: 15-40+ anos
- Borgonha Grand Cru: 15-50+ anos
- Vintage Port: 40-100+ anos
- Madeira: Virtualmente imortal""",
            "content_en": """Understanding how wine evolves is essential to knowing when to open your bottles.

**What happens during aging?**

**Chemical Reactions**
- Tannin polymerization: Become softer
- Esterification: More complex aromas
- Slow oxidation: Color and flavor changes
- Precipitation: Sediment formation

**Factors affecting longevity**

**Wine Structure**
- Acidity: High acidity = greater longevity
- Tannins: More tannins = more potential
- Alcohol: Preserves, but excess unbalances
- Residual sugar: Acts as preservative

**Storage Conditions**
- Temperature: 12-14°C ideal, constant
- Humidity: 70-80% to maintain cork
- Light: No direct light
- Position: Horizontal for natural corks
- Vibration: Avoid constant movement

**Evolution Curve**

**Development Phase**
- Young wine, primary aromas
- Tannins may be aggressive
- Acidity may seem high

**Maturity Phase**
- Component integration
- Secondary and tertiary aromas
- Silky tannins
- Maximum complexity

**Decline Phase**
- Fruit loss
- Oxidation aromas (nuts, caramel)
- Prominent acidity
- Dry tannins

**Aging Potential by Style**
- Beaujolais: 1-3 years
- Rioja Crianza: 5-10 years
- Bordeaux Cru Classé: 15-40+ years
- Burgundy Grand Cru: 15-50+ years
- Vintage Port: 40-100+ years
- Madeira: Virtually immortal""",
            "duration_minutes": 20
        },
        {
            "lesson_id": "advanced_4", "track_id": "advanced", "order": 4,
            "title_pt": "Tipicidade vs Inovação", "title_en": "Typicity vs Innovation",
            "content_pt": """O debate entre tradição e modernidade define muito do mundo do vinho contemporâneo.

**O Conceito de Tipicidade**

Tipicidade refere-se às características esperadas de um vinho de determinada região:
- Chianti deve ter acidez alta e sabor de cereja ácida
- Borgonha tinta deve ser elegante, não potente
- Barossa Shiraz deve ser encorpado e frutado

**Argumentos pela Tradição**
- Preserva identidade regional
- Facilita reconhecimento pelo consumidor
- Protege patrimônio cultural
- Sistemas de denominação existem para isso

**Movimentos Inovadores**

**Super Toscanos (1970s)**
- Usaram Cabernet em vez de Sangiovese
- Ignoraram regras DOC
- Hoje são alguns dos vinhos mais caros da Itália
- Exemplo: Sassicaia, Tignanello, Ornellaia

**Vinhos Naturais**
- Mínima intervenção
- Sem sulfitos adicionados
- Leveduras nativas
- Podem ser controversos (defeitos vs características)

**Orange Wines**
- Vinhos brancos com maceração prolongada
- Tradição da Geórgia revivida
- Cor âmbar, taninos, complexidade

**Vinhos de Altitude**
- Produção em altitudes extremas
- Argentina (Salta), Chile (Elqui)
- Novo estilo sendo definido

**Questões para Reflexão**
1. Deve um Chianti usar Cabernet Sauvignon?
2. Vinhos naturais são "melhores" ou apenas diferentes?
3. As denominações limitam a criatividade?
4. Como equilibrar tradição e evolução?

**O Caminho do Meio**
Muitos produtores encontram equilíbrio:
- Respeitam tradições mas experimentam
- Fazem vinhos "de denominação" e "de garagem"
- Inovam dentro dos limites do terroir""",
            "content_en": """The debate between tradition and modernity defines much of contemporary wine.

**The Concept of Typicity**

Typicity refers to expected characteristics of a wine from a certain region:
- Chianti should have high acidity and sour cherry flavor
- Red Burgundy should be elegant, not powerful
- Barossa Shiraz should be full-bodied and fruity

**Arguments for Tradition**
- Preserves regional identity
- Facilitates consumer recognition
- Protects cultural heritage
- Denomination systems exist for this

**Innovative Movements**

**Super Tuscans (1970s)**
- Used Cabernet instead of Sangiovese
- Ignored DOC rules
- Today are some of Italy's most expensive wines
- Examples: Sassicaia, Tignanello, Ornellaia

**Natural Wines**
- Minimal intervention
- No added sulfites
- Native yeasts
- Can be controversial (faults vs characteristics)

**Orange Wines**
- White wines with prolonged maceration
- Georgian tradition revived
- Amber color, tannins, complexity

**High Altitude Wines**
- Production at extreme altitudes
- Argentina (Salta), Chile (Elqui)
- New style being defined

**Questions for Reflection**
1. Should a Chianti use Cabernet Sauvignon?
2. Are natural wines "better" or just different?
3. Do denominations limit creativity?
4. How to balance tradition and evolution?

**The Middle Way**
Many producers find balance:
- Respect traditions but experiment
- Make "denomination" and "garage" wines
- Innovate within terroir limits""",
            "duration_minutes": 18
        }
    ]
    
    # More quiz questions
    new_quiz_questions = [
        # Intermediate questions
        {"question_id": "int_q1", "track_id": "intermediate", "question_type": "multiple_choice", "question_pt": "Qual componente do terroir é responsável pela drenagem e concentração de sabores em Bordeaux?", "question_en": "Which terroir component is responsible for drainage and flavor concentration in Bordeaux?", "options_pt": ["Argila", "Calcário", "Cascalho", "Xisto"], "options_en": ["Clay", "Limestone", "Gravel", "Schist"], "correct_answer": 2, "explanation_pt": "O cascalho (graves) em Bordeaux proporciona excelente drenagem, forçando as raízes a buscar água profundamente, resultando em vinhos mais concentrados.", "explanation_en": "Gravel (graves) in Bordeaux provides excellent drainage, forcing roots to seek water deeply, resulting in more concentrated wines."},
        {"question_id": "int_q2", "track_id": "intermediate", "question_type": "multiple_choice", "question_pt": "Qual é a diferença principal entre a Margem Esquerda e a Margem Direita de Bordeaux?", "question_en": "What is the main difference between the Left Bank and Right Bank of Bordeaux?", "options_pt": ["Clima", "Uva dominante", "Altitude", "Método de vinificação"], "options_en": ["Climate", "Dominant grape", "Altitude", "Winemaking method"], "correct_answer": 1, "explanation_pt": "A Margem Esquerda é dominada por Cabernet Sauvignon (solos de cascalho), enquanto a Margem Direita é dominada por Merlot (solos de argila e calcário).", "explanation_en": "The Left Bank is dominated by Cabernet Sauvignon (gravel soils), while the Right Bank is dominated by Merlot (clay and limestone soils)."},
        {"question_id": "int_q3", "track_id": "intermediate", "question_type": "multiple_choice", "question_pt": "O que é fermentação malolática?", "question_en": "What is malolactic fermentation?", "options_pt": ["Conversão de açúcar em álcool", "Conversão de ácido málico em ácido lático", "Fermentação em barrica", "Segunda fermentação para espumantes"], "options_en": ["Conversion of sugar to alcohol", "Conversion of malic acid to lactic acid", "Barrel fermentation", "Second fermentation for sparkling"], "correct_answer": 1, "explanation_pt": "A FML converte o ácido málico (agressivo, maçã verde) em ácido lático (suave, cremoso), reduzindo a acidez e adicionando textura.", "explanation_en": "MLF converts malic acid (aggressive, green apple) to lactic acid (soft, creamy), reducing acidity and adding texture."},
        {"question_id": "int_q4", "track_id": "intermediate", "question_type": "multiple_choice", "question_pt": "Qual método de produção é usado para Champagne?", "question_en": "Which production method is used for Champagne?", "options_pt": ["Charmat", "Ancestral", "Tradicional (Champenoise)", "Transferência"], "options_en": ["Charmat", "Ancestral", "Traditional (Champenoise)", "Transfer"], "correct_answer": 2, "explanation_pt": "O Método Tradicional (Champenoise) envolve segunda fermentação na garrafa, envelhecimento sobre borras, remuage e dégorgement.", "explanation_en": "The Traditional Method (Champenoise) involves second fermentation in bottle, lees aging, riddling and disgorgement."},
        {"question_id": "int_q5", "track_id": "intermediate", "question_type": "true_false", "question_pt": "Botrytis cinerea é um fungo prejudicial que sempre arruina as uvas.", "question_en": "Botrytis cinerea is a harmful fungus that always ruins grapes.", "options_pt": ["Verdadeiro", "Falso"], "options_en": ["True", "False"], "correct_answer": 1, "explanation_pt": "Sob condições específicas (manhãs úmidas, tardes secas), Botrytis se torna 'podridão nobre', concentrando açúcares e criando aromas únicos em vinhos como Sauternes e Tokaji.", "explanation_en": "Under specific conditions (humid mornings, dry afternoons), Botrytis becomes 'noble rot', concentrating sugars and creating unique aromas in wines like Sauternes and Tokaji."},
        {"question_id": "int_q6", "track_id": "intermediate", "question_type": "multiple_choice", "question_pt": "Qual é a uva principal do Barolo?", "question_en": "What is the main grape of Barolo?", "options_pt": ["Sangiovese", "Nebbiolo", "Corvina", "Aglianico"], "options_en": ["Sangiovese", "Nebbiolo", "Corvina", "Aglianico"], "correct_answer": 1, "explanation_pt": "Barolo é feito 100% de Nebbiolo, uma uva com taninos firmes, acidez alta e aromas característicos de rosa, alcatrão e cereja.", "explanation_en": "Barolo is made 100% from Nebbiolo, a grape with firm tannins, high acidity and characteristic aromas of rose, tar and cherry."},
        
        # Advanced questions
        {"question_id": "adv_q1", "track_id": "advanced", "question_type": "multiple_choice", "question_pt": "Por que a Pinot Noir é considerada a uva mais sensível ao terroir?", "question_en": "Why is Pinot Noir considered the most terroir-sensitive grape?", "options_pt": ["Produz mais álcool", "Casca fina expressa nuances do solo", "É mais resistente a doenças", "Amadurece mais rápido"], "options_en": ["Produces more alcohol", "Thin skin expresses soil nuances", "More disease resistant", "Ripens faster"], "correct_answer": 1, "explanation_pt": "A casca fina da Pinot Noir oferece menos 'filtro' entre o terroir e o vinho, permitindo que características sutis do solo e clima se expressem.", "explanation_en": "Pinot Noir's thin skin offers less 'filter' between terroir and wine, allowing subtle soil and climate characteristics to express themselves."},
        {"question_id": "adv_q2", "track_id": "advanced", "question_type": "multiple_choice", "question_pt": "O que são os 'Super Toscanos'?", "question_en": "What are 'Super Tuscans'?", "options_pt": ["Vinhos DOC de alta qualidade", "Vinhos que usam uvas não tradicionais da Toscana", "Vinhos biodinâmicos", "Vinhos de colheita tardia"], "options_en": ["High quality DOC wines", "Wines using non-traditional Tuscan grapes", "Biodynamic wines", "Late harvest wines"], "correct_answer": 1, "explanation_pt": "Super Toscanos são vinhos que usam Cabernet Sauvignon, Merlot ou outras uvas internacionais, desafiando as regras tradicionais do DOC toscano.", "explanation_en": "Super Tuscans are wines using Cabernet Sauvignon, Merlot or other international grapes, defying traditional Tuscan DOC rules."},
        {"question_id": "adv_q3", "track_id": "advanced", "question_type": "multiple_choice", "question_pt": "Durante o envelhecimento, o que acontece com os taninos?", "question_en": "During aging, what happens to tannins?", "options_pt": ["Aumentam", "Polimerizam e ficam mais suaves", "Desaparecem completamente", "Tornam-se mais agressivos"], "options_en": ["Increase", "Polymerize and become softer", "Disappear completely", "Become more aggressive"], "correct_answer": 1, "explanation_pt": "Os taninos se polimerizam (juntam-se em cadeias maiores) durante o envelhecimento, tornando-se mais suaves e aveludados na textura.", "explanation_en": "Tannins polymerize (join into larger chains) during aging, becoming softer and more velvety in texture."},
        {"question_id": "adv_q4", "track_id": "advanced", "question_type": "true_false", "question_pt": "Vinhos com maior acidez geralmente têm maior potencial de envelhecimento.", "question_en": "Wines with higher acidity generally have greater aging potential.", "options_pt": ["Verdadeiro", "Falso"], "options_en": ["True", "False"], "correct_answer": 0, "explanation_pt": "A acidez atua como conservante natural no vinho. Vinhos com acidez alta, como Riesling e Borgonha, podem envelhecer por décadas.", "explanation_en": "Acidity acts as a natural preservative in wine. High-acid wines like Riesling and Burgundy can age for decades."},
    ]
    
    # Insert all new content
    await db.lessons.insert_many(intermediate_lessons + advanced_lessons)
    await db.quiz_questions.insert_many(new_quiz_questions)
    
    # Update study track lesson counts
    await db.study_tracks.update_one({"track_id": "intermediate"}, {"$set": {"lessons_count": 8}})
    await db.study_tracks.update_one({"track_id": "advanced"}, {"$set": {"lessons_count": 4}})
    
    return {
        "message": "Content expanded successfully",
        "new_lessons": len(intermediate_lessons) + len(advanced_lessons),
        "new_questions": len(new_quiz_questions)
    }

# ======================== COMPLETE GRAPE SEEDING ========================

@api_router.post("/seed/grapes-complete")
async def seed_complete_grapes():
    """Seed the database with a comprehensive list of grape varieties from all major wine regions"""
    
    # Check if grapes already seeded extensively
    grape_count = await db.grapes.count_documents({})
    if grape_count > 50:
        return {"message": "Grapes already extensively seeded", "grape_count": grape_count}
    
    # Clear existing grapes to avoid duplicates
    await db.grapes.delete_many({})
    
    # Insert all complete grapes
    await db.grapes.insert_many(COMPLETE_GRAPES)
    
    # Update aroma tags with any new aromas found in the grapes
    existing_tags = {tag["name_en"] async for tag in db.aroma_tags.find({}, {"name_en": 1})}
    
    # Collect all unique aromas from the complete grapes
    all_aromas = set()
    for grape in COMPLETE_GRAPES:
        all_aromas.update(grape.get("aromatic_notes", []))
        all_aromas.update(grape.get("flavor_notes", []))
    
    # Add new aroma tags that don't exist yet
    new_aroma_tags = []
    aroma_categories = {
        "fruit": ["Cherry", "Raspberry", "Strawberry", "Blackberry", "Plum", "Apple", "Pear", "Peach", "Apricot", 
                  "Citrus", "Lime", "Lemon", "Grapefruit", "Orange", "Tropical fruits", "Passion fruit", 
                  "Gooseberry", "Cassis", "Black currant", "Red berries", "Dark fruits", "Fig", "Prune", "Raisins",
                  "Stone fruit", "Jam", "Kirsch", "Sour cherry", "Blood orange", "Quince", "Melon"],
        "floral": ["Rose", "Violet", "White flowers", "Orange blossom", "Honeysuckle", "Acacia", "Peony", 
                   "Elderflower", "Chamomile", "Geranium", "Floral"],
        "vegetal": ["Grass", "Herbs", "Green pepper", "Mint", "Tomato leaf", "Asparagus", "Dried herbs", 
                    "Bay leaf", "Sage", "Fennel", "Garrigue", "Pea shoot", "Herbal"],
        "spice": ["Black pepper", "White pepper", "Spice", "Licorice", "Ginger", "Cinnamon", "Clove", "Pepper"],
        "oak": ["Oak", "Vanilla", "Cedar", "Toast", "Coconut", "Sandalwood", "Smoke"],
        "earth": ["Earth", "Leather", "Truffle", "Mushroom", "Forest floor", "Wet wool", "Lanolin", 
                  "Volcanic ash", "Tar", "Graphite", "Pencil lead", "Slate", "Game", "Meat"],
        "mineral": ["Mineral", "Saline", "Chalk", "Flint", "Sea salt", "Wet stone"],
        "nuts": ["Almond", "Hazelnut", "Nuts", "Bitter almond", "Walnut", "Marzipan"],
        "sweet": ["Honey", "Chocolate", "Dark chocolate", "Cocoa", "Caramel", "Mocha", "Butterscotch"],
        "dairy": ["Butter", "Cream", "Yogurt", "Bread", "Yeast"],
        "roasted": ["Coffee", "Tobacco", "Smoke", "Toast", "Rubber", "Ink", "Bacon"],
        "other": ["Petrol", "Musk", "Turkish delight", "Lentil"]
    }
    
    # Map aromas to categories
    def get_category(aroma):
        for cat, aromas in aroma_categories.items():
            if aroma in aromas:
                return cat
        return "other"
    
    # Create simple Portuguese translations
    pt_translations = {
        "Cherry": "Cereja", "Raspberry": "Framboesa", "Strawberry": "Morango", "Blackberry": "Amora",
        "Plum": "Ameixa", "Apple": "Maçã", "Pear": "Pera", "Peach": "Pêssego", "Apricot": "Damasco",
        "Citrus": "Cítrico", "Lime": "Lima", "Lemon": "Limão", "Grapefruit": "Grapefruit",
        "Tropical fruits": "Frutas tropicais", "Passion fruit": "Maracujá", "Gooseberry": "Groselha",
        "Cassis": "Cassis", "Black currant": "Groselha preta", "Red berries": "Frutas vermelhas",
        "Dark fruits": "Frutas escuras", "Fig": "Figo", "Rose": "Rosa", "Violet": "Violeta",
        "White flowers": "Flores brancas", "Orange blossom": "Flor de laranjeira",
        "Grass": "Capim", "Herbs": "Ervas", "Green pepper": "Pimentão verde", "Mint": "Menta",
        "Tomato leaf": "Folha de tomate", "Dried herbs": "Ervas secas",
        "Black pepper": "Pimenta preta", "White pepper": "Pimenta branca", "Spice": "Especiarias",
        "Licorice": "Alcaçuz", "Ginger": "Gengibre",
        "Oak": "Carvalho", "Vanilla": "Baunilha", "Cedar": "Cedro", "Toast": "Tostado",
        "Earth": "Terra", "Leather": "Couro", "Truffle": "Trufa", "Mushroom": "Cogumelo",
        "Forest floor": "Chão de floresta", "Tar": "Alcatrão", "Graphite": "Grafite",
        "Mineral": "Mineral", "Saline": "Salino", "Slate": "Ardósia",
        "Almond": "Amêndoa", "Hazelnut": "Avelã", "Nuts": "Nozes",
        "Honey": "Mel", "Chocolate": "Chocolate", "Dark chocolate": "Chocolate amargo",
        "Cocoa": "Cacau", "Mocha": "Mocha",
        "Butter": "Manteiga", "Cream": "Creme",
        "Coffee": "Café", "Tobacco": "Tabaco", "Smoke": "Defumado", "Bacon": "Bacon",
        "Petrol": "Petróleo", "Game": "Caça", "Meat": "Carne"
    }
    
    for aroma in all_aromas:
        if aroma not in existing_tags:
            new_aroma_tags.append({
                "tag_id": aroma.lower().replace(" ", "_").replace("-", "_"),
                "name_pt": pt_translations.get(aroma, aroma),
                "name_en": aroma,
                "category": get_category(aroma),
                "emoji": "🍷"  # Default emoji
            })
    
    if new_aroma_tags:
        await db.aroma_tags.insert_many(new_aroma_tags)
    
    return {
        "message": "Complete grape database seeded successfully",
        "grapes_added": len(COMPLETE_GRAPES),
        "new_aroma_tags_added": len(new_aroma_tags),
        "grape_types": {
            "red": len([g for g in COMPLETE_GRAPES if g["grape_type"] == "red"]),
            "white": len([g for g in COMPLETE_GRAPES if g["grape_type"] == "white"])
        },
        "countries": list(set(g["origin_country"] for g in COMPLETE_GRAPES))
    }


@api_router.post("/seed/expand-advanced")
async def expand_advanced_content():
    """Add more advanced study content"""
    
    # Check if already expanded
    advanced_count = await db.lessons.count_documents({"track_id": "advanced"})
    if advanced_count >= 10:
        return {"message": "Advanced content already expanded", "lesson_count": advanced_count}
    
    new_advanced_lessons = [
        {
            "lesson_id": "advanced_5", "track_id": "advanced", "order": 5,
            "title_pt": "Análise Sensorial Avançada", "title_en": "Advanced Sensory Analysis",
            "content_pt": """A análise sensorial profissional vai além da degustação casual, utilizando metodologias estruturadas.

**Sistemática de Degustação**

A metodologia WSET (Wine & Spirit Education Trust) é o padrão internacional:

**1. Aparência**
- Intensidade: pálido, médio, profundo
- Cor: núcleo e borda (indica idade)
- Limpidez e viscosidade

**2. Nariz**
- Condição: limpo ou com defeitos
- Intensidade aromática
- Características: frutadas, florais, herbáceas, especiarias, carvalho, terciárias

**3. Paladar**
- Doçura: seco a doce
- Acidez: baixa a alta
- Tanino (tintos): baixo a alto
- Corpo: leve a encorpado
- Intensidade de sabor
- Final: curto a longo

**4. Conclusão**
- Qualidade (BLIC: defeituoso, aceitável, bom, muito bom, excepcional)
- Potencial de guarda
- Estado de maturação

**Defeitos Comuns**

- **TCA (rolha)**: Mofo, papelão molhado
- **Brettanomyces**: Curral, band-aid
- **Oxidação**: Maçã podre, xerez (em não fortificados)
- **Redução**: Ovo podre, borracha queimada
- **Acidez volátil**: Vinagre, esmalte""",
            "content_en": """Professional sensory analysis goes beyond casual tasting, using structured methodologies.

**Tasting Systematic**

The WSET (Wine & Spirit Education Trust) methodology is the international standard:

**1. Appearance**
- Intensity: pale, medium, deep
- Color: core and rim (indicates age)
- Clarity and viscosity

**2. Nose**
- Condition: clean or faulty
- Aromatic intensity
- Characteristics: fruity, floral, herbaceous, spices, oak, tertiary

**3. Palate**
- Sweetness: dry to sweet
- Acidity: low to high
- Tannin (reds): low to high
- Body: light to full
- Flavor intensity
- Finish: short to long

**4. Conclusion**
- Quality (BLIC: faulty, acceptable, good, very good, outstanding)
- Aging potential
- Readiness

**Common Faults**

- **TCA (cork taint)**: Mold, wet cardboard
- **Brettanomyces**: Barnyard, band-aid
- **Oxidation**: Rotten apple, sherry (in non-fortified)
- **Reduction**: Rotten egg, burnt rubber
- **Volatile acidity**: Vinegar, nail polish""",
            "duration_minutes": 25
        },
        {
            "lesson_id": "advanced_6", "track_id": "advanced", "order": 6,
            "title_pt": "Grandes Vinhos da Itália", "title_en": "Great Wines of Italy",
            "content_pt": """A Itália é o maior produtor de vinho do mundo, com uma diversidade incomparável de uvas autóctones.

**Os 4 Grandes (DOCG Mais Prestigiosos)**

**1. Barolo e Barbaresco (Piemonte)**
- Uva: Nebbiolo
- Estilo: Taninos firmes, acidez alta, cor clara
- Aromas: Rosa, alcatrão, cereja, trufa
- Guarda: 15-40+ anos para Barolo
- Diferença: Barolo mais potente, Barbaresco mais elegante

**2. Brunello di Montalcino (Toscana)**
- Uva: Sangiovese Grosso (clone local)
- Estilo: Encorpado, tânico, complexo
- Aromas: Cereja ácida, couro, tabaco, terra
- Envelhecimento: Mínimo 5 anos (2 em carvalho)
- Guarda: 10-30+ anos

**3. Amarone della Valpolicella (Vêneto)**
- Uvas: Corvina, Rondinella, Molinara
- Método: Appassimento (uvas secas por 3-4 meses)
- Estilo: Rico, potente, levemente doce
- Álcool: 15-17%
- Aromas: Cereja seca, chocolate, café, especiarias

**Super Toscanos**

Movimento dos anos 1970 que desafiou as regras DOC:
- Uso de Cabernet Sauvignon e Merlot
- Exemplos: Sassicaia, Ornellaia, Tignanello
- Hoje são alguns dos vinhos mais caros da Itália

**Outras Regiões Importantes**
- Chianti Classico (Sangiovese)
- Bolgheri (blends bordaleses)
- Etna (Nerello Mascalese)
- Taurasi (Aglianico)""",
            "content_en": """Italy is the world's largest wine producer, with an unparalleled diversity of indigenous grapes.

**The Big 4 (Most Prestigious DOCGs)**

**1. Barolo and Barbaresco (Piedmont)**
- Grape: Nebbiolo
- Style: Firm tannins, high acidity, light color
- Aromas: Rose, tar, cherry, truffle
- Aging: 15-40+ years for Barolo
- Difference: Barolo more powerful, Barbaresco more elegant

**2. Brunello di Montalcino (Tuscany)**
- Grape: Sangiovese Grosso (local clone)
- Style: Full-bodied, tannic, complex
- Aromas: Sour cherry, leather, tobacco, earth
- Aging: Minimum 5 years (2 in oak)
- Cellaring: 10-30+ years

**3. Amarone della Valpolicella (Veneto)**
- Grapes: Corvina, Rondinella, Molinara
- Method: Appassimento (grapes dried for 3-4 months)
- Style: Rich, powerful, slightly sweet
- Alcohol: 15-17%
- Aromas: Dried cherry, chocolate, coffee, spices

**Super Tuscans**

1970s movement that challenged DOC rules:
- Use of Cabernet Sauvignon and Merlot
- Examples: Sassicaia, Ornellaia, Tignanello
- Today among Italy's most expensive wines

**Other Important Regions**
- Chianti Classico (Sangiovese)
- Bolgheri (Bordeaux blends)
- Etna (Nerello Mascalese)
- Taurasi (Aglianico)""",
            "duration_minutes": 22
        },
        {
            "lesson_id": "advanced_7", "track_id": "advanced", "order": 7,
            "title_pt": "Grandes Vinhos da Espanha", "title_en": "Great Wines of Spain",
            "content_pt": """A Espanha possui a maior área plantada de vinhedos do mundo e uma rica tradição vinícola.

**Rioja: O Clássico**

Sistema de classificação único baseado em tempo de envelhecimento:
- **Joven**: Pouco ou nenhum carvalho
- **Crianza**: 2 anos (1 em barrica)
- **Reserva**: 3 anos (1 em barrica)
- **Gran Reserva**: 5 anos (2 em barrica)

Uva principal: Tempranillo
Sub-regiões: Alta (altitude, elegância), Alavesa (vales), Oriental (calor, potência)

**Ribera del Duero**

- Clima extremo: Frio intenso, verões quentes
- Uva: Tempranillo (localmente "Tinto Fino")
- Estilo: Mais potente que Rioja, frutas negras
- Grandes produtores: Vega Sicilia, Pingus, Pesquera

**Priorat**

- Região renascentista nos anos 1980
- Solos de licorella (xisto)
- Uvas: Garnacha, Carignan (Cariñena)
- Estilo: Concentrado, mineral, álcool alto
- DOCa status (junto com Rioja)

**Jerez (Sherry)**

Vinhos fortificados únicos com sistema de solera:
- **Fino/Manzanilla**: Sob flor, seco, leve
- **Amontillado**: Biológico depois oxidativo
- **Oloroso**: Oxidativo, encorpado
- **Pedro Ximénez**: Doce, viscoso

**Cava**

Espumante método tradicional da Catalunha:
- Uvas: Macabeo, Parellada, Xarel·lo
- Alternativa acessível ao Champagne""",
            "content_en": """Spain has the largest vineyard area in the world and a rich winemaking tradition.

**Rioja: The Classic**

Unique classification system based on aging time:
- **Joven**: Little or no oak
- **Crianza**: 2 years (1 in barrel)
- **Reserva**: 3 years (1 in barrel)
- **Gran Reserva**: 5 years (2 in barrel)

Main grape: Tempranillo
Sub-regions: Alta (altitude, elegance), Alavesa (valleys), Oriental (heat, power)

**Ribera del Duero**

- Extreme climate: Intense cold, hot summers
- Grape: Tempranillo (locally "Tinto Fino")
- Style: More powerful than Rioja, black fruits
- Great producers: Vega Sicilia, Pingus, Pesquera

**Priorat**

- Renaissance region in the 1980s
- Licorella soils (schist)
- Grapes: Garnacha, Carignan (Cariñena)
- Style: Concentrated, mineral, high alcohol
- DOCa status (along with Rioja)

**Jerez (Sherry)**

Unique fortified wines with solera system:
- **Fino/Manzanilla**: Under flor, dry, light
- **Amontillado**: Biological then oxidative
- **Oloroso**: Oxidative, full-bodied
- **Pedro Ximénez**: Sweet, viscous

**Cava**

Traditional method sparkling from Catalonia:
- Grapes: Macabeo, Parellada, Xarel·lo
- Affordable Champagne alternative""",
            "duration_minutes": 20
        },
        {
            "lesson_id": "advanced_8", "track_id": "advanced", "order": 8,
            "title_pt": "Vinhos do Novo Mundo", "title_en": "New World Wines",
            "content_pt": """O Novo Mundo revolucionou a indústria vinícola com inovação e qualidade.

**Estados Unidos (Califórnia)**

**Napa Valley**
- Região mais prestigiosa dos EUA
- Especialidade: Cabernet Sauvignon
- Sub-AVAs: Oakville, Rutherford, Stags Leap
- Estilo: Encorpado, frutado, carvalho novo

**Sonoma**
- Mais diversa que Napa
- Pinot Noir e Chardonnay (Russian River, Sonoma Coast)
- Zinfandel (Dry Creek Valley)

**Oregon**
- Clima frio, foco em Pinot Noir
- Willamette Valley: Borgonha americana

**Argentina**

- Altitude extrema (até 3.000m)
- Uva emblemática: Malbec
- Mendoza: 70% da produção
- Salta: Vinhos de altitude, Torrontés

**Chile**

- Condições ideais (seco, sem filoxera)
- Cabernet Sauvignon: Maipo Valley
- Carménère: Uva emblemática
- Vinhos costeiros: Casablanca, Leyda

**Austrália**

- Shiraz: Barossa Valley (potente)
- Cabernet: Coonawarra (terroso)
- Riesling: Clare e Eden Valley
- Sistema de indicação geográfica (GI)

**Nova Zelândia**

- Sauvignon Blanc: Marlborough (intenso)
- Pinot Noir: Central Otago, Martinborough
- Clima marítimo fresco

**África do Sul**

- Pinotage: cruzamento único
- Chenin Blanc: uva mais plantada
- Stellenbosch: região clássica""",
            "content_en": """The New World revolutionized the wine industry with innovation and quality.

**United States (California)**

**Napa Valley**
- Most prestigious US region
- Specialty: Cabernet Sauvignon
- Sub-AVAs: Oakville, Rutherford, Stags Leap
- Style: Full-bodied, fruity, new oak

**Sonoma**
- More diverse than Napa
- Pinot Noir and Chardonnay (Russian River, Sonoma Coast)
- Zinfandel (Dry Creek Valley)

**Oregon**
- Cool climate, Pinot Noir focus
- Willamette Valley: American Burgundy

**Argentina**

- Extreme altitude (up to 3,000m)
- Emblematic grape: Malbec
- Mendoza: 70% of production
- Salta: Altitude wines, Torrontés

**Chile**

- Ideal conditions (dry, no phylloxera)
- Cabernet Sauvignon: Maipo Valley
- Carménère: Emblematic grape
- Coastal wines: Casablanca, Leyda

**Australia**

- Shiraz: Barossa Valley (powerful)
- Cabernet: Coonawarra (earthy)
- Riesling: Clare and Eden Valley
- Geographical Indication (GI) system

**New Zealand**

- Sauvignon Blanc: Marlborough (intense)
- Pinot Noir: Central Otago, Martinborough
- Cool maritime climate

**South Africa**

- Pinotage: unique cross
- Chenin Blanc: most planted grape
- Stellenbosch: classic region""",
            "duration_minutes": 22
        },
        {
            "lesson_id": "advanced_9", "track_id": "advanced", "order": 9,
            "title_pt": "Harmonização Avançada", "title_en": "Advanced Food Pairing",
            "content_pt": """A harmonização avançada vai além de "tinto com carne, branco com peixe".

**Princípios Fundamentais**

**1. Peso e Intensidade**
- Pratos leves → vinhos leves
- Pratos intensos → vinhos potentes
- Exceção: contraste intencional

**2. Interação de Sabores**
- Acidez do vinho corta gordura
- Tanino combina com proteína
- Doçura equilibra picante

**3. Componentes Problemáticos**
- Alcachofra: contém cinarina (altera sabor)
- Aspargos: compostos sulfurosos
- Vinagrete: acidez compete com vinho
- Pimenta intensa: ressalta álcool

**Harmonizações Clássicas**

**Queijos**
- Brie/Camembert → Champagne, Chardonnay
- Roquefort → Sauternes, Porto
- Parmesão → Barolo, Chianti
- Cabra → Sancerre, Sauvignon Blanc

**Carnes**
- Cordeiro → Rioja, Bordeaux
- Vitela → Pinot Noir, Barbera
- Porco → Riesling, Chenin Blanc
- Pato → Pinot Noir, Côtes du Rhône

**Frutos do Mar**
- Ostras → Chablis, Muscadet
- Salmão → Pinot Noir leve, Rosé
- Lagosta → Champagne, Borgonha branco
- Atum grelhado → Tintos leves

**Harmonização Regional**
O princípio mais seguro: vinhos e comidas da mesma região evoluíram juntos
- Chianti + massa com molho de tomate
- Albariño + frutos do mar galegos
- Gewürztraminer + choucroute alsaciana""",
            "content_en": """Advanced pairing goes beyond "red with meat, white with fish".

**Fundamental Principles**

**1. Weight and Intensity**
- Light dishes → light wines
- Intense dishes → powerful wines
- Exception: intentional contrast

**2. Flavor Interaction**
- Wine acidity cuts fat
- Tannin pairs with protein
- Sweetness balances spicy

**3. Problematic Components**
- Artichoke: contains cynarin (alters taste)
- Asparagus: sulfur compounds
- Vinaigrette: acidity competes with wine
- Intense spice: highlights alcohol

**Classic Pairings**

**Cheeses**
- Brie/Camembert → Champagne, Chardonnay
- Roquefort → Sauternes, Port
- Parmesan → Barolo, Chianti
- Goat → Sancerre, Sauvignon Blanc

**Meats**
- Lamb → Rioja, Bordeaux
- Veal → Pinot Noir, Barbera
- Pork → Riesling, Chenin Blanc
- Duck → Pinot Noir, Côtes du Rhône

**Seafood**
- Oysters → Chablis, Muscadet
- Salmon → Light Pinot Noir, Rosé
- Lobster → Champagne, White Burgundy
- Grilled tuna → Light reds

**Regional Pairing**
The safest principle: wines and foods from the same region evolved together
- Chianti + pasta with tomato sauce
- Albariño + Galician seafood
- Gewürztraminer + Alsatian choucroute""",
            "duration_minutes": 20
        },
        {
            "lesson_id": "advanced_10", "track_id": "advanced", "order": 10,
            "title_pt": "Serviço e Armazenamento", "title_en": "Service and Storage",
            "content_pt": """O serviço correto pode transformar a experiência de um vinho.

**Temperatura de Serviço**

A temperatura errada é o erro mais comum:

**Vinhos Brancos e Rosés**
- Espumantes: 6-8°C
- Brancos leves (Vinho Verde): 8-10°C
- Brancos encorpados (Borgonha): 10-12°C
- Rosés: 10-12°C

**Vinhos Tintos**
- Leves (Beaujolais): 12-14°C
- Médios (Pinot Noir): 14-16°C
- Encorpados (Bordeaux, Barolo): 16-18°C

*"Temperatura ambiente" é um mito - veio de castelos sem aquecimento!*

**Decantação**

**Quando decantar:**
- Vinhos jovens potentes: aerar 1-2 horas
- Vinhos velhos com sedimento: decantar cuidadosamente
- Tintos tânicos fechados

**Quando NÃO decantar:**
- Brancos delicados
- Espumantes (perde gás)
- Vinhos muito velhos e frágeis

**Ordem de Serviço**
1. Espumantes primeiro
2. Brancos antes de tintos
3. Leves antes de encorpados
4. Secos antes de doces
5. Jovens antes de velhos

**Armazenamento**

**Condições ideais:**
- Temperatura: 12-14°C constante
- Umidade: 70-75%
- Escuro (luz UV degrada)
- Sem vibração
- Sem odores fortes
- Garrafas deitadas (para rolha)

**Quanto tempo guardar:**
- A maioria dos vinhos: beber em 2-3 anos
- Apenas 1-5% dos vinhos melhora com guarda
- Grandes tintos e doces: 10-50+ anos""",
            "content_en": """Proper service can transform a wine experience.

**Serving Temperature**

Wrong temperature is the most common mistake:

**White and Rosé Wines**
- Sparkling: 6-8°C
- Light whites (Vinho Verde): 8-10°C
- Full-bodied whites (Burgundy): 10-12°C
- Rosés: 10-12°C

**Red Wines**
- Light (Beaujolais): 12-14°C
- Medium (Pinot Noir): 14-16°C
- Full-bodied (Bordeaux, Barolo): 16-18°C

*"Room temperature" is a myth - it came from unheated castles!*

**Decanting**

**When to decant:**
- Young powerful wines: aerate 1-2 hours
- Old wines with sediment: decant carefully
- Closed tannic reds

**When NOT to decant:**
- Delicate whites
- Sparkling (loses fizz)
- Very old fragile wines

**Service Order**
1. Sparkling first
2. Whites before reds
3. Light before full-bodied
4. Dry before sweet
5. Young before old

**Storage**

**Ideal conditions:**
- Temperature: 12-14°C constant
- Humidity: 70-75%
- Dark (UV light degrades)
- No vibration
- No strong odors
- Bottles lying down (for cork)

**How long to keep:**
- Most wines: drink within 2-3 years
- Only 1-5% of wines improve with age
- Great reds and sweets: 10-50+ years""",
            "duration_minutes": 18
        }
    ]
    
    # Additional quiz questions for advanced content
    new_advanced_questions = [
        {"question_id": "adv_q5", "track_id": "advanced", "question_type": "multiple_choice", 
         "question_pt": "Qual é a temperatura ideal para servir um Bordeaux tinto encorpado?",
         "question_en": "What is the ideal serving temperature for a full-bodied red Bordeaux?",
         "options_pt": ["6-8°C", "10-12°C", "16-18°C", "20-22°C"],
         "options_en": ["6-8°C", "10-12°C", "16-18°C", "20-22°C"],
         "correct_answer": 2,
         "explanation_pt": "Vinhos tintos encorpados devem ser servidos entre 16-18°C. 'Temperatura ambiente' é um mito de castelos sem aquecimento.",
         "explanation_en": "Full-bodied reds should be served at 16-18°C. 'Room temperature' is a myth from unheated castles."},
        
        {"question_id": "adv_q6", "track_id": "advanced", "question_type": "multiple_choice",
         "question_pt": "Qual é o método de produção do Amarone?",
         "question_en": "What is the production method for Amarone?",
         "options_pt": ["Fermentação em barrica", "Appassimento (secagem das uvas)", "Maceração carbônica", "Fortificação"],
         "options_en": ["Barrel fermentation", "Appassimento (grape drying)", "Carbonic maceration", "Fortification"],
         "correct_answer": 1,
         "explanation_pt": "Amarone usa o método Appassimento, onde as uvas são secas por 3-4 meses antes da fermentação, concentrando açúcares e sabores.",
         "explanation_en": "Amarone uses the Appassimento method, where grapes are dried for 3-4 months before fermentation, concentrating sugars and flavors."},
        
        {"question_id": "adv_q7", "track_id": "advanced", "question_type": "true_false",
         "question_pt": "A maioria dos vinhos melhora significativamente com o envelhecimento.",
         "question_en": "Most wines improve significantly with aging.",
         "options_pt": ["Verdadeiro", "Falso"],
         "options_en": ["True", "False"],
         "correct_answer": 1,
         "explanation_pt": "Falso. Apenas 1-5% dos vinhos realmente melhoram com guarda. A maioria deve ser consumida em 2-3 anos.",
         "explanation_en": "False. Only 1-5% of wines actually improve with aging. Most should be consumed within 2-3 years."},
        
        {"question_id": "adv_q8", "track_id": "advanced", "question_type": "multiple_choice",
         "question_pt": "Qual defeito do vinho é caracterizado por aromas de curral e band-aid?",
         "question_en": "Which wine fault is characterized by barnyard and band-aid aromas?",
         "options_pt": ["TCA (rolha)", "Oxidação", "Brettanomyces", "Redução"],
         "options_en": ["TCA (cork taint)", "Oxidation", "Brettanomyces", "Reduction"],
         "correct_answer": 2,
         "explanation_pt": "Brettanomyces é uma levedura que produz compostos com aromas de curral, suor de cavalo e band-aid.",
         "explanation_en": "Brettanomyces is a yeast that produces compounds with barnyard, horse sweat and band-aid aromas."}
    ]
    
    await db.lessons.insert_many(new_advanced_lessons)
    await db.quiz_questions.insert_many(new_advanced_questions)
    await db.study_tracks.update_one({"track_id": "advanced"}, {"$set": {"lessons_count": 10}})
    
    return {
        "message": "Advanced content expanded successfully",
        "new_lessons": len(new_advanced_lessons),
        "new_questions": len(new_advanced_questions)
    }


@api_router.post("/seed/regions-complete")
async def seed_complete_regions():
    """Seed the database with all wine regions with complete terroir information"""
    
    # Clear existing regions and insert new ones with complete data
    await db.regions.delete_many({})
    await db.regions.insert_many(COMPLETE_REGIONS)
    
    return {
        "message": "Complete regions database seeded successfully",
        "regions_added": len(COMPLETE_REGIONS),
        "countries_covered": len(set(r["country_id"] for r in COMPLETE_REGIONS))
    }

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

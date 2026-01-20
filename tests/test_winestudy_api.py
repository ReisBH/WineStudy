"""
WineStudy API Tests - Comprehensive backend testing
Tests for: Grapes, Study Tracks, Tastings, and Filters
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://winestudy.preview.emergentagent.com')

# Test session token (created in MongoDB)
TEST_SESSION_TOKEN = "test_session_1768929554305"


class TestGrapesAPI:
    """Tests for /api/grapes endpoints"""
    
    def test_get_all_grapes_returns_81(self):
        """Verify that there are 81 grapes in the database"""
        response = requests.get(f"{BASE_URL}/api/grapes")
        assert response.status_code == 200
        grapes = response.json()
        assert len(grapes) == 81, f"Expected 81 grapes, got {len(grapes)}"
    
    def test_filter_grapes_by_type_red(self):
        """Verify filter by grape_type=red returns 43 red grapes"""
        response = requests.get(f"{BASE_URL}/api/grapes", params={"grape_type": "red"})
        assert response.status_code == 200
        grapes = response.json()
        assert len(grapes) == 43, f"Expected 43 red grapes, got {len(grapes)}"
        # Verify all returned grapes are red
        for grape in grapes:
            assert grape["grape_type"] == "red", f"Grape {grape['name']} is not red"
    
    def test_filter_grapes_by_type_white(self):
        """Verify filter by grape_type=white returns 38 white grapes"""
        response = requests.get(f"{BASE_URL}/api/grapes", params={"grape_type": "white"})
        assert response.status_code == 200
        grapes = response.json()
        assert len(grapes) == 38, f"Expected 38 white grapes, got {len(grapes)}"
        # Verify all returned grapes are white
        for grape in grapes:
            assert grape["grape_type"] == "white", f"Grape {grape['name']} is not white"
    
    def test_filter_grapes_by_aroma_cherry(self):
        """Verify filter by aroma=Cherry returns grapes with Cherry in aromatic_notes or flavor_notes"""
        response = requests.get(f"{BASE_URL}/api/grapes", params={"aroma": "Cherry"})
        assert response.status_code == 200
        grapes = response.json()
        assert len(grapes) > 0, "Expected at least one grape with Cherry aroma"
        # Verify all returned grapes have Cherry in their notes
        for grape in grapes:
            has_cherry = "Cherry" in grape.get("aromatic_notes", []) or "Cherry" in grape.get("flavor_notes", [])
            assert has_cherry, f"Grape {grape['name']} doesn't have Cherry in notes"
    
    def test_filter_grapes_by_aroma_blackberry(self):
        """Verify filter by aroma=Blackberry works"""
        response = requests.get(f"{BASE_URL}/api/grapes", params={"aroma": "Blackberry"})
        assert response.status_code == 200
        grapes = response.json()
        assert len(grapes) > 0, "Expected at least one grape with Blackberry aroma"
    
    def test_get_single_grape_cabernet_sauvignon(self):
        """Verify getting a single grape by ID"""
        response = requests.get(f"{BASE_URL}/api/grapes/cabernet_sauvignon")
        assert response.status_code == 200
        grape = response.json()
        assert grape["name"] == "Cabernet Sauvignon"
        assert grape["grape_type"] == "red"
        assert grape["origin_country"] == "france"
        assert "aromatic_notes" in grape
        assert "structure" in grape
    
    def test_get_nonexistent_grape_returns_404(self):
        """Verify 404 for non-existent grape"""
        response = requests.get(f"{BASE_URL}/api/grapes/nonexistent_grape")
        assert response.status_code == 404


class TestStudyTracksAPI:
    """Tests for /api/study/tracks endpoints"""
    
    def test_get_all_tracks_returns_3(self):
        """Verify there are 3 study tracks"""
        response = requests.get(f"{BASE_URL}/api/study/tracks")
        assert response.status_code == 200
        tracks = response.json()
        assert len(tracks) == 3, f"Expected 3 tracks, got {len(tracks)}"
    
    def test_basic_track_has_5_lessons(self):
        """Verify basic track has 5 lessons"""
        response = requests.get(f"{BASE_URL}/api/study/tracks")
        assert response.status_code == 200
        tracks = response.json()
        basic_track = next((t for t in tracks if t["track_id"] == "basic"), None)
        assert basic_track is not None, "Basic track not found"
        assert basic_track["lessons_count"] == 5, f"Expected 5 lessons, got {basic_track['lessons_count']}"
        assert basic_track["level"] == "basic"
    
    def test_intermediate_track_has_8_lessons(self):
        """Verify intermediate track has 8 lessons"""
        response = requests.get(f"{BASE_URL}/api/study/tracks")
        assert response.status_code == 200
        tracks = response.json()
        intermediate_track = next((t for t in tracks if t["track_id"] == "intermediate"), None)
        assert intermediate_track is not None, "Intermediate track not found"
        assert intermediate_track["lessons_count"] == 8, f"Expected 8 lessons, got {intermediate_track['lessons_count']}"
        assert intermediate_track["level"] == "intermediate"
    
    def test_advanced_track_has_10_lessons(self):
        """Verify advanced track has 10 lessons"""
        response = requests.get(f"{BASE_URL}/api/study/tracks")
        assert response.status_code == 200
        tracks = response.json()
        advanced_track = next((t for t in tracks if t["track_id"] == "advanced"), None)
        assert advanced_track is not None, "Advanced track not found"
        assert advanced_track["lessons_count"] == 10, f"Expected 10 lessons, got {advanced_track['lessons_count']}"
        assert advanced_track["level"] == "advanced"
    
    def test_get_advanced_lessons_returns_10(self):
        """Verify GET /api/study/tracks/advanced/lessons returns 10 lessons"""
        response = requests.get(f"{BASE_URL}/api/study/tracks/advanced/lessons")
        assert response.status_code == 200
        lessons = response.json()
        assert len(lessons) == 10, f"Expected 10 advanced lessons, got {len(lessons)}"
    
    def test_get_basic_lessons_returns_5(self):
        """Verify GET /api/study/tracks/basic/lessons returns 5 lessons"""
        response = requests.get(f"{BASE_URL}/api/study/tracks/basic/lessons")
        assert response.status_code == 200
        lessons = response.json()
        assert len(lessons) == 5, f"Expected 5 basic lessons, got {len(lessons)}"
    
    def test_get_intermediate_lessons_returns_8(self):
        """Verify GET /api/study/tracks/intermediate/lessons returns 8 lessons"""
        response = requests.get(f"{BASE_URL}/api/study/tracks/intermediate/lessons")
        assert response.status_code == 200
        lessons = response.json()
        assert len(lessons) == 8, f"Expected 8 intermediate lessons, got {len(lessons)}"


class TestTastingsAPI:
    """Tests for /api/tastings endpoints (requires authentication)"""
    
    @pytest.fixture
    def auth_headers(self):
        return {"Authorization": f"Bearer {TEST_SESSION_TOKEN}"}
    
    def test_get_tastings_requires_auth(self):
        """Verify GET /api/tastings requires authentication"""
        response = requests.get(f"{BASE_URL}/api/tastings")
        assert response.status_code == 401
    
    def test_get_tastings_with_auth(self, auth_headers):
        """Verify GET /api/tastings works with authentication"""
        response = requests.get(f"{BASE_URL}/api/tastings", headers=auth_headers)
        assert response.status_code == 200
        tastings = response.json()
        assert isinstance(tastings, list)
    
    def test_create_tasting(self, auth_headers):
        """Verify POST /api/tastings creates a new tasting"""
        tasting_data = {
            "wine_name": f"TEST_Wine_{datetime.now().timestamp()}",
            "vintage": 2020,
            "grape_ids": ["pinot_noir"],
            "region_id": "burgundy",
            "appearance": {"intensity": "medium", "color": "ruby"},
            "nose": {"condition": "clean", "intensity": "medium", "aromas": ["Cherry", "Rose"]},
            "palate": {"sweetness": "dry", "acidity": "high", "tannin": "medium", "body": "medium", "alcohol": "medium", "flavors": ["Red berries"], "finish": "medium"},
            "conclusion": {"quality": "good", "aging_potential": "can_age", "readiness": "drink_now"},
            "notes": "Test tasting note"
        }
        response = requests.post(
            f"{BASE_URL}/api/tastings",
            headers={**auth_headers, "Content-Type": "application/json"},
            json=tasting_data
        )
        assert response.status_code == 201
        created = response.json()
        assert "tasting_id" in created
        assert created["wine_name"] == tasting_data["wine_name"]
        assert created["vintage"] == 2020
        
        # Verify tasting was persisted by fetching it
        get_response = requests.get(
            f"{BASE_URL}/api/tastings/{created['tasting_id']}",
            headers=auth_headers
        )
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["wine_name"] == tasting_data["wine_name"]
    
    def test_get_tasting_by_id(self, auth_headers):
        """Verify GET /api/tastings/:id returns the tasting"""
        # First create a tasting
        tasting_data = {
            "wine_name": f"TEST_GetById_{datetime.now().timestamp()}",
            "vintage": 2019,
            "grape_ids": [],
            "appearance": {"intensity": "light", "color": "gold"},
            "nose": {"condition": "clean", "intensity": "light", "aromas": []},
            "palate": {"sweetness": "dry", "acidity": "medium", "tannin": "low", "body": "light", "alcohol": "low", "flavors": [], "finish": "short"},
            "conclusion": {"quality": "acceptable", "aging_potential": "not_suitable", "readiness": "drink_now"},
        }
        create_response = requests.post(
            f"{BASE_URL}/api/tastings",
            headers={**auth_headers, "Content-Type": "application/json"},
            json=tasting_data
        )
        assert create_response.status_code == 201
        tasting_id = create_response.json()["tasting_id"]
        
        # Now fetch it
        get_response = requests.get(
            f"{BASE_URL}/api/tastings/{tasting_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 200
        tasting = get_response.json()
        assert tasting["tasting_id"] == tasting_id
        assert tasting["wine_name"] == tasting_data["wine_name"]
    
    def test_get_nonexistent_tasting_returns_404(self, auth_headers):
        """Verify 404 for non-existent tasting"""
        response = requests.get(
            f"{BASE_URL}/api/tastings/nonexistent_tasting_id",
            headers=auth_headers
        )
        assert response.status_code == 404


class TestAromasAPI:
    """Tests for /api/aromas endpoints"""
    
    def test_get_all_aromas(self):
        """Verify GET /api/aromas returns aroma tags"""
        response = requests.get(f"{BASE_URL}/api/aromas")
        assert response.status_code == 200
        aromas = response.json()
        assert len(aromas) > 0, "Expected at least one aroma"
        # Verify structure
        for aroma in aromas:
            assert "tag_id" in aroma
            assert "name_pt" in aroma
            assert "name_en" in aroma
            assert "category" in aroma
            assert "emoji" in aroma
    
    def test_filter_aromas_by_category(self):
        """Verify filtering aromas by category"""
        response = requests.get(f"{BASE_URL}/api/aromas", params={"category": "fruit"})
        assert response.status_code == 200
        aromas = response.json()
        for aroma in aromas:
            assert aroma["category"] == "fruit"


class TestAuthAPI:
    """Tests for /api/auth endpoints"""
    
    def test_auth_me_requires_auth(self):
        """Verify GET /api/auth/me requires authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
    
    def test_auth_me_with_valid_token(self):
        """Verify GET /api/auth/me works with valid token"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {TEST_SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        user = response.json()
        assert "user_id" in user
        assert "email" in user
        assert "name" in user


class TestCountriesAndRegionsAPI:
    """Tests for /api/countries and /api/regions endpoints"""
    
    def test_get_countries(self):
        """Verify GET /api/countries returns countries"""
        response = requests.get(f"{BASE_URL}/api/countries")
        assert response.status_code == 200
        countries = response.json()
        assert len(countries) >= 10, "Expected at least 10 countries"
    
    def test_filter_countries_by_world_type(self):
        """Verify filtering countries by world_type"""
        response = requests.get(f"{BASE_URL}/api/countries", params={"world_type": "old_world"})
        assert response.status_code == 200
        countries = response.json()
        for country in countries:
            assert country["world_type"] == "old_world"
    
    def test_get_regions(self):
        """Verify GET /api/regions returns regions"""
        response = requests.get(f"{BASE_URL}/api/regions")
        assert response.status_code == 200
        regions = response.json()
        assert len(regions) >= 10, "Expected at least 10 regions"
    
    def test_filter_regions_by_country(self):
        """Verify filtering regions by country_id"""
        response = requests.get(f"{BASE_URL}/api/regions", params={"country_id": "france"})
        assert response.status_code == 200
        regions = response.json()
        for region in regions:
            assert region["country_id"] == "france"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

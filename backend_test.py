#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class WineStudyAPITester:
    def __init__(self, base_url="https://vinopedia-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text[:200]}")
                
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'endpoint': endpoint
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e),
                'endpoint': endpoint
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_seed_database(self):
        """Test database seeding"""
        return self.run_test("Seed Database", "POST", "seed", 200)

    def test_countries_api(self):
        """Test countries endpoints"""
        success, data = self.run_test("Get All Countries", "GET", "countries", 200)
        if success and data:
            print(f"   Found {len(data)} countries")
            
            # Test filtering by world type
            self.run_test("Get Old World Countries", "GET", "countries?world_type=old_world", 200)
            self.run_test("Get New World Countries", "GET", "countries?world_type=new_world", 200)
            
            # Test individual country if data exists
            if data and len(data) > 0:
                country_id = data[0].get('country_id')
                if country_id:
                    self.run_test(f"Get Country {country_id}", "GET", f"countries/{country_id}", 200)
        
        return success

    def test_regions_api(self):
        """Test regions endpoints"""
        success, data = self.run_test("Get All Regions", "GET", "regions", 200)
        if success and data:
            print(f"   Found {len(data)} regions")
            
            # Test individual region if data exists
            if data and len(data) > 0:
                region_id = data[0].get('region_id')
                if region_id:
                    self.run_test(f"Get Region {region_id}", "GET", f"regions/{region_id}", 200)
        
        return success

    def test_grapes_api(self):
        """Test grapes endpoints"""
        success, data = self.run_test("Get All Grapes", "GET", "grapes", 200)
        if success and data:
            print(f"   Found {len(data)} grapes")
            
            # Test filtering
            self.run_test("Get Red Grapes", "GET", "grapes?grape_type=red", 200)
            self.run_test("Get White Grapes", "GET", "grapes?grape_type=white", 200)
            
            # Test individual grape if data exists
            if data and len(data) > 0:
                grape_id = data[0].get('grape_id')
                if grape_id:
                    self.run_test(f"Get Grape {grape_id}", "GET", f"grapes/{grape_id}", 200)
        
        return success

    def test_aromas_api(self):
        """Test aromas endpoints"""
        success, data = self.run_test("Get All Aromas", "GET", "aromas", 200)
        if success and data:
            print(f"   Found {len(data)} aroma tags")
            
            # Test individual aroma grapes if data exists
            if data and len(data) > 0:
                tag_id = data[0].get('tag_id')
                if tag_id:
                    self.run_test(f"Get Grapes by Aroma {tag_id}", "GET", f"aromas/{tag_id}/grapes", 200)
        
        return success

    def test_study_tracks_api(self):
        """Test study tracks endpoints"""
        success, data = self.run_test("Get Study Tracks", "GET", "study/tracks", 200)
        if success and data:
            print(f"   Found {len(data)} study tracks")
            
            # Test individual track if data exists
            if data and len(data) > 0:
                track_id = data[0].get('track_id')
                if track_id:
                    self.run_test(f"Get Track {track_id}", "GET", f"study/tracks/{track_id}", 200)
                    self.run_test(f"Get Track {track_id} Lessons", "GET", f"study/tracks/{track_id}/lessons", 200)
        
        return success

    def test_search_api(self):
        """Test search functionality"""
        return self.run_test("Search API", "GET", "search?q=cabernet", 200)

    def test_user_registration(self):
        """Test user registration"""
        timestamp = int(datetime.now().timestamp())
        test_user = {
            "email": f"test.user.{timestamp}@example.com",
            "password": "TestPass123!",
            "name": f"Test User {timestamp}"
        }
        
        success, data = self.run_test("User Registration", "POST", "auth/register", 200, test_user)
        if success and data:
            self.user_id = data.get('user_id')
            print(f"   Created user: {self.user_id}")
        
        return success

    def test_user_login(self):
        """Test user login - create a new user first"""
        timestamp = int(datetime.now().timestamp())
        test_user = {
            "email": f"test.login.{timestamp}@example.com",
            "password": "TestPass123!",
            "name": f"Test Login User {timestamp}"
        }
        
        # First register
        reg_success, reg_data = self.run_test("Register for Login Test", "POST", "auth/register", 200, test_user)
        if not reg_success:
            return False
        
        # Then login
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        
        success, data = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        if success and data:
            self.token = data.get('token')
            self.user_id = data.get('user_id')
            print(f"   Logged in user: {self.user_id}")
            print(f"   Token: {self.token[:20]}..." if self.token else "   No token received")
        
        return success

    def test_authenticated_endpoints(self):
        """Test endpoints that require authentication"""
        if not self.token:
            print("⚠️  Skipping authenticated tests - no token available")
            return False
        
        # Test /auth/me
        self.run_test("Get Current User", "GET", "auth/me", 200)
        
        # Test user progress
        self.run_test("Get User Progress", "GET", "progress", 200)
        
        # Test tastings
        self.run_test("Get User Tastings", "GET", "tastings", 200)
        
        # Test creating a tasting note
        tasting_data = {
            "wine_name": "Test Wine",
            "vintage": 2020,
            "grape_ids": [],
            "appearance": {"color": "ruby", "intensity": "medium"},
            "nose": {"intensity": "medium", "notes": ["cherry", "vanilla"]},
            "palate": {"sweetness": "dry", "acidity": "medium", "tannin": "medium"},
            "conclusion": {"quality": "good", "ready": "now"},
            "notes": "Test tasting note"
        }
        
        success, data = self.run_test("Create Tasting Note", "POST", "tastings", 201, tasting_data)
        if success and data:
            tasting_id = data.get('tasting_id')
            if tasting_id:
                self.run_test(f"Get Tasting {tasting_id}", "GET", f"tastings/{tasting_id}", 200)
        
        return True

    def test_quiz_endpoints(self):
        """Test quiz functionality"""
        # Get study tracks first to get a track_id
        success, tracks = self.run_test("Get Tracks for Quiz", "GET", "study/tracks", 200)
        if success and tracks and len(tracks) > 0:
            track_id = tracks[0].get('track_id')
            if track_id:
                self.run_test(f"Get Quiz Questions for {track_id}", "GET", f"quiz/tracks/{track_id}/questions", 200)
        
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🍷 Starting WineStudy API Tests")
        print("=" * 50)
        
        # Basic API tests
        self.test_root_endpoint()
        self.test_seed_database()
        
        # Data API tests
        self.test_countries_api()
        self.test_regions_api()
        self.test_grapes_api()
        self.test_aromas_api()
        self.test_study_tracks_api()
        self.test_search_api()
        self.test_quiz_endpoints()
        
        # Auth tests
        self.test_user_registration()
        self.test_user_login()
        self.test_authenticated_endpoints()
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests ({len(self.failed_tests)}):")
            for test in self.failed_tests:
                error_msg = test.get('error', f"Expected {test.get('expected')}, got {test.get('actual')}")
                print(f"   • {test['test']}: {error_msg}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\n🎯 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = WineStudyAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
import psycopg2
import json
import sys
sys.path.insert(0, '/app/backend')

from grape_data import COMPLETE_GRAPES
from region_data import COMPLETE_REGIONS

NEON_URL = "postgresql://neondb_owner:npg_iuFJrUdRbt16@ep-dry-hall-ag84ay26-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Countries data
COUNTRIES = [
    {"country_id": "france", "name_pt": "França", "name_en": "France", "world_type": "old_world", "flag_emoji": "🇫🇷", "description_pt": "O berço dos vinhos finos, lar de Bordeaux, Borgonha e Champagne", "description_en": "The birthplace of fine wines, home of Bordeaux, Burgundy and Champagne"},
    {"country_id": "italy", "name_pt": "Itália", "name_en": "Italy", "world_type": "old_world", "flag_emoji": "🇮🇹", "description_pt": "Tradição milenar com diversidade incomparável de castas e estilos", "description_en": "Millennial tradition with unparalleled diversity of grapes and styles"},
    {"country_id": "spain", "name_pt": "Espanha", "name_en": "Spain", "world_type": "old_world", "flag_emoji": "🇪🇸", "description_pt": "Maior área vinícola do mundo, lar da Rioja e do Xerez", "description_en": "Largest vineyard area in the world, home of Rioja and Sherry"},
    {"country_id": "portugal", "name_pt": "Portugal", "name_en": "Portugal", "world_type": "old_world", "flag_emoji": "🇵🇹", "description_pt": "Casa do vinho do Porto e de castas autóctones únicas", "description_en": "Home of Port wine and unique indigenous grapes"},
    {"country_id": "germany", "name_pt": "Alemanha", "name_en": "Germany", "world_type": "old_world", "flag_emoji": "🇩🇪", "description_pt": "Mestre em Riesling, vinhos de clima frio de qualidade excepcional", "description_en": "Master of Riesling, exceptional quality cool-climate wines"},
    {"country_id": "austria", "name_pt": "Áustria", "name_en": "Austria", "world_type": "old_world", "flag_emoji": "🇦🇹", "description_pt": "Grüner Veltliner único e tradição de vinhos brancos aromáticos", "description_en": "Unique Grüner Veltliner and aromatic white wine tradition"},
    {"country_id": "greece", "name_pt": "Grécia", "name_en": "Greece", "world_type": "old_world", "flag_emoji": "🇬🇷", "description_pt": "Origem antiga do vinho com castas milenares", "description_en": "Ancient origin of wine with millennial grape varieties"},
    {"country_id": "usa", "name_pt": "Estados Unidos", "name_en": "United States", "world_type": "new_world", "flag_emoji": "🇺🇸", "description_pt": "Líder do Novo Mundo, inovação e qualidade de Napa a Oregon", "description_en": "New World leader, innovation and quality from Napa to Oregon"},
    {"country_id": "argentina", "name_pt": "Argentina", "name_en": "Argentina", "world_type": "new_world", "flag_emoji": "🇦🇷", "description_pt": "Terra do Malbec, vinhos de altitude de Mendoza", "description_en": "Land of Malbec, high altitude wines from Mendoza"},
    {"country_id": "chile", "name_pt": "Chile", "name_en": "Chile", "world_type": "new_world", "flag_emoji": "🇨🇱", "description_pt": "Vinhos de altitude e costa, excelente relação qualidade-preço", "description_en": "High altitude and coastal wines, excellent value"},
    {"country_id": "australia", "name_pt": "Austrália", "name_en": "Australia", "world_type": "new_world", "flag_emoji": "🇦🇺", "description_pt": "Inovação e qualidade, Shiraz icônico e vinhos de clima fresco", "description_en": "Innovation and quality, iconic Shiraz and cool-climate wines"},
    {"country_id": "new_zealand", "name_pt": "Nova Zelândia", "name_en": "New Zealand", "world_type": "new_world", "flag_emoji": "🇳🇿", "description_pt": "Sauvignon Blanc excepcional de Marlborough", "description_en": "Exceptional Sauvignon Blanc from Marlborough"},
    {"country_id": "south_africa", "name_pt": "África do Sul", "name_en": "South Africa", "world_type": "new_world", "flag_emoji": "🇿🇦", "description_pt": "Berço do Pinotage, diversidade de terroirs únicos", "description_en": "Birthplace of Pinotage, diversity of unique terroirs"},
]

STUDY_TRACKS = [
    {"track_id": "basic", "level": "basic", "title_pt": "Fundamentos do Vinho", "title_en": "Wine Fundamentals", "description_pt": "Aprenda os conceitos básicos do vinho", "description_en": "Learn the basic concepts of wine", "lessons_count": 5},
    {"track_id": "intermediate", "level": "intermediate", "title_pt": "Terroir e Regiões", "title_en": "Terroir and Regions", "description_pt": "Explore regiões vinícolas do mundo", "description_en": "Explore wine regions of the world", "lessons_count": 8},
    {"track_id": "advanced", "level": "advanced", "title_pt": "Mestria em Vinhos", "title_en": "Wine Mastery", "description_pt": "Conhecimento avançado para experts", "description_en": "Advanced knowledge for experts", "lessons_count": 10},
]

LESSONS = [
    # Basic
    {"lesson_id": "basic_1", "track_id": "basic", "title_pt": "O que é Vinho?", "title_en": "What is Wine?", "content_pt": "O vinho é uma bebida alcoólica...", "content_en": "Wine is an alcoholic beverage...", "order_index": 1, "duration_minutes": 10},
    {"lesson_id": "basic_2", "track_id": "basic", "title_pt": "Tipos de Vinho", "title_en": "Types of Wine", "content_pt": "Existem diversos tipos de vinho...", "content_en": "There are several types of wine...", "order_index": 2, "duration_minutes": 12},
    {"lesson_id": "basic_3", "track_id": "basic", "title_pt": "Como Ler um Rótulo", "title_en": "How to Read a Label", "content_pt": "O rótulo contém informações importantes...", "content_en": "The label contains important information...", "order_index": 3, "duration_minutes": 10},
    {"lesson_id": "basic_4", "track_id": "basic", "title_pt": "Castas Básicas", "title_en": "Basic Grapes", "content_pt": "Conheça as principais castas...", "content_en": "Know the main grape varieties...", "order_index": 4, "duration_minutes": 15},
    {"lesson_id": "basic_5", "track_id": "basic", "title_pt": "Degustação Básica", "title_en": "Basic Tasting", "content_pt": "Aprenda a degustar vinho...", "content_en": "Learn how to taste wine...", "order_index": 5, "duration_minutes": 12},
]

AROMA_TAGS = [
    {"tag_id": "apple", "name_pt": "Maçã", "name_en": "Apple", "category": "fruit", "emoji": "🍎"},
    {"tag_id": "citrus", "name_pt": "Cítrico", "name_en": "Citrus", "category": "fruit", "emoji": "🍋"},
    {"tag_id": "berry", "name_pt": "Frutas vermelhas", "name_en": "Berries", "category": "fruit", "emoji": "🍓"},
    {"tag_id": "cherry", "name_pt": "Cereja", "name_en": "Cherry", "category": "fruit", "emoji": "🍒"},
    {"tag_id": "blackberry", "name_pt": "Amora", "name_en": "Blackberry", "category": "fruit", "emoji": "🫐"},
    {"tag_id": "plum", "name_pt": "Ameixa", "name_en": "Plum", "category": "fruit", "emoji": "🍑"},
    {"tag_id": "vanilla", "name_pt": "Baunilha", "name_en": "Vanilla", "category": "oak", "emoji": "🍦"},
    {"tag_id": "oak", "name_pt": "Carvalho", "name_en": "Oak", "category": "oak", "emoji": "🪵"},
    {"tag_id": "toast", "name_pt": "Tostado", "name_en": "Toast", "category": "oak", "emoji": "🍞"},
    {"tag_id": "pepper", "name_pt": "Pimenta", "name_en": "Pepper", "category": "spice", "emoji": "🌶️"},
    {"tag_id": "cinnamon", "name_pt": "Canela", "name_en": "Cinnamon", "category": "spice", "emoji": "🌿"},
    {"tag_id": "floral", "name_pt": "Floral", "name_en": "Floral", "category": "floral", "emoji": "🌸"},
    {"tag_id": "rose", "name_pt": "Rosa", "name_en": "Rose", "category": "floral", "emoji": "🌹"},
    {"tag_id": "mineral", "name_pt": "Mineral", "name_en": "Mineral", "category": "earth", "emoji": "🪨"},
    {"tag_id": "tobacco", "name_pt": "Tabaco", "name_en": "Tobacco", "category": "earth", "emoji": "🍂"},
    {"tag_id": "leather", "name_pt": "Couro", "name_en": "Leather", "category": "earth", "emoji": "👜"},
]

def migrate():
    conn = psycopg2.connect(NEON_URL)
    cur = conn.cursor()
    
    print("Migrating countries...")
    for c in COUNTRIES:
        cur.execute("""
            INSERT INTO countries (country_id, name_pt, name_en, world_type, flag_emoji, description_pt, description_en)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (country_id) DO UPDATE SET
                name_pt = EXCLUDED.name_pt,
                name_en = EXCLUDED.name_en,
                description_pt = EXCLUDED.description_pt,
                description_en = EXCLUDED.description_en
        """, (c['country_id'], c['name_pt'], c['name_en'], c['world_type'], c['flag_emoji'], c['description_pt'], c['description_en']))
    print(f"  Migrated {len(COUNTRIES)} countries")
    
    print("Migrating regions...")
    region_count = 0
    for r in COMPLETE_REGIONS:
        terroir = r.get('terroir', {})
        climate = r.get('climate', {})
        cur.execute("""
            INSERT INTO regions (region_id, country_id, name, name_pt, name_en, description_pt, description_en, terroir, climate, key_grapes, wine_styles)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (region_id) DO UPDATE SET
                name_pt = EXCLUDED.name_pt,
                name_en = EXCLUDED.name_en,
                description_pt = EXCLUDED.description_pt,
                description_en = EXCLUDED.description_en,
                terroir = EXCLUDED.terroir,
                climate = EXCLUDED.climate,
                key_grapes = EXCLUDED.key_grapes,
                wine_styles = EXCLUDED.wine_styles
        """, (
            r['region_id'], r['country_id'], r.get('name', r.get('name_pt', '')),
            r.get('name_pt'), r.get('name_en'), r.get('description_pt', ''), r.get('description_en', ''),
            json.dumps(terroir), json.dumps(climate),
            r.get('key_grapes', []), r.get('wine_styles', [])
        ))
        region_count += 1
    print(f"  Migrated {region_count} regions")
    
    print("Migrating grapes...")
    grape_count = 0
    for g in COMPLETE_GRAPES:
        structure = g.get('structure', {})
        cur.execute("""
            INSERT INTO grapes (grape_id, name, grape_type, origin_country, description_pt, description_en,
                               aroma_notes_pt, aroma_notes_en, flavor_notes_pt, flavor_notes_en,
                               structure, aging_potential, best_regions, climate_preference)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (grape_id) DO UPDATE SET
                description_pt = EXCLUDED.description_pt,
                description_en = EXCLUDED.description_en,
                aroma_notes_pt = EXCLUDED.aroma_notes_pt,
                aroma_notes_en = EXCLUDED.aroma_notes_en
        """, (
            g['grape_id'], g['name'], g['grape_type'], g.get('origin_country', ''),
            g.get('description_pt', ''), g.get('description_en', ''),
            g.get('aroma_notes_pt', []), g.get('aroma_notes_en', []),
            g.get('flavor_notes_pt', []), g.get('flavor_notes_en', []),
            json.dumps(structure), g.get('aging_potential', ''),
            g.get('best_regions', []), g.get('climate_preference', '')
        ))
        grape_count += 1
    print(f"  Migrated {grape_count} grapes")
    
    print("Migrating study tracks...")
    for t in STUDY_TRACKS:
        cur.execute("""
            INSERT INTO study_tracks (track_id, level, title_pt, title_en, description_pt, description_en, lessons_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (track_id) DO UPDATE SET
                title_pt = EXCLUDED.title_pt,
                title_en = EXCLUDED.title_en
        """, (t['track_id'], t['level'], t['title_pt'], t['title_en'], t['description_pt'], t['description_en'], t['lessons_count']))
    print(f"  Migrated {len(STUDY_TRACKS)} tracks")
    
    print("Migrating lessons...")
    for l in LESSONS:
        cur.execute("""
            INSERT INTO lessons (lesson_id, track_id, title_pt, title_en, content_pt, content_en, order_index, duration_minutes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (lesson_id) DO UPDATE SET
                title_pt = EXCLUDED.title_pt,
                title_en = EXCLUDED.title_en
        """, (l['lesson_id'], l['track_id'], l['title_pt'], l['title_en'], l['content_pt'], l['content_en'], l['order_index'], l['duration_minutes']))
    print(f"  Migrated {len(LESSONS)} lessons")
    
    print("Migrating aroma tags...")
    for a in AROMA_TAGS:
        cur.execute("""
            INSERT INTO aroma_tags (tag_id, name_pt, name_en, category, emoji)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (tag_id) DO UPDATE SET
                name_pt = EXCLUDED.name_pt,
                name_en = EXCLUDED.name_en
        """, (a['tag_id'], a['name_pt'], a['name_en'], a['category'], a['emoji']))
    print(f"  Migrated {len(AROMA_TAGS)} aroma tags")
    
    conn.commit()
    cur.close()
    conn.close()
    print("\nMigration complete!")

if __name__ == "__main__":
    migrate()

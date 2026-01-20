# Complete wine regions data with terroir information
# All data is bilingual (Portuguese and English)

COMPLETE_REGIONS = [
    # ===== FRANCE =====
    {
        "region_id": "bordeaux", "name": "Bordeaux", "name_pt": "Bordéus", "name_en": "Bordeaux", "country_id": "france",
        "description_pt": "A região mais famosa do mundo, conhecida por seus blends de Cabernet Sauvignon, Merlot e Cabernet Franc. Dividida em Margem Esquerda e Margem Direita.",
        "description_en": "The world's most famous region, known for its Cabernet Sauvignon, Merlot and Cabernet Franc blends. Divided into Left Bank and Right Bank.",
        "climate": {"type_pt": "Oceânico", "type_en": "Oceanic", "temperature_pt": "Temperado", "temperature_en": "Temperate", "rainfall_pt": "900mm/ano", "rainfall_en": "900mm/year"},
        "terroir": {"soil_pt": "Cascalho, argila, calcário", "soil_en": "Gravel, clay, limestone", "altitude_pt": "0-100m", "altitude_en": "0-100m", "maritime_influence": True},
        "key_grapes": ["Cabernet Sauvignon", "Merlot", "Cabernet Franc", "Sémillon", "Sauvignon Blanc"],
        "wine_styles_pt": ["Tintos encorpados", "Brancos secos", "Doces (Sauternes)"],
        "wine_styles_en": ["Full-bodied reds", "Dry whites", "Sweet wines (Sauternes)"]
    },
    {
        "region_id": "burgundy", "name": "Burgundy", "name_pt": "Borgonha", "name_en": "Burgundy", "country_id": "france",
        "description_pt": "Berço do Pinot Noir e Chardonnay de classe mundial. Sistema de classificação complexo baseado em climat (vinhedos individuais).",
        "description_en": "Birthplace of world-class Pinot Noir and Chardonnay. Complex classification system based on climat (individual vineyards).",
        "climate": {"type_pt": "Continental", "type_en": "Continental", "temperature_pt": "Frio a moderado", "temperature_en": "Cool to moderate", "rainfall_pt": "700mm/ano", "rainfall_en": "700mm/year"},
        "terroir": {"soil_pt": "Calcário, marga, argila", "soil_en": "Limestone, marl, clay", "altitude_pt": "200-400m", "altitude_en": "200-400m", "maritime_influence": False},
        "key_grapes": ["Pinot Noir", "Chardonnay"],
        "wine_styles_pt": ["Tintos elegantes", "Brancos minerais"],
        "wine_styles_en": ["Elegant reds", "Mineral whites"]
    },
    {
        "region_id": "champagne", "name": "Champagne", "name_pt": "Champagne", "name_en": "Champagne", "country_id": "france",
        "description_pt": "Região exclusiva para produção de espumantes pelo método tradicional. Apenas vinhos daqui podem ser chamados de Champagne.",
        "description_en": "Exclusive region for traditional method sparkling production. Only wines from here can be called Champagne.",
        "climate": {"type_pt": "Continental frio", "type_en": "Cool continental", "temperature_pt": "Frio", "temperature_en": "Cool", "rainfall_pt": "650mm/ano", "rainfall_en": "650mm/year"},
        "terroir": {"soil_pt": "Giz (craie), calcário", "soil_en": "Chalk (craie), limestone", "altitude_pt": "100-300m", "altitude_en": "100-300m", "maritime_influence": False},
        "key_grapes": ["Chardonnay", "Pinot Noir", "Pinot Meunier"],
        "wine_styles_pt": ["Espumantes (método tradicional)"],
        "wine_styles_en": ["Sparkling wines (traditional method)"]
    },
    {
        "region_id": "rhone", "name": "Rhône", "name_pt": "Ródano", "name_en": "Rhône", "country_id": "france",
        "description_pt": "Dividida em Norte (Syrah elegante) e Sul (blends com Grenache). Inclui Côte-Rôtie, Hermitage e Châteauneuf-du-Pape.",
        "description_en": "Divided into North (elegant Syrah) and South (Grenache blends). Includes Côte-Rôtie, Hermitage and Châteauneuf-du-Pape.",
        "climate": {"type_pt": "Continental (norte), Mediterrâneo (sul)", "type_en": "Continental (north), Mediterranean (south)", "temperature_pt": "Moderado a quente", "temperature_en": "Moderate to warm", "rainfall_pt": "600-800mm/ano", "rainfall_en": "600-800mm/year"},
        "terroir": {"soil_pt": "Granito (norte), seixos rolados (sul)", "soil_en": "Granite (north), galets roulés/rounded stones (south)", "altitude_pt": "100-400m", "altitude_en": "100-400m", "maritime_influence": False},
        "key_grapes": ["Syrah", "Grenache", "Mourvèdre", "Viognier", "Marsanne", "Roussanne"],
        "wine_styles_pt": ["Tintos potentes", "Brancos aromáticos"],
        "wine_styles_en": ["Powerful reds", "Aromatic whites"]
    },
    {
        "region_id": "loire", "name": "Loire Valley", "name_pt": "Vale do Loire", "name_en": "Loire Valley", "country_id": "france",
        "description_pt": "O jardim da França, com grande diversidade de estilos. Famosa por Sauvignon Blanc (Sancerre), Chenin Blanc (Vouvray) e Cabernet Franc (Chinon).",
        "description_en": "The garden of France, with great diversity of styles. Famous for Sauvignon Blanc (Sancerre), Chenin Blanc (Vouvray) and Cabernet Franc (Chinon).",
        "climate": {"type_pt": "Oceânico a continental", "type_en": "Oceanic to continental", "temperature_pt": "Frio a moderado", "temperature_en": "Cool to moderate", "rainfall_pt": "600-700mm/ano", "rainfall_en": "600-700mm/year"},
        "terroir": {"soil_pt": "Calcário, sílex, xisto, tufo", "soil_en": "Limestone, flint, schist, tuffeau", "altitude_pt": "50-300m", "altitude_en": "50-300m", "maritime_influence": True},
        "key_grapes": ["Sauvignon Blanc", "Chenin Blanc", "Cabernet Franc", "Muscadet"],
        "wine_styles_pt": ["Brancos frescos", "Tintos leves", "Espumantes", "Doces"],
        "wine_styles_en": ["Fresh whites", "Light reds", "Sparkling", "Sweet wines"]
    },
    {
        "region_id": "alsace", "name": "Alsace", "name_pt": "Alsácia", "name_en": "Alsace", "country_id": "france",
        "description_pt": "Região de influência germânica, especializada em brancos aromáticos. Vinhos varietais em garrafas alongadas características.",
        "description_en": "German-influenced region, specializing in aromatic whites. Varietal wines in characteristic elongated bottles.",
        "climate": {"type_pt": "Continental frio", "type_en": "Cool continental", "temperature_pt": "Frio", "temperature_en": "Cool", "rainfall_pt": "500mm/ano (uma das mais secas)", "rainfall_en": "500mm/year (one of the driest)"},
        "terroir": {"soil_pt": "Granito, calcário, argila, arenito", "soil_en": "Granite, limestone, clay, sandstone", "altitude_pt": "200-400m", "altitude_en": "200-400m", "maritime_influence": False},
        "key_grapes": ["Riesling", "Gewürztraminer", "Pinot Gris", "Muscat"],
        "wine_styles_pt": ["Brancos aromáticos secos", "Vendanges Tardives (colheita tardia)"],
        "wine_styles_en": ["Dry aromatic whites", "Late harvest wines"]
    },
    {
        "region_id": "languedoc", "name": "Languedoc-Roussillon", "name_pt": "Languedoc-Roussillon", "name_en": "Languedoc-Roussillon", "country_id": "france",
        "description_pt": "Maior região vinícola da França em volume. Produz desde vinhos acessíveis até premium. Clima mediterrâneo quente.",
        "description_en": "France's largest wine region by volume. Produces everything from value to premium wines. Hot Mediterranean climate.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Quente e seco", "temperature_en": "Warm and dry", "rainfall_pt": "400-600mm/ano", "rainfall_en": "400-600mm/year"},
        "terroir": {"soil_pt": "Xisto, calcário, argila, cascalho", "soil_en": "Schist, limestone, clay, gravel", "altitude_pt": "0-500m", "altitude_en": "0-500m", "maritime_influence": True},
        "key_grapes": ["Grenache", "Syrah", "Mourvèdre", "Carignan", "Cinsault", "Picpoul"],
        "wine_styles_pt": ["Tintos encorpados", "Rosés", "Brancos frescos"],
        "wine_styles_en": ["Full-bodied reds", "Rosés", "Fresh whites"]
    },
    {
        "region_id": "provence", "name": "Provence", "name_pt": "Provença", "name_en": "Provence", "country_id": "france",
        "description_pt": "Capital mundial do vinho rosé. Vinhos pálidos, secos e refrescantes. Paisagens icônicas do sul da França.",
        "description_en": "World capital of rosé wine. Pale, dry and refreshing wines. Iconic southern French landscapes.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Quente e ensolarado", "temperature_en": "Warm and sunny", "rainfall_pt": "600mm/ano", "rainfall_en": "600mm/year"},
        "terroir": {"soil_pt": "Calcário, xisto, argila, arenito", "soil_en": "Limestone, schist, clay, sandstone", "altitude_pt": "0-400m", "altitude_en": "0-400m", "maritime_influence": True},
        "key_grapes": ["Grenache", "Cinsault", "Syrah", "Mourvèdre"],
        "wine_styles_pt": ["Rosés pálidos e secos"],
        "wine_styles_en": ["Pale, dry rosés"]
    },
    {
        "region_id": "beaujolais", "name": "Beaujolais", "name_pt": "Beaujolais", "name_en": "Beaujolais", "country_id": "france",
        "description_pt": "Região do Gamay, produzindo vinhos frutados e leves. Dos Crus de Beaujolais premium ao Beaujolais Nouveau jovem.",
        "description_en": "Home of Gamay, producing fruity, light wines. From premium Beaujolais Crus to young Beaujolais Nouveau.",
        "climate": {"type_pt": "Continental", "type_en": "Continental", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "750mm/ano", "rainfall_en": "750mm/year"},
        "terroir": {"soil_pt": "Granito (norte/Crus), argila (sul)", "soil_en": "Granite (north/Crus), clay (south)", "altitude_pt": "200-500m", "altitude_en": "200-500m", "maritime_influence": False},
        "key_grapes": ["Gamay"],
        "wine_styles_pt": ["Tintos leves e frutados"],
        "wine_styles_en": ["Light, fruity reds"]
    },
    {
        "region_id": "cahors", "name": "Cahors", "name_pt": "Cahors", "name_en": "Cahors", "country_id": "france",
        "description_pt": "Berço do Malbec, produzindo vinhos escuros e intensos conhecidos historicamente como 'vinho negro'.",
        "description_en": "Birthplace of Malbec, producing dark, intense wines historically known as 'black wine'.",
        "climate": {"type_pt": "Continental", "type_en": "Continental", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "700mm/ano", "rainfall_en": "700mm/year"},
        "terroir": {"soil_pt": "Calcário, argila, cascalho", "soil_en": "Limestone, clay, gravel", "altitude_pt": "100-350m", "altitude_en": "100-350m", "maritime_influence": False},
        "key_grapes": ["Malbec"],
        "wine_styles_pt": ["Tintos escuros e intensos"],
        "wine_styles_en": ["Dark, intense reds"]
    },
    {
        "region_id": "bandol", "name": "Bandol", "name_pt": "Bandol", "name_en": "Bandol", "country_id": "france",
        "description_pt": "Pequena denominação na Provença conhecida por seus tintos potentes baseados em Mourvèdre.",
        "description_en": "Small Provence appellation known for powerful Mourvèdre-based reds.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Quente", "temperature_en": "Warm", "rainfall_pt": "650mm/ano", "rainfall_en": "650mm/year"},
        "terroir": {"soil_pt": "Calcário, arenito, argila", "soil_en": "Limestone, sandstone, clay", "altitude_pt": "0-400m em terraços", "altitude_en": "0-400m on terraces", "maritime_influence": True},
        "key_grapes": ["Mourvèdre", "Grenache", "Cinsault"],
        "wine_styles_pt": ["Tintos de guarda", "Rosés"],
        "wine_styles_en": ["Age-worthy reds", "Rosés"]
    },
    
    # ===== ITALY =====
    {
        "region_id": "tuscany", "name": "Tuscany", "name_pt": "Toscana", "name_en": "Tuscany", "country_id": "italy",
        "description_pt": "Coração vinícola da Itália, lar do Sangiovese. Inclui Chianti, Brunello di Montalcino e os Super Toscanos.",
        "description_en": "Heart of Italian winemaking, home of Sangiovese. Includes Chianti, Brunello di Montalcino and Super Tuscans.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Quente e seco", "temperature_en": "Warm and dry", "rainfall_pt": "700mm/ano", "rainfall_en": "700mm/year"},
        "terroir": {"soil_pt": "Galestro (xisto argiloso), alberese (calcário), areia", "soil_en": "Galestro (clay schist), alberese (limestone), sand", "altitude_pt": "250-600m", "altitude_en": "250-600m", "maritime_influence": True},
        "key_grapes": ["Sangiovese", "Cabernet Sauvignon", "Merlot"],
        "wine_styles_pt": ["Tintos estruturados", "Super Toscanos"],
        "wine_styles_en": ["Structured reds", "Super Tuscans"]
    },
    {
        "region_id": "piedmont", "name": "Piedmont", "name_pt": "Piemonte", "name_en": "Piedmont", "country_id": "italy",
        "description_pt": "Noroeste da Itália, produzindo os majestosos Barolo e Barbaresco de Nebbiolo.",
        "description_en": "Northwestern Italy, producing majestic Barolo and Barbaresco from Nebbiolo.",
        "climate": {"type_pt": "Continental", "type_en": "Continental", "temperature_pt": "Frio a moderado", "temperature_en": "Cool to moderate", "rainfall_pt": "700mm/ano", "rainfall_en": "700mm/year"},
        "terroir": {"soil_pt": "Marga calcária (Tortonian e Helvetian)", "soil_en": "Calcareous marl (Tortonian and Helvetian)", "altitude_pt": "200-500m", "altitude_en": "200-500m", "maritime_influence": False},
        "key_grapes": ["Nebbiolo", "Barbera", "Dolcetto", "Moscato", "Arneis", "Cortese"],
        "wine_styles_pt": ["Tintos tânicos de guarda", "Brancos aromáticos", "Espumantes (Asti)"],
        "wine_styles_en": ["Tannic age-worthy reds", "Aromatic whites", "Sparkling (Asti)"]
    },
    {
        "region_id": "veneto", "name": "Veneto", "name_pt": "Vêneto", "name_en": "Veneto", "country_id": "italy",
        "description_pt": "Região mais produtiva da Itália, incluindo Prosecco, Amarone, Valpolicella e Soave.",
        "description_en": "Italy's most productive region, including Prosecco, Amarone, Valpolicella and Soave.",
        "climate": {"type_pt": "Continental a mediterrâneo", "type_en": "Continental to Mediterranean", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "800mm/ano", "rainfall_en": "800mm/year"},
        "terroir": {"soil_pt": "Calcário, basalto vulcânico, aluvial", "soil_en": "Limestone, volcanic basite, alluvial", "altitude_pt": "50-500m", "altitude_en": "50-500m", "maritime_influence": False},
        "key_grapes": ["Corvina", "Rondinella", "Glera", "Garganega"],
        "wine_styles_pt": ["Amarone (appassimento)", "Prosecco", "Soave"],
        "wine_styles_en": ["Amarone (appassimento)", "Prosecco", "Soave"]
    },
    {
        "region_id": "sicily", "name": "Sicily", "name_pt": "Sicília", "name_en": "Sicily", "country_id": "italy",
        "description_pt": "Maior ilha do Mediterrâneo, com vinhos do Etna vulcânico aos tintos do interior.",
        "description_en": "Largest Mediterranean island, from volcanic Etna wines to interior reds.",
        "climate": {"type_pt": "Mediterrâneo quente", "type_en": "Hot Mediterranean", "temperature_pt": "Quente", "temperature_en": "Hot", "rainfall_pt": "500mm/ano", "rainfall_en": "500mm/year"},
        "terroir": {"soil_pt": "Vulcânico (Etna), calcário, argila", "soil_en": "Volcanic (Etna), limestone, clay", "altitude_pt": "0-1000m (Etna)", "altitude_en": "0-1000m (Etna)", "maritime_influence": True},
        "key_grapes": ["Nero d'Avola", "Nerello Mascalese", "Grillo", "Carricante"],
        "wine_styles_pt": ["Tintos frutados", "Etna elegante", "Brancos frescos"],
        "wine_styles_en": ["Fruity reds", "Elegant Etna", "Fresh whites"]
    },
    {
        "region_id": "campania", "name": "Campania", "name_pt": "Campânia", "name_en": "Campania", "country_id": "italy",
        "description_pt": "Sul da Itália com uvas antigas como Aglianico (Taurasi) e Fiano (Avellino). Terroir vulcânico único.",
        "description_en": "Southern Italy with ancient grapes like Aglianico (Taurasi) and Fiano (Avellino). Unique volcanic terroir.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Quente", "temperature_en": "Warm", "rainfall_pt": "800mm/ano", "rainfall_en": "800mm/year"},
        "terroir": {"soil_pt": "Vulcânico (tufo, cinzas), calcário", "soil_en": "Volcanic (tuff, ash), limestone", "altitude_pt": "300-700m", "altitude_en": "300-700m", "maritime_influence": True},
        "key_grapes": ["Aglianico", "Fiano", "Greco"],
        "wine_styles_pt": ["Tintos potentes (Taurasi)", "Brancos minerais"],
        "wine_styles_en": ["Powerful reds (Taurasi)", "Mineral whites"]
    },
    {
        "region_id": "puglia", "name": "Puglia", "name_pt": "Puglia", "name_en": "Puglia", "country_id": "italy",
        "description_pt": "O calcanhar da bota italiana, maior produtor de volume. Primitivo (Zinfandel) e vinhos generosos.",
        "description_en": "The heel of Italy's boot, largest volume producer. Primitivo (Zinfandel) and generous wines.",
        "climate": {"type_pt": "Mediterrâneo quente", "type_en": "Hot Mediterranean", "temperature_pt": "Quente e seco", "temperature_en": "Hot and dry", "rainfall_pt": "500mm/ano", "rainfall_en": "500mm/year"},
        "terroir": {"soil_pt": "Terra rossa, calcário, argila", "soil_en": "Terra rossa, limestone, clay", "altitude_pt": "0-400m", "altitude_en": "0-400m", "maritime_influence": True},
        "key_grapes": ["Primitivo", "Negroamaro", "Nero di Troia"],
        "wine_styles_pt": ["Tintos concentrados e frutados"],
        "wine_styles_en": ["Concentrated, fruity reds"]
    },
    {
        "region_id": "abruzzo", "name": "Abruzzo", "name_pt": "Abruzzo", "name_en": "Abruzzo", "country_id": "italy",
        "description_pt": "Centro-leste da Itália, famosa por Montepulciano d'Abruzzo - vinhos tintos acessíveis e frutados.",
        "description_en": "Central-eastern Italy, famous for Montepulciano d'Abruzzo - accessible, fruity red wines.",
        "climate": {"type_pt": "Mediterrâneo moderado", "type_en": "Moderate Mediterranean", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "700mm/ano", "rainfall_en": "700mm/year"},
        "terroir": {"soil_pt": "Argila, calcário, aluvial", "soil_en": "Clay, limestone, alluvial", "altitude_pt": "200-600m", "altitude_en": "200-600m", "maritime_influence": True},
        "key_grapes": ["Montepulciano", "Trebbiano"],
        "wine_styles_pt": ["Tintos frutados acessíveis"],
        "wine_styles_en": ["Accessible fruity reds"]
    },
    {
        "region_id": "marche", "name": "Marche", "name_pt": "Marche", "name_en": "Marche", "country_id": "italy",
        "description_pt": "Costa adriática, conhecida pelo branco Verdicchio de alta acidez e potencial de guarda.",
        "description_en": "Adriatic coast, known for high-acid Verdicchio white with aging potential.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "700mm/ano", "rainfall_en": "700mm/year"},
        "terroir": {"soil_pt": "Calcário, argila, arenito", "soil_en": "Limestone, clay, sandstone", "altitude_pt": "200-500m", "altitude_en": "200-500m", "maritime_influence": True},
        "key_grapes": ["Verdicchio", "Montepulciano"],
        "wine_styles_pt": ["Brancos com potencial de guarda"],
        "wine_styles_en": ["Age-worthy whites"]
    },
    {
        "region_id": "umbria", "name": "Umbria", "name_pt": "Úmbria", "name_en": "Umbria", "country_id": "italy",
        "description_pt": "Coração verde da Itália, lar do tânico Sagrantino de Montefalco e do branco Orvieto.",
        "description_en": "Green heart of Italy, home of tannic Sagrantino di Montefalco and white Orvieto.",
        "climate": {"type_pt": "Continental", "type_en": "Continental", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "800mm/ano", "rainfall_en": "800mm/year"},
        "terroir": {"soil_pt": "Argila, calcário, tufo vulcânico", "soil_en": "Clay, limestone, volcanic tuff", "altitude_pt": "200-500m", "altitude_en": "200-500m", "maritime_influence": False},
        "key_grapes": ["Sagrantino", "Sangiovese", "Grechetto"],
        "wine_styles_pt": ["Tintos muito tânicos", "Brancos frescos (Orvieto)"],
        "wine_styles_en": ["Highly tannic reds", "Fresh whites (Orvieto)"]
    },
    {
        "region_id": "friuli", "name": "Friuli-Venezia Giulia", "name_pt": "Friuli-Venezia Giulia", "name_en": "Friuli-Venezia Giulia", "country_id": "italy",
        "description_pt": "Nordeste da Itália, produzindo alguns dos melhores brancos italianos. Pioneiro dos vinhos laranjas.",
        "description_en": "Northeastern Italy, producing some of Italy's best whites. Pioneer of orange wines.",
        "climate": {"type_pt": "Continental frio", "type_en": "Cool continental", "temperature_pt": "Frio a moderado", "temperature_en": "Cool to moderate", "rainfall_pt": "1200mm/ano", "rainfall_en": "1200mm/year"},
        "terroir": {"soil_pt": "Ponca (marga), flysch, aluvial", "soil_en": "Ponca (marl), flysch, alluvial", "altitude_pt": "100-400m", "altitude_en": "100-400m", "maritime_influence": False},
        "key_grapes": ["Pinot Grigio", "Friulano", "Ribolla Gialla", "Sauvignon Blanc"],
        "wine_styles_pt": ["Brancos complexos", "Vinhos laranjas"],
        "wine_styles_en": ["Complex whites", "Orange wines"]
    },
    {
        "region_id": "sardinia", "name": "Sardinia", "name_pt": "Sardenha", "name_en": "Sardinia", "country_id": "italy",
        "description_pt": "Ilha com tradição vinícola antiga. Cannonau (Grenache) tinto e Vermentino branco dominam.",
        "description_en": "Island with ancient winemaking tradition. Red Cannonau (Grenache) and white Vermentino dominate.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Quente e ventoso", "temperature_en": "Warm and windy", "rainfall_pt": "500mm/ano", "rainfall_en": "500mm/year"},
        "terroir": {"soil_pt": "Granito, xisto, calcário, areia", "soil_en": "Granite, schist, limestone, sand", "altitude_pt": "0-700m", "altitude_en": "0-700m", "maritime_influence": True},
        "key_grapes": ["Cannonau", "Vermentino", "Carignano"],
        "wine_styles_pt": ["Tintos encorpados", "Brancos frescos"],
        "wine_styles_en": ["Full-bodied reds", "Fresh whites"]
    },
    {
        "region_id": "lombardy", "name": "Lombardy", "name_pt": "Lombardia", "name_en": "Lombardy", "country_id": "italy",
        "description_pt": "Norte da Itália, incluindo Franciacorta (espumantes) e Valtellina (Nebbiolo de altitude).",
        "description_en": "Northern Italy, including Franciacorta (sparkling) and Valtellina (altitude Nebbiolo).",
        "climate": {"type_pt": "Continental", "type_en": "Continental", "temperature_pt": "Frio a moderado", "temperature_en": "Cool to moderate", "rainfall_pt": "1000mm/ano", "rainfall_en": "1000mm/year"},
        "terroir": {"soil_pt": "Morena glacial, xisto, argila", "soil_en": "Glacial moraine, schist, clay", "altitude_pt": "200-800m", "altitude_en": "200-800m", "maritime_influence": False},
        "key_grapes": ["Chardonnay", "Pinot Nero", "Nebbiolo"],
        "wine_styles_pt": ["Espumantes (Franciacorta)", "Tintos alpinos"],
        "wine_styles_en": ["Sparkling (Franciacorta)", "Alpine reds"]
    },
    
    # ===== SPAIN =====
    {
        "region_id": "rioja", "name": "Rioja", "name_pt": "Rioja", "name_en": "Rioja", "country_id": "spain",
        "description_pt": "A região mais prestigiosa da Espanha, conhecida por Tempranillo envelhecido em carvalho.",
        "description_en": "Spain's most prestigious region, known for oak-aged Tempranillo.",
        "climate": {"type_pt": "Continental moderado", "type_en": "Moderate continental", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "400-500mm/ano", "rainfall_en": "400-500mm/year"},
        "terroir": {"soil_pt": "Argila calcária, argila ferruginosa, aluvial", "soil_en": "Calcareous clay, iron-rich clay, alluvial", "altitude_pt": "400-700m", "altitude_en": "400-700m", "maritime_influence": False},
        "key_grapes": ["Tempranillo", "Garnacha", "Graciano", "Viura"],
        "wine_styles_pt": ["Tintos envelhecidos (Crianza, Reserva, Gran Reserva)", "Brancos"],
        "wine_styles_en": ["Aged reds (Crianza, Reserva, Gran Reserva)", "Whites"]
    },
    {
        "region_id": "ribera_del_duero", "name": "Ribera del Duero", "name_pt": "Ribera del Duero", "name_en": "Ribera del Duero", "country_id": "spain",
        "description_pt": "Castilla y León, produzindo Tempranillo potente de altitude. Rival de Rioja em prestígio.",
        "description_en": "Castilla y León, producing powerful altitude Tempranillo. Rioja's rival in prestige.",
        "climate": {"type_pt": "Continental extremo", "type_en": "Extreme continental", "temperature_pt": "Verões quentes, invernos frios", "temperature_en": "Hot summers, cold winters", "rainfall_pt": "450mm/ano", "rainfall_en": "450mm/year"},
        "terroir": {"soil_pt": "Calcário, argila, cascalho", "soil_en": "Limestone, clay, gravel", "altitude_pt": "750-1000m", "altitude_en": "750-1000m", "maritime_influence": False},
        "key_grapes": ["Tempranillo", "Cabernet Sauvignon"],
        "wine_styles_pt": ["Tintos potentes e concentrados"],
        "wine_styles_en": ["Powerful, concentrated reds"]
    },
    {
        "region_id": "priorat", "name": "Priorat", "name_pt": "Priorat", "name_en": "Priorat", "country_id": "spain",
        "description_pt": "Catalunha, renascida nos anos 1980. Solos de licorella (xisto) e vinhos potentes.",
        "description_en": "Catalonia, reborn in the 1980s. Licorella (schist) soils and powerful wines.",
        "climate": {"type_pt": "Mediterrâneo quente", "type_en": "Hot Mediterranean", "temperature_pt": "Quente e seco", "temperature_en": "Hot and dry", "rainfall_pt": "400mm/ano", "rainfall_en": "400mm/year"},
        "terroir": {"soil_pt": "Licorella (xisto com mica)", "soil_en": "Licorella (schist with mica)", "altitude_pt": "200-700m em terraços íngremes", "altitude_en": "200-700m on steep terraces", "maritime_influence": False},
        "key_grapes": ["Garnacha", "Cariñena", "Cabernet Sauvignon"],
        "wine_styles_pt": ["Tintos concentrados e minerais"],
        "wine_styles_en": ["Concentrated, mineral reds"]
    },
    {
        "region_id": "rias_baixas", "name": "Rías Baixas", "name_pt": "Rías Baixas", "name_en": "Rías Baixas", "country_id": "spain",
        "description_pt": "Galícia atlântica, produzindo brancos aromáticos de Albariño.",
        "description_en": "Atlantic Galicia, producing aromatic Albariño whites.",
        "climate": {"type_pt": "Atlântico", "type_en": "Atlantic", "temperature_pt": "Frio e úmido", "temperature_en": "Cool and humid", "rainfall_pt": "1500mm/ano", "rainfall_en": "1500mm/year"},
        "terroir": {"soil_pt": "Granito, areia, aluvial", "soil_en": "Granite, sand, alluvial", "altitude_pt": "0-300m", "altitude_en": "0-300m", "maritime_influence": True},
        "key_grapes": ["Albariño"],
        "wine_styles_pt": ["Brancos aromáticos e frescos"],
        "wine_styles_en": ["Aromatic, fresh whites"]
    },
    {
        "region_id": "rueda", "name": "Rueda", "name_pt": "Rueda", "name_en": "Rueda", "country_id": "spain",
        "description_pt": "Castilla y León, especializada em Verdejo aromático e refrescante.",
        "description_en": "Castilla y León, specializing in aromatic, refreshing Verdejo.",
        "climate": {"type_pt": "Continental", "type_en": "Continental", "temperature_pt": "Extremos térmicos", "temperature_en": "Temperature extremes", "rainfall_pt": "400mm/ano", "rainfall_en": "400mm/year"},
        "terroir": {"soil_pt": "Cascalho, areia, argila", "soil_en": "Gravel, sand, clay", "altitude_pt": "700-800m", "altitude_en": "700-800m", "maritime_influence": False},
        "key_grapes": ["Verdejo", "Sauvignon Blanc"],
        "wine_styles_pt": ["Brancos herbáceos e refrescantes"],
        "wine_styles_en": ["Herbaceous, refreshing whites"]
    },
    {
        "region_id": "penedes", "name": "Penedès", "name_pt": "Penedès", "name_en": "Penedès", "country_id": "spain",
        "description_pt": "Catalunha, coração da produção de Cava.",
        "description_en": "Catalonia, heart of Cava production.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "550mm/ano", "rainfall_en": "550mm/year"},
        "terroir": {"soil_pt": "Calcário, argila, areia", "soil_en": "Limestone, clay, sand", "altitude_pt": "200-800m", "altitude_en": "200-800m", "maritime_influence": True},
        "key_grapes": ["Macabeo", "Xarel·lo", "Parellada", "Garnacha"],
        "wine_styles_pt": ["Cava (espumante)", "Brancos tranquilos"],
        "wine_styles_en": ["Cava (sparkling)", "Still whites"]
    },
    {
        "region_id": "jerez", "name": "Jerez", "name_pt": "Jerez", "name_en": "Jerez (Sherry)", "country_id": "spain",
        "description_pt": "Andaluzia, única região para Sherry autêntico. Sistema de solera.",
        "description_en": "Andalusia, only region for authentic Sherry. Solera system.",
        "climate": {"type_pt": "Mediterrâneo quente", "type_en": "Hot Mediterranean", "temperature_pt": "Quente", "temperature_en": "Hot", "rainfall_pt": "600mm/ano", "rainfall_en": "600mm/year"},
        "terroir": {"soil_pt": "Albariza (giz branco)", "soil_en": "Albariza (white chalk)", "altitude_pt": "0-100m", "altitude_en": "0-100m", "maritime_influence": True},
        "key_grapes": ["Palomino Fino", "Pedro Ximénez", "Moscatel"],
        "wine_styles_pt": ["Fino", "Manzanilla", "Oloroso", "PX"],
        "wine_styles_en": ["Fino", "Manzanilla", "Oloroso", "PX"]
    },
    {
        "region_id": "bierzo", "name": "Bierzo", "name_pt": "Bierzo", "name_en": "Bierzo", "country_id": "spain",
        "description_pt": "Noroeste da Espanha, produzindo Mencía elegante comparada a Pinot Noir.",
        "description_en": "Northwestern Spain, producing elegant Mencía compared to Pinot Noir.",
        "climate": {"type_pt": "Atlântico-continental", "type_en": "Atlantic-continental", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "700mm/ano", "rainfall_en": "700mm/year"},
        "terroir": {"soil_pt": "Ardósia, quartzito, areia", "soil_en": "Slate, quartzite, sand", "altitude_pt": "450-1000m", "altitude_en": "450-1000m", "maritime_influence": False},
        "key_grapes": ["Mencía", "Godello"],
        "wine_styles_pt": ["Tintos elegantes e florais"],
        "wine_styles_en": ["Elegant, floral reds"]
    },
    {
        "region_id": "navarra", "name": "Navarra", "name_pt": "Navarra", "name_en": "Navarra", "country_id": "spain",
        "description_pt": "Vizinha de Rioja, conhecida por rosés e vinhos tintos de valor.",
        "description_en": "Rioja's neighbor, known for rosés and value reds.",
        "climate": {"type_pt": "Continental a mediterrâneo", "type_en": "Continental to Mediterranean", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "500mm/ano", "rainfall_en": "500mm/year"},
        "terroir": {"soil_pt": "Argila, calcário, aluvial", "soil_en": "Clay, limestone, alluvial", "altitude_pt": "250-600m", "altitude_en": "250-600m", "maritime_influence": False},
        "key_grapes": ["Garnacha", "Tempranillo", "Cabernet Sauvignon"],
        "wine_styles_pt": ["Rosés", "Tintos de valor"],
        "wine_styles_en": ["Rosés", "Value reds"]
    },
    {
        "region_id": "jumilla", "name": "Jumilla", "name_pt": "Jumilla", "name_en": "Jumilla", "country_id": "spain",
        "description_pt": "Murcia, especializada em Monastrell (Mourvèdre) potente de vinhas velhas.",
        "description_en": "Murcia, specializing in powerful old-vine Monastrell (Mourvèdre).",
        "climate": {"type_pt": "Continental-mediterrâneo", "type_en": "Continental-Mediterranean", "temperature_pt": "Quente e seco", "temperature_en": "Hot and dry", "rainfall_pt": "300mm/ano", "rainfall_en": "300mm/year"},
        "terroir": {"soil_pt": "Calcário, argila, areia", "soil_en": "Limestone, clay, sand", "altitude_pt": "400-800m", "altitude_en": "400-800m", "maritime_influence": False},
        "key_grapes": ["Monastrell", "Garnacha"],
        "wine_styles_pt": ["Tintos concentrados de vinhas velhas"],
        "wine_styles_en": ["Concentrated old-vine reds"]
    },
    {
        "region_id": "toro", "name": "Toro", "name_pt": "Toro", "name_en": "Toro", "country_id": "spain",
        "description_pt": "Castilla y León, produzindo Tempranillo extremamente potente (Tinta de Toro).",
        "description_en": "Castilla y León, producing extremely powerful Tempranillo (Tinta de Toro).",
        "climate": {"type_pt": "Continental extremo", "type_en": "Extreme continental", "temperature_pt": "Verões muito quentes", "temperature_en": "Very hot summers", "rainfall_pt": "350mm/ano", "rainfall_en": "350mm/year"},
        "terroir": {"soil_pt": "Argila com cascalho, areia", "soil_en": "Clay with gravel, sand", "altitude_pt": "600-800m", "altitude_en": "600-800m", "maritime_influence": False},
        "key_grapes": ["Tempranillo"],
        "wine_styles_pt": ["Tintos muito potentes e concentrados"],
        "wine_styles_en": ["Very powerful, concentrated reds"]
    },
    {
        "region_id": "valdeorras", "name": "Valdeorras", "name_pt": "Valdeorras", "name_en": "Valdeorras", "country_id": "spain",
        "description_pt": "Galícia interior, produzindo brancos de Godello de alta qualidade.",
        "description_en": "Interior Galicia, producing high-quality Godello whites.",
        "climate": {"type_pt": "Atlântico-continental", "type_en": "Atlantic-continental", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "850mm/ano", "rainfall_en": "850mm/year"},
        "terroir": {"soil_pt": "Ardósia, granito", "soil_en": "Slate, granite", "altitude_pt": "300-700m", "altitude_en": "300-700m", "maritime_influence": False},
        "key_grapes": ["Godello", "Mencía"],
        "wine_styles_pt": ["Brancos minerais e complexos"],
        "wine_styles_en": ["Mineral, complex whites"]
    },
    
    # ===== PORTUGAL =====
    {
        "region_id": "douro", "name": "Douro", "name_pt": "Douro", "name_en": "Douro", "country_id": "portugal",
        "description_pt": "Património Mundial da UNESCO, produzindo Porto e vinhos tintos de classe mundial.",
        "description_en": "UNESCO World Heritage, producing Port and world-class red wines.",
        "climate": {"type_pt": "Continental mediterrâneo", "type_en": "Continental Mediterranean", "temperature_pt": "Verões muito quentes", "temperature_en": "Very hot summers", "rainfall_pt": "600mm/ano", "rainfall_en": "600mm/year"},
        "terroir": {"soil_pt": "Xisto (schist)", "soil_en": "Schist", "altitude_pt": "100-700m em socalcos", "altitude_en": "100-700m on terraces", "maritime_influence": False},
        "key_grapes": ["Touriga Nacional", "Touriga Franca", "Tinta Roriz", "Tinta Cão"],
        "wine_styles_pt": ["Porto (Ruby, Tawny, Vintage)", "Tintos secos premium"],
        "wine_styles_en": ["Port (Ruby, Tawny, Vintage)", "Premium dry reds"]
    },
    {
        "region_id": "dao", "name": "Dão", "name_pt": "Dão", "name_en": "Dão", "country_id": "portugal",
        "description_pt": "Centro de Portugal, produzindo tintos elegantes e brancos de Encruzado.",
        "description_en": "Central Portugal, producing elegant reds and Encruzado whites.",
        "climate": {"type_pt": "Continental", "type_en": "Continental", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "1200mm/ano", "rainfall_en": "1200mm/year"},
        "terroir": {"soil_pt": "Granito", "soil_en": "Granite", "altitude_pt": "400-800m", "altitude_en": "400-800m", "maritime_influence": False},
        "key_grapes": ["Touriga Nacional", "Jaen", "Encruzado"],
        "wine_styles_pt": ["Tintos elegantes", "Brancos minerais"],
        "wine_styles_en": ["Elegant reds", "Mineral whites"]
    },
    {
        "region_id": "vinho_verde", "name": "Vinho Verde", "name_pt": "Vinho Verde", "name_en": "Vinho Verde", "country_id": "portugal",
        "description_pt": "Noroeste de Portugal, produzindo brancos leves e frescos. Alvarinho premium.",
        "description_en": "Northwestern Portugal, producing light, fresh whites. Premium Alvarinho.",
        "climate": {"type_pt": "Atlântico", "type_en": "Atlantic", "temperature_pt": "Frio e úmido", "temperature_en": "Cool and humid", "rainfall_pt": "1500mm/ano", "rainfall_en": "1500mm/year"},
        "terroir": {"soil_pt": "Granito, xisto", "soil_en": "Granite, schist", "altitude_pt": "0-400m", "altitude_en": "0-400m", "maritime_influence": True},
        "key_grapes": ["Alvarinho", "Loureiro", "Arinto"],
        "wine_styles_pt": ["Brancos leves e refrescantes", "Alvarinho premium"],
        "wine_styles_en": ["Light, refreshing whites", "Premium Alvarinho"]
    },
    {
        "region_id": "alentejo", "name": "Alentejo", "name_pt": "Alentejo", "name_en": "Alentejo", "country_id": "portugal",
        "description_pt": "Sul de Portugal, maior região vinícola do país. Vinhos tintos maduros e frutados.",
        "description_en": "Southern Portugal, country's largest wine region. Ripe, fruity red wines.",
        "climate": {"type_pt": "Mediterrâneo quente", "type_en": "Hot Mediterranean", "temperature_pt": "Quente e seco", "temperature_en": "Hot and dry", "rainfall_pt": "500mm/ano", "rainfall_en": "500mm/year"},
        "terroir": {"soil_pt": "Xisto, granito, argila, calcário", "soil_en": "Schist, granite, clay, limestone", "altitude_pt": "200-400m", "altitude_en": "200-400m", "maritime_influence": False},
        "key_grapes": ["Aragonez", "Trincadeira", "Alicante Bouschet", "Antão Vaz"],
        "wine_styles_pt": ["Tintos frutados e acessíveis", "Brancos frescos"],
        "wine_styles_en": ["Fruity, accessible reds", "Fresh whites"]
    },
    {
        "region_id": "bairrada", "name": "Bairrada", "name_pt": "Bairrada", "name_en": "Bairrada", "country_id": "portugal",
        "description_pt": "Litoral centro, conhecida pela uva Baga tânica. Excelentes espumantes.",
        "description_en": "Central coast, known for tannic Baga grape. Excellent sparkling wines.",
        "climate": {"type_pt": "Atlântico", "type_en": "Atlantic", "temperature_pt": "Moderado e úmido", "temperature_en": "Moderate and humid", "rainfall_pt": "1000mm/ano", "rainfall_en": "1000mm/year"},
        "terroir": {"soil_pt": "Argila, calcário, areia", "soil_en": "Clay, limestone, sand", "altitude_pt": "0-100m", "altitude_en": "0-100m", "maritime_influence": True},
        "key_grapes": ["Baga", "Maria Gomes"],
        "wine_styles_pt": ["Tintos tânicos de guarda", "Espumantes"],
        "wine_styles_en": ["Tannic age-worthy reds", "Sparkling wines"]
    },
    {
        "region_id": "setubal", "name": "Península de Setúbal", "name_pt": "Península de Setúbal", "name_en": "Setúbal Peninsula", "country_id": "portugal",
        "description_pt": "Sul de Lisboa, famosa pelo Moscatel de Setúbal fortificado.",
        "description_en": "South of Lisbon, famous for fortified Moscatel de Setúbal.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Quente e seco", "temperature_en": "Warm and dry", "rainfall_pt": "600mm/ano", "rainfall_en": "600mm/year"},
        "terroir": {"soil_pt": "Areia, argila, calcário", "soil_en": "Sand, clay, limestone", "altitude_pt": "0-200m", "altitude_en": "0-200m", "maritime_influence": True},
        "key_grapes": ["Castelão", "Moscatel"],
        "wine_styles_pt": ["Moscatel fortificado", "Tintos frutados"],
        "wine_styles_en": ["Fortified Moscatel", "Fruity reds"]
    },
    
    # ===== GERMANY =====
    {
        "region_id": "mosel", "name": "Mosel", "name_pt": "Mosel", "name_en": "Mosel", "country_id": "germany",
        "description_pt": "Vale do rio Mosel, produzindo os Rieslings mais elegantes e minerais do mundo.",
        "description_en": "Mosel river valley, producing the world's most elegant, mineral Rieslings.",
        "climate": {"type_pt": "Continental frio", "type_en": "Cool continental", "temperature_pt": "Frio", "temperature_en": "Cool", "rainfall_pt": "650mm/ano", "rainfall_en": "650mm/year"},
        "terroir": {"soil_pt": "Ardósia azul e cinza", "soil_en": "Blue and grey slate", "altitude_pt": "100-350m em encostas íngremes", "altitude_en": "100-350m on steep slopes", "maritime_influence": False},
        "key_grapes": ["Riesling"],
        "wine_styles_pt": ["Riesling do seco ao doce", "TBA", "Eiswein"],
        "wine_styles_en": ["Riesling from dry to sweet", "TBA", "Eiswein"]
    },
    {
        "region_id": "rheingau", "name": "Rheingau", "name_pt": "Rheingau", "name_en": "Rheingau", "country_id": "germany",
        "description_pt": "Berço do Riesling seco alemão. Orientação sul ideal.",
        "description_en": "Birthplace of dry German Riesling. Ideal south-facing orientation.",
        "climate": {"type_pt": "Continental frio", "type_en": "Cool continental", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "550mm/ano", "rainfall_en": "550mm/year"},
        "terroir": {"soil_pt": "Ardósia, quartzito, loess", "soil_en": "Slate, quartzite, loess", "altitude_pt": "100-300m", "altitude_en": "100-300m", "maritime_influence": False},
        "key_grapes": ["Riesling", "Spätburgunder"],
        "wine_styles_pt": ["Riesling seco premium"],
        "wine_styles_en": ["Premium dry Riesling"]
    },
    {
        "region_id": "pfalz", "name": "Pfalz", "name_pt": "Pfalz", "name_en": "Pfalz", "country_id": "germany",
        "description_pt": "Segunda maior região da Alemanha, clima mais quente. Riesling e Pinot Noir.",
        "description_en": "Germany's second largest region, warmer climate. Riesling and Pinot Noir.",
        "climate": {"type_pt": "Continental moderado", "type_en": "Moderate continental", "temperature_pt": "O mais quente da Alemanha", "temperature_en": "Germany's warmest", "rainfall_pt": "600mm/ano", "rainfall_en": "600mm/year"},
        "terroir": {"soil_pt": "Basalto, calcário, arenito, argila", "soil_en": "Basite, limestone, sandstone, clay", "altitude_pt": "100-400m", "altitude_en": "100-400m", "maritime_influence": False},
        "key_grapes": ["Riesling", "Spätburgunder", "Dornfelder"],
        "wine_styles_pt": ["Riesling", "Tintos de Pinot Noir"],
        "wine_styles_en": ["Riesling", "Pinot Noir reds"]
    },
    {
        "region_id": "baden", "name": "Baden", "name_pt": "Baden", "name_en": "Baden", "country_id": "germany",
        "description_pt": "Região mais quente e ensolarada da Alemanha. Especializada em Pinot Noir.",
        "description_en": "Germany's warmest, sunniest region. Specializing in Pinot Noir.",
        "climate": {"type_pt": "Continental quente", "type_en": "Warm continental", "temperature_pt": "Quente para a Alemanha", "temperature_en": "Warm for Germany", "rainfall_pt": "700mm/ano", "rainfall_en": "700mm/year"},
        "terroir": {"soil_pt": "Calcário, loess, vulcânico", "soil_en": "Limestone, loess, volcanic", "altitude_pt": "200-500m", "altitude_en": "200-500m", "maritime_influence": False},
        "key_grapes": ["Spätburgunder", "Grauburgunder", "Weissburgunder"],
        "wine_styles_pt": ["Tintos de Pinot Noir", "Brancos borgonheses"],
        "wine_styles_en": ["Pinot Noir reds", "Burgundian whites"]
    },
    {
        "region_id": "franken", "name": "Franken", "name_pt": "Francônia", "name_en": "Franken", "country_id": "germany",
        "description_pt": "Bavária, conhecida por Silvaner em garrafas Bocksbeutel. Vinhos secos e terrosos.",
        "description_en": "Bavaria, known for Silvaner in Bocksbeutel bottles. Dry, earthy wines.",
        "climate": {"type_pt": "Continental", "type_en": "Continental", "temperature_pt": "Extremos térmicos", "temperature_en": "Temperature extremes", "rainfall_pt": "600mm/ano", "rainfall_en": "600mm/year"},
        "terroir": {"soil_pt": "Calcário (Muschelkalk), arenito", "soil_en": "Shell limestone (Muschelkalk), sandstone", "altitude_pt": "200-400m", "altitude_en": "200-400m", "maritime_influence": False},
        "key_grapes": ["Silvaner", "Müller-Thurgau", "Riesling"],
        "wine_styles_pt": ["Brancos secos e terrosos"],
        "wine_styles_en": ["Dry, earthy whites"]
    },
    {
        "region_id": "ahr", "name": "Ahr", "name_pt": "Ahr", "name_en": "Ahr", "country_id": "germany",
        "description_pt": "Pequena região ao norte, especializada em Pinot Noir de alta qualidade.",
        "description_en": "Small northern region, specializing in high-quality Pinot Noir.",
        "climate": {"type_pt": "Continental frio", "type_en": "Cool continental", "temperature_pt": "Frio", "temperature_en": "Cool", "rainfall_pt": "600mm/ano", "rainfall_en": "600mm/year"},
        "terroir": {"soil_pt": "Ardósia, basalto, loess", "soil_en": "Slate, basalt, loess", "altitude_pt": "100-300m", "altitude_en": "100-300m", "maritime_influence": False},
        "key_grapes": ["Spätburgunder"],
        "wine_styles_pt": ["Tintos elegantes de Pinot Noir"],
        "wine_styles_en": ["Elegant Pinot Noir reds"]
    },
    {
        "region_id": "rheinhessen", "name": "Rheinhessen", "name_pt": "Rheinhessen", "name_en": "Rheinhessen", "country_id": "germany",
        "description_pt": "Maior região vinícola da Alemanha. Grande variedade de estilos.",
        "description_en": "Germany's largest wine region. Wide variety of styles.",
        "climate": {"type_pt": "Continental", "type_en": "Continental", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "500mm/ano", "rainfall_en": "500mm/year"},
        "terroir": {"soil_pt": "Loess, calcário, ardósia vermelha", "soil_en": "Loess, limestone, red slate", "altitude_pt": "100-300m", "altitude_en": "100-300m", "maritime_influence": False},
        "key_grapes": ["Riesling", "Müller-Thurgau", "Silvaner", "Dornfelder"],
        "wine_styles_pt": ["Diversos estilos de branco e tinto"],
        "wine_styles_en": ["Various white and red styles"]
    },
    
    # ===== AUSTRIA =====
    {
        "region_id": "wachau", "name": "Wachau", "name_pt": "Wachau", "name_en": "Wachau", "country_id": "austria",
        "description_pt": "Vale do Danúbio, Patrimônio da UNESCO. Riesling e Grüner Veltliner de classe mundial.",
        "description_en": "Danube valley, UNESCO Heritage. World-class Riesling and Grüner Veltliner.",
        "climate": {"type_pt": "Continental frio", "type_en": "Cool continental", "temperature_pt": "Frio", "temperature_en": "Cool", "rainfall_pt": "500mm/ano", "rainfall_en": "500mm/year"},
        "terroir": {"soil_pt": "Gnaisse, granito, loess", "soil_en": "Gneiss, granite, loess", "altitude_pt": "200-450m em terraços", "altitude_en": "200-450m on terraces", "maritime_influence": False},
        "key_grapes": ["Grüner Veltliner", "Riesling"],
        "wine_styles_pt": ["Brancos secos (Smaragd, Federspiel, Steinfeder)"],
        "wine_styles_en": ["Dry whites (Smaragd, Federspiel, Steinfeder)"]
    },
    {
        "region_id": "kamptal", "name": "Kamptal", "name_pt": "Kamptal", "name_en": "Kamptal", "country_id": "austria",
        "description_pt": "Norte da Áustria, produzindo Grüner Veltliner expressivo.",
        "description_en": "Northern Austria, producing expressive Grüner Veltliner.",
        "climate": {"type_pt": "Continental", "type_en": "Continental", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "500mm/ano", "rainfall_en": "500mm/year"},
        "terroir": {"soil_pt": "Loess, gnaisse, calcário", "soil_en": "Loess, gneiss, limestone", "altitude_pt": "200-400m", "altitude_en": "200-400m", "maritime_influence": False},
        "key_grapes": ["Grüner Veltliner", "Riesling"],
        "wine_styles_pt": ["Brancos secos com notas de pimenta branca"],
        "wine_styles_en": ["Dry whites with white pepper notes"]
    },
    {
        "region_id": "kremstal", "name": "Kremstal", "name_pt": "Kremstal", "name_en": "Kremstal", "country_id": "austria",
        "description_pt": "Entre Wachau e Kamptal, combinando elementos de ambos.",
        "description_en": "Between Wachau and Kamptal, combining elements of both.",
        "climate": {"type_pt": "Continental", "type_en": "Continental", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "500mm/ano", "rainfall_en": "500mm/year"},
        "terroir": {"soil_pt": "Loess, gnaisse primário", "soil_en": "Loess, primary gneiss", "altitude_pt": "200-400m", "altitude_en": "200-400m", "maritime_influence": False},
        "key_grapes": ["Grüner Veltliner", "Riesling"],
        "wine_styles_pt": ["Brancos elegantes e secos"],
        "wine_styles_en": ["Elegant, dry whites"]
    },
    
    # ===== USA =====
    {
        "region_id": "napa_valley", "name": "Napa Valley", "name_pt": "Vale de Napa", "name_en": "Napa Valley", "country_id": "usa",
        "description_pt": "A região mais prestigiosa dos EUA, famosa por Cabernet Sauvignon de classe mundial.",
        "description_en": "USA's most prestigious region, famous for world-class Cabernet Sauvignon.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Quente", "temperature_en": "Warm", "rainfall_pt": "600mm/ano", "rainfall_en": "600mm/year"},
        "terroir": {"soil_pt": "Vulcânico, aluvial, cascalho", "soil_en": "Volcanic, alluvial, gravel", "altitude_pt": "0-600m", "altitude_en": "0-600m", "maritime_influence": False},
        "key_grapes": ["Cabernet Sauvignon", "Merlot", "Chardonnay"],
        "wine_styles_pt": ["Tintos encorpados de Cabernet", "Chardonnay com carvalho"],
        "wine_styles_en": ["Full-bodied Cabernet reds", "Oaky Chardonnay"]
    },
    {
        "region_id": "sonoma", "name": "Sonoma", "name_pt": "Sonoma", "name_en": "Sonoma", "country_id": "usa",
        "description_pt": "Vizinha de Napa, mais diversa em climas e estilos. Excelentes Pinot Noir e Chardonnay.",
        "description_en": "Napa's neighbor, more diverse in climates and styles. Excellent Pinot Noir and Chardonnay.",
        "climate": {"type_pt": "Variado (costeiro a interior)", "type_en": "Varied (coastal to inland)", "temperature_pt": "Frio a quente", "temperature_en": "Cool to warm", "rainfall_pt": "750mm/ano", "rainfall_en": "750mm/year"},
        "terroir": {"soil_pt": "Vulcânico, argila, areia", "soil_en": "Volcanic, clay, sand", "altitude_pt": "0-500m", "altitude_en": "0-500m", "maritime_influence": True},
        "key_grapes": ["Pinot Noir", "Chardonnay", "Zinfandel"],
        "wine_styles_pt": ["Pinot Noir elegante", "Chardonnay costeiro", "Zinfandel potente"],
        "wine_styles_en": ["Elegant Pinot Noir", "Coastal Chardonnay", "Powerful Zinfandel"]
    },
    {
        "region_id": "oregon", "name": "Oregon", "name_pt": "Oregon", "name_en": "Oregon", "country_id": "usa",
        "description_pt": "Noroeste dos EUA, clima frio ideal para Pinot Noir. Willamette Valley.",
        "description_en": "Pacific Northwest, cool climate ideal for Pinot Noir. Willamette Valley.",
        "climate": {"type_pt": "Marítimo frio", "type_en": "Cool maritime", "temperature_pt": "Frio", "temperature_en": "Cool", "rainfall_pt": "1000mm/ano", "rainfall_en": "1000mm/year"},
        "terroir": {"soil_pt": "Jory (vulcânico vermelho), sedimentar", "soil_en": "Jory (red volcanic), sedimentary", "altitude_pt": "60-300m", "altitude_en": "60-300m", "maritime_influence": True},
        "key_grapes": ["Pinot Noir", "Pinot Gris", "Chardonnay"],
        "wine_styles_pt": ["Pinot Noir estilo borgonhês"],
        "wine_styles_en": ["Burgundian-style Pinot Noir"]
    },
    {
        "region_id": "washington", "name": "Washington State", "name_pt": "Estado de Washington", "name_en": "Washington State", "country_id": "usa",
        "description_pt": "Segundo maior produtor dos EUA. Columbia Valley com excelentes Cabernet, Merlot e Syrah.",
        "description_en": "Second largest US producer. Columbia Valley with excellent Cabernet, Merlot and Syrah.",
        "climate": {"type_pt": "Continental desértico", "type_en": "Continental desert", "temperature_pt": "Dias quentes, noites frias", "temperature_en": "Hot days, cool nights", "rainfall_pt": "200mm/ano (irrigado)", "rainfall_en": "200mm/year (irrigated)"},
        "terroir": {"soil_pt": "Basalto, loess, areia", "soil_en": "Basalt, loess, sand", "altitude_pt": "100-600m", "altitude_en": "100-600m", "maritime_influence": False},
        "key_grapes": ["Cabernet Sauvignon", "Merlot", "Syrah", "Riesling"],
        "wine_styles_pt": ["Tintos estruturados", "Riesling de clima frio"],
        "wine_styles_en": ["Structured reds", "Cool-climate Riesling"]
    },
    {
        "region_id": "finger_lakes", "name": "Finger Lakes", "name_pt": "Finger Lakes", "name_en": "Finger Lakes", "country_id": "usa",
        "description_pt": "Nova York, especializada em Riesling de clima frio.",
        "description_en": "New York, specializing in cool-climate Riesling.",
        "climate": {"type_pt": "Continental frio", "type_en": "Cool continental", "temperature_pt": "Frio", "temperature_en": "Cool", "rainfall_pt": "850mm/ano", "rainfall_en": "850mm/year"},
        "terroir": {"soil_pt": "Xisto, calcário, cascalho glacial", "soil_en": "Shale, limestone, glacial gravel", "altitude_pt": "150-400m", "altitude_en": "150-400m", "maritime_influence": False},
        "key_grapes": ["Riesling", "Cabernet Franc", "Gewürztraminer"],
        "wine_styles_pt": ["Riesling de todos os estilos"],
        "wine_styles_en": ["Riesling in all styles"]
    },
    
    # ===== ARGENTINA =====
    {
        "region_id": "mendoza", "name": "Mendoza", "name_pt": "Mendoza", "name_en": "Mendoza", "country_id": "argentina",
        "description_pt": "Coração vinícola da Argentina, produzindo 70% dos vinhos do país. Malbec de altitude.",
        "description_en": "Argentina's wine heartland, producing 70% of the country's wines. Altitude Malbec.",
        "climate": {"type_pt": "Continental desértico", "type_en": "Continental desert", "temperature_pt": "Quente e seco", "temperature_en": "Hot and dry", "rainfall_pt": "200mm/ano (irrigado)", "rainfall_en": "200mm/year (irrigated)"},
        "terroir": {"soil_pt": "Aluvial, cascalho, areia, calcário", "soil_en": "Alluvial, gravel, sand, limestone", "altitude_pt": "600-1500m", "altitude_en": "600-1500m", "maritime_influence": False},
        "key_grapes": ["Malbec", "Cabernet Sauvignon", "Bonarda"],
        "wine_styles_pt": ["Malbec frutado e encorpado"],
        "wine_styles_en": ["Fruity, full-bodied Malbec"]
    },
    {
        "region_id": "salta", "name": "Salta", "name_pt": "Salta", "name_en": "Salta", "country_id": "argentina",
        "description_pt": "Noroeste da Argentina, vinhedos entre os mais altos do mundo (até 3.000m). Torrontés aromático.",
        "description_en": "Northwestern Argentina, among the world's highest vineyards (up to 3,000m). Aromatic Torrontés.",
        "climate": {"type_pt": "Desértico de altitude", "type_en": "High altitude desert", "temperature_pt": "Dias quentes, noites muito frias", "temperature_en": "Hot days, very cold nights", "rainfall_pt": "150mm/ano", "rainfall_en": "150mm/year"},
        "terroir": {"soil_pt": "Arenoso, calcário, cascalho", "soil_en": "Sandy, limestone, gravel", "altitude_pt": "1500-3000m", "altitude_en": "1500-3000m", "maritime_influence": False},
        "key_grapes": ["Torrontés", "Malbec"],
        "wine_styles_pt": ["Torrontés aromático", "Malbec de altitude"],
        "wine_styles_en": ["Aromatic Torrontés", "Altitude Malbec"]
    },
    {
        "region_id": "la_rioja_arg", "name": "La Rioja (Argentina)", "name_pt": "La Rioja (Argentina)", "name_en": "La Rioja (Argentina)", "country_id": "argentina",
        "description_pt": "Uma das regiões mais antigas da Argentina, conhecida por Torrontés.",
        "description_en": "One of Argentina's oldest regions, known for Torrontés.",
        "climate": {"type_pt": "Continental desértico", "type_en": "Continental desert", "temperature_pt": "Quente e seco", "temperature_en": "Hot and dry", "rainfall_pt": "150mm/ano", "rainfall_en": "150mm/year"},
        "terroir": {"soil_pt": "Arenoso, aluvial", "soil_en": "Sandy, alluvial", "altitude_pt": "800-1500m", "altitude_en": "800-1500m", "maritime_influence": False},
        "key_grapes": ["Torrontés", "Bonarda"],
        "wine_styles_pt": ["Torrontés branco aromático"],
        "wine_styles_en": ["Aromatic white Torrontés"]
    },
    
    # ===== CHILE =====
    {
        "region_id": "maipo", "name": "Maipo Valley", "name_pt": "Vale do Maipo", "name_en": "Maipo Valley", "country_id": "chile",
        "description_pt": "A região mais prestigiosa do Chile, nos arredores de Santiago. Cabernet Sauvignon de classe mundial.",
        "description_en": "Chile's most prestigious region, near Santiago. World-class Cabernet Sauvignon.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Quente e seco", "temperature_en": "Warm and dry", "rainfall_pt": "350mm/ano", "rainfall_en": "350mm/year"},
        "terroir": {"soil_pt": "Aluvial, cascalho, argila", "soil_en": "Alluvial, gravel, clay", "altitude_pt": "400-800m", "altitude_en": "400-800m", "maritime_influence": False},
        "key_grapes": ["Cabernet Sauvignon", "Carménère", "Merlot"],
        "wine_styles_pt": ["Cabernet Sauvignon clássico"],
        "wine_styles_en": ["Classic Cabernet Sauvignon"]
    },
    {
        "region_id": "colchagua", "name": "Colchagua Valley", "name_pt": "Vale de Colchagua", "name_en": "Colchagua Valley", "country_id": "chile",
        "description_pt": "Sul de Santiago, produzindo tintos potentes e frutados. Carménère é especialidade.",
        "description_en": "South of Santiago, producing powerful, fruity reds. Carménère is a specialty.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Quente", "temperature_en": "Warm", "rainfall_pt": "500mm/ano", "rainfall_en": "500mm/year"},
        "terroir": {"soil_pt": "Argila, granito, aluvial", "soil_en": "Clay, granite, alluvial", "altitude_pt": "100-400m", "altitude_en": "100-400m", "maritime_influence": False},
        "key_grapes": ["Carménère", "Cabernet Sauvignon", "Syrah"],
        "wine_styles_pt": ["Carménère herbáceo", "Tintos encorpados"],
        "wine_styles_en": ["Herbaceous Carménère", "Full-bodied reds"]
    },
    {
        "region_id": "casablanca", "name": "Casablanca Valley", "name_pt": "Vale de Casablanca", "name_en": "Casablanca Valley", "country_id": "chile",
        "description_pt": "Região costeira fria, ideal para brancos e Pinot Noir.",
        "description_en": "Cool coastal region, ideal for whites and Pinot Noir.",
        "climate": {"type_pt": "Marítimo frio", "type_en": "Cool maritime", "temperature_pt": "Frio", "temperature_en": "Cool", "rainfall_pt": "450mm/ano", "rainfall_en": "450mm/year"},
        "terroir": {"soil_pt": "Argila, granito decomposto", "soil_en": "Clay, decomposed granite", "altitude_pt": "200-400m", "altitude_en": "200-400m", "maritime_influence": True},
        "key_grapes": ["Sauvignon Blanc", "Chardonnay", "Pinot Noir"],
        "wine_styles_pt": ["Brancos frescos e vibrantes", "Pinot Noir elegante"],
        "wine_styles_en": ["Fresh, vibrant whites", "Elegant Pinot Noir"]
    },
    {
        "region_id": "leyda", "name": "Leyda Valley", "name_pt": "Vale de Leyda", "name_en": "Leyda Valley", "country_id": "chile",
        "description_pt": "Região costeira extrema, produzindo brancos vibrantes e Pinot Noir elegante.",
        "description_en": "Extreme coastal region, producing vibrant whites and elegant Pinot Noir.",
        "climate": {"type_pt": "Marítimo muito frio", "type_en": "Very cool maritime", "temperature_pt": "Muito frio", "temperature_en": "Very cool", "rainfall_pt": "300mm/ano", "rainfall_en": "300mm/year"},
        "terroir": {"soil_pt": "Granito, argila, areia costeira", "soil_en": "Granite, clay, coastal sand", "altitude_pt": "100-300m", "altitude_en": "100-300m", "maritime_influence": True},
        "key_grapes": ["Sauvignon Blanc", "Pinot Noir", "Chardonnay"],
        "wine_styles_pt": ["Sauvignon Blanc mineral", "Pinot Noir fresco"],
        "wine_styles_en": ["Mineral Sauvignon Blanc", "Fresh Pinot Noir"]
    },
    {
        "region_id": "cachapoal", "name": "Cachapoal Valley", "name_pt": "Vale de Cachapoal", "name_en": "Cachapoal Valley", "country_id": "chile",
        "description_pt": "Centro-sul do Chile, conhecida por Carménère e tintos maduros.",
        "description_en": "Central-south Chile, known for Carménère and ripe reds.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Quente", "temperature_en": "Warm", "rainfall_pt": "500mm/ano", "rainfall_en": "500mm/year"},
        "terroir": {"soil_pt": "Aluvial, argila vermelha", "soil_en": "Alluvial, red clay", "altitude_pt": "200-500m", "altitude_en": "200-500m", "maritime_influence": False},
        "key_grapes": ["Carménère", "Cabernet Sauvignon", "Merlot"],
        "wine_styles_pt": ["Tintos maduros e frutados"],
        "wine_styles_en": ["Ripe, fruity reds"]
    },
    
    # ===== AUSTRALIA =====
    {
        "region_id": "barossa_valley", "name": "Barossa Valley", "name_pt": "Vale de Barossa", "name_en": "Barossa Valley", "country_id": "australia",
        "description_pt": "A região mais icônica da Austrália, famosa por Shiraz potente de vinhas velhas.",
        "description_en": "Australia's most iconic region, famous for powerful old-vine Shiraz.",
        "climate": {"type_pt": "Mediterrâneo quente", "type_en": "Warm Mediterranean", "temperature_pt": "Quente e seco", "temperature_en": "Hot and dry", "rainfall_pt": "500mm/ano", "rainfall_en": "500mm/year"},
        "terroir": {"soil_pt": "Terra vermelha, areia, argila", "soil_en": "Red earth, sand, clay", "altitude_pt": "200-400m", "altitude_en": "200-400m", "maritime_influence": False},
        "key_grapes": ["Shiraz", "Grenache", "Mataro"],
        "wine_styles_pt": ["Shiraz potente de vinhas velhas"],
        "wine_styles_en": ["Powerful old-vine Shiraz"]
    },
    {
        "region_id": "mclaren_vale", "name": "McLaren Vale", "name_pt": "McLaren Vale", "name_en": "McLaren Vale", "country_id": "australia",
        "description_pt": "Sul da Austrália, Shiraz e Grenache de alta qualidade com influência marítima.",
        "description_en": "South Australia, high-quality Shiraz and Grenache with maritime influence.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Moderado a quente", "temperature_en": "Moderate to warm", "rainfall_pt": "550mm/ano", "rainfall_en": "550mm/year"},
        "terroir": {"soil_pt": "Areia, argila, calcário", "soil_en": "Sand, clay, limestone", "altitude_pt": "0-300m", "altitude_en": "0-300m", "maritime_influence": True},
        "key_grapes": ["Shiraz", "Grenache", "Cabernet Sauvignon"],
        "wine_styles_pt": ["Shiraz elegante", "Blends GSM"],
        "wine_styles_en": ["Elegant Shiraz", "GSM blends"]
    },
    {
        "region_id": "coonawarra", "name": "Coonawarra", "name_pt": "Coonawarra", "name_en": "Coonawarra", "country_id": "australia",
        "description_pt": "Famosa pelo solo terra rossa (argila vermelha sobre calcário). Cabernet Sauvignon de classe mundial.",
        "description_en": "Famous for terra rossa soil (red clay over limestone). World-class Cabernet Sauvignon.",
        "climate": {"type_pt": "Marítimo frio", "type_en": "Cool maritime", "temperature_pt": "Frio", "temperature_en": "Cool", "rainfall_pt": "600mm/ano", "rainfall_en": "600mm/year"},
        "terroir": {"soil_pt": "Terra rossa sobre calcário", "soil_en": "Terra rossa over limestone", "altitude_pt": "50-70m", "altitude_en": "50-70m", "maritime_influence": True},
        "key_grapes": ["Cabernet Sauvignon", "Shiraz"],
        "wine_styles_pt": ["Cabernet elegante e terroso"],
        "wine_styles_en": ["Elegant, earthy Cabernet"]
    },
    {
        "region_id": "hunter_valley", "name": "Hunter Valley", "name_pt": "Hunter Valley", "name_en": "Hunter Valley", "country_id": "australia",
        "description_pt": "Nova Gales do Sul, Sémillon único que envelhece magnificamente e Shiraz terroso.",
        "description_en": "New South Wales, unique Sémillon that ages magnificently and earthy Shiraz.",
        "climate": {"type_pt": "Subtropical úmido", "type_en": "Humid subtropical", "temperature_pt": "Quente e úmido", "temperature_en": "Warm and humid", "rainfall_pt": "750mm/ano", "rainfall_en": "750mm/year"},
        "terroir": {"soil_pt": "Argila vermelha, aluvial, arenito", "soil_en": "Red clay, alluvial, sandstone", "altitude_pt": "50-150m", "altitude_en": "50-150m", "maritime_influence": True},
        "key_grapes": ["Sémillon", "Shiraz", "Chardonnay"],
        "wine_styles_pt": ["Sémillon de guarda", "Shiraz terroso"],
        "wine_styles_en": ["Age-worthy Sémillon", "Earthy Shiraz"]
    },
    {
        "region_id": "clare_valley", "name": "Clare Valley", "name_pt": "Clare Valley", "name_en": "Clare Valley", "country_id": "australia",
        "description_pt": "Sul da Austrália, famosa por Riesling seco e mineral. Pioneira da tampa de rosca.",
        "description_en": "South Australia, famous for dry, mineral Riesling. Screw cap pioneer.",
        "climate": {"type_pt": "Continental", "type_en": "Continental", "temperature_pt": "Dias quentes, noites frias", "temperature_en": "Hot days, cool nights", "rainfall_pt": "600mm/ano", "rainfall_en": "600mm/year"},
        "terroir": {"soil_pt": "Ardósia, calcário, terra vermelha", "soil_en": "Slate, limestone, red earth", "altitude_pt": "400-500m", "altitude_en": "400-500m", "maritime_influence": False},
        "key_grapes": ["Riesling", "Shiraz", "Cabernet Sauvignon"],
        "wine_styles_pt": ["Riesling seco e mineral"],
        "wine_styles_en": ["Dry, mineral Riesling"]
    },
    {
        "region_id": "margaret_river", "name": "Margaret River", "name_pt": "Margaret River", "name_en": "Margaret River", "country_id": "australia",
        "description_pt": "Oeste da Austrália, blends bordaleses elegantes e Chardonnay de classe mundial.",
        "description_en": "Western Australia, elegant Bordeaux blends and world-class Chardonnay.",
        "climate": {"type_pt": "Mediterrâneo marítimo", "type_en": "Maritime Mediterranean", "temperature_pt": "Moderado", "temperature_en": "Moderate", "rainfall_pt": "1100mm/ano", "rainfall_en": "1100mm/year"},
        "terroir": {"soil_pt": "Granito, laterita, calcário", "soil_en": "Granite, laterite, limestone", "altitude_pt": "0-200m", "altitude_en": "0-200m", "maritime_influence": True},
        "key_grapes": ["Cabernet Sauvignon", "Chardonnay", "Sauvignon Blanc", "Sémillon"],
        "wine_styles_pt": ["Blends bordaleses", "Chardonnay premium"],
        "wine_styles_en": ["Bordeaux blends", "Premium Chardonnay"]
    },
    {
        "region_id": "yarra_valley", "name": "Yarra Valley", "name_pt": "Yarra Valley", "name_en": "Yarra Valley", "country_id": "australia",
        "description_pt": "Victoria, região de clima frio ideal para Pinot Noir e Chardonnay. Perto de Melbourne.",
        "description_en": "Victoria, cool climate region ideal for Pinot Noir and Chardonnay. Near Melbourne.",
        "climate": {"type_pt": "Marítimo frio", "type_en": "Cool maritime", "temperature_pt": "Frio", "temperature_en": "Cool", "rainfall_pt": "1000mm/ano", "rainfall_en": "1000mm/year"},
        "terroir": {"soil_pt": "Argila vermelha vulcânica, areia", "soil_en": "Red volcanic clay, sand", "altitude_pt": "50-400m", "altitude_en": "50-400m", "maritime_influence": True},
        "key_grapes": ["Pinot Noir", "Chardonnay", "Shiraz"],
        "wine_styles_pt": ["Pinot Noir elegante", "Espumantes"],
        "wine_styles_en": ["Elegant Pinot Noir", "Sparkling wines"]
    },
    
    # ===== NEW ZEALAND =====
    {
        "region_id": "marlborough", "name": "Marlborough", "name_pt": "Marlborough", "name_en": "Marlborough", "country_id": "new_zealand",
        "description_pt": "A maior e mais famosa região da Nova Zelândia, definindo o Sauvignon Blanc aromático mundial.",
        "description_en": "New Zealand's largest and most famous region, defining world aromatic Sauvignon Blanc.",
        "climate": {"type_pt": "Marítimo frio", "type_en": "Cool maritime", "temperature_pt": "Frio e ensolarado", "temperature_en": "Cool and sunny", "rainfall_pt": "650mm/ano", "rainfall_en": "650mm/year"},
        "terroir": {"soil_pt": "Cascalho aluvial, argila, silte", "soil_en": "Alluvial gravel, clay, silt", "altitude_pt": "0-200m", "altitude_en": "0-200m", "maritime_influence": True},
        "key_grapes": ["Sauvignon Blanc", "Pinot Noir", "Chardonnay"],
        "wine_styles_pt": ["Sauvignon Blanc intensamente aromático"],
        "wine_styles_en": ["Intensely aromatic Sauvignon Blanc"]
    },
    {
        "region_id": "central_otago", "name": "Central Otago", "name_pt": "Central Otago", "name_en": "Central Otago", "country_id": "new_zealand",
        "description_pt": "Região continental mais ao sul do mundo, produzindo Pinot Noir excepcional.",
        "description_en": "World's southernmost continental wine region, producing exceptional Pinot Noir.",
        "climate": {"type_pt": "Continental", "type_en": "Continental", "temperature_pt": "Extremos térmicos", "temperature_en": "Temperature extremes", "rainfall_pt": "400mm/ano", "rainfall_en": "400mm/year"},
        "terroir": {"soil_pt": "Xisto, loess, cascalho glacial", "soil_en": "Schist, loess, glacial gravel", "altitude_pt": "200-450m", "altitude_en": "200-450m", "maritime_influence": False},
        "key_grapes": ["Pinot Noir", "Riesling", "Pinot Gris"],
        "wine_styles_pt": ["Pinot Noir intenso e puro"],
        "wine_styles_en": ["Intense, pure Pinot Noir"]
    },
    {
        "region_id": "martinborough", "name": "Martinborough", "name_pt": "Martinborough", "name_en": "Martinborough", "country_id": "new_zealand",
        "description_pt": "Norte da Ilha Sul, produzindo Pinot Noir elegante em pequena escala.",
        "description_en": "North of South Island, producing elegant small-scale Pinot Noir.",
        "climate": {"type_pt": "Marítimo frio", "type_en": "Cool maritime", "temperature_pt": "Frio e seco", "temperature_en": "Cool and dry", "rainfall_pt": "700mm/ano", "rainfall_en": "700mm/year"},
        "terroir": {"soil_pt": "Cascalho aluvial, silte", "soil_en": "Alluvial gravel, silt", "altitude_pt": "0-100m", "altitude_en": "0-100m", "maritime_influence": True},
        "key_grapes": ["Pinot Noir", "Sauvignon Blanc"],
        "wine_styles_pt": ["Pinot Noir elegante e estruturado"],
        "wine_styles_en": ["Elegant, structured Pinot Noir"]
    },
    
    # ===== SOUTH AFRICA =====
    {
        "region_id": "stellenbosch", "name": "Stellenbosch", "name_pt": "Stellenbosch", "name_en": "Stellenbosch", "country_id": "south_africa",
        "description_pt": "A região mais prestigiosa da África do Sul, excelentes tintos e blends bordaleses.",
        "description_en": "South Africa's most prestigious region, excellent reds and Bordeaux blends.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Quente", "temperature_en": "Warm", "rainfall_pt": "800mm/ano", "rainfall_en": "800mm/year"},
        "terroir": {"soil_pt": "Granito decomposto, arenito, xisto", "soil_en": "Decomposed granite, sandstone, shale", "altitude_pt": "100-600m", "altitude_en": "100-600m", "maritime_influence": True},
        "key_grapes": ["Cabernet Sauvignon", "Pinotage", "Shiraz", "Chenin Blanc"],
        "wine_styles_pt": ["Blends bordaleses", "Pinotage único"],
        "wine_styles_en": ["Bordeaux blends", "Unique Pinotage"]
    },
    {
        "region_id": "swartland", "name": "Swartland", "name_pt": "Swartland", "name_en": "Swartland", "country_id": "south_africa",
        "description_pt": "Região renascentista com vinhos naturais e de vinhas velhas. Chenin Blanc e blends do Rhône.",
        "description_en": "Renaissance region with natural and old-vine wines. Chenin Blanc and Rhône blends.",
        "climate": {"type_pt": "Mediterrâneo", "type_en": "Mediterranean", "temperature_pt": "Quente e seco", "temperature_en": "Hot and dry", "rainfall_pt": "400mm/ano", "rainfall_en": "400mm/year"},
        "terroir": {"soil_pt": "Xisto, granito, argila", "soil_en": "Shale, granite, clay", "altitude_pt": "100-400m", "altitude_en": "100-400m", "maritime_influence": False},
        "key_grapes": ["Chenin Blanc", "Syrah", "Grenache", "Mourvèdre"],
        "wine_styles_pt": ["Chenin Blanc de vinhas velhas", "Blends do Rhône"],
        "wine_styles_en": ["Old-vine Chenin Blanc", "Rhône blends"]
    },
    {
        "region_id": "constantia", "name": "Constantia", "name_pt": "Constantia", "name_en": "Constantia", "country_id": "south_africa",
        "description_pt": "Região histórica perto da Cidade do Cabo, famosa no século 18 por vinhos doces.",
        "description_en": "Historic region near Cape Town, famous in the 18th century for sweet wines.",
        "climate": {"type_pt": "Marítimo frio", "type_en": "Cool maritime", "temperature_pt": "Frio", "temperature_en": "Cool", "rainfall_pt": "1000mm/ano", "rainfall_en": "1000mm/year"},
        "terroir": {"soil_pt": "Granito decomposto, arenito", "soil_en": "Decomposed granite, sandstone", "altitude_pt": "100-400m", "altitude_en": "100-400m", "maritime_influence": True},
        "key_grapes": ["Sauvignon Blanc", "Sémillon"],
        "wine_styles_pt": ["Brancos frescos", "Vin de Constance (doce histórico)"],
        "wine_styles_en": ["Fresh whites", "Vin de Constance (historic sweet)"]
    },
    
    # ===== URUGUAY =====
    {
        "region_id": "canelones", "name": "Canelones", "name_pt": "Canelones", "name_en": "Canelones", "country_id": "uruguay",
        "description_pt": "Principal região vinícola do Uruguai, produzindo a maior parte do Tannat do país.",
        "description_en": "Uruguay's main wine region, producing most of the country's Tannat.",
        "climate": {"type_pt": "Marítimo", "type_en": "Maritime", "temperature_pt": "Moderado e úmido", "temperature_en": "Moderate and humid", "rainfall_pt": "1000mm/ano", "rainfall_en": "1000mm/year"},
        "terroir": {"soil_pt": "Argila, calcário, cascalho", "soil_en": "Clay, limestone, gravel", "altitude_pt": "0-100m", "altitude_en": "0-100m", "maritime_influence": True},
        "key_grapes": ["Tannat", "Merlot", "Cabernet Sauvignon"],
        "wine_styles_pt": ["Tannat potente e tânico"],
        "wine_styles_en": ["Powerful, tannic Tannat"]
    }
]

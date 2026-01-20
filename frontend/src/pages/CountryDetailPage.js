import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Globe, MapPin, Wine, GlassWater, 
  Thermometer, Mountain, ChevronRight, Grape, Award
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useLanguage } from '../contexts/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CountryDetailPage = () => {
  const { countryId } = useParams();
  const { language } = useLanguage();
  const [country, setCountry] = useState(null);
  const [regions, setRegions] = useState([]);
  const [grapes, setGrapes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch country
        const countryRes = await fetch(`${API}/countries/${countryId}`);
        if (countryRes.ok) {
          const countryData = await countryRes.json();
          setCountry(countryData);
        }
        
        // Fetch regions for this country
        const regionsRes = await fetch(`${API}/regions?country_id=${countryId}`);
        if (regionsRes.ok) {
          const regionsData = await regionsRes.json();
          setRegions(regionsData);
        }
        
        // Fetch grapes that are prominent in this country's regions
        const grapesRes = await fetch(`${API}/grapes`);
        if (grapesRes.ok) {
          const allGrapes = await grapesRes.json();
          // Filter grapes by origin country or best regions
          const countryGrapes = allGrapes.filter(g => 
            g.origin_country === countryId ||
            g.best_regions?.some(r => 
              regions.some(reg => 
                r.toLowerCase().includes(reg.name.toLowerCase()) ||
                reg.name.toLowerCase().includes(r.toLowerCase())
              )
            )
          );
          setGrapes(countryGrapes.slice(0, 8));
        }
      } catch (error) {
        console.error('Error fetching country:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [countryId]);

  // Country-specific content
  const countryInfo = {
    france: {
      history_pt: "A França é considerada o berço da vinicultura moderna. Desde os monges cistercienses na Borgonha até a classificação de 1855 em Bordeaux, o país estabeleceu os padrões de qualidade que o mundo segue até hoje.",
      history_en: "France is considered the birthplace of modern viticulture. From the Cistercian monks in Burgundy to the 1855 classification in Bordeaux, the country established quality standards the world follows today.",
      highlights_pt: ["Sistema AOC (Appellation d'Origine Contrôlée)", "Classificação de 1855 de Bordeaux", "Conceito de terroir desenvolvido na Borgonha", "Champagne: único espumante verdadeiro"],
      highlights_en: ["AOC system (Appellation d'Origine Contrôlée)", "1855 Bordeaux Classification", "Terroir concept developed in Burgundy", "Champagne: the only true sparkling"],
      climate_pt: "Varia do oceânico no oeste ao continental no leste e mediterrâneo no sul.",
      climate_en: "Varies from oceanic in the west to continental in the east and Mediterranean in the south.",
    },
    italy: {
      history_pt: "A Itália possui a maior diversidade de castas autóctones do mundo, com mais de 350 variedades oficialmente reconhecidas. Cada região preserva tradições milenares únicas.",
      history_en: "Italy has the greatest diversity of indigenous grape varieties in the world, with over 350 officially recognized varieties. Each region preserves unique millennial traditions.",
      highlights_pt: ["Maior diversidade de castas do mundo", "Sistema DOCG/DOC/IGT", "Super Toscanos revolucionaram a indústria", "Tradição de vinhos de sobremesa (Vin Santo, Passito)"],
      highlights_en: ["World's greatest grape diversity", "DOCG/DOC/IGT system", "Super Tuscans revolutionized the industry", "Dessert wine tradition (Vin Santo, Passito)"],
      climate_pt: "Predominantemente mediterrâneo, com variações alpinas no norte e influência africana no sul.",
      climate_en: "Predominantly Mediterranean, with alpine variations in the north and African influence in the south.",
    },
    spain: {
      history_pt: "A Espanha possui a maior área plantada de vinhedos do mundo. A revolução qualitativa começou nos anos 1990, transformando o país em produtor de vinhos de classe mundial.",
      history_en: "Spain has the largest vineyard area in the world. The quality revolution began in the 1990s, transforming the country into a world-class wine producer.",
      highlights_pt: ["Maior área de vinhedos do mundo", "Sistema Solera para Jerez", "Tempranillo: uva símbolo nacional", "Classificação por tempo de envelhecimento (Crianza, Reserva, Gran Reserva)"],
      highlights_en: ["World's largest vineyard area", "Solera system for Sherry", "Tempranillo: national symbol grape", "Classification by aging time (Crianza, Reserva, Gran Reserva)"],
      climate_pt: "Continental no interior, mediterrâneo na costa e atlântico no noroeste.",
      climate_en: "Continental inland, Mediterranean on the coast and Atlantic in the northwest.",
    },
    portugal: {
      history_pt: "Portugal é o país com a região demarcada mais antiga do mundo (Douro, 1756). Rico em castas autóctones, é berço do vinho do Porto e Madeira.",
      history_en: "Portugal has the world's oldest demarcated wine region (Douro, 1756). Rich in indigenous varieties, it's the birthplace of Port and Madeira wines.",
      highlights_pt: ["Região demarcada mais antiga do mundo", "Vinho do Porto: patrimônio mundial", "Madeira: vinho imortal", "Mais de 250 castas autóctones"],
      highlights_en: ["World's oldest demarcated region", "Port wine: world heritage", "Madeira: immortal wine", "Over 250 indigenous varieties"],
      climate_pt: "Atlântico no norte e oeste, mediterrâneo no sul e continental no interior.",
      climate_en: "Atlantic in the north and west, Mediterranean in the south and continental inland.",
    },
    germany: {
      history_pt: "A Alemanha é mestre em vinhos brancos elegantes, especialmente Riesling. O sistema de classificação por nível de açúcar das uvas é único no mundo.",
      history_en: "Germany is a master of elegant white wines, especially Riesling. The classification system by grape sugar level is unique in the world.",
      highlights_pt: ["Riesling: a uva mais nobre para brancos", "Sistema Prädikat de classificação", "Eiswein: vinho de gelo", "Vinhedos em encostas íngremes ao longo do Reno"],
      highlights_en: ["Riesling: noblest white grape", "Prädikat classification system", "Eiswein: ice wine", "Steep slope vineyards along the Rhine"],
      climate_pt: "Continental frio, com influência fluvial dos rios Reno e Mosela.",
      climate_en: "Cold continental, with river influence from the Rhine and Moselle.",
    },
    usa: {
      history_pt: "Os Estados Unidos são o quarto maior produtor mundial. A Califórnia domina com 90% da produção, mas Oregon e Washington ganham destaque internacional.",
      history_en: "The United States is the fourth largest producer worldwide. California dominates with 90% of production, but Oregon and Washington gain international prominence.",
      highlights_pt: ["Califórnia: 90% da produção americana", "Napa Valley: Cabernet de classe mundial", "Oregon: Pinot Noir estilo Borgonha", "Sistema AVA (American Viticultural Area)"],
      highlights_en: ["California: 90% of American production", "Napa Valley: world-class Cabernet", "Oregon: Burgundy-style Pinot Noir", "AVA system (American Viticultural Area)"],
      climate_pt: "Varia enormemente: mediterrâneo na Califórnia, marítimo frio em Oregon.",
      climate_en: "Varies enormously: Mediterranean in California, cool maritime in Oregon.",
    },
    argentina: {
      history_pt: "A Argentina é o quinto maior produtor mundial e a capital mundial do Malbec. Os vinhedos em altitudes extremas (até 3.000m) são únicos no mundo.",
      history_en: "Argentina is the fifth largest producer worldwide and the world capital of Malbec. Vineyards at extreme altitudes (up to 3,000m) are unique in the world.",
      highlights_pt: ["Capital mundial do Malbec", "Vinhedos mais altos do mundo", "Mendoza: 70% da produção", "Torrontés: branco aromático único"],
      highlights_en: ["World capital of Malbec", "World's highest vineyards", "Mendoza: 70% of production", "Torrontés: unique aromatic white"],
      climate_pt: "Continental desértico com grande amplitude térmica. Irrigação por degelo andino.",
      climate_en: "Continental desert with great temperature range. Irrigation by Andean snowmelt.",
    },
    chile: {
      history_pt: "O Chile é um paraíso vitícola isolado por montanhas, oceano e deserto. É o único país livre de filoxera, preservando vinhas centenárias.",
      history_en: "Chile is a viticultural paradise isolated by mountains, ocean and desert. It's the only phylloxera-free country, preserving century-old vines.",
      highlights_pt: ["Único país livre de filoxera", "Carménère: uva redescoberta", "Vinhedos costeiros de clima frio", "DO (Denominación de Origen) em evolução"],
      highlights_en: ["Only phylloxera-free country", "Carménère: rediscovered grape", "Cool-climate coastal vineyards", "DO (Denominación de Origen) evolving"],
      climate_pt: "Mediterrâneo no centro, desértico no norte e frio no sul.",
      climate_en: "Mediterranean in the center, desert in the north and cold in the south.",
    },
    australia: {
      history_pt: "A Austrália revolucionou a indústria com técnicas inovadoras e marketing agressivo. Possui algumas das vinhas mais antigas do mundo, especialmente de Shiraz.",
      history_en: "Australia revolutionized the industry with innovative techniques and aggressive marketing. It has some of the world's oldest vines, especially Shiraz.",
      highlights_pt: ["Shiraz: o estilo australiano potente", "Vinhas centenárias no Barossa", "Técnicas de irrigação inovadoras", "Sistema GI (Geographical Indication)"],
      highlights_en: ["Shiraz: the powerful Australian style", "Century-old Barossa vines", "Innovative irrigation techniques", "GI system (Geographical Indication)"],
      climate_pt: "Varia de quente e seco no interior a fresco e marítimo nas costas.",
      climate_en: "Varies from hot and dry inland to cool and maritime on the coasts.",
    },
    south_africa: {
      history_pt: "A África do Sul produz vinho desde 1659. É berço da Pinotage (cruzamento de Pinot Noir e Cinsaut) e possui terroirs únicos em Stellenbosch e Swartland.",
      history_en: "South Africa has produced wine since 1659. It's the birthplace of Pinotage (Pinot Noir x Cinsaut cross) and has unique terroirs in Stellenbosch and Swartland.",
      highlights_pt: ["Pinotage: uva exclusiva sul-africana", "Vinhos de Constantia: históricos vinhos doces", "Stellenbosch: principal região", "Chenin Blanc: produção expressiva"],
      highlights_en: ["Pinotage: exclusive South African grape", "Constantia wines: historic sweet wines", "Stellenbosch: main region", "Chenin Blanc: significant production"],
      climate_pt: "Mediterrâneo com influência oceânica refrescante.",
      climate_en: "Mediterranean with cooling oceanic influence.",
    },
  };

  const info = countryInfo[countryId] || {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando país...</p>
        </div>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">País não encontrado</p>
          <Link to="/atlas">
            <Button variant="link" className="text-wine-500 mt-2">
              Voltar ao Atlas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const name = language === 'pt' ? country.name_pt : country.name_en;
  const worldType = country.world_type === 'old_world' 
    ? (language === 'pt' ? 'Velho Mundo' : 'Old World')
    : (language === 'pt' ? 'Novo Mundo' : 'New World');

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/atlas" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Atlas
          </Link>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/atlas" className="hover:text-foreground">Atlas</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{name}</span>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-sm overflow-hidden mb-10"
        >
          <div className="h-64 md:h-80 relative">
            {country.image_url ? (
              <img 
                src={country.image_url}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-wine-500/20 flex items-center justify-center">
                <Globe className="w-20 h-20 text-wine-500/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-4">
                <span className="text-6xl">{country.flag_emoji}</span>
                <div>
                  <Badge className={country.world_type === 'old_world' ? 'bg-wine-500' : 'bg-gold-500'}>
                    {worldType}
                  </Badge>
                  <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mt-2">
                    {name}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <p className="text-lg text-muted-foreground max-w-3xl">
            {language === 'pt' ? country.description_pt : country.description_en}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* History & Overview */}
            {info.history_pt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2">
                      <Award className="w-5 h-5 text-wine-500" />
                      {language === 'pt' ? 'História e Tradição' : 'History and Tradition'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {language === 'pt' ? info.history_pt : info.history_en}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Highlights */}
            {info.highlights_pt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2">
                      <Wine className="w-5 h-5 text-wine-500" />
                      {language === 'pt' ? 'Destaques' : 'Highlights'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(language === 'pt' ? info.highlights_pt : info.highlights_en).map((highlight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-wine-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-wine-500 text-sm font-medium">{index + 1}</span>
                          </div>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Climate */}
            {info.climate_pt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2">
                      <Thermometer className="w-5 h-5 text-wine-500" />
                      {language === 'pt' ? 'Clima' : 'Climate'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {language === 'pt' ? info.climate_pt : info.climate_en}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Regions */}
            {regions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-wine-500" />
                      {language === 'pt' ? 'Principais Regiões' : 'Main Regions'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {regions.map((region) => (
                        <Link 
                          key={region.region_id}
                          to={`/atlas/region/${region.region_id}`}
                          className="p-4 bg-muted/30 rounded-sm hover:bg-muted/50 transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <p className="font-medium">{region.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {region.main_grapes?.slice(0, 2).join(', ')}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-wine-500 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">
                    {language === 'pt' ? 'Informações' : 'Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {language === 'pt' ? 'Classificação' : 'Classification'}
                    </span>
                    <Badge variant="outline">{worldType}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {language === 'pt' ? 'Regiões' : 'Regions'}
                    </span>
                    <span className="font-medium">{regions.length}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Featured Grapes */}
            {grapes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <Grape className="w-4 h-4" />
                      {language === 'pt' ? 'Castas em Destaque' : 'Featured Grapes'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {grapes.map((grape) => (
                      <Link 
                        key={grape.grape_id}
                        to={`/grapes/${grape.grape_id}`}
                        className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-sm transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={grape.grape_type === 'red' ? 'border-wine-500 text-wine-500' : 'border-gold-500 text-gold-600'}
                          >
                            {grape.grape_type === 'red' ? '🍷' : '🥂'}
                          </Badge>
                          <span className="text-sm">{grape.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Sommelier Tip */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-border/40 bg-wine-500/5">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">
                    {language === 'pt' ? 'Dica do Sommelier' : 'Sommelier Tip'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-accent italic">
                    {language === 'pt' 
                      ? `"Para conhecer ${name}, comece pelos vinhos mais emblemáticos de cada região. Compare diferentes produtores para entender a diversidade do país."`
                      : `"To know ${name}, start with the most emblematic wines from each region. Compare different producers to understand the country's diversity."`
                    }
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryDetailPage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Thermometer, Mountain, Droplets, 
  GlassWater, Wine, Grape, Award, ChevronRight, Waves
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useLanguage } from '../contexts/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InfoItem = ({ icon: Icon, label, value, color = "text-wine-500" }) => (
  <div className="flex items-start gap-3">
    <div className={`w-8 h-8 rounded-sm flex items-center justify-center bg-wine-500/10 flex-shrink-0`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

const RegionDetailPage = () => {
  const { regionId } = useParams();
  const { language, t } = useLanguage();
  const [region, setRegion] = useState(null);
  const [country, setCountry] = useState(null);
  const [relatedGrapes, setRelatedGrapes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch region
        const regionRes = await fetch(`${API}/regions/${regionId}`);
        if (regionRes.ok) {
          const regionData = await regionRes.json();
          setRegion(regionData);
          
          // Fetch country
          const countryRes = await fetch(`${API}/countries/${regionData.country_id}`);
          if (countryRes.ok) {
            setCountry(await countryRes.json());
          }
          
          // Fetch related grapes - use key_grapes or main_grapes
          const grapeNames = regionData.key_grapes?.length > 0 
            ? regionData.key_grapes 
            : regionData.main_grapes || [];
          
          if (grapeNames.length > 0) {
            const grapesRes = await fetch(`${API}/grapes`);
            if (grapesRes.ok) {
              const allGrapes = await grapesRes.json();
              const related = allGrapes.filter(g => 
                grapeNames.some(mg => 
                  g.name.toLowerCase() === mg.toLowerCase() ||
                  g.name.toLowerCase().includes(mg.toLowerCase()) ||
                  mg.toLowerCase().includes(g.name.toLowerCase())
                )
              );
              setRelatedGrapes(related);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching region:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [regionId]);

  // Helper functions to get translated values
  const getClimateValue = (field) => {
    if (!region?.climate) return null;
    if (typeof region.climate === 'string') return region.climate;
    if (typeof region.climate === 'object') {
      return language === 'pt' ? region.climate[`${field}_pt`] : region.climate[`${field}_en`];
    }
    return null;
  };

  const getTerroirValue = (field) => {
    if (!region?.terroir) return null;
    return language === 'pt' ? region.terroir[`${field}_pt`] : region.terroir[`${field}_en`];
  };

  const getWineStyles = () => {
    if (region?.wine_styles_pt && language === 'pt') return region.wine_styles_pt;
    if (region?.wine_styles_en && language === 'en') return region.wine_styles_en;
    if (region?.wine_styles && Array.isArray(region.wine_styles)) return region.wine_styles;
    return [];
  };

  const getDescription = () => {
    if (language === 'pt' && region?.description_pt) return region.description_pt;
    if (language === 'en' && region?.description_en) return region.description_en;
    return region?.description_pt || region?.description_en || '';
  };

  const getRegionName = () => {
    if (language === 'pt' && region?.name_pt) return region.name_pt;
    if (language === 'en' && region?.name_en) return region.name_en;
    return region?.name || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <MapPin className="w-16 h-16 text-muted-foreground/30 animate-pulse" />
      </div>
    );
  }

  if (!region) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === 'pt' ? 'Região não encontrada' : 'Region not found'}
          </p>
          <Link to="/atlas">
            <Button className="mt-4">{language === 'pt' ? 'Voltar ao Atlas' : 'Back to Atlas'}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const wineStyles = getWineStyles();
  const grapesList = region.key_grapes?.length > 0 ? region.key_grapes : region.main_grapes || [];

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb & Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/atlas" className="hover:text-foreground transition-colors">
              {language === 'pt' ? 'Atlas' : 'Atlas'}
            </Link>
            <ChevronRight className="w-4 h-4" />
            {country && (
              <>
                <Link 
                  to={`/atlas/${country.country_id}`} 
                  className="hover:text-foreground transition-colors"
                >
                  {language === 'pt' ? country.name_pt : country.name_en}
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <span className="text-foreground">{getRegionName()}</span>
          </div>
          
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4" data-testid="region-name">
            {getRegionName()}
          </h1>
          
          <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
            {getDescription()}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Climate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-wine-500" />
                    {language === 'pt' ? 'Clima' : 'Climate'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(getClimateValue('type') || (typeof region.climate === 'string' && region.climate)) && (
                      <InfoItem
                        icon={Thermometer}
                        label={language === 'pt' ? 'Tipo de Clima' : 'Climate Type'}
                        value={getClimateValue('type') || region.climate}
                      />
                    )}
                    {getClimateValue('temperature') && (
                      <InfoItem
                        icon={Thermometer}
                        label={language === 'pt' ? 'Temperatura' : 'Temperature'}
                        value={getClimateValue('temperature')}
                      />
                    )}
                    {getClimateValue('rainfall') && (
                      <InfoItem
                        icon={Droplets}
                        label={language === 'pt' ? 'Precipitação' : 'Rainfall'}
                        value={getClimateValue('rainfall')}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Terroir */}
            {region.terroir && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2">
                      <Mountain className="w-5 h-5 text-wine-500" />
                      Terroir
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getTerroirValue('soil') && (
                        <InfoItem
                          icon={Grape}
                          label={language === 'pt' ? 'Tipo de Solo' : 'Soil Type'}
                          value={getTerroirValue('soil')}
                        />
                      )}
                      {getTerroirValue('altitude') && (
                        <InfoItem
                          icon={Mountain}
                          label={language === 'pt' ? 'Altitude' : 'Altitude'}
                          value={getTerroirValue('altitude')}
                        />
                      )}
                      {region.terroir?.maritime_influence !== undefined && (
                        <InfoItem
                          icon={Waves}
                          label={language === 'pt' ? 'Influência Marítima' : 'Maritime Influence'}
                          value={region.terroir.maritime_influence 
                            ? (language === 'pt' ? 'Sim' : 'Yes') 
                            : (language === 'pt' ? 'Não' : 'No')}
                        />
                      )}
                    </div>
                    <p className="mt-6 text-muted-foreground font-accent italic">
                      {language === 'pt' 
                        ? 'O terroir único desta região confere aos vinhos características distintas que refletem o solo, a altitude e as influências climáticas locais.'
                        : 'The unique terroir of this region gives wines distinctive characteristics that reflect the soil, altitude, and local climate influences.'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Wine Styles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Wine className="w-5 h-5 text-wine-500" />
                    {language === 'pt' ? 'Estilos de Vinho' : 'Wine Styles'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {wineStyles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {wineStyles.map((style, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-sm px-3 py-1.5"
                        >
                          {style}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {grapesList.some(g => 
                        ['Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Syrah', 'Tempranillo', 'Sangiovese', 'Nebbiolo', 'Shiraz', 'Grenache', 'Malbec'].includes(g)
                      ) && (
                        <Badge variant="outline" className="text-sm px-3 py-1.5 border-wine-500/50">
                          🍷 {language === 'pt' ? 'Tintos' : 'Red Wines'}
                        </Badge>
                      )}
                      {grapesList.some(g => 
                        ['Chardonnay', 'Sauvignon Blanc', 'Riesling', 'Pinot Grigio', 'Albariño', 'Viognier', 'Chenin Blanc', 'Grüner Veltliner'].includes(g)
                      ) && (
                        <Badge variant="outline" className="text-sm px-3 py-1.5 border-gold-500/50">
                          🥂 {language === 'pt' ? 'Brancos' : 'White Wines'}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Main Grapes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">
                    {language === 'pt' ? 'Castas Principais' : 'Main Grapes'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {grapesList.map((grape, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-sm">
                      <span className="font-medium">{grape}</span>
                      <GlassWater className="w-4 h-4 text-wine-500" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Explore Grapes */}
            {relatedGrapes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-border/40 bg-wine-500/5">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">
                      {language === 'pt' ? 'Explorar Castas' : 'Explore Grapes'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {relatedGrapes.slice(0, 5).map((grape) => (
                      <Link 
                        key={grape.grape_id}
                        to={`/grapes/${grape.grape_id}`}
                        className="flex items-center justify-between p-2 hover:bg-wine-500/10 rounded-sm transition-colors"
                      >
                        <span>{grape.name}</span>
                        <Badge 
                          variant="outline" 
                          className={grape.grape_type === 'red' ? 'border-wine-500/50' : 'border-gold-500/50'}
                        >
                          {grape.grape_type === 'red' ? '🍷' : '🥂'}
                        </Badge>
                      </Link>
                    ))}
                    {relatedGrapes.length > 5 && (
                      <Link to="/grapes">
                        <Button variant="ghost" className="w-full mt-2">
                          {language === 'pt' ? 'Ver mais castas' : 'See more grapes'} →
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Facts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-wine-500" />
                    {language === 'pt' ? 'Dados Rápidos' : 'Quick Facts'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {country && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {language === 'pt' ? 'País' : 'Country'}
                      </span>
                      <Link 
                        to={`/atlas/${country.country_id}`}
                        className="font-medium hover:text-wine-500 transition-colors"
                      >
                        {language === 'pt' ? country.name_pt : country.name_en}
                      </Link>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {language === 'pt' ? 'Castas' : 'Grapes'}
                    </span>
                    <span className="font-medium">{grapesList.length}</span>
                  </div>
                  {region.terroir?.maritime_influence !== undefined && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          {language === 'pt' ? 'Costa' : 'Coastal'}
                        </span>
                        <span className="font-medium">
                          {region.terroir.maritime_influence 
                            ? (language === 'pt' ? 'Sim' : 'Yes')
                            : (language === 'pt' ? 'Não' : 'No')}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionDetailPage;

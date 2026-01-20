import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Thermometer, Mountain, Droplets, 
  GlassWater, Wine, Grape, Award, ChevronRight
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
  const { language } = useLanguage();
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
          
          // Fetch related grapes
          const grapesRes = await fetch(`${API}/grapes`);
          if (grapesRes.ok) {
            const allGrapes = await grapesRes.json();
            const related = allGrapes.filter(g => 
              regionData.main_grapes?.some(mg => 
                g.name.toLowerCase().includes(mg.toLowerCase()) ||
                mg.toLowerCase().includes(g.name.toLowerCase())
              )
            );
            setRelatedGrapes(related);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando região...</p>
        </div>
      </div>
    );
  }

  if (!region) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Região não encontrada</p>
          <Link to="/atlas">
            <Button variant="link" className="text-wine-500 mt-2">
              Voltar ao Atlas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
            {country && (
              <>
                <Link to={`/atlas/${country.country_id}`} className="hover:text-foreground">
                  {country.flag_emoji} {language === 'pt' ? country.name_pt : country.name_en}
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <span className="text-foreground">{region.name}</span>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-wine-500 rounded-sm flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold">{region.name}</h1>
              {country && (
                <p className="text-muted-foreground">
                  {country.flag_emoji} {language === 'pt' ? country.name_pt : country.name_en}
                </p>
              )}
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {language === 'pt' ? region.description_pt : region.description_en}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Terroir */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-wine-500" />
                    Terroir
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {region.terroir?.soil && (
                      <InfoItem
                        icon={Grape}
                        label="Tipo de Solo"
                        value={region.terroir.soil}
                      />
                    )}
                    {region.terroir?.altitude && (
                      <InfoItem
                        icon={Mountain}
                        label="Altitude"
                        value={region.terroir.altitude}
                      />
                    )}
                    {region.terroir?.maritime_influence !== undefined && (
                      <InfoItem
                        icon={Droplets}
                        label="Influência Marítima"
                        value={region.terroir.maritime_influence ? "Sim" : "Não"}
                      />
                    )}
                  </div>
                  {region.terroir && (
                    <p className="mt-6 text-muted-foreground font-accent italic">
                      O terroir único desta região confere aos vinhos características distintas 
                      que refletem o solo, a altitude e as influências climáticas locais.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Climate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-wine-500" />
                    {language === 'pt' ? 'Clima' : 'Climate'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Handle climate as string or object */}
                  {typeof region.climate === 'string' ? (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-wine-500/10 rounded-sm flex items-center justify-center">
                        <Thermometer className="w-6 h-6 text-wine-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {language === 'pt' ? 'Tipo de Clima' : 'Climate Type'}
                        </p>
                        <p className="text-lg font-medium">{region.climate}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-6">
                      {region.climate?.type && (
                        <InfoItem
                          icon={Thermometer}
                          label={language === 'pt' ? 'Tipo de Clima' : 'Climate Type'}
                          value={region.climate.type}
                        />
                      )}
                      {region.climate?.temperature && (
                        <InfoItem
                          icon={Thermometer}
                          label={language === 'pt' ? 'Temperatura' : 'Temperature'}
                          value={region.climate.temperature}
                        />
                      )}
                      {region.climate?.rainfall && (
                        <InfoItem
                          icon={Droplets}
                          label={language === 'pt' ? 'Precipitação' : 'Rainfall'}
                          value={region.climate.rainfall}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

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
                    Estilos de Vinho
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {region.wine_styles?.map((style, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-sm px-3 py-1"
                      >
                        {style}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Appellations */}
            {region.appellations?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2">
                      <Award className="w-5 h-5 text-wine-500" />
                      Denominações (AOC/DOC)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {region.appellations.map((appellation, index) => (
                        <div 
                          key={index}
                          className="p-3 bg-muted/30 rounded-sm flex items-center gap-2"
                        >
                          <Award className="w-4 h-4 text-gold-500" />
                          <span>{appellation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
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
                  <CardTitle className="font-serif text-lg">Castas Principais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {region.main_grapes?.map((grape, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-sm">
                      <span>{grape}</span>
                      <GlassWater className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Related Grapes from Database */}
            {relatedGrapes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">Explorar Castas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {relatedGrapes.slice(0, 5).map((grape) => (
                      <Link 
                        key={grape.grape_id} 
                        to={`/grapes/${grape.grape_id}`}
                        className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-sm transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={grape.grape_type === 'red' ? 'border-wine-500 text-wine-500' : 'border-gold-500 text-gold-600'}
                          >
                            {grape.grape_type === 'red' ? '🍷' : '🥂'}
                          </Badge>
                          <span>{grape.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    ))}
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
              <Card className="border-border/40 bg-wine-500/5">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Dica do Sommelier</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-accent italic">
                    "Os vinhos de {region.name} são conhecidos por sua expressão única de terroir. 
                    Experimente provar diferentes produtores para entender a diversidade da região."
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

export default RegionDetailPage;

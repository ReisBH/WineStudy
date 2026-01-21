import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, GlassWater, MapPin, Thermometer, Clock, 
  Droplets, Wine, Tag, ChevronRight, Leaf, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { useLanguage } from '../contexts/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const StructureBar = ({ label, value, maxLabel, minLabel }) => {
  const levelMap = {
    'Baixo': 20, 'Baixa': 20, 'Low': 20, 'Leve': 20, 'Light': 20,
    'Médio-baixo': 35, 'Medium-': 35,
    'Médio': 50, 'Média': 50, 'Medium': 50, 'Moderado': 50,
    'Médio-alto': 65, 'Medium+': 65, 'Média-alta': 65,
    'Alto': 80, 'Alta': 80, 'High': 80, 'Encorpado': 80, 'Full': 80,
    'Muito alto': 95, 'Very high': 95,
  };
  
  const percentage = levelMap[value] || 50;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="relative">
        <Progress value={percentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{minLabel || 'Baixo'}</span>
          <span>{maxLabel || 'Alto'}</span>
        </div>
      </div>
    </div>
  );
};

const GrapeDetailPage = () => {
  const { grapeId } = useParams();
  const { language } = useLanguage();
  const [grape, setGrape] = useState(null);
  const [relatedGrapes, setRelatedGrapes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch grape
        const grapeRes = await fetch(`${API}/grapes/${grapeId}`);
        if (grapeRes.ok) {
          const grapeData = await grapeRes.json();
          setGrape(grapeData);
          
          // Fetch related grapes (same type)
          const grapesRes = await fetch(`${API}/grapes?grape_type=${grapeData.grape_type}`);
          if (grapesRes.ok) {
            const allGrapes = await grapesRes.json();
            setRelatedGrapes(allGrapes.filter(g => g.grape_id !== grapeId).slice(0, 4));
          }
          
          // Fetch regions
          const regionsRes = await fetch(`${API}/regions`);
          if (regionsRes.ok) {
            const allRegions = await regionsRes.json();
            const related = allRegions.filter(r => 
              grapeData.best_regions?.some(br => 
                r.name.toLowerCase().includes(br.toLowerCase()) ||
                br.toLowerCase().includes(r.name.toLowerCase())
              )
            );
            setRegions(related);
          }
        }
      } catch (error) {
        console.error('Error fetching grape:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [grapeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GlassWater className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando casta...</p>
        </div>
      </div>
    );
  }

  if (!grape) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GlassWater className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Casta não encontrada</p>
          <Link to="/grapes">
            <Button variant="link" className="text-wine-500 mt-2">
              Voltar às Castas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isRed = grape.grape_type === 'red';

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/grapes" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar às Castas
          </Link>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/grapes" className="hover:text-foreground">Castas</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{grape.name}</span>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-start gap-6 mb-6">
            <div className={`w-20 h-20 rounded-sm flex items-center justify-center ${
              isRed ? 'bg-wine-500' : 'bg-gold-500'
            }`}>
              <GlassWater className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-serif text-3xl sm:text-4xl font-bold">{grape.name}</h1>
                <Badge 
                  className={isRed ? 'bg-wine-500' : 'bg-gold-500'}
                >
                  {isRed ? '🍷 Tinta' : '🥂 Branca'}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Origem: {grape.origin_country === 'france' ? '🇫🇷 França' : 
                        grape.origin_country === 'italy' ? '🇮🇹 Itália' :
                        grape.origin_country === 'spain' ? '🇪🇸 Espanha' :
                        grape.origin_country === 'portugal' ? '🇵🇹 Portugal' :
                        grape.origin_country === 'germany' ? '🇩🇪 Alemanha' :
                        grape.origin_country}
              </p>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-3xl">
            {language === 'pt' ? grape.description_pt : grape.description_en}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Aromatic Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-wine-500" />
                    Perfil Aromático
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Aromatic Notes */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {language === 'pt' ? 'Aromas Primários (Nariz)' : 'Primary Aromas (Nose)'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {grape.aromatic_notes?.map((note, index) => (
                        <Link 
                          key={index}
                          to={`/aromas/${note.toLowerCase().replace(/ /g, '_')}`}
                        >
                          <Badge 
                            variant="outline"
                            className="px-3 py-1.5 text-sm cursor-pointer hover:bg-wine-500/20 hover:border-wine-500 transition-colors"
                          >
                            {note}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Flavor Notes */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Wine className="w-4 h-4" />
                      {language === 'pt' ? 'Sabores (Paladar)' : 'Flavors (Palate)'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {grape.flavor_notes?.map((note, index) => (
                        <Link 
                          key={index}
                          to={`/aromas/${note.toLowerCase().replace(/ /g, '_')}`}
                        >
                          <Badge 
                            variant="outline"
                            className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-wine-500/20 hover:border-wine-500 transition-colors ${isRed ? 'border-wine-500/30' : 'border-gold-500/30'}`}
                          >
                            {note}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Structure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Wine className="w-5 h-5 text-wine-500" />
                    Estrutura Típica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {grape.structure?.acidity && (
                    <StructureBar 
                      label="Acidez" 
                      value={grape.structure.acidity}
                      minLabel="Baixa"
                      maxLabel="Alta"
                    />
                  )}
                  {grape.structure?.tannin && grape.structure.tannin !== 'N/A' && (
                    <StructureBar 
                      label="Tanino" 
                      value={grape.structure.tannin}
                      minLabel="Baixo"
                      maxLabel="Alto"
                    />
                  )}
                  {grape.structure?.body && (
                    <StructureBar 
                      label="Corpo" 
                      value={grape.structure.body}
                      minLabel="Leve"
                      maxLabel="Encorpado"
                    />
                  )}
                  {grape.structure?.alcohol && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-sm">
                      <span className="text-muted-foreground">Teor Alcoólico</span>
                      <span className="font-medium">{grape.structure.alcohol}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Best Regions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-wine-500" />
                    Melhores Regiões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {grape.best_regions?.map((region, index) => {
                      const linkedRegion = regions.find(r => 
                        r.name.toLowerCase().includes(region.toLowerCase()) ||
                        region.toLowerCase().includes(r.name.toLowerCase())
                      );
                      
                      return linkedRegion ? (
                        <Link 
                          key={index}
                          to={`/atlas/region/${linkedRegion.region_id}`}
                          className="p-4 bg-muted/30 rounded-sm hover:bg-muted/50 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-wine-500" />
                            <span>{region}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </Link>
                      ) : (
                        <div 
                          key={index}
                          className="p-4 bg-muted/30 rounded-sm flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4 text-wine-500" />
                          <span>{region}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Informações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Clima Ideal</span>
                    <Badge variant="outline">{grape.climate_preference}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Potencial de Guarda</span>
                    <span className="font-medium text-sm">{grape.aging_potential}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Related Grapes */}
            {relatedGrapes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">
                      Outras {isRed ? 'Tintas' : 'Brancas'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {relatedGrapes.map((g) => (
                      <Link 
                        key={g.grape_id} 
                        to={`/grapes/${g.grape_id}`}
                        className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-sm transition-colors"
                      >
                        <span>{g.name}</span>
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
              <Card className={`border-border/40 ${isRed ? 'bg-wine-500/5' : 'bg-gold-500/5'}`}>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Dica do Sommelier</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-accent italic">
                    "{grape.name} é uma uva que expressa muito bem o terroir onde é cultivada. 
                    Compare vinhos de diferentes regiões para perceber como o clima e o solo 
                    influenciam o resultado final na taça."
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

export default GrapeDetailPage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Leaf, GlassWater, Tag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useLanguage } from '../contexts/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

// Aroma translations
const aromaTranslations = {
  'Cherry': 'Cereja', 'Raspberry': 'Framboesa', 'Strawberry': 'Morango', 'Blackberry': 'Amora',
  'Plum': 'Ameixa', 'Apple': 'Maçã', 'Pear': 'Pera', 'Peach': 'Pêssego', 'Apricot': 'Damasco',
  'Citrus': 'Cítrico', 'Lime': 'Lima', 'Lemon': 'Limão', 'Grapefruit': 'Grapefruit',
  'Tropical fruits': 'Frutas tropicais', 'Passion fruit': 'Maracujá', 'Gooseberry': 'Groselha',
  'Cassis': 'Cassis', 'Black currant': 'Groselha preta', 'Red berries': 'Frutas vermelhas',
  'Dark fruits': 'Frutas escuras', 'Fig': 'Figo', 'Rose': 'Rosa', 'Violet': 'Violeta',
  'White flowers': 'Flores brancas', 'Orange blossom': 'Flor de laranjeira',
  'Grass': 'Capim', 'Herbs': 'Ervas', 'Green pepper': 'Pimentão verde', 'Mint': 'Menta',
  'Tomato leaf': 'Folha de tomate', 'Dried herbs': 'Ervas secas',
  'Black pepper': 'Pimenta preta', 'White pepper': 'Pimenta branca', 'Spice': 'Especiarias',
  'Licorice': 'Alcaçuz', 'Ginger': 'Gengibre',
  'Oak': 'Carvalho', 'Vanilla': 'Baunilha', 'Cedar': 'Cedro', 'Toast': 'Tostado',
  'Earth': 'Terra', 'Leather': 'Couro', 'Truffle': 'Trufa', 'Mushroom': 'Cogumelo',
  'Forest floor': 'Chão de floresta', 'Tar': 'Alcatrão', 'Graphite': 'Grafite',
  'Mineral': 'Mineral', 'Saline': 'Salino', 'Slate': 'Ardósia',
  'Almond': 'Amêndoa', 'Hazelnut': 'Avelã', 'Nuts': 'Nozes',
  'Honey': 'Mel', 'Chocolate': 'Chocolate', 'Dark chocolate': 'Chocolate amargo',
  'Cocoa': 'Cacau', 'Mocha': 'Mocha',
  'Butter': 'Manteiga', 'Cream': 'Creme',
  'Coffee': 'Café', 'Tobacco': 'Tabaco', 'Smoke': 'Defumado', 'Bacon': 'Bacon',
  'Petrol': 'Petróleo', 'Game': 'Caça', 'Meat': 'Carne'
};

const categoryEmojis = {
  'fruit': '🍇', 'floral': '🌸', 'vegetal': '🌿', 'spice': '🌶️',
  'oak': '🪵', 'earth': '🌍', 'mineral': '🪨', 'nuts': '🥜',
  'sweet': '🍫', 'dairy': '🧈', 'roasted': '☕', 'other': '🍷'
};

const GrapeCard = ({ grape, language }) => (
  <Link to={`/grapes/${grape.grape_id}`}>
    <Card className="wine-card border-border/40 hover:shadow-lg transition-all cursor-pointer h-full">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-serif text-lg font-semibold">{grape.name}</h3>
          <Badge variant={grape.grape_type === 'red' ? 'default' : 'secondary'}
            className={grape.grape_type === 'red' ? 'bg-wine-500' : 'bg-gold-500 text-white'}>
            {grape.grape_type === 'red' ? '🍷 Tinta' : '🥂 Branca'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {language === 'pt' ? grape.description_pt : grape.description_en}
        </p>
        <div className="flex flex-wrap gap-1">
          {grape.aromatic_notes?.slice(0, 4).map((note, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {language === 'pt' ? (aromaTranslations[note] || note) : note}
            </Badge>
          ))}
          {grape.aromatic_notes?.length > 4 && (
            <Badge variant="outline" className="text-xs">+{grape.aromatic_notes.length - 4}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  </Link>
);

const AromaDetailPage = () => {
  const { aromaId } = useParams();
  const { language } = useLanguage();
  const [aroma, setAroma] = useState(null);
  const [grapes, setGrapes] = useState([]);
  const [allAromas, setAllAromas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch aroma details
        const aromasRes = await fetch(`${API}/aromas`);
        if (aromasRes.ok) {
          const aromas = await aromasRes.json();
          setAllAromas(aromas);
          const found = aromas.find(a => a.tag_id === aromaId);
          setAroma(found);
        }

        // Fetch grapes with this aroma
        const grapesRes = await fetch(`${API}/aromas/${aromaId}/grapes`);
        if (grapesRes.ok) {
          const data = await grapesRes.json();
          setGrapes(data);
        }
      } catch (error) {
        console.error('Error fetching aroma data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [aromaId]);

  // Get related aromas (same category)
  const relatedAromas = allAromas.filter(a => 
    a.category === aroma?.category && a.tag_id !== aromaId
  ).slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Leaf className="w-16 h-16 text-muted-foreground/30 animate-pulse" />
      </div>
    );
  }

  const aromaName = aroma 
    ? (language === 'pt' ? aroma.name_pt : aroma.name_en)
    : aromaId.replace(/_/g, ' ');

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link to="/grapes" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'pt' ? 'Voltar às Castas' : 'Back to Grapes'}
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-wine-500/10 rounded-full flex items-center justify-center text-3xl">
              {aroma?.emoji || categoryEmojis[aroma?.category] || '🍷'}
            </div>
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold" data-testid="aroma-name">
                {aromaName}
              </h1>
              {aroma?.category && (
                <Badge variant="secondary" className="mt-1">
                  {language === 'pt' ? ({
                    fruit: 'Frutas', floral: 'Florais', vegetal: 'Vegetais',
                    spice: 'Especiarias', oak: 'Carvalho', earth: 'Terrosos',
                    mineral: 'Minerais', nuts: 'Nozes', sweet: 'Doces',
                    dairy: 'Lácteos', roasted: 'Tostados', other: 'Outros'
                  }[aroma.category] || aroma.category) : aroma.category}
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-muted-foreground text-lg">
            {language === 'pt' 
              ? `${grapes.length} casta${grapes.length !== 1 ? 's' : ''} com notas de ${aromaName.toLowerCase()}`
              : `${grapes.length} grape${grapes.length !== 1 ? 's' : ''} with ${aromaName.toLowerCase()} notes`}
          </p>
        </motion.div>

        {/* Grapes Grid */}
        {grapes.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
          >
            {grapes.map((grape, index) => (
              <motion.div
                key={grape.grape_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GrapeCard grape={grape} language={language} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <GlassWater className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {language === 'pt' ? 'Nenhuma casta encontrada com este aroma' : 'No grapes found with this aroma'}
            </p>
          </div>
        )}

        {/* Related Aromas */}
        {relatedAromas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/40">
              <CardContent className="p-6">
                <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-wine-500" />
                  {language === 'pt' ? 'Aromas Relacionados' : 'Related Aromas'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {relatedAromas.map((relAroma) => (
                    <Link key={relAroma.tag_id} to={`/aromas/${relAroma.tag_id}`}>
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-wine-500/10 transition-colors py-2 px-3"
                      >
                        {relAroma.emoji} {language === 'pt' ? relAroma.name_pt : relAroma.name_en}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All Aromas Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="border-border/40 bg-muted/20">
            <CardContent className="p-6">
              <h3 className="font-serif text-lg font-semibold mb-4">
                {language === 'pt' ? 'Explorar Outros Aromas' : 'Explore Other Aromas'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {allAromas.slice(0, 20).map((a) => (
                  <Link key={a.tag_id} to={`/aromas/${a.tag_id}`}>
                    <Badge 
                      variant={a.tag_id === aromaId ? 'default' : 'outline'}
                      className={`cursor-pointer transition-colors py-1.5 px-2.5 ${
                        a.tag_id === aromaId ? 'bg-wine-500' : 'hover:bg-wine-500/10'
                      }`}
                    >
                      {a.emoji} {language === 'pt' ? a.name_pt : a.name_en}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AromaDetailPage;

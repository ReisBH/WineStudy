import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlassWater, Search, Filter, Tag, MapPin, Leaf } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useLanguage } from '../contexts/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const GrapeCard = ({ grape, language, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Link to={`/grapes/${grape.grape_id}`}>
      <Card className="wine-card border-border/40 overflow-hidden group cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge 
                variant="outline" 
                className={`mb-2 ${
                  grape.grape_type === 'red' 
                    ? 'border-wine-500 text-wine-500' 
                    : 'border-gold-500 text-gold-600'
                }`}
              >
                {grape.grape_type === 'red' ? '🍷 Tinta' : '🥂 Branca'}
              </Badge>
              <h3 className="font-serif text-xl font-bold">{grape.name}</h3>
            </div>
            <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${
              grape.grape_type === 'red' ? 'bg-wine-500/10' : 'bg-gold-500/10'
            }`}>
              <GlassWater className={`w-5 h-5 ${
                grape.grape_type === 'red' ? 'text-wine-500' : 'text-gold-500'
              }`} />
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {language === 'pt' ? grape.description_pt : grape.description_en}
          </p>

          {/* Aromatic Notes */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Notas Aromáticas
            </p>
            <div className="flex flex-wrap gap-1">
              {grape.aromatic_notes?.slice(0, 4).map((note) => (
                <span 
                  key={note}
                  className="px-2 py-0.5 bg-muted text-xs rounded-sm"
                >
                  {note}
                </span>
              ))}
              {grape.aromatic_notes?.length > 4 && (
                <span className="px-2 py-0.5 text-xs text-muted-foreground">
                  +{grape.aromatic_notes.length - 4}
                </span>
              )}
            </div>
          </div>

          {/* Best Regions */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Melhores Regiões
            </p>
            <div className="flex flex-wrap gap-1">
              {grape.best_regions?.slice(0, 3).map((region) => (
                <span 
                  key={region}
                  className="px-2 py-0.5 bg-wine-500/10 text-wine-600 dark:text-wine-400 text-xs rounded-sm"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
);

const AromaTag = ({ aroma, selected, onClick }) => (
  <button
    onClick={() => onClick(aroma.tag_id)}
    className={`px-3 py-1.5 rounded-sm text-sm flex items-center gap-1.5 transition-all ${
      selected 
        ? 'bg-wine-500 text-white' 
        : 'bg-muted hover:bg-muted/80 text-foreground'
    }`}
  >
    <span>{aroma.emoji}</span>
    {aroma.name_pt}
  </button>
);

const GrapesPage = () => {
  const { t, language } = useLanguage();
  const [grapes, setGrapes] = useState([]);
  const [aromas, setAromas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAromas, setSelectedAromas] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [grapesRes, aromasRes] = await Promise.all([
          fetch(`${API}/grapes`),
          fetch(`${API}/aromas`),
        ]);

        if (grapesRes.ok) {
          const data = await grapesRes.json();
          setGrapes(data);
        }

        if (aromasRes.ok) {
          const data = await aromasRes.json();
          setAromas(data);
        }
      } catch (error) {
        console.error('Error fetching grapes data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleAroma = (aromaId) => {
    setSelectedAromas(prev => 
      prev.includes(aromaId)
        ? prev.filter(id => id !== aromaId)
        : [...prev, aromaId]
    );
  };

  const filteredGrapes = grapes.filter(grape => {
    const matchesSearch = grape.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || grape.grape_type === selectedType;
    const matchesAromas = selectedAromas.length === 0 || 
      selectedAromas.some(aromaId => {
        const aroma = aromas.find(a => a.tag_id === aromaId);
        return aroma && (
          grape.aromatic_notes?.includes(aroma.name_en) ||
          grape.flavor_notes?.includes(aroma.name_en)
        );
      });
    return matchesSearch && matchesType && matchesAromas;
  });

  // Group aromas by category
  const aromaCategories = aromas.reduce((acc, aroma) => {
    if (!acc[aroma.category]) {
      acc[aroma.category] = [];
    }
    acc[aroma.category].push(aroma);
    return acc;
  }, {});

  const categoryNames = {
    fruit: 'Frutas',
    floral: 'Florais',
    vegetal: 'Vegetais',
    spice: 'Especiarias',
    oak: 'Carvalho',
    dairy: 'Lácteos',
    sweet: 'Doces',
    roasted: 'Tostados',
    earth: 'Terrosos',
    mineral: 'Minerais',
    nuts: 'Nozes',
  };

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
            {t('grapes.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('grapes.subtitle')}
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                data-testid="grapes-search-input"
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-5 rounded-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                data-testid="filter-all-grapes"
                variant={selectedType === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedType('all')}
                className={`rounded-sm ${selectedType === 'all' ? 'bg-wine-500 hover:bg-wine-600' : ''}`}
              >
                {t('grapes.all')}
              </Button>
              <Button
                data-testid="filter-red-grapes"
                variant={selectedType === 'red' ? 'default' : 'outline'}
                onClick={() => setSelectedType('red')}
                className={`rounded-sm ${selectedType === 'red' ? 'bg-wine-500 hover:bg-wine-600' : ''}`}
              >
                🍷 {t('grapes.red')}
              </Button>
              <Button
                data-testid="filter-white-grapes"
                variant={selectedType === 'white' ? 'default' : 'outline'}
                onClick={() => setSelectedType('white')}
                className={`rounded-sm ${selectedType === 'white' ? 'bg-gold-500 hover:bg-gold-600 text-white' : ''}`}
              >
                🥂 {t('grapes.white')}
              </Button>
              <Button
                data-testid="toggle-aroma-filters"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Aromas
              </Button>
            </div>
          </div>

          {/* Aroma Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/30 rounded-sm p-6 mb-4"
            >
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                {t('grapes.filterByAroma')}
              </h3>
              <div className="space-y-4">
                {Object.entries(aromaCategories).map(([category, categoryAromas]) => (
                  <div key={category}>
                    <p className="text-sm text-muted-foreground mb-2">
                      {categoryNames[category] || category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {categoryAromas.map((aroma) => (
                        <AromaTag
                          key={aroma.tag_id}
                          aroma={aroma}
                          selected={selectedAromas.includes(aroma.tag_id)}
                          onClick={toggleAroma}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {selectedAromas.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAromas([])}
                  className="mt-4 text-wine-500"
                >
                  Limpar filtros
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-muted-foreground">
          {filteredGrapes.length} {filteredGrapes.length === 1 ? 'casta encontrada' : 'castas encontradas'}
        </div>

        {/* Grapes Grid */}
        {loading ? (
          <div className="text-center py-20">
            <GlassWater className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : filteredGrapes.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGrapes.map((grape, index) => (
              <GrapeCard 
                key={grape.grape_id} 
                grape={grape} 
                language={language}
                delay={index * 0.05}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <GlassWater className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma casta encontrada</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedAromas([]);
              }}
              className="text-wine-500 mt-2"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrapesPage;

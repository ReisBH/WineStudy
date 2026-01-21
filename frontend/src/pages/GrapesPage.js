import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlassWater, Search, Filter, Tag, MapPin, Leaf, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useLanguage } from '../contexts/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

// Complete aroma translations mapping
const aromaTranslations = {
  // Fruits
  'Cassis': { pt: 'Cassis', en: 'Blackcurrant' },
  'Blackcurrant': { pt: 'Cassis', en: 'Blackcurrant' },
  'Black currant': { pt: 'Cassis', en: 'Black currant' },
  'Cedar': { pt: 'Cedro', en: 'Cedar' },
  'Tobacco': { pt: 'Tabaco', en: 'Tobacco' },
  'Green pepper': { pt: 'Pimentão verde', en: 'Green pepper' },
  'Mint': { pt: 'Menta', en: 'Mint' },
  'Dark chocolate': { pt: 'Chocolate amargo', en: 'Dark chocolate' },
  'Plum': { pt: 'Ameixa', en: 'Plum' },
  'Cherry': { pt: 'Cereja', en: 'Cherry' },
  'Chocolate': { pt: 'Chocolate', en: 'Chocolate' },
  'Herbs': { pt: 'Ervas', en: 'Herbs' },
  'Red fruits': { pt: 'Frutas vermelhas', en: 'Red fruits' },
  'Vanilla': { pt: 'Baunilha', en: 'Vanilla' },
  'Spice': { pt: 'Especiarias', en: 'Spice' },
  'Raspberry': { pt: 'Framboesa', en: 'Raspberry' },
  'Rose': { pt: 'Rosa', en: 'Rose' },
  'Earth': { pt: 'Terra', en: 'Earth' },
  'Red berries': { pt: 'Frutas vermelhas', en: 'Red berries' },
  'Mushroom': { pt: 'Cogumelo', en: 'Mushroom' },
  'Forest floor': { pt: 'Chão de floresta', en: 'Forest floor' },
  'Tomato leaf': { pt: 'Folha de tomate', en: 'Tomato leaf' },
  'Leather': { pt: 'Couro', en: 'Leather' },
  'Sour cherry': { pt: 'Cereja ácida', en: 'Sour cherry' },
  'Tea': { pt: 'Chá', en: 'Tea' },
  'Dried herbs': { pt: 'Ervas secas', en: 'Dried herbs' },
  'Fig': { pt: 'Figo', en: 'Fig' },
  'Blackberry': { pt: 'Amora', en: 'Blackberry' },
  'Violet': { pt: 'Violeta', en: 'Violet' },
  'Cocoa': { pt: 'Cacau', en: 'Cocoa' },
  'Dark fruits': { pt: 'Frutas escuras', en: 'Dark fruits' },
  'Tar': { pt: 'Alcatrão', en: 'Tar' },
  'Truffle': { pt: 'Trufa', en: 'Truffle' },
  'Red cherry': { pt: 'Cereja vermelha', en: 'Red cherry' },
  'Licorice': { pt: 'Alcaçuz', en: 'Licorice' },
  'Black pepper': { pt: 'Pimenta preta', en: 'Black pepper' },
  'Smoke': { pt: 'Defumado', en: 'Smoke' },
  'Bacon': { pt: 'Bacon', en: 'Bacon' },
  'Olive': { pt: 'Azeitona', en: 'Olive' },
  'Apple': { pt: 'Maçã', en: 'Apple' },
  'Citrus': { pt: 'Cítrico', en: 'Citrus' },
  'Butter': { pt: 'Manteiga', en: 'Butter' },
  'Oak': { pt: 'Carvalho', en: 'Oak' },
  'Tropical fruits': { pt: 'Frutas tropicais', en: 'Tropical fruits' },
  'Toast': { pt: 'Tostado', en: 'Toast' },
  'Grapefruit': { pt: 'Grapefruit', en: 'Grapefruit' },
  'Grass': { pt: 'Capim', en: 'Grass' },
  'Gooseberry': { pt: 'Groselha', en: 'Gooseberry' },
  'Passion fruit': { pt: 'Maracujá', en: 'Passion fruit' },
  'Green apple': { pt: 'Maçã verde', en: 'Green apple' },
  'Mineral': { pt: 'Mineral', en: 'Mineral' },
  'Lime': { pt: 'Lima', en: 'Lime' },
  'Peach': { pt: 'Pêssego', en: 'Peach' },
  'Petrol': { pt: 'Petróleo', en: 'Petrol' },
  'Honey': { pt: 'Mel', en: 'Honey' },
  'Apricot': { pt: 'Damasco', en: 'Apricot' },
  'Slate': { pt: 'Ardósia', en: 'Slate' },
  'Rock rose': { pt: 'Esteva', en: 'Rock rose' },
};

// All available aromas for filtering (comprehensive list)
const allAromas = [
  // Fruits - Red
  { id: 'cherry', name_pt: 'Cereja', name_en: 'Cherry', category: 'fruit', emoji: '🍒' },
  { id: 'raspberry', name_pt: 'Framboesa', name_en: 'Raspberry', category: 'fruit', emoji: '🫐' },
  { id: 'strawberry', name_pt: 'Morango', name_en: 'Strawberry', category: 'fruit', emoji: '🍓' },
  { id: 'red_berries', name_pt: 'Frutas vermelhas', name_en: 'Red berries', category: 'fruit', emoji: '🍒' },
  // Fruits - Dark
  { id: 'blackberry', name_pt: 'Amora', name_en: 'Blackberry', category: 'fruit', emoji: '🫐' },
  { id: 'cassis', name_pt: 'Cassis', name_en: 'Cassis', category: 'fruit', emoji: '🍇' },
  { id: 'plum', name_pt: 'Ameixa', name_en: 'Plum', category: 'fruit', emoji: '🫐' },
  { id: 'dark_fruits', name_pt: 'Frutas escuras', name_en: 'Dark fruits', category: 'fruit', emoji: '🍇' },
  // Fruits - Stone/Tropical
  { id: 'peach', name_pt: 'Pêssego', name_en: 'Peach', category: 'fruit', emoji: '🍑' },
  { id: 'apricot', name_pt: 'Damasco', name_en: 'Apricot', category: 'fruit', emoji: '🍑' },
  { id: 'tropical', name_pt: 'Frutas tropicais', name_en: 'Tropical fruits', category: 'fruit', emoji: '🥭' },
  { id: 'passion_fruit', name_pt: 'Maracujá', name_en: 'Passion fruit', category: 'fruit', emoji: '🥭' },
  // Fruits - Citrus
  { id: 'citrus', name_pt: 'Cítrico', name_en: 'Citrus', category: 'fruit', emoji: '🍋' },
  { id: 'lime', name_pt: 'Lima', name_en: 'Lime', category: 'fruit', emoji: '🍋' },
  { id: 'grapefruit', name_pt: 'Grapefruit', name_en: 'Grapefruit', category: 'fruit', emoji: '🍊' },
  // Fruits - Apple/Pear
  { id: 'apple', name_pt: 'Maçã', name_en: 'Apple', category: 'fruit', emoji: '🍏' },
  { id: 'green_apple', name_pt: 'Maçã verde', name_en: 'Green apple', category: 'fruit', emoji: '🍏' },
  // Floral
  { id: 'rose', name_pt: 'Rosa', name_en: 'Rose', category: 'floral', emoji: '🌹' },
  { id: 'violet', name_pt: 'Violeta', name_en: 'Violet', category: 'floral', emoji: '💜' },
  { id: 'floral', name_pt: 'Floral', name_en: 'Floral', category: 'floral', emoji: '🌸' },
  // Herbal/Vegetal
  { id: 'herbs', name_pt: 'Ervas', name_en: 'Herbs', category: 'vegetal', emoji: '🌿' },
  { id: 'dried_herbs', name_pt: 'Ervas secas', name_en: 'Dried herbs', category: 'vegetal', emoji: '🌿' },
  { id: 'grass', name_pt: 'Capim', name_en: 'Grass', category: 'vegetal', emoji: '🌱' },
  { id: 'green_pepper', name_pt: 'Pimentão verde', name_en: 'Green pepper', category: 'vegetal', emoji: '🫑' },
  { id: 'mint', name_pt: 'Menta', name_en: 'Mint', category: 'vegetal', emoji: '🌿' },
  { id: 'tomato_leaf', name_pt: 'Folha de tomate', name_en: 'Tomato leaf', category: 'vegetal', emoji: '🍅' },
  // Spice
  { id: 'black_pepper', name_pt: 'Pimenta preta', name_en: 'Black pepper', category: 'spice', emoji: '🌶️' },
  { id: 'spice', name_pt: 'Especiarias', name_en: 'Spice', category: 'spice', emoji: '🌶️' },
  { id: 'licorice', name_pt: 'Alcaçuz', name_en: 'Licorice', category: 'spice', emoji: '🌿' },
  // Oak/Wood
  { id: 'vanilla', name_pt: 'Baunilha', name_en: 'Vanilla', category: 'oak', emoji: '🍦' },
  { id: 'oak', name_pt: 'Carvalho', name_en: 'Oak', category: 'oak', emoji: '🪵' },
  { id: 'cedar', name_pt: 'Cedro', name_en: 'Cedar', category: 'oak', emoji: '🪵' },
  { id: 'toast', name_pt: 'Tostado', name_en: 'Toast', category: 'oak', emoji: '🍞' },
  // Dairy
  { id: 'butter', name_pt: 'Manteiga', name_en: 'Butter', category: 'dairy', emoji: '🧈' },
  // Sweet/Confection
  { id: 'chocolate', name_pt: 'Chocolate', name_en: 'Chocolate', category: 'sweet', emoji: '🍫' },
  { id: 'cocoa', name_pt: 'Cacau', name_en: 'Cocoa', category: 'sweet', emoji: '🍫' },
  { id: 'honey', name_pt: 'Mel', name_en: 'Honey', category: 'sweet', emoji: '🍯' },
  // Earth/Mineral
  { id: 'earth', name_pt: 'Terra', name_en: 'Earth', category: 'earth', emoji: '🌍' },
  { id: 'mushroom', name_pt: 'Cogumelo', name_en: 'Mushroom', category: 'earth', emoji: '🍄' },
  { id: 'leather', name_pt: 'Couro', name_en: 'Leather', category: 'earth', emoji: '👞' },
  { id: 'truffle', name_pt: 'Trufa', name_en: 'Truffle', category: 'earth', emoji: '🍄' },
  { id: 'mineral', name_pt: 'Mineral', name_en: 'Mineral', category: 'mineral', emoji: '🪨' },
  // Roasted/Smoke
  { id: 'smoke', name_pt: 'Defumado', name_en: 'Smoke', category: 'roasted', emoji: '💨' },
  { id: 'tobacco', name_pt: 'Tabaco', name_en: 'Tobacco', category: 'roasted', emoji: '🍂' },
  { id: 'tar', name_pt: 'Alcatrão', name_en: 'Tar', category: 'roasted', emoji: '⚫' },
  { id: 'coffee', name_pt: 'Café', name_en: 'Coffee', category: 'roasted', emoji: '☕' },
  // Other
  { id: 'petrol', name_pt: 'Petróleo', name_en: 'Petrol', category: 'other', emoji: '⛽' },
  { id: 'olive', name_pt: 'Azeitona', name_en: 'Olive', category: 'other', emoji: '🫒' },
];

const categoryNames = {
  fruit: { pt: 'Frutas', en: 'Fruits' },
  floral: { pt: 'Florais', en: 'Floral' },
  vegetal: { pt: 'Vegetais/Herbáceos', en: 'Vegetal/Herbal' },
  spice: { pt: 'Especiarias', en: 'Spices' },
  oak: { pt: 'Carvalho/Madeira', en: 'Oak/Wood' },
  dairy: { pt: 'Lácteos', en: 'Dairy' },
  sweet: { pt: 'Doces', en: 'Sweet' },
  earth: { pt: 'Terrosos', en: 'Earthy' },
  mineral: { pt: 'Minerais', en: 'Mineral' },
  roasted: { pt: 'Tostados/Defumados', en: 'Roasted/Smoky' },
  other: { pt: 'Outros', en: 'Other' },
};

// Translate aromatic note
const translateNote = (note, language) => {
  const translation = aromaTranslations[note];
  if (translation) {
    return language === 'pt' ? translation.pt : translation.en;
  }
  return note;
};

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
                {grape.grape_type === 'red' 
                  ? (language === 'pt' ? '🍷 Tinta' : '🍷 Red') 
                  : (language === 'pt' ? '🥂 Branca' : '🥂 White')}
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

          {/* Aromatic Notes - Clickable to navigate */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Tag className="w-3 h-3" /> 
              {language === 'pt' ? 'Notas Aromáticas' : 'Aromatic Notes'}
            </p>
            <div className="flex flex-wrap gap-1">
              {grape.aromatic_notes?.slice(0, 4).map((note) => (
                <Link 
                  key={note}
                  to={`/aromas/${note.toLowerCase().replace(/ /g, '_')}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-0.5 bg-muted text-xs rounded-sm hover:bg-wine-500/20 hover:text-wine-600 transition-colors cursor-pointer"
                >
                  {translateNote(note, language)}
                </Link>
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
              <MapPin className="w-3 h-3" /> 
              {language === 'pt' ? 'Melhores Regiões' : 'Best Regions'}
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

const AromaTag = ({ aroma, selected, onClick, language }) => (
  <button
    onClick={() => onClick(aroma.id)}
    className={`px-3 py-1.5 rounded-sm text-sm flex items-center gap-1.5 transition-all ${
      selected 
        ? 'bg-wine-500 text-white' 
        : 'bg-muted hover:bg-muted/80 text-foreground'
    }`}
  >
    <span>{aroma.emoji}</span>
    {language === 'pt' ? aroma.name_pt : aroma.name_en}
  </button>
);

const GrapesPage = () => {
  const { t, language } = useLanguage();
  const [grapes, setGrapes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAromas, setSelectedAromas] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const grapesRes = await fetch(`${API}/grapes`);
        if (grapesRes.ok) {
          const data = await grapesRes.json();
          setGrapes(data);
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

  const clearFilters = () => {
    setSelectedAromas([]);
    setSelectedType('all');
    setSearchQuery('');
  };

  // Filter grapes based on selected aromas
  const filteredGrapes = grapes.filter(grape => {
    const matchesSearch = grape.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || grape.grape_type === selectedType;
    
    // Match aromas - check both English and Portuguese names
    const matchesAromas = selectedAromas.length === 0 || 
      selectedAromas.some(aromaId => {
        const aroma = allAromas.find(a => a.id === aromaId);
        if (!aroma) return false;
        
        // Check against aromatic_notes and flavor_notes
        const allNotes = [...(grape.aromatic_notes || []), ...(grape.flavor_notes || [])];
        return allNotes.some(note => 
          note.toLowerCase().includes(aroma.name_en.toLowerCase()) ||
          aroma.name_en.toLowerCase().includes(note.toLowerCase()) ||
          note.toLowerCase().includes(aroma.name_pt.toLowerCase()) ||
          aroma.name_pt.toLowerCase().includes(note.toLowerCase())
        );
      });
    
    return matchesSearch && matchesType && matchesAromas;
  });

  // Group aromas by category
  const aromaCategories = allAromas.reduce((acc, aroma) => {
    if (!acc[aroma.category]) {
      acc[aroma.category] = [];
    }
    acc[aroma.category].push(aroma);
    return acc;
  }, {});

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
            <div className="flex gap-2 flex-wrap">
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
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className={`rounded-sm ${showFilters ? 'bg-wine-500 hover:bg-wine-600' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {language === 'pt' ? 'Aromas' : 'Aromas'}
                {selectedAromas.length > 0 && (
                  <Badge className="ml-2 bg-white text-wine-500">{selectedAromas.length}</Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Aroma Filters - With translations */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/30 rounded-sm p-6 mb-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  {language === 'pt' ? 'Filtrar por Aromas e Sabores' : 'Filter by Aromas and Flavors'}
                </h3>
                {selectedAromas.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAromas([])}
                    className="text-wine-500 hover:text-wine-600"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {language === 'pt' ? 'Limpar' : 'Clear'}
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {Object.entries(aromaCategories).map(([category, categoryAromas]) => (
                  <div key={category}>
                    <p className="text-sm text-muted-foreground mb-2 font-medium">
                      {categoryNames[category]?.[language] || category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {categoryAromas.map((aroma) => (
                        <AromaTag
                          key={aroma.id}
                          aroma={aroma}
                          selected={selectedAromas.includes(aroma.id)}
                          onClick={toggleAroma}
                          language={language}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Active Filters Summary */}
        {(selectedAromas.length > 0 || selectedType !== 'all' || searchQuery) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap items-center gap-2 mb-6"
          >
            <span className="text-sm text-muted-foreground">
              {language === 'pt' ? 'Filtros ativos:' : 'Active filters:'}
            </span>
            {selectedType !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedType === 'red' ? '🍷' : '🥂'} {selectedType === 'red' ? (language === 'pt' ? 'Tintas' : 'Red') : (language === 'pt' ? 'Brancas' : 'White')}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedType('all')} />
              </Badge>
            )}
            {selectedAromas.map(aromaId => {
              const aroma = allAromas.find(a => a.id === aromaId);
              return aroma ? (
                <Badge key={aromaId} variant="secondary" className="flex items-center gap-1">
                  {aroma.emoji} {language === 'pt' ? aroma.name_pt : aroma.name_en}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleAroma(aromaId)} />
                </Badge>
              ) : null;
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-muted-foreground"
            >
              {language === 'pt' ? 'Limpar todos' : 'Clear all'}
            </Button>
          </motion.div>
        )}

        {/* Results Count */}
        <div className="mb-6 text-sm text-muted-foreground">
          {filteredGrapes.length} {filteredGrapes.length === 1 
            ? (language === 'pt' ? 'casta encontrada' : 'grape found')
            : (language === 'pt' ? 'castas encontradas' : 'grapes found')}
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
            <p className="text-muted-foreground">
              {language === 'pt' ? 'Nenhuma casta encontrada' : 'No grapes found'}
            </p>
            <Button
              variant="link"
              onClick={clearFilters}
              className="text-wine-500 mt-2"
            >
              {language === 'pt' ? 'Limpar filtros' : 'Clear filters'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrapesPage;

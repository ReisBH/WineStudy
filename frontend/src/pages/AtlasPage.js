import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, MapPin, Wine, ChevronRight, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useLanguage } from '../contexts/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CountryCard = ({ country, language, delay }) => {
  const name = language === 'pt' ? country.name_pt : country.name_en;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link to={`/atlas/${country.country_id}`}>
        <Card className="wine-card border-border/40 overflow-hidden group cursor-pointer h-full">
          <div className="relative h-40">
            {country.image_url ? (
              <img 
                src={country.image_url}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-wine-500/10 flex items-center justify-center">
                <Globe className="w-12 h-12 text-wine-500/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-3xl mb-1 block">{country.flag_emoji}</span>
              <h3 className="font-serif text-xl font-bold text-white">{name}</h3>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {language === 'pt' ? country.description_pt : country.description_en}
            </p>
            <div className="flex items-center text-wine-500 text-sm mt-3 group-hover:translate-x-1 transition-transform">
              Explorar <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

const RegionCard = ({ region, language, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Link to={`/atlas/region/${region.region_id}`}>
      <Card className="wine-card border-border/40 group cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-serif font-semibold text-lg mb-1">{region.name}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {language === 'pt' ? region.description_pt : region.description_en}
              </p>
            </div>
            <div className="w-10 h-10 bg-wine-500/10 rounded-sm flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-wine-500" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {region.main_grapes?.slice(0, 3).map((grape) => (
              <span 
                key={grape}
                className="px-2 py-1 bg-muted text-xs rounded-sm"
              >
                {grape}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
);

const AtlasPage = () => {
  const { t, language } = useLanguage();
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorld, setSelectedWorld] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, regionsRes] = await Promise.all([
          fetch(`${API}/countries`),
          fetch(`${API}/regions`),
        ]);

        if (countriesRes.ok) {
          const data = await countriesRes.json();
          setCountries(data);
        }

        if (regionsRes.ok) {
          const data = await regionsRes.json();
          setRegions(data);
        }
      } catch (error) {
        console.error('Error fetching atlas data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCountries = countries.filter(country => {
    const matchesSearch = 
      country.name_pt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.name_en.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWorld = selectedWorld === 'all' || country.world_type === selectedWorld;
    return matchesSearch && matchesWorld;
  });

  const oldWorld = filteredCountries.filter(c => c.world_type === 'old_world');
  const newWorld = filteredCountries.filter(c => c.world_type === 'new_world');

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
            {t('atlas.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('atlas.subtitle')}
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              data-testid="atlas-search-input"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-5 rounded-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="filter-all-button"
              variant={selectedWorld === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedWorld('all')}
              className={`rounded-sm ${selectedWorld === 'all' ? 'bg-wine-500 hover:bg-wine-600' : ''}`}
            >
              Todos
            </Button>
            <Button
              data-testid="filter-old-world-button"
              variant={selectedWorld === 'old_world' ? 'default' : 'outline'}
              onClick={() => setSelectedWorld('old_world')}
              className={`rounded-sm ${selectedWorld === 'old_world' ? 'bg-wine-500 hover:bg-wine-600' : ''}`}
            >
              {t('atlas.oldWorld')}
            </Button>
            <Button
              data-testid="filter-new-world-button"
              variant={selectedWorld === 'new_world' ? 'default' : 'outline'}
              onClick={() => setSelectedWorld('new_world')}
              className={`rounded-sm ${selectedWorld === 'new_world' ? 'bg-wine-500 hover:bg-wine-600' : ''}`}
            >
              {t('atlas.newWorld')}
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <Globe className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : (
          <Tabs defaultValue="countries" className="w-full">
            <TabsList className="mb-8 bg-muted/50">
              <TabsTrigger value="countries" className="data-[state=active]:bg-wine-500 data-[state=active]:text-white">
                Países
              </TabsTrigger>
              <TabsTrigger value="regions" className="data-[state=active]:bg-wine-500 data-[state=active]:text-white">
                {t('atlas.regions')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="countries">
              {/* Old World */}
              {(selectedWorld === 'all' || selectedWorld === 'old_world') && oldWorld.length > 0 && (
                <div className="mb-12">
                  <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-wine-500/10 rounded-sm flex items-center justify-center">
                      <Wine className="w-4 h-4 text-wine-500" />
                    </span>
                    {t('atlas.oldWorld')}
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {oldWorld.map((country, index) => (
                      <CountryCard 
                        key={country.country_id} 
                        country={country} 
                        language={language}
                        delay={index * 0.1}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* New World */}
              {(selectedWorld === 'all' || selectedWorld === 'new_world') && newWorld.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-gold-500/10 rounded-sm flex items-center justify-center">
                      <Globe className="w-4 h-4 text-gold-500" />
                    </span>
                    {t('atlas.newWorld')}
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {newWorld.map((country, index) => (
                      <CountryCard 
                        key={country.country_id} 
                        country={country} 
                        language={language}
                        delay={index * 0.1}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="regions">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {regions.map((region, index) => (
                  <RegionCard 
                    key={region.region_id} 
                    region={region} 
                    language={language}
                    delay={index * 0.05}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AtlasPage;

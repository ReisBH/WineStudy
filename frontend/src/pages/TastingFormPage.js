import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Wine, Save, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const intensityOptions = ['light', 'medium', 'pronounced'];
const sweetOptions = ['dry', 'off-dry', 'medium-dry', 'medium-sweet', 'sweet'];
const acidityOptions = ['low', 'medium-', 'medium', 'medium+', 'high'];
const tanninOptions = ['low', 'medium-', 'medium', 'medium+', 'high'];
const bodyOptions = ['light', 'medium-', 'medium', 'medium+', 'full'];
const finishOptions = ['short', 'medium-', 'medium', 'medium+', 'long'];
const qualityOptions = ['poor', 'acceptable', 'good', 'veryGood', 'outstanding'];
const readinessOptions = ['drink_now', 'can_age', 'needs_aging', 'past_peak'];

const colorOptions = {
  white: ['lemon', 'gold', 'amber', 'brown'],
  red: ['purple', 'ruby', 'garnet', 'tawny', 'brown'],
  rose: ['pink', 'salmon', 'orange'],
};

const TastingFormPage = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [aromas, setAromas] = useState([]);
  const [grapes, setGrapes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [wineType, setWineType] = useState('red');
  
  const [formData, setFormData] = useState({
    wine_name: '',
    vintage: '',
    grape_ids: [],
    region_id: '',
    appearance: {
      intensity: 'medium',
      color: 'ruby',
    },
    nose: {
      condition: 'clean',
      intensity: 'medium',
      aromas: [],
    },
    palate: {
      sweetness: 'dry',
      acidity: 'medium',
      tannin: 'medium',
      body: 'medium',
      alcohol: 'medium',
      flavors: [],
      finish: 'medium',
    },
    conclusion: {
      quality: 'good',
      aging_potential: 'can_age',
      readiness: 'drink_now',
    },
    notes: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [aromasRes, grapesRes, regionsRes] = await Promise.all([
          fetch(`${API}/aromas`),
          fetch(`${API}/grapes`),
          fetch(`${API}/regions`),
        ]);

        if (aromasRes.ok) setAromas(await aromasRes.json());
        if (grapesRes.ok) setGrapes(await grapesRes.json());
        if (regionsRes.ok) setRegions(await regionsRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  const updateFormData = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      }
    }));
  };

  const toggleAroma = (aromaName, section) => {
    const field = section === 'nose' ? 'aromas' : 'flavors';
    const current = formData[section][field];
    
    updateFormData(
      section,
      field,
      current.includes(aromaName)
        ? current.filter(a => a !== aromaName)
        : [...current, aromaName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.wine_name) {
      toast.error('Nome do vinho é obrigatório');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(`${API}/tastings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          vintage: formData.vintage ? parseInt(formData.vintage) : null,
        }),
      });

      if (res.ok) {
        toast.success('Degustação salva com sucesso!');
        navigate('/tasting');
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Erro ao salvar');
      }
    } catch (error) {
      toast.error('Erro ao salvar degustação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/tasting" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Link>
          <h1 className="font-serif text-3xl font-bold">
            {t('tasting.newTasting')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistemática WSET (SAT)
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Wine Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Wine className="w-5 h-5 text-wine-500" />
                  Informações do Vinho
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('tasting.wineName')} *</Label>
                    <Input
                      data-testid="wine-name-input"
                      value={formData.wine_name}
                      onChange={(e) => setFormData({ ...formData, wine_name: e.target.value })}
                      placeholder="Ex: Château Margaux 2015"
                      className="rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('tasting.vintage')}</Label>
                    <Input
                      data-testid="vintage-input"
                      type="number"
                      value={formData.vintage}
                      onChange={(e) => setFormData({ ...formData, vintage: e.target.value })}
                      placeholder="2020"
                      className="rounded-sm"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Vinho</Label>
                    <Select value={wineType} onValueChange={setWineType}>
                      <SelectTrigger data-testid="wine-type-select" className="rounded-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="red">🍷 Tinto</SelectItem>
                        <SelectItem value="white">🥂 Branco</SelectItem>
                        <SelectItem value="rose">🌸 Rosé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('tasting.region')}</Label>
                    <Select 
                      value={formData.region_id} 
                      onValueChange={(v) => setFormData({ ...formData, region_id: v })}
                    >
                      <SelectTrigger className="rounded-sm">
                        <SelectValue placeholder="Selecione a região" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.region_id} value={region.region_id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="font-serif">👁️ {t('tasting.appearance.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('tasting.appearance.intensity')}</Label>
                    <Select 
                      value={formData.appearance.intensity} 
                      onValueChange={(v) => updateFormData('appearance', 'intensity', v)}
                    >
                      <SelectTrigger className="rounded-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {intensityOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {t(`intensity.${opt}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('tasting.appearance.color')}</Label>
                    <Select 
                      value={formData.appearance.color} 
                      onValueChange={(v) => updateFormData('appearance', 'color', v)}
                    >
                      <SelectTrigger className="rounded-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions[wineType]?.map((color) => (
                          <SelectItem key={color} value={color}>
                            {t(`colors.${color}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Nose */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="font-serif">👃 {t('tasting.nose.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('tasting.nose.condition')}</Label>
                    <Select 
                      value={formData.nose.condition} 
                      onValueChange={(v) => updateFormData('nose', 'condition', v)}
                    >
                      <SelectTrigger className="rounded-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clean">Limpo</SelectItem>
                        <SelectItem value="unclean">Defeituoso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('tasting.nose.intensity')}</Label>
                    <Select 
                      value={formData.nose.intensity} 
                      onValueChange={(v) => updateFormData('nose', 'intensity', v)}
                    >
                      <SelectTrigger className="rounded-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {intensityOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {t(`intensity.${opt}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{t('tasting.nose.aromas')}</Label>
                  <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-sm">
                    {aromas.map((aroma) => (
                      <Badge
                        key={aroma.tag_id}
                        variant={formData.nose.aromas.includes(aroma.name_en) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${
                          formData.nose.aromas.includes(aroma.name_en) 
                            ? 'bg-wine-500 hover:bg-wine-600' 
                            : 'hover:bg-wine-500/10'
                        }`}
                        onClick={() => toggleAroma(aroma.name_en, 'nose')}
                      >
                        {aroma.emoji} {language === 'pt' ? aroma.name_pt : aroma.name_en}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Palate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="font-serif">👄 {t('tasting.palate.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('tasting.palate.sweetness')}</Label>
                    <Select 
                      value={formData.palate.sweetness} 
                      onValueChange={(v) => updateFormData('palate', 'sweetness', v)}
                    >
                      <SelectTrigger className="rounded-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sweetOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('tasting.palate.acidity')}</Label>
                    <Select 
                      value={formData.palate.acidity} 
                      onValueChange={(v) => updateFormData('palate', 'acidity', v)}
                    >
                      <SelectTrigger className="rounded-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {acidityOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {wineType === 'red' && (
                    <div className="space-y-2">
                      <Label>{t('tasting.palate.tannin')}</Label>
                      <Select 
                        value={formData.palate.tannin} 
                        onValueChange={(v) => updateFormData('palate', 'tannin', v)}
                      >
                        <SelectTrigger className="rounded-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tanninOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{t('tasting.palate.body')}</Label>
                    <Select 
                      value={formData.palate.body} 
                      onValueChange={(v) => updateFormData('palate', 'body', v)}
                    >
                      <SelectTrigger className="rounded-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('tasting.palate.finish')}</Label>
                    <Select 
                      value={formData.palate.finish} 
                      onValueChange={(v) => updateFormData('palate', 'finish', v)}
                    >
                      <SelectTrigger className="rounded-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {finishOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('tasting.palate.flavors')}</Label>
                  <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-sm">
                    {aromas.map((aroma) => (
                      <Badge
                        key={aroma.tag_id}
                        variant={formData.palate.flavors.includes(aroma.name_en) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${
                          formData.palate.flavors.includes(aroma.name_en) 
                            ? 'bg-wine-500 hover:bg-wine-600' 
                            : 'hover:bg-wine-500/10'
                        }`}
                        onClick={() => toggleAroma(aroma.name_en, 'palate')}
                      >
                        {aroma.emoji} {language === 'pt' ? aroma.name_pt : aroma.name_en}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Conclusion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="font-serif">⭐ {t('tasting.conclusion.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('tasting.conclusion.quality')}</Label>
                    <Select 
                      value={formData.conclusion.quality} 
                      onValueChange={(v) => updateFormData('conclusion', 'quality', v)}
                    >
                      <SelectTrigger className="rounded-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {t(`quality.${opt}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('tasting.conclusion.agingPotential')}</Label>
                    <Select 
                      value={formData.conclusion.aging_potential} 
                      onValueChange={(v) => updateFormData('conclusion', 'aging_potential', v)}
                    >
                      <SelectTrigger className="rounded-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_suitable">Não adequado</SelectItem>
                        <SelectItem value="can_age">Pode envelhecer</SelectItem>
                        <SelectItem value="high_potential">Alto potencial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('tasting.conclusion.readiness')}</Label>
                    <Select 
                      value={formData.conclusion.readiness} 
                      onValueChange={(v) => updateFormData('conclusion', 'readiness', v)}
                    >
                      <SelectTrigger className="rounded-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drink_now">Beber agora</SelectItem>
                        <SelectItem value="can_age">Pode guardar</SelectItem>
                        <SelectItem value="needs_aging">Precisa envelhecer</SelectItem>
                        <SelectItem value="past_peak">Passou do ponto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="font-serif">📝 {t('tasting.notes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  data-testid="tasting-notes-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Suas impressões pessoais sobre o vinho..."
                  className="rounded-sm min-h-[120px] font-accent italic"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-end gap-4"
          >
            <Link to="/tasting">
              <Button type="button" variant="outline" className="rounded-sm">
                {t('common.cancel')}
              </Button>
            </Link>
            <Button
              data-testid="save-tasting-button"
              type="submit"
              disabled={loading}
              className="bg-wine-500 hover:bg-wine-600 text-white rounded-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {t('tasting.save')}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default TastingFormPage;

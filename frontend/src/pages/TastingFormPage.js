import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Wine, Save, Loader2, Eye, Sparkles, CircleDot } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// WSET SAT Options
const clarityOptions = [
  { value: 'clear', label_pt: 'Límpido', label_en: 'Clear' },
  { value: 'hazy', label_pt: 'Turvo', label_en: 'Hazy' },
];

const intensityOptions = [
  { value: 'light', label_pt: 'Leve', label_en: 'Light' },
  { value: 'medium-', label_pt: 'Médio-', label_en: 'Medium-' },
  { value: 'medium', label_pt: 'Médio', label_en: 'Medium' },
  { value: 'medium+', label_pt: 'Médio+', label_en: 'Medium+' },
  { value: 'pronounced', label_pt: 'Pronunciado', label_en: 'Pronounced' },
];

const noseConditionOptions = [
  { value: 'clean', label_pt: 'Limpo', label_en: 'Clean' },
  { value: 'unclean', label_pt: 'Defeituoso', label_en: 'Unclean' },
];

const developmentOptions = [
  { value: 'youthful', label_pt: 'Jovem', label_en: 'Youthful' },
  { value: 'developing', label_pt: 'Em desenvolvimento', label_en: 'Developing' },
  { value: 'fully_developed', label_pt: 'Desenvolvido', label_en: 'Fully Developed' },
  { value: 'tired', label_pt: 'Cansado/Passado', label_en: 'Tired/Past Peak' },
];

const sweetnessOptions = [
  { value: 'dry', label_pt: 'Seco', label_en: 'Dry' },
  { value: 'off-dry', label_pt: 'Meio-seco', label_en: 'Off-dry' },
  { value: 'medium-dry', label_pt: 'Meio-seco', label_en: 'Medium-dry' },
  { value: 'medium-sweet', label_pt: 'Meio-doce', label_en: 'Medium-sweet' },
  { value: 'sweet', label_pt: 'Doce', label_en: 'Sweet' },
  { value: 'luscious', label_pt: 'Licoroso', label_en: 'Luscious' },
];

const acidityOptions = [
  { value: 'low', label_pt: 'Baixa', label_en: 'Low' },
  { value: 'medium-', label_pt: 'Média-', label_en: 'Medium-' },
  { value: 'medium', label_pt: 'Média', label_en: 'Medium' },
  { value: 'medium+', label_pt: 'Média+', label_en: 'Medium+' },
  { value: 'high', label_pt: 'Alta', label_en: 'High' },
];

const tanninOptions = [
  { value: 'low', label_pt: 'Baixo', label_en: 'Low' },
  { value: 'medium-', label_pt: 'Médio-', label_en: 'Medium-' },
  { value: 'medium', label_pt: 'Médio', label_en: 'Medium' },
  { value: 'medium+', label_pt: 'Médio+', label_en: 'Medium+' },
  { value: 'high', label_pt: 'Alto', label_en: 'High' },
];

const alcoholOptions = [
  { value: 'low', label_pt: 'Baixo', label_en: 'Low' },
  { value: 'medium', label_pt: 'Médio', label_en: 'Medium' },
  { value: 'high', label_pt: 'Alto', label_en: 'High' },
];

const bodyOptions = [
  { value: 'light', label_pt: 'Leve', label_en: 'Light' },
  { value: 'medium-', label_pt: 'Médio-', label_en: 'Medium-' },
  { value: 'medium', label_pt: 'Médio', label_en: 'Medium' },
  { value: 'medium+', label_pt: 'Médio+', label_en: 'Medium+' },
  { value: 'full', label_pt: 'Encorpado', label_en: 'Full' },
];

const finishOptions = [
  { value: 'short', label_pt: 'Curto', label_en: 'Short' },
  { value: 'medium-', label_pt: 'Médio-', label_en: 'Medium-' },
  { value: 'medium', label_pt: 'Médio', label_en: 'Medium' },
  { value: 'medium+', label_pt: 'Médio+', label_en: 'Medium+' },
  { value: 'long', label_pt: 'Longo', label_en: 'Long' },
];

const qualityOptions = [
  { value: 'poor', label_pt: 'Deficiente', label_en: 'Poor' },
  { value: 'acceptable', label_pt: 'Aceitável', label_en: 'Acceptable' },
  { value: 'good', label_pt: 'Bom', label_en: 'Good' },
  { value: 'very_good', label_pt: 'Muito Bom', label_en: 'Very Good' },
  { value: 'outstanding', label_pt: 'Excepcional', label_en: 'Outstanding' },
];

const readinessOptions = [
  { value: 'drink_now', label_pt: 'Beber agora', label_en: 'Drink now' },
  { value: 'can_age', label_pt: 'Pode envelhecer', label_en: 'Can age' },
  { value: 'needs_aging', label_pt: 'Precisa envelhecer', label_en: 'Needs aging' },
  { value: 'past_peak', label_pt: 'Passou do ponto', label_en: 'Past peak' },
];

const SelectField = ({ label, value, onChange, options, language, testId, required }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">
      {label} {required && <span className="text-wine-500">*</span>}
    </Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger data-testid={testId} className="rounded-sm bg-background">
        <SelectValue placeholder={language === 'pt' ? 'Selecionar' : 'Select'} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {language === 'pt' ? opt.label_pt : opt.label_en}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const TastingFormPage = () => {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    wine_name: '',
    producer: '',
    vintage: '',
    region: '',
    appearance: {
      clarity: '',
      intensity: '',
      color: '',
    },
    nose: {
      condition: '',
      intensity: '',
      development: '',
      characteristics: '',
    },
    palate: {
      sweetness: '',
      acidity: '',
      tannin: '',
      alcohol: '',
      body: '',
      intensity: '',
      finish: '',
      characteristics: '',
    },
    conclusion: {
      quality: '',
      readiness: '',
    },
    notes: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const updateFormData = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.wine_name.trim()) {
      toast.error(language === 'pt' ? 'Nome do vinho é obrigatório' : 'Wine name is required');
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
          grape_ids: [],
          region_id: null,
        }),
      });

      if (res.ok) {
        toast.success(language === 'pt' ? 'Degustação salva com sucesso!' : 'Tasting saved successfully!');
        navigate('/tasting');
      } else {
        const error = await res.json();
        toast.error(error.detail || (language === 'pt' ? 'Erro ao salvar' : 'Error saving'));
      }
    } catch (error) {
      toast.error(language === 'pt' ? 'Erro ao salvar degustação' : 'Error saving tasting');
    } finally {
      setLoading(false);
    }
  };

  const t = {
    back: language === 'pt' ? 'Voltar' : 'Back',
    newTasting: language === 'pt' ? 'Nova Degustação' : 'New Tasting',
    subtitle: language === 'pt' ? 'Sistemática WSET (SAT)' : 'WSET Systematic Approach (SAT)',
    wineInfo: language === 'pt' ? 'Informações do Vinho' : 'Wine Information',
    wineName: language === 'pt' ? 'Nome do Vinho' : 'Wine Name',
    producer: language === 'pt' ? 'Produtor' : 'Producer',
    year: language === 'pt' ? 'Ano' : 'Year',
    region: language === 'pt' ? 'Região' : 'Region',
    appearance: language === 'pt' ? 'Aparência' : 'Appearance',
    clarity: language === 'pt' ? 'Limpidez' : 'Clarity',
    intensity: language === 'pt' ? 'Intensidade' : 'Intensity',
    color: language === 'pt' ? 'Cor' : 'Color',
    nose: language === 'pt' ? 'Nariz' : 'Nose',
    condition: language === 'pt' ? 'Condição' : 'Condition',
    development: language === 'pt' ? 'Desenvolvimento' : 'Development',
    aromaticChar: language === 'pt' ? 'Características Aromáticas' : 'Aromatic Characteristics',
    palate: language === 'pt' ? 'Boca' : 'Palate',
    sweetness: language === 'pt' ? 'Doçura' : 'Sweetness',
    acidity: language === 'pt' ? 'Acidez' : 'Acidity',
    tannin: language === 'pt' ? 'Tanino' : 'Tannin',
    alcohol: language === 'pt' ? 'Álcool' : 'Alcohol',
    body: language === 'pt' ? 'Corpo' : 'Body',
    finish: language === 'pt' ? 'Final' : 'Finish',
    flavorChar: language === 'pt' ? 'Características de Sabor' : 'Flavor Characteristics',
    conclusions: language === 'pt' ? 'Conclusões' : 'Conclusions',
    quality: language === 'pt' ? 'Qualidade' : 'Quality',
    readiness: language === 'pt' ? 'Prontidão para Consumo' : 'Readiness for Drinking',
    additionalNotes: language === 'pt' ? 'Notas Adicionais' : 'Additional Notes',
    cancel: language === 'pt' ? 'Cancelar' : 'Cancel',
    save: language === 'pt' ? 'Salvar Degustação' : 'Save Tasting',
    placeholders: {
      wineName: 'Ex: Château Margaux',
      producer: 'Ex: Château Margaux',
      year: 'Ex: 2018',
      region: 'Ex: Margaux, Bordéus',
      color: language === 'pt' ? 'Ex: Rubi com reflexos granada' : 'Ex: Ruby with garnet reflections',
      aromatic: language === 'pt' ? 'Ex: Cassis, cedro, tabaco' : 'Ex: Cassis, cedar, tobacco',
      flavor: language === 'pt' ? 'Ex: Fruta preta madura, especiarias, notas de carvalho' : 'Ex: Ripe black fruit, spices, oak notes',
      notes: language === 'pt' ? 'Impressões gerais, harmonização sugerida, etc.' : 'General impressions, suggested pairings, etc.',
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
          <Link to="/tasting" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </Link>
          <h1 className="font-serif text-3xl font-bold">{t.newTasting}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Wine Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/40">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif flex items-center gap-2 text-xl">
                  <Wine className="w-5 h-5 text-wine-500" />
                  {t.wineInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.wineName} <span className="text-wine-500">*</span></Label>
                    <Input
                      data-testid="wine-name-input"
                      value={formData.wine_name}
                      onChange={(e) => updateFormData(null, 'wine_name', e.target.value)}
                      placeholder={t.placeholders.wineName}
                      className="rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.producer}</Label>
                    <Input
                      data-testid="producer-input"
                      value={formData.producer}
                      onChange={(e) => updateFormData(null, 'producer', e.target.value)}
                      placeholder={t.placeholders.producer}
                      className="rounded-sm"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.year}</Label>
                    <Input
                      data-testid="vintage-input"
                      type="number"
                      value={formData.vintage}
                      onChange={(e) => updateFormData(null, 'vintage', e.target.value)}
                      placeholder={t.placeholders.year}
                      className="rounded-sm"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.region}</Label>
                    <Input
                      data-testid="region-input"
                      value={formData.region}
                      onChange={(e) => updateFormData(null, 'region', e.target.value)}
                      placeholder={t.placeholders.region}
                      className="rounded-sm"
                    />
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
              <CardHeader className="pb-4">
                <CardTitle className="font-serif flex items-center gap-2 text-xl">
                  <Eye className="w-5 h-5 text-wine-500" />
                  {t.appearance}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <SelectField
                    label={t.clarity}
                    value={formData.appearance.clarity}
                    onChange={(v) => updateFormData('appearance', 'clarity', v)}
                    options={clarityOptions}
                    language={language}
                    testId="clarity-select"
                  />
                  <SelectField
                    label={t.intensity}
                    value={formData.appearance.intensity}
                    onChange={(v) => updateFormData('appearance', 'intensity', v)}
                    options={intensityOptions}
                    language={language}
                    testId="appearance-intensity-select"
                  />
                  <div className="space-y-2">
                    <Label>{t.color}</Label>
                    <Input
                      data-testid="color-input"
                      value={formData.appearance.color}
                      onChange={(e) => updateFormData('appearance', 'color', e.target.value)}
                      placeholder={t.placeholders.color}
                      className="rounded-sm"
                    />
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
              <CardHeader className="pb-4">
                <CardTitle className="font-serif flex items-center gap-2 text-xl">
                  <Sparkles className="w-5 h-5 text-wine-500" />
                  {t.nose}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <SelectField
                    label={t.condition}
                    value={formData.nose.condition}
                    onChange={(v) => updateFormData('nose', 'condition', v)}
                    options={noseConditionOptions}
                    language={language}
                    testId="nose-condition-select"
                  />
                  <SelectField
                    label={t.intensity}
                    value={formData.nose.intensity}
                    onChange={(v) => updateFormData('nose', 'intensity', v)}
                    options={intensityOptions}
                    language={language}
                    testId="nose-intensity-select"
                  />
                  <SelectField
                    label={t.development}
                    value={formData.nose.development}
                    onChange={(v) => updateFormData('nose', 'development', v)}
                    options={developmentOptions}
                    language={language}
                    testId="nose-development-select"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.aromaticChar}</Label>
                  <Textarea
                    data-testid="aromatic-characteristics-textarea"
                    value={formData.nose.characteristics}
                    onChange={(e) => updateFormData('nose', 'characteristics', e.target.value)}
                    placeholder={t.placeholders.aromatic}
                    className="rounded-sm min-h-[80px] font-accent"
                  />
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
              <CardHeader className="pb-4">
                <CardTitle className="font-serif flex items-center gap-2 text-xl">
                  <CircleDot className="w-5 h-5 text-wine-500" />
                  {t.palate}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <SelectField
                    label={t.sweetness}
                    value={formData.palate.sweetness}
                    onChange={(v) => updateFormData('palate', 'sweetness', v)}
                    options={sweetnessOptions}
                    language={language}
                    testId="sweetness-select"
                  />
                  <SelectField
                    label={t.acidity}
                    value={formData.palate.acidity}
                    onChange={(v) => updateFormData('palate', 'acidity', v)}
                    options={acidityOptions}
                    language={language}
                    testId="acidity-select"
                  />
                  <SelectField
                    label={t.tannin}
                    value={formData.palate.tannin}
                    onChange={(v) => updateFormData('palate', 'tannin', v)}
                    options={tanninOptions}
                    language={language}
                    testId="tannin-select"
                  />
                  <SelectField
                    label={t.alcohol}
                    value={formData.palate.alcohol}
                    onChange={(v) => updateFormData('palate', 'alcohol', v)}
                    options={alcoholOptions}
                    language={language}
                    testId="alcohol-select"
                  />
                </div>
                <Separator />
                <div className="grid sm:grid-cols-3 gap-4">
                  <SelectField
                    label={t.body}
                    value={formData.palate.body}
                    onChange={(v) => updateFormData('palate', 'body', v)}
                    options={bodyOptions}
                    language={language}
                    testId="body-select"
                  />
                  <SelectField
                    label={t.intensity}
                    value={formData.palate.intensity}
                    onChange={(v) => updateFormData('palate', 'intensity', v)}
                    options={intensityOptions}
                    language={language}
                    testId="palate-intensity-select"
                  />
                  <SelectField
                    label={t.finish}
                    value={formData.palate.finish}
                    onChange={(v) => updateFormData('palate', 'finish', v)}
                    options={finishOptions}
                    language={language}
                    testId="finish-select"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.flavorChar}</Label>
                  <Textarea
                    data-testid="flavor-characteristics-textarea"
                    value={formData.palate.characteristics}
                    onChange={(e) => updateFormData('palate', 'characteristics', e.target.value)}
                    placeholder={t.placeholders.flavor}
                    className="rounded-sm min-h-[80px] font-accent"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Conclusions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-border/40">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif flex items-center gap-2 text-xl">
                  ⭐ {t.conclusions}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <SelectField
                    label={t.quality}
                    value={formData.conclusion.quality}
                    onChange={(v) => updateFormData('conclusion', 'quality', v)}
                    options={qualityOptions}
                    language={language}
                    testId="quality-select"
                  />
                  <SelectField
                    label={t.readiness}
                    value={formData.conclusion.readiness}
                    onChange={(v) => updateFormData('conclusion', 'readiness', v)}
                    options={readinessOptions}
                    language={language}
                    testId="readiness-select"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.additionalNotes}</Label>
                  <Textarea
                    data-testid="additional-notes-textarea"
                    value={formData.notes}
                    onChange={(e) => updateFormData(null, 'notes', e.target.value)}
                    placeholder={t.placeholders.notes}
                    className="rounded-sm min-h-[100px] font-accent"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-end gap-4 pb-8"
          >
            <Link to="/tasting">
              <Button type="button" variant="outline" className="rounded-sm">
                {t.cancel}
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
              {t.save}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default TastingFormPage;

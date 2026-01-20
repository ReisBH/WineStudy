import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Wine, Trash2, Calendar, MapPin, 
  Eye, Sparkles, CircleDot, Star, Clock, User
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const qualityLabels = {
  poor: { pt: 'Deficiente', en: 'Poor', color: 'bg-red-500/10 text-red-600' },
  acceptable: { pt: 'Aceitável', en: 'Acceptable', color: 'bg-orange-500/10 text-orange-600' },
  good: { pt: 'Bom', en: 'Good', color: 'bg-green-500/10 text-green-600' },
  very_good: { pt: 'Muito Bom', en: 'Very Good', color: 'bg-blue-500/10 text-blue-600' },
  outstanding: { pt: 'Excepcional', en: 'Outstanding', color: 'bg-gold-500/10 text-gold-600' },
};

const readinessLabels = {
  drink_now: { pt: 'Beber agora', en: 'Drink now' },
  can_age: { pt: 'Pode guardar', en: 'Can age' },
  needs_aging: { pt: 'Precisa envelhecer', en: 'Needs aging' },
  past_peak: { pt: 'Passou do ponto', en: 'Past peak' },
};

const translateValue = (value, language) => {
  const translations = {
    // Clarity
    clear: { pt: 'Límpido', en: 'Clear' },
    hazy: { pt: 'Turvo', en: 'Hazy' },
    // Intensity
    light: { pt: 'Leve', en: 'Light' },
    'medium-': { pt: 'Médio-', en: 'Medium-' },
    medium: { pt: 'Médio', en: 'Medium' },
    'medium+': { pt: 'Médio+', en: 'Medium+' },
    pronounced: { pt: 'Pronunciado', en: 'Pronounced' },
    // Condition
    clean: { pt: 'Limpo', en: 'Clean' },
    unclean: { pt: 'Defeituoso', en: 'Unclean' },
    // Development
    youthful: { pt: 'Jovem', en: 'Youthful' },
    developing: { pt: 'Em desenvolvimento', en: 'Developing' },
    fully_developed: { pt: 'Desenvolvido', en: 'Fully Developed' },
    tired: { pt: 'Cansado/Passado', en: 'Tired/Past Peak' },
    // Sweetness
    dry: { pt: 'Seco', en: 'Dry' },
    'off-dry': { pt: 'Meio-seco', en: 'Off-dry' },
    'medium-dry': { pt: 'Meio-seco', en: 'Medium-dry' },
    'medium-sweet': { pt: 'Meio-doce', en: 'Medium-sweet' },
    sweet: { pt: 'Doce', en: 'Sweet' },
    luscious: { pt: 'Licoroso', en: 'Luscious' },
    // Acidity/Tannin
    low: { pt: 'Baixo', en: 'Low' },
    high: { pt: 'Alto', en: 'High' },
    // Body
    full: { pt: 'Encorpado', en: 'Full' },
    // Finish
    short: { pt: 'Curto', en: 'Short' },
    long: { pt: 'Longo', en: 'Long' },
  };
  
  if (!value) return '-';
  const trans = translations[value];
  return trans ? trans[language] : value;
};

const DetailSection = ({ title, icon: Icon, children }) => (
  <Card className="border-border/40">
    <CardHeader className="pb-3">
      <CardTitle className="font-serif text-lg flex items-center gap-2">
        <Icon className="w-5 h-5 text-wine-500" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const AttributeRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-border/30 last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const TastingDetailPage = () => {
  const { tastingId } = useParams();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [tasting, setTasting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  const t = {
    back: language === 'pt' ? 'Voltar' : 'Back',
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
    readiness: language === 'pt' ? 'Prontidão para Consumo' : 'Readiness',
    additionalNotes: language === 'pt' ? 'Notas Adicionais' : 'Additional Notes',
    deleteTitle: language === 'pt' ? 'Excluir degustação?' : 'Delete tasting?',
    deleteDesc: language === 'pt' ? 'Esta ação não pode ser desfeita. A degustação será permanentemente removida.' : 'This action cannot be undone. The tasting will be permanently deleted.',
    cancel: language === 'pt' ? 'Cancelar' : 'Cancel',
    delete: language === 'pt' ? 'Excluir' : 'Delete',
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchTasting = async () => {
      try {
        const res = await fetch(`${API}/tastings/${tastingId}`, {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setTasting(data);
        } else if (res.status === 404) {
          toast.error(language === 'pt' ? 'Degustação não encontrada' : 'Tasting not found');
          navigate('/tasting');
        }
      } catch (error) {
        console.error('Error fetching tasting:', error);
        toast.error(language === 'pt' ? 'Erro ao carregar degustação' : 'Error loading tasting');
      } finally {
        setLoading(false);
      }
    };

    fetchTasting();
  }, [tastingId, isAuthenticated, navigate, language]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/tastings/${tastingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(language === 'pt' ? 'Degustação excluída' : 'Tasting deleted');
        navigate('/tasting');
      } else {
        toast.error(language === 'pt' ? 'Erro ao excluir' : 'Error deleting');
      }
    } catch (error) {
      toast.error(language === 'pt' ? 'Erro ao excluir degustação' : 'Error deleting tasting');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Wine className="w-16 h-16 text-muted-foreground/30 animate-pulse" />
      </div>
    );
  }

  if (!tasting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wine className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === 'pt' ? 'Degustação não encontrada' : 'Tasting not found'}
          </p>
          <Link to="/tasting">
            <Button className="mt-4">{t.back}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const quality = tasting.conclusion?.quality || 'good';
  const qualityInfo = qualityLabels[quality] || qualityLabels.good;

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            to="/tasting" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold mb-2" data-testid="tasting-wine-name">
                {tasting.wine_name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                {tasting.producer && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {tasting.producer}
                  </span>
                )}
                {tasting.vintage && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {tasting.vintage}
                  </span>
                )}
                {tasting.region && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {tasting.region}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(tasting.created_at).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${qualityInfo.color} px-4 py-2 text-sm`}>
                <Star className="w-4 h-4 mr-1" />
                {language === 'pt' ? qualityInfo.pt : qualityInfo.en}
              </Badge>
              <Button 
                variant="outline" 
                size="icon"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setShowDelete(true)}
                data-testid="delete-tasting-button"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DetailSection title={t.appearance} icon={Eye}>
              <AttributeRow 
                label={t.clarity} 
                value={translateValue(tasting.appearance?.clarity, language)} 
              />
              <AttributeRow 
                label={t.intensity} 
                value={translateValue(tasting.appearance?.intensity, language)} 
              />
              <AttributeRow 
                label={t.color} 
                value={tasting.appearance?.color || '-'} 
              />
            </DetailSection>
          </motion.div>

          {/* Nose */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DetailSection title={t.nose} icon={Sparkles}>
              <AttributeRow 
                label={t.condition} 
                value={translateValue(tasting.nose?.condition, language)} 
              />
              <AttributeRow 
                label={t.intensity} 
                value={translateValue(tasting.nose?.intensity, language)} 
              />
              <AttributeRow 
                label={t.development} 
                value={translateValue(tasting.nose?.development, language)} 
              />
              {tasting.nose?.characteristics && (
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-sm text-muted-foreground mb-2">{t.aromaticChar}</p>
                  <p className="font-accent italic">{tasting.nose.characteristics}</p>
                </div>
              )}
            </DetailSection>
          </motion.div>

          {/* Palate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2"
          >
            <DetailSection title={t.palate} icon={CircleDot}>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <AttributeRow 
                    label={t.sweetness} 
                    value={translateValue(tasting.palate?.sweetness, language)} 
                  />
                  <AttributeRow 
                    label={t.acidity} 
                    value={translateValue(tasting.palate?.acidity, language)} 
                  />
                </div>
                <div>
                  <AttributeRow 
                    label={t.tannin} 
                    value={translateValue(tasting.palate?.tannin, language)} 
                  />
                  <AttributeRow 
                    label={t.alcohol} 
                    value={translateValue(tasting.palate?.alcohol, language)} 
                  />
                </div>
                <div>
                  <AttributeRow 
                    label={t.body} 
                    value={translateValue(tasting.palate?.body, language)} 
                  />
                  <AttributeRow 
                    label={t.intensity} 
                    value={translateValue(tasting.palate?.intensity, language)} 
                  />
                </div>
                <div>
                  <AttributeRow 
                    label={t.finish} 
                    value={translateValue(tasting.palate?.finish, language)} 
                  />
                </div>
              </div>
              {tasting.palate?.characteristics && (
                <div className="pt-3 border-t border-border/30">
                  <p className="text-sm text-muted-foreground mb-2">{t.flavorChar}</p>
                  <p className="font-accent italic">{tasting.palate.characteristics}</p>
                </div>
              )}
            </DetailSection>
          </motion.div>

          {/* Conclusion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2"
          >
            <DetailSection title={t.conclusions} icon={Star}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-sm">
                  <p className="text-sm text-muted-foreground mb-1">{t.quality}</p>
                  <p className="font-serif text-xl font-semibold text-wine-600">
                    {language === 'pt' ? qualityInfo.pt : qualityInfo.en}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-sm">
                  <p className="text-sm text-muted-foreground mb-1">{t.readiness}</p>
                  <p className="font-serif text-xl font-semibold">
                    {readinessLabels[tasting.conclusion?.readiness]?.[language] || '-'}
                  </p>
                </div>
              </div>
            </DetailSection>
          </motion.div>

          {/* Notes */}
          {tasting.notes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="md:col-span-2"
            >
              <Card className="border-border/40 bg-wine-500/5">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">{t.additionalNotes}</p>
                  <p className="font-accent italic text-lg leading-relaxed">
                    "{tasting.notes}"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.deleteDesc}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                {t.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default TastingDetailPage;

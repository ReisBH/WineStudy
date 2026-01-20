import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Wine, Trash2, Calendar, MapPin, 
  Eye, Droplet, GlassWater, Star, Clock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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
  poor: { pt: 'Insatisfatório', en: 'Poor', color: 'bg-red-500/10 text-red-600' },
  acceptable: { pt: 'Aceitável', en: 'Acceptable', color: 'bg-orange-500/10 text-orange-600' },
  good: { pt: 'Bom', en: 'Good', color: 'bg-green-500/10 text-green-600' },
  veryGood: { pt: 'Muito Bom', en: 'Very Good', color: 'bg-blue-500/10 text-blue-600' },
  outstanding: { pt: 'Excepcional', en: 'Outstanding', color: 'bg-gold-500/10 text-gold-600' },
};

const readinessLabels = {
  drink_now: { pt: 'Beber agora', en: 'Drink now' },
  can_age: { pt: 'Pode guardar', en: 'Can age' },
  needs_aging: { pt: 'Precisa envelhecer', en: 'Needs aging' },
  past_peak: { pt: 'Passou do ponto', en: 'Past peak' },
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
    <span className="font-medium capitalize">{value}</span>
  </div>
);

const AromaList = ({ aromas, title }) => (
  aromas && aromas.length > 0 && (
    <div className="mt-3">
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {aromas.map((aroma, i) => (
          <Badge key={i} variant="secondary" className="bg-wine-500/10 text-wine-600">
            {aroma}
          </Badge>
        ))}
      </div>
    </div>
  )
);

const TastingDetailPage = () => {
  const { tastingId } = useParams();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [tasting, setTasting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

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
          toast.error('Degustação não encontrada');
          navigate('/tasting');
        }
      } catch (error) {
        console.error('Error fetching tasting:', error);
        toast.error('Erro ao carregar degustação');
      } finally {
        setLoading(false);
      }
    };

    fetchTasting();
  }, [tastingId, isAuthenticated, navigate]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/tastings/${tastingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Degustação excluída');
        navigate('/tasting');
      } else {
        toast.error('Erro ao excluir');
      }
    } catch (error) {
      toast.error('Erro ao excluir degustação');
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
          <GlassWater className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Degustação não encontrada</p>
          <Link to="/tasting">
            <Button className="mt-4">Voltar às degustações</Button>
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
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold mb-2" data-testid="tasting-wine-name">
                {tasting.wine_name}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                {tasting.vintage && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {tasting.vintage}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(tasting.created_at).toLocaleDateString('pt-BR')}
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
            <DetailSection title={t('tasting.appearance.title')} icon={Eye}>
              <AttributeRow 
                label={t('tasting.appearance.intensity')} 
                value={tasting.appearance?.intensity || '-'} 
              />
              <AttributeRow 
                label={t('tasting.appearance.color')} 
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
            <DetailSection title={t('tasting.nose.title')} icon={Droplet}>
              <AttributeRow 
                label={t('tasting.nose.condition')} 
                value={tasting.nose?.condition || 'clean'} 
              />
              <AttributeRow 
                label={t('tasting.nose.intensity')} 
                value={tasting.nose?.intensity || '-'} 
              />
              <AromaList 
                aromas={tasting.nose?.aromas} 
                title={t('tasting.nose.aromas')} 
              />
            </DetailSection>
          </motion.div>

          {/* Palate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2"
          >
            <DetailSection title={t('tasting.palate.title')} icon={GlassWater}>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <AttributeRow 
                    label={t('tasting.palate.sweetness')} 
                    value={tasting.palate?.sweetness || '-'} 
                  />
                  <AttributeRow 
                    label={t('tasting.palate.acidity')} 
                    value={tasting.palate?.acidity || '-'} 
                  />
                </div>
                <div>
                  <AttributeRow 
                    label={t('tasting.palate.tannin')} 
                    value={tasting.palate?.tannin || '-'} 
                  />
                  <AttributeRow 
                    label={t('tasting.palate.body')} 
                    value={tasting.palate?.body || '-'} 
                  />
                </div>
                <div>
                  <AttributeRow 
                    label={t('tasting.palate.alcohol')} 
                    value={tasting.palate?.alcohol || '-'} 
                  />
                  <AttributeRow 
                    label={t('tasting.palate.finish')} 
                    value={tasting.palate?.finish || '-'} 
                  />
                </div>
              </div>
              <AromaList 
                aromas={tasting.palate?.flavors} 
                title={t('tasting.palate.flavors')} 
              />
            </DetailSection>
          </motion.div>

          {/* Conclusion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2"
          >
            <DetailSection title={t('tasting.conclusion.title')} icon={Star}>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-sm">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('tasting.conclusion.quality')}
                  </p>
                  <p className="font-serif text-xl font-semibold text-wine-600">
                    {language === 'pt' ? qualityInfo.pt : qualityInfo.en}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-sm">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('tasting.conclusion.agingPotential')}
                  </p>
                  <p className="font-serif text-xl font-semibold capitalize">
                    {tasting.conclusion?.aging_potential?.replace(/_/g, ' ') || '-'}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-sm">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('tasting.conclusion.readiness')}
                  </p>
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
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('tasting.notes')}
                  </p>
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
              <AlertDialogTitle>Excluir degustação?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A degustação de "{tasting.wine_name}" será permanentemente removida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default TastingDetailPage;

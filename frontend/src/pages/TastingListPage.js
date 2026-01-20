import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wine, Plus, Clock, Trash2, Eye, GlassWater,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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

const qualityColors = {
  poor: 'bg-red-500/10 text-red-600',
  acceptable: 'bg-orange-500/10 text-orange-600',
  good: 'bg-green-500/10 text-green-600',
  very_good: 'bg-blue-500/10 text-blue-600',
  veryGood: 'bg-blue-500/10 text-blue-600',
  outstanding: 'bg-gold-500/10 text-gold-600',
};

const qualityLabels = {
  poor: { pt: 'Deficiente', en: 'Poor' },
  acceptable: { pt: 'Aceitável', en: 'Acceptable' },
  good: { pt: 'Bom', en: 'Good' },
  very_good: { pt: 'Muito Bom', en: 'Very Good' },
  outstanding: { pt: 'Excepcional', en: 'Outstanding' },
};

const TastingCard = ({ tasting, onDelete, language }) => {
  const quality = tasting.conclusion?.quality || 'good';
  const qualityLabel = qualityLabels[quality] || qualityLabels.good;
  
  return (
    <Card className="wine-card border-border/40">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-wine-500/10 rounded-sm flex items-center justify-center flex-shrink-0">
              <GlassWater className="w-6 h-6 text-wine-500" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-lg">{tasting.wine_name}</h3>
              <p className="text-sm text-muted-foreground">
                {tasting.producer && `${tasting.producer} • `}
                {tasting.vintage && `${tasting.vintage} • `}
                {tasting.region && `${tasting.region} • `}
                {new Date(tasting.created_at).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-sm text-xs font-medium ${qualityColors[quality] || qualityColors.good}`}>
            {language === 'pt' ? qualityLabel.pt : qualityLabel.en}
          </span>
        </div>
        
        {tasting.notes && (
          <p className="mt-4 text-sm text-muted-foreground line-clamp-2 font-accent italic">
            "{tasting.notes}"
          </p>
        )}
        
        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
          <Link to={`/tasting/${tasting.tasting_id}`}>
            <Button variant="ghost" size="sm" className="text-wine-500">
              <Eye className="w-4 h-4 mr-1" />
              {language === 'pt' ? 'Ver' : 'View'}
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-600"
            onClick={() => onDelete(tasting.tasting_id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const TastingListPage = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [tastings, setTastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchTastings = async () => {
      try {
        const res = await fetch(`${API}/tastings`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setTastings(data);
        }
      } catch (error) {
        console.error('Error fetching tastings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTastings();
  }, [isAuthenticated, navigate]);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const res = await fetch(`${API}/tastings/${deleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (res.ok) {
        setTastings(prev => prev.filter(t => t.tasting_id !== deleteId));
        toast.success('Degustação excluída');
      }
    } catch (error) {
      toast.error('Erro ao excluir');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
              {t('tasting.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('tasting.subtitle')}
            </p>
          </div>
          <Link to="/tasting/new">
            <Button 
              data-testid="new-tasting-button"
              className="bg-wine-500 hover:bg-wine-600 text-white rounded-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('tasting.newTasting')}
            </Button>
          </Link>
        </motion.div>

        {/* Tastings List */}
        {loading ? (
          <div className="text-center py-20">
            <Wine className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : tastings.length > 0 ? (
          <div className="space-y-4">
            {tastings.map((tasting, index) => (
              <motion.div
                key={tasting.tasting_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TastingCard 
                  tasting={tasting} 
                  onDelete={(id) => setDeleteId(id)}
                  language={language}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Wine className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6" />
            <h3 className="font-serif text-xl font-semibold mb-2">
              {t('tasting.noTastings')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {t('tasting.noTastingsDescription')}
            </p>
            <Link to="/tasting/new">
              <Button className="bg-wine-500 hover:bg-wine-600 text-white rounded-sm">
                <Plus className="w-4 h-4 mr-2" />
                {t('tasting.firstTasting')}
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('tasting.deleteTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('tasting.deleteDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                {t('common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default TastingListPage;

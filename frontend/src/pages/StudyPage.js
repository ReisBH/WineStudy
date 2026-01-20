import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Play, CheckCircle, Clock, ChevronRight, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const levelColors = {
  basic: 'bg-green-500',
  intermediate: 'bg-gold-500',
  advanced: 'bg-wine-500',
};

const levelLabels = {
  basic: { pt: 'Básico', en: 'Basic' },
  intermediate: { pt: 'Intermediário', en: 'Intermediate' },
  advanced: { pt: 'Avançado', en: 'Advanced' },
};

const TrackCard = ({ track, progress, language, delay }) => {
  const completedLessons = progress?.completed_lessons || [];
  const trackLessonsCompleted = completedLessons.filter(l => l.startsWith(track.level)).length;
  const progressPercent = (trackLessonsCompleted / track.lessons_count) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="wine-card border-border/40 overflow-hidden h-full">
        <div className="relative h-48">
          {track.image_url ? (
            <img 
              src={track.image_url}
              alt={language === 'pt' ? track.title_pt : track.title_en}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-wine-500/10 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-wine-500/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute top-4 left-4">
            <Badge className={`${levelColors[track.level]} text-white`}>
              {levelLabels[track.level][language]}
            </Badge>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="font-serif text-xl font-bold">
              {language === 'pt' ? track.title_pt : track.title_en}
            </h3>
          </div>
        </div>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'pt' ? track.description_pt : track.description_en}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {track.lessons_count} lições
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              ~{track.lessons_count * 12} min
            </span>
          </div>

          {progressPercent > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{trackLessonsCompleted}/{track.lessons_count}</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}

          <Link to={`/study/${track.track_id}`}>
            <Button 
              data-testid={`start-track-${track.track_id}`}
              className="w-full bg-wine-500 hover:bg-wine-600 text-white rounded-sm"
            >
              {progressPercent > 0 ? 'Continuar' : 'Começar'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StudyPage = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tracksRes = await fetch(`${API}/study/tracks`);
        if (tracksRes.ok) {
          const data = await tracksRes.json();
          setTracks(data);
        }

        if (isAuthenticated) {
          const progressRes = await fetch(`${API}/progress`, { credentials: 'include' });
          if (progressRes.ok) {
            const data = await progressRes.json();
            setProgress(data);
          }
        }
      } catch (error) {
        console.error('Error fetching study data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Sort tracks by level
  const sortedTracks = [...tracks].sort((a, b) => {
    const order = { basic: 0, intermediate: 1, advanced: 2 };
    return order[a.level] - order[b.level];
  });

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
            {t('study.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('study.subtitle')}
          </p>
        </motion.div>

        {/* Progress Overview */}
        {isAuthenticated && progress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <Card className="border-border/40 bg-wine-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold mb-1">Seu Progresso</h3>
                    <p className="text-muted-foreground">
                      {progress.completed_lessons?.length || 0} lições completadas
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {progress.badges?.slice(0, 3).map((badge, i) => (
                      <span key={i} className="text-2xl">{badge}</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Study Tracks */}
        {loading ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTracks.map((track, index) => (
              <TrackCard 
                key={track.track_id} 
                track={track} 
                progress={progress}
                language={language}
                delay={index * 0.1}
              />
            ))}
          </div>
        )}

        {/* Learning Path Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="font-serif">Como funciona o aprendizado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Comece pelo Básico</h4>
                    <p className="text-sm text-muted-foreground">
                      Aprenda os fundamentos do vinho: tipos, castas e como ler rótulos.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gold-500/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Aprofunde o Conhecimento</h4>
                    <p className="text-sm text-muted-foreground">
                      Explore terroir, regiões clássicas e métodos de produção.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-wine-500/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-wine-500" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Teste e Pratique</h4>
                    <p className="text-sm text-muted-foreground">
                      Faça quizzes e registre degustações para consolidar o aprendizado.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudyPage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, ChevronRight, ChevronLeft, Brain } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LessonPage = () => {
  const { trackId, lessonId } = useParams();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lessonsRes = await fetch(`${API}/study/tracks/${trackId}/lessons`);
        if (lessonsRes.ok) {
          const data = await lessonsRes.json();
          setLessons(data);
          
          if (lessonId) {
            const lesson = data.find(l => l.lesson_id === lessonId);
            setCurrentLesson(lesson);
          } else if (data.length > 0) {
            setCurrentLesson(data[0]);
          }
        }

        if (isAuthenticated) {
          const progressRes = await fetch(`${API}/progress`, { credentials: 'include' });
          if (progressRes.ok) {
            const data = await progressRes.json();
            setProgress(data);
          }
        }
      } catch (error) {
        console.error('Error fetching lesson data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trackId, lessonId, isAuthenticated]);

  const currentIndex = lessons.findIndex(l => l.lesson_id === currentLesson?.lesson_id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const isCompleted = progress?.completed_lessons?.includes(currentLesson?.lesson_id);

  const handleComplete = async () => {
    if (!isAuthenticated) {
      toast.error(language === 'pt' ? 'Faça login para salvar seu progresso' : 'Login to save your progress');
      return;
    }

    try {
      const res = await fetch(`${API}/study/lessons/${currentLesson.lesson_id}/complete`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        setProgress(prev => ({
          ...prev,
          completed_lessons: [...(prev?.completed_lessons || []), currentLesson.lesson_id]
        }));
        toast.success(language === 'pt' ? 'Lição concluída!' : 'Lesson completed!');
        
        if (nextLesson) {
          navigate(`/study/${trackId}/${nextLesson.lesson_id}`);
        }
      }
    } catch (error) {
      toast.error(language === 'pt' ? 'Erro ao salvar progresso' : 'Error saving progress');
    }
  };

  const navigateToLesson = (lesson) => {
    setCurrentLesson(lesson);
    navigate(`/study/${trackId}/${lesson.lesson_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-wine-500/20 rounded-sm mx-auto mb-4 animate-pulse flex items-center justify-center">
            <Brain className="w-8 h-8 text-wine-500" />
          </div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            {language === 'pt' ? 'Lição não encontrada' : 'Lesson not found'}
          </p>
          <Link to="/study">
            <Button variant="link" className="text-wine-500 mt-2">
              {t('quiz.backToStudy')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = lessons.filter(l => 
    progress?.completed_lessons?.includes(l.lesson_id)
  ).length;

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/study" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm text-muted-foreground">
                {t('study.lesson')} {currentIndex + 1} {language === 'pt' ? 'de' : 'of'} {lessons.length}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">
                {language === 'pt' ? currentLesson.title_pt : currentLesson.title_en}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{currentLesson.duration_minutes} {t('study.minutes')}</span>
            </div>
          </div>

          <Progress value={(completedCount / lessons.length) * 100} className="h-2" />
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Lesson List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="border-border/40 sticky top-24">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3 text-sm">Lições</h3>
                <div className="space-y-1">
                  {lessons.map((lesson, index) => {
                    const isActive = lesson.lesson_id === currentLesson.lesson_id;
                    const isLessonCompleted = progress?.completed_lessons?.includes(lesson.lesson_id);
                    
                    return (
                      <button
                        key={lesson.lesson_id}
                        onClick={() => navigateToLesson(lesson)}
                        className={`w-full text-left px-3 py-2 rounded-sm text-sm flex items-center gap-2 transition-colors ${
                          isActive 
                            ? 'bg-wine-500 text-white' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        {isLessonCompleted ? (
                          <CheckCircle className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-green-500'}`} />
                        ) : (
                          <span className={`w-4 h-4 flex-shrink-0 rounded-full border text-xs flex items-center justify-center ${
                            isActive ? 'border-white text-white' : 'border-muted-foreground'
                          }`}>
                            {index + 1}
                          </span>
                        )}
                        <span className="truncate">
                          {language === 'pt' ? lesson.title_pt : lesson.title_en}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Card className="border-border/40">
              <CardContent className="p-8">
                {/* Lesson Content */}
                <div className="prose prose-wine max-w-none">
                  <div 
                    className="whitespace-pre-wrap text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: (language === 'pt' ? currentLesson.content_pt : currentLesson.content_en)
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br />')
                    }}
                  />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                  <div>
                    {prevLesson && (
                      <Button
                        variant="outline"
                        onClick={() => navigateToLesson(prevLesson)}
                        className="rounded-sm"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Anterior
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    {!isCompleted && isAuthenticated && (
                      <Button
                        data-testid="complete-lesson-button"
                        onClick={handleComplete}
                        className="bg-wine-500 hover:bg-wine-600 text-white rounded-sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como Concluída
                      </Button>
                    )}
                    
                    {nextLesson && (
                      <Button
                        onClick={() => navigateToLesson(nextLesson)}
                        className="bg-wine-500 hover:bg-wine-600 text-white rounded-sm"
                      >
                        Próxima
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                    
                    {!nextLesson && (
                      <Link to={`/quiz?track=${trackId}`}>
                        <Button className="bg-gold-500 hover:bg-gold-600 text-white rounded-sm">
                          <Brain className="w-4 h-4 mr-2" />
                          Fazer Quiz
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;

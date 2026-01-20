import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Wine, BookOpen, GlassWater, Trophy, Flame, 
  ArrowRight, Plus, Globe, Brain
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="wine-card border-border/40">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-sm flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-serif font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const QuickActionCard = ({ icon: Icon, title, description, to, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Link to={to}>
      <Card className="wine-card border-border/40 h-full group cursor-pointer">
        <CardContent className="p-6">
          <div className="w-10 h-10 bg-wine-500/10 rounded-sm flex items-center justify-center mb-4 group-hover:bg-wine-500/20 transition-colors">
            <Icon className="w-5 h-5 text-wine-500" />
          </div>
          <h3 className="font-serif font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
);

const DashboardPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [recentTastings, setRecentTastings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, tastingsRes] = await Promise.all([
          fetch(`${API}/progress`, { credentials: 'include' }),
          fetch(`${API}/tastings`, { credentials: 'include' }),
        ]);

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setProgress(progressData);
        }

        if (tastingsRes.ok) {
          const tastingsData = await tastingsRes.json();
          setRecentTastings(tastingsData.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const lessonsCompleted = progress?.completed_lessons?.length || 0;
  const totalTastings = progress?.total_tastings || 0;
  const quizScore = Object.values(progress?.quiz_scores || {}).reduce((a, b) => a + b, 0);
  const streak = progress?.current_streak || 0;

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
            {t('dashboard.welcome')}, {user?.name?.split(' ')[0] || 'Wine Lover'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'pt' ? 'Continue sua jornada no mundo do vinho' : 'Continue your journey in the world of wine'}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={BookOpen}
            label={t('dashboard.lessonsCompleted')}
            value={lessonsCompleted}
            color="bg-wine-500"
            delay={0.1}
          />
          <StatCard
            icon={Wine}
            label={t('dashboard.tastingsRecorded')}
            value={totalTastings}
            color="bg-gold-500"
            delay={0.2}
          />
          <StatCard
            icon={Trophy}
            label={t('dashboard.quizScore')}
            value={quizScore}
            color="bg-paper-600"
            delay={0.3}
          />
          <StatCard
            icon={Flame}
            label={`${t('dashboard.streak')} (${t('dashboard.days')})`}
            value={streak}
            color="bg-wine-600"
            delay={0.4}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Studying */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-border/40 overflow-hidden">
                <div className="relative h-48">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1474722883778-792e7990302f)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-wine-900/90 to-wine-900/60" />
                  </div>
                  <div className="relative h-full p-6 flex flex-col justify-between text-white">
                    <div>
                      <span className="text-wine-200 text-sm font-medium">Trilha Atual</span>
                      <h3 className="font-serif text-2xl font-bold mt-1">Fundamentos do Vinho</h3>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progresso</span>
                        <span>{lessonsCompleted}/5 lições</span>
                      </div>
                      <Progress value={(lessonsCompleted / 5) * 100} className="h-2 bg-wine-800" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <Link to="/study">
                    <Button 
                      data-testid="continue-study-button"
                      className="w-full bg-wine-500 hover:bg-wine-600 text-white rounded-sm"
                    >
                      {t('dashboard.continueStudy')}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Tastings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-border/40">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-serif text-xl">{t('dashboard.recentTastings')}</CardTitle>
                  <Link to="/tasting">
                    <Button variant="ghost" size="sm" className="text-wine-500 hover:text-wine-600">
                      Ver todas
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {recentTastings.length > 0 ? (
                    <div className="space-y-4">
                      {recentTastings.map((tasting, index) => (
                        <div 
                          key={tasting.tasting_id}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-wine-500/10 rounded-sm flex items-center justify-center">
                              <GlassWater className="w-5 h-5 text-wine-500" />
                            </div>
                            <div>
                              <p className="font-medium">{tasting.wine_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {tasting.vintage && `${tasting.vintage} • `}
                                {new Date(tasting.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {tasting.conclusion?.quality || '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <GlassWater className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Nenhuma degustação ainda</p>
                      <Link to="/tasting/new">
                        <Button variant="link" className="text-wine-500 mt-2">
                          Registrar primeira degustação
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold mb-4">{t('dashboard.quickActions')}</h3>
            <QuickActionCard
              icon={Plus}
              title={t('dashboard.newTasting')}
              description="Registre uma nova degustação"
              to="/tasting/new"
              delay={0.7}
            />
            <QuickActionCard
              icon={GlassWater}
              title={t('dashboard.exploreGrapes')}
              description="Descubra novas castas"
              to="/grapes"
              delay={0.8}
            />
            <QuickActionCard
              icon={Globe}
              title="Explorar Atlas"
              description="Navegue pelas regiões"
              to="/atlas"
              delay={0.9}
            />
            <QuickActionCard
              icon={Brain}
              title={t('dashboard.takeQuiz')}
              description="Teste seus conhecimentos"
              to="/quiz"
              delay={1.0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wine, BookOpen, Globe, GlassWater, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="wine-card bg-card border border-border/40 p-8 rounded-sm group"
  >
    <div className="w-12 h-12 bg-wine-500/10 rounded-sm flex items-center justify-center mb-6 group-hover:bg-wine-500/20 transition-colors">
      <Icon className="w-6 h-6 text-wine-500" />
    </div>
    <h3 className="font-serif text-xl font-semibold mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

const LandingPage = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();

  // Country labels with translations
  const countries = language === 'pt' 
    ? ['🇫🇷 França', '🇮🇹 Itália', '🇪🇸 Espanha', '🇵🇹 Portugal', '🇺🇸 EUA', '🇦🇷 Argentina']
    : ['🇫🇷 France', '🇮🇹 Italy', '🇪🇸 Spain', '🇵🇹 Portugal', '🇺🇸 USA', '🇦🇷 Argentina'];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1619525163217-996bd4c1eb92?crop=entropy&cs=srgb&fm=jpg&q=85)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-wine-500/10 border border-wine-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-wine-500" />
              <span className="text-sm text-wine-600 dark:text-wine-400 font-medium">
                {language === 'pt' ? 'Sistemática WSET' : 'WSET Systematic Approach'}
              </span>
            </div>
            
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground">
              {t('landing.hero.title')}
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                <Button 
                  data-testid="hero-cta-button"
                  className="bg-wine-500 hover:bg-wine-600 text-white rounded-sm px-8 py-6 text-base font-serif tracking-wide"
                >
                  {t('landing.hero.cta')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/atlas">
                <Button 
                  data-testid="hero-secondary-button"
                  variant="outline" 
                  className="border-wine-500/30 hover:bg-wine-500/5 text-wine-700 dark:text-wine-300 rounded-sm px-8 py-6 text-base font-serif tracking-wide"
                >
                  {t('landing.hero.ctaSecondary')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-wine-500/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 bg-wine-500 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-paper-100/50 dark:bg-paper-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              {t('landing.features.sectionTitle')} <span className="text-wine-500">Wine</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t('landing.features.sectionSubtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Globe}
              title={t('landing.features.atlas.title')}
              description={t('landing.features.atlas.description')}
              delay={0.1}
            />
            <FeatureCard
              icon={BookOpen}
              title={t('landing.features.study.title')}
              description={t('landing.features.study.description')}
              delay={0.2}
            />
            <FeatureCard
              icon={Wine}
              title={t('landing.features.tasting.title')}
              description={t('landing.features.tasting.description')}
              delay={0.3}
            />
            <FeatureCard
              icon={GlassWater}
              title={t('landing.features.grapes.title')}
              description={t('landing.features.grapes.description')}
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* World Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-wine-500 font-serif text-sm tracking-wider uppercase mb-4 block">
                {t('landing.world.sectionLabel')}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6">
                {t('landing.world.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {t('landing.world.description')}
              </p>
              <div className="flex flex-wrap gap-3">
                {countries.map((country) => (
                  <span 
                    key={country}
                    className="px-4 py-2 bg-paper-200 dark:bg-paper-800 rounded-sm text-sm"
                  >
                    {country}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-sm overflow-hidden shadow-soft">
                <img 
                  src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt={language === 'pt' ? 'Vinhedo' : 'Vineyard'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card border border-border/40 p-4 rounded-sm shadow-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-wine-500 rounded-sm flex items-center justify-center">
                    <Wine className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">+80 {t('landing.world.grapesCount')}</p>
                    <p className="text-sm text-muted-foreground">{t('landing.world.cataloged')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-wine-500 dark:bg-wine-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-6">
              {t('landing.cta.title')}
            </h2>
            <p className="text-wine-100 text-lg mb-10 max-w-xl mx-auto">
              {t('landing.cta.description')}
            </p>
            <Link to={isAuthenticated ? "/dashboard" : "/register"}>
              <Button 
                data-testid="cta-section-button"
                className="bg-white hover:bg-paper-100 text-wine-600 rounded-sm px-10 py-6 text-base font-serif tracking-wide"
              >
                {t('landing.cta.button')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

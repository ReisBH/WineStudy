import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wine, Globe, GlassWater, BookOpen, Menu, X, 
  User, LogOut, Moon, Sun, Languages, Factory
} from 'lucide-react';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { href: '/atlas', label: t('nav.atlas'), icon: Globe },
    { href: '/grapes', label: t('nav.grapes'), icon: GlassWater },
    { href: '/production', label: language === 'pt' ? 'Produção' : 'Production', icon: Factory },
    { href: '/study', label: t('nav.study'), icon: BookOpen },
    { href: '/tasting', label: t('nav.tasting'), icon: Wine },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  // Don't show navbar on auth pages
  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 glass border-b border-border/40"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-wine-500 rounded-sm flex items-center justify-center">
            <Wine className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-xl font-bold hidden sm:block">WineStudy</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button
                variant="ghost"
                className={`rounded-sm ${
                  isActive(link.href) 
                    ? 'bg-wine-500/10 text-wine-600 dark:text-wine-400' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <link.icon className="w-4 h-4 mr-2" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="rounded-sm"
            data-testid="language-toggle"
          >
            <Languages className="w-5 h-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-sm"
            data-testid="theme-toggle"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* User Menu or Auth Buttons */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-sm gap-2" data-testid="user-menu-button">
                  {user?.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-500 cursor-pointer"
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" className="rounded-sm" data-testid="login-button">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-wine-500 hover:bg-wine-600 text-white rounded-sm" data-testid="register-button">
                  {t('nav.register')}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-serif text-xl font-bold">Menu</span>
                </div>
                
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Link to={link.href}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start rounded-sm ${
                            isActive(link.href) 
                              ? 'bg-wine-500/10 text-wine-600' 
                              : ''
                          }`}
                        >
                          <link.icon className="w-4 h-4 mr-3" />
                          {link.label}
                        </Button>
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-border">
                  {!isAuthenticated && (
                    <div className="flex flex-col gap-2">
                      <SheetClose asChild>
                        <Link to="/login">
                          <Button variant="outline" className="w-full rounded-sm">
                            {t('nav.login')}
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/register">
                          <Button className="w-full bg-wine-500 hover:bg-wine-600 text-white rounded-sm">
                            {t('nav.register')}
                          </Button>
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
};

export const Footer = () => {
  const { t, language } = useLanguage();
  
  return (
    <footer className="border-t border-border/40 bg-muted/30 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-wine-500 rounded-sm flex items-center justify-center">
                <Wine className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif text-lg font-bold">WineStudy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'pt' 
                ? 'Sua plataforma completa para aprender sobre vinhos.'
                : 'Your complete platform for learning about wines.'}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">
              {language === 'pt' ? 'Navegação' : 'Navigation'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/atlas" className="hover:text-foreground">{t('nav.atlas')}</Link></li>
              <li><Link to="/grapes" className="hover:text-foreground">{t('nav.grapes')}</Link></li>
              <li><Link to="/study" className="hover:text-foreground">{t('nav.study')}</Link></li>
              <li><Link to="/tasting" className="hover:text-foreground">{t('nav.tasting')}</Link></li>
            </ul>
          </div>

          {/* Study */}
          <div>
            <h4 className="font-semibold mb-4">
              {language === 'pt' ? 'Estudar' : 'Study'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/study/basic" className="hover:text-foreground">{t('study.basic')}</Link></li>
              <li><Link to="/study/intermediate" className="hover:text-foreground">{t('study.intermediate')}</Link></li>
              <li><Link to="/study/advanced" className="hover:text-foreground">{t('study.advanced')}</Link></li>
              <li><Link to="/quiz" className="hover:text-foreground">Quiz</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">
              {language === 'pt' ? 'Recursos' : 'Resources'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-pointer hover:text-foreground">WSET SAT</span></li>
              <li><span className="cursor-pointer hover:text-foreground">{language === 'pt' ? 'Glossário' : 'Glossary'}</span></li>
              <li><span className="cursor-pointer hover:text-foreground">{language === 'pt' ? 'Harmonização' : 'Food Pairing'}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} WineStudy. {language === 'pt' ? 'Todos os direitos reservados.' : 'All rights reserved.'}
          </p>
          <p className="text-sm text-muted-foreground font-accent italic">
            "In vino veritas"
          </p>
        </div>
      </div>
    </footer>
  );
};

// Noise Overlay Component
export const NoiseOverlay = () => (
  <div className="noise-overlay" aria-hidden="true" />
);

// Layout Component
export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <NoiseOverlay />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Coffee, Monitor, ArrowRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleDemoAdmin = () => {
    // We navigate to login on landing page demo clicks
    navigate('/login');
  };

  const featurePills = [
    t('landing.features.multi'),
    t('landing.features.capacity'),
    t('landing.features.waitlist'),
    t('landing.features.rules'),
    t('landing.features.mobile'),
  ];

  const useCases = [
    { icon: BookOpen, title: t('landing.cases.edu_title'), desc: t('landing.cases.edu_desc') },
    { icon: Coffee, title: t('landing.cases.cafe_title'), desc: t('landing.cases.cafe_desc') },
    { icon: Monitor, title: t('landing.cases.desk_title'), desc: t('landing.cases.desk_desc') },
    { icon: Building2, title: t('landing.cases.room_title'), desc: t('landing.cases.room_desc') },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <div className="h-[60px] bg-card/80 border-b border-border flex items-center px-5 gap-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="font-display font-extrabold text-xl tracking-tight shrink-0">
          <span className="bg-gradient-to-br from-primary to-accent3 bg-clip-text text-transparent">Mekan Ayarla</span>
          <span className="block text-muted-foreground font-normal text-xs tracking-wider uppercase mt-[-2px]">
            Platform
          </span>
        </div>
        <div className="flex-1" />
        <button
          onClick={toggleLanguage}
          className="text-xs font-bold px-2 py-1 bg-secondary rounded-md hover:bg-secondary/80 text-muted-foreground mr-1"
        >
          {i18n.language === 'tr' ? 'EN' : 'TR'}
        </button>
        <Button variant="ghost" className="hidden sm:flex text-sm text-muted-foreground border border-transparent hover:border-border hover:bg-secondary" size="sm" onClick={() => navigate('/login')}>
          {t('auth.sign_in_btn')}
        </Button>
        <Button size="sm" className="shadow-lg shadow-primary/20 text-sm font-semibold rounded-lg" onClick={() => navigate('/register')}>
          {t('landing.start_free')}
        </Button>
      </div>

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative pt-24 border-b border-border pb-20 px-6 text-center text-foreground flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(108,99,255,0.12)_0%,transparent_70%)]">

          {/* Subtle Grid Background replacing SVGs */}
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(var(--border2) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

          <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-accent3 mb-8 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Sparkles className="w-3.5 h-3.5" />
              {t('landing.badge')}
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
              {t('landing.title_1')}<br />
              <span className="bg-gradient-to-br from-primary to-accent3 bg-clip-text text-transparent">
                {t('landing.title_2')}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              {t('landing.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button size="lg" className="text-base rounded-xl h-14 px-8 shadow-xl shadow-primary/30 font-semibold w-full sm:w-auto" onClick={() => navigate('/register')}>
                {t('landing.start_free')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="secondary" className="text-base rounded-xl h-14 border border-border w-full sm:w-auto hover:bg-secondary/80 font-semibold" onClick={handleDemoAdmin}>
                {t('landing.view_admin')}
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-14 max-w-3xl">
              {featurePills.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-sm text-muted-foreground shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-xl font-bold text-muted-foreground tracking-tight">
              {t('landing.cases_title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map((caseItem, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4 text-foreground shadow-inner">
                  <caseItem.icon className="w-7 h-7 opacity-80" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{caseItem.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {caseItem.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center py-10 text-sm text-muted-foreground/60 border-t border-border bg-card/30">
        © 2026 MekanAyarla.com • Built with ♥ for multi-tenant SaaS
      </footer>
    </div>
  );
}

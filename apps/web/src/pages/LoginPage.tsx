import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,rgba(108,99,255,0.08)_0%,var(--background)_70%)]">
      <div className="w-full max-w-[400px] mb-12 fade-in">
        <div className="text-center mb-8">
          <div className="font-display font-extrabold text-3xl tracking-tight mb-2">
            <span className="bg-gradient-to-br from-primary to-accent3 bg-clip-text text-transparent">Mekan Ayarla</span>
          </div>
          <p className="text-[0.875rem] text-muted-foreground">{t('auth.login_title')}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 border border-destructive/20">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('auth.username') || 'Username'}</label>
              <Input
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 bg-secondary/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-[0.9rem]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('auth.password')}</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-secondary/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-[0.9rem]"
              />
            </div>

            <Button
              className="w-full h-11 text-[0.9rem] font-semibold mt-2 shadow-lg shadow-primary/20"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('auth.sign_in_btn')}
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>

            <div className="text-center text-[0.82rem] text-muted-foreground mt-2">
              {t('auth.no_account')} <Link to="/register" className="text-accent2 hover:text-accent font-medium">{t('auth.sign_up_btn')}</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

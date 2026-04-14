import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowRight } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'BUSINESS_ADMIN',
    organizationName: '',
  });
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    try {
      const res = await fetchApi(`/auth/check-username?username=${username}`);
      setUsernameStatus(res.available ? 'available' : 'taken');
    } catch (err) {
      setUsernameStatus('idle');
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkUsername(formData.username);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setFormData({ ...formData, username: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (usernameStatus === 'taken') {
        throw new Error('Username is already taken');
      }
      if (formData.role === 'BUSINESS_ADMIN' && !formData.organizationName) {
        throw new Error('Organization name is required for business accounts');
      }

      const { user } = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setUser(user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,rgba(108,99,255,0.08)_0%,var(--background)_70%)]">
      <div className="w-full max-w-[420px] mb-12 fade-in">
        <div className="text-center mb-8">
          <div className="font-display font-extrabold text-3xl tracking-tight mb-2">
            <span className="bg-gradient-to-br from-primary to-accent3 bg-clip-text text-transparent">Mekan Ayarla</span>
          </div>
          <p className="text-[0.875rem] text-muted-foreground">{t('auth.register_title')}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 border border-destructive/20">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('auth.account_type')}</label>
              <select
                className="h-11 bg-secondary/50 border border-border rounded-md px-3 py-2 text-[0.9rem] text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <option value="CUSTOMER">{t('auth.type_customer')}</option>
                <option value="BUSINESS_ADMIN">{t('auth.type_business')}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('auth.username') || 'Username'}</label>
              <div className="relative">
                <Input
                  placeholder={t('auth.username_placeholder')}
                  value={formData.username}
                  onChange={handleUsernameChange}
                  required
                  className={`h-11 bg-secondary/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-[0.9rem] pr-10 ${usernameStatus === 'available' ? 'border-success/50' : usernameStatus === 'taken' ? 'border-destructive/50' : ''
                    }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
                  {usernameStatus === 'available' && <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" title="Available" />}
                  {usernameStatus === 'taken' && <div className="w-2 h-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" title="Taken" />}
                </div>
              </div>
              {usernameStatus === 'taken' && <span className="text-[0.65rem] text-destructive font-medium ml-1">This username is already taken</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('auth.full_name')}</label>
              <Input
                placeholder="Ayşe Kaya"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-11 bg-secondary/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-[0.9rem]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('auth.email')} ({t('common.optional') || 'Optional'})</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11 bg-secondary/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-[0.9rem]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('auth.password')}</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-11 bg-secondary/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-[0.9rem]"
              />
            </div>

            {formData.role === 'BUSINESS_ADMIN' && (
              <div className="flex flex-col gap-1.5 fade-in">
                <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('auth.organization')}</label>
                <Input
                  placeholder={t('auth.ph_organization')}
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  required
                  className="h-11 bg-primary/5 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 text-[0.9rem]"
                />
              </div>
            )}

            <Button
              className="w-full h-11 text-[0.9rem] font-semibold mt-2 shadow-lg shadow-primary/20"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('auth.sign_up_btn')}
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>

            <div className="text-center text-[0.82rem] text-muted-foreground mt-2">
              {t('auth.has_account')} <Link to="/login" className="text-accent2 hover:text-accent font-medium">{t('auth.sign_in_btn')}</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

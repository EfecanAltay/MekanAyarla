import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { LogOut, User } from 'lucide-react';

export function HeaderProfile() {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <div
        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent3 flex items-center justify-center text-xs font-bold font-display text-white cursor-pointer shrink-0 shadow-sm transition-transform hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
      >
        {user?.name?.charAt(0)?.toUpperCase() || '?'}
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg shadow-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-border bg-secondary/30">
            <p className="font-medium text-sm text-foreground truncate">{user?.name || 'Kullanıcı'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
          </div>
          <div className="p-1">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
            >
              <User className="h-4 w-4" />
              {t('nav.profile')}
            </button>
            {/* <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
            >
              <Settings className="h-4 w-4" />
              {t('nav.settings')}
            </button> */}
          </div>
          <div className="h-px bg-border" />
          <div className="p-1">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
            >
              <LogOut className="h-4 w-4" />
              {t('nav.sign_out')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { Calendar, Bookmark, LogOut, Package, Search, X, Menu, Bell, Tag, Building2 } from 'lucide-react';
import { HeaderProfile } from './HeaderProfile';
import { cn } from '../../lib/utils';

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Role based navigation exactly like reference
  const isAdmin = user?.role === 'BUSINESS_ADMIN' || user?.role === 'SUPER_ADMIN';

  const adminItems = [
    { id: '/admin/branches', label: t('admin.branches_title') || 'Branches', icon: Building2 },
    { id: '/admin/resource-types', label: t('admin.resource_types_title') || 'Resource Types', icon: Tag },
    { id: '/resources', label: t('nav.resources'), icon: Package },
    { id: '/schedule', label: t('nav.schedule'), icon: Calendar },
    { id: '/reservations', label: t('nav.my_bookings'), icon: Bookmark },
  ];

  const userItems = [
    { id: '/dashboard', label: t('nav.explore'), icon: Search },
    { id: '/bookings', label: t('nav.my_bookings'), icon: Bookmark },
  ];

  const items = isAdmin ? adminItems : userItems;

  const handleNav = (path: string) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Topbar */}
      <div className="h-[60px] bg-card border-b border-border flex items-center px-5 gap-4 sticky top-0 z-50 backdrop-blur-md">
        <button
          className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => setMobileDrawerOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div
          className="font-display font-extrabold text-xl tracking-tight cursor-pointer shrink-0"
          onClick={() => navigate('/')}
        >
          <span className="bg-gradient-to-br from-primary to-accent3 bg-clip-text text-transparent">Boş Yer Var MI ?</span>
          <span className="block text-muted-foreground font-normal text-xs tracking-wider uppercase mt-[-2px]">
            {isAdmin ? 'Admin' : 'Platform'}
          </span>
        </div>
        <div className="flex-1" />
        {!isAdmin && (
          <nav className="hidden md:flex gap-1">
            {userItems.map(it => (
              <button
                key={it.id}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-sans transition-all text-muted-foreground hover:bg-secondary hover:text-foreground",
                  location.pathname === it.id && "text-accent bg-primary/10 hover:bg-primary/10"
                )}
                onClick={() => navigate(it.id)}
              >
                {it.label}
              </button>
            ))}
          </nav>
        )}
        <button className="hidden md:flex text-muted-foreground hover:text-foreground p-1.5">
          <Bell className="h-4 w-4" />
        </button>
        <HeaderProfile />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        {isAdmin && (
          <aside className="hidden md:flex w-[220px] bg-card border-r border-border p-4 pt-4 flex-col gap-1 overflow-y-auto shrink-0">
            {items.map(it => (
              <button
                key={it.id}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer transition-all text-sm text-left w-full text-muted-foreground border-transparent border hover:bg-secondary hover:text-foreground",
                  location.pathname === it.id && "bg-primary/15 text-accent font-medium border-primary/20"
                )}
                onClick={() => handleNav(it.id)}
              >
                <it.icon className={cn("h-4 w-4 opacity-70", location.pathname === it.id && "opacity-100")} />
                {it.label}
              </button>
            ))}
            <div className="flex-1" />
            <div className="h-px bg-border my-2" />
            <button
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer transition-all text-sm text-left w-full text-muted-foreground border-transparent border hover:bg-secondary hover:text-foreground"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 opacity-70" />
              {t('nav.sign_out')}
            </button>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-[70px] md:pb-0">
          <div className="max-w-[1200px] mx-auto fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-safe">
        <div className="flex justify-around items-center h-[60px] px-2">
          {items.map(it => (
            <button
              key={it.id}
              className={cn(
                "flex flex-col items-center gap-1 p-2 min-w-[64px] text-muted-foreground transition-colors",
                location.pathname === it.id && "text-accent"
              )}
              onClick={() => handleNav(it.id)}
            >
              <it.icon className="h-[22px] w-[22px]" />
              <span className="text-[10px] font-semibold tracking-wider">{it.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 bg-black/70 z-[200] backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={cn(
        "md:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-card border-r border-border z-[201] p-5 flex flex-col gap-1 overflow-y-auto transition-transform duration-300",
        mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div className="font-display font-extrabold text-xl tracking-tight">
            <span className="bg-gradient-to-br from-primary to-accent3 bg-clip-text text-transparent">Boş Yer Var MI ?</span>
          </div>
          <button className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={() => setMobileDrawerOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.map(it => (
          <button
            key={it.id}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer transition-all text-sm text-left w-full text-muted-foreground hover:bg-secondary hover:text-foreground",
              location.pathname === it.id && "bg-primary/15 text-accent font-medium"
            )}
            onClick={() => handleNav(it.id)}
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </button>
        ))}

        <div className="flex-1" />
        <div className="h-px bg-border my-2" />
        <button
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer transition-all text-sm text-left w-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {t('nav.sign_out')}
        </button>
      </div>

    </div>
  );
}

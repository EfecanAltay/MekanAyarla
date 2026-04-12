import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchApi } from '../lib/api';
import { TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    // Simulated fetching for now based on reference data
    setStats({
      totalReservations: 284,
      activeSlots: 18,
      occupancyRate: '73%',
      waitlistCount: 7
    });

    fetchApi('/resources').then(res => setResources(res.resources || []));
  }, []);

  return (
    <div className="fade-in p-4 md:p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">{t('nav.dashboard')}</h1>
          <p className="text-sm text-muted-foreground">{t('dashboard.greeting')}</p>
        </div>
        <Button className="shadow-md shadow-primary/10">
          <Plus className="w-4 h-4 mr-2" />
          {t('dashboard.new_resource')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-border2 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-accent2" />
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">{t('dashboard.stats.total_res')}</span>
          <span className="font-display text-3xl font-extrabold leading-none">{stats?.totalReservations || '--'}</span>
          <div className="text-xs flex items-center gap-1 text-success mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> +12% this week
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-border2 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent3 to-blue-400" />
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">{t('dashboard.stats.active_slots')}</span>
          <span className="font-display text-3xl font-extrabold leading-none">{stats?.activeSlots || '--'}</span>
          <div className="text-xs flex items-center gap-1 text-success mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> 3 slots remaining
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-border2 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-success to-emerald-300" />
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">{t('dashboard.stats.occupancy')}</span>
          <span className="font-display text-3xl font-extrabold leading-none">{stats?.occupancyRate || '--'}</span>
          <div className="text-xs flex items-center gap-1 text-success mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> Up from 64%
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-border2 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-warning to-yellow-300" />
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">{t('dashboard.stats.waitlisted')}</span>
          <span className="font-display text-3xl font-extrabold leading-none">{stats?.waitlistCount || '--'}</span>
          <div className="text-xs flex items-center gap-1 text-warning mt-1">
            2 new today
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-bold tracking-tight">{t('dashboard.recent_res')}</h2>
          <Button variant="ghost" size="sm" className="text-xs h-8">
            {t('common.view_all')} <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-bold">Resource</th>
                <th className="px-4 py-3 font-bold">Location</th>
                <th className="px-4 py-3 font-bold">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {resources.slice(0, 5).map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-foreground">{r.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">{r.description}</div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{r.branch?.name || '--'}</td>
                  <td className="px-4 py-3.5 font-display font-bold">{r.capacity}</td>
                </tr>
              ))}
              {resources.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No resources found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

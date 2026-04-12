import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchApi } from '../lib/api';
import { Search, Download } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function AdminReservationsPage() {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const res = await fetchApi('/reservations/admin');
      setReservations(res.reservations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetchApi(`/reservations/${id}/confirm`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadReservations();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-success/15 text-success border border-success/20';
      case 'CANCELLED': return 'bg-destructive/15 text-destructive border border-destructive/20';
      case 'PENDING': return 'bg-warning/15 text-warning border border-warning/20';
      default: return 'bg-secondary text-foreground';
    }
  };

  return (
    <div className="fade-in p-4 md:p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">{t('admin.reservations_title')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.reservations_subtitle')}</p>
        </div>
        <Button variant="secondary" className="shadow-sm">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('admin.ph_search_reservation')}
            className="w-full h-10 pl-9 pr-3 bg-secondary/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <select className="h-10 bg-secondary/50 border border-border rounded-md px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer w-full sm:w-auto">
          <option>All statuses</option>
          <option>Confirmed</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
        <select className="h-10 bg-secondary/50 border border-border rounded-md px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer w-full sm:w-auto">
          <option>All types</option>
          <option>Lesson</option>
          <option>Café</option>
          <option>Desk</option>
          <option>Room</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 font-bold">#</th>
                <th className="px-4 py-3 font-bold">{t('admin.list.attendee')}</th>
                <th className="px-4 py-3 font-bold">{t('admin.list.resource')}</th>
                <th className="px-4 py-3 font-bold">Date & Slot</th>
                <th className="px-4 py-3 font-bold">{t('admin.list.status')}</th>
                <th className="px-4 py-3 font-bold">{t('admin.list.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!isLoading && reservations.map((r: any) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5 text-muted-foreground text-xs font-mono">
                    #{String(r.id).slice(0, 6)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent3 flex items-center justify-center text-[0.6rem] font-bold font-display text-white shrink-0 shadow-sm">
                        {r.user?.name?.charAt(0) || '?'}
                      </div>
                      <span className="font-medium text-foreground">{r.user?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-foreground">{r.timeSlot?.resource?.name}</div>
                    <div className="text-[0.7rem] text-muted-foreground uppercase tracking-wider mt-0.5">{r.timeSlot?.resource?.type?.name || 'Resource'}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-foreground">{new Date(r.timeSlot?.startTime).toLocaleDateString()}</div>
                    <div className="text-[0.7rem] text-muted-foreground mt-0.5">
                      {new Date(r.timeSlot?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                      {new Date(r.timeSlot?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wider uppercase rounded-full ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {r.status === 'PENDING' && (
                        <Button
                          size="sm"
                          className="h-7 text-[0.7rem] px-2 bg-success/15 text-success border border-success/20 hover:bg-success/25"
                          onClick={() => updateStatus(r.id, 'CONFIRMED')}
                        >
                          Confirm
                        </Button>
                      )}
                      {r.status !== 'CANCELLED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[0.7rem] px-2 bg-destructive/15 text-destructive border border-destructive/20 hover:bg-destructive/25"
                          onClick={() => updateStatus(r.id, 'CANCELLED')}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && reservations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No reservations found.
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

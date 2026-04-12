import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardTitle } from '../components/ui/card';
import { AlertCircle, Clock, MapPin } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Bookings() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadBookings = async () => {
    try {
      const { reservations } = await fetchApi('/reservations/me');
      setBookings(reservations);
    } catch (error) {
      console.error('Failed to load bookings', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm(t('bookings.cancel_confirm'))) return;
    
    try {
      await fetchApi(`/reservations/${id}`, { method: 'DELETE' });
      await loadBookings();
    } catch (error: any) {
      alert(error.message || t('common.error'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-success/15 text-success';
      case 'CANCELLED': return 'bg-destructive/15 text-destructive';
      case 'WAITLISTED': return 'bg-warning/15 text-warning';
      default: return 'bg-secondary text-foreground';
    }
  };

  return (
    <div className="fade-in p-4 md:p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">{t('bookings.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('bookings.subtitle')}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse bg-card rounded-xl border border-border" />)}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="border-dashed border-border2 bg-transparent flex h-64 flex-col items-center justify-center text-center p-10">
          <div className="rounded-full bg-secondary p-4 mb-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2 font-display">{t('bookings.empty_title')}</CardTitle>
          <CardDescription className="text-muted-foreground">{t('bookings.empty_desc')}</CardDescription>
          <Button className="mt-6" onClick={() => navigate('/dashboard')}>{t('bookings.discover')}</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="bg-card border border-border rounded-xl p-0 flex flex-col sm:flex-row overflow-hidden hover:border-border2 transition-colors">
              <div className="flex-1 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wider uppercase rounded-full ${getStatusColor(booking.status)}`}>
                    {t(`common.status.${booking.status.toLowerCase()}`) || booking.status}
                  </span>
                  <span className="text-[0.7rem] font-medium text-muted-foreground tracking-wider uppercase">ID: {String(booking.id).padStart(4, '0')}</span>
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{booking.timeSlot?.resource?.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="flex items-center gap-2 text-[0.8rem] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 opacity-70" />
                    {new Date(booking.timeSlot?.startTime).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-[0.8rem] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 opacity-70" />
                    {booking.timeSlot?.resource?.branch?.name || 'Main Branch'}
                  </div>
                </div>
              </div>
              <div className="bg-secondary/30 border-t sm:border-t-0 sm:border-l border-border p-5 flex items-center justify-center sm:w-48">
                {booking.status === 'CONFIRMED' && (
                  <Button variant="ghost" className="text-destructive hover:bg-destructive/15 w-full h-10" onClick={() => handleCancel(booking.id)}>
                    {t('common.cancel')}
                  </Button>
                )}
                {booking.status === 'CANCELLED' && (
                  <span className="text-xs font-semibold text-muted-foreground/60 italic">{t('bookings.cancelled_label')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchApi } from '../lib/api';
import { Search, MapPin, ArrowRight, Check } from 'lucide-react';
import { CATEGORY_MAP, CategoryIcon } from '../lib/icons';
import { Button } from '../components/ui/button';
import { generateDays, generateSlots } from '../lib/slotutils';
import { ResourceCategory } from '@mekanayarla/shared';

export default function BrowsePage() {
  const { t } = useTranslation();
  const [resources, setResources] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [bookingResource, setBookingResource] = useState<any | null>(null);

  useEffect(() => {
    fetchApi('/resources').then(res => setResources(res.resources || []));
  }, []);

  const getTypeIcon = (resource: any) => {
    return <CategoryIcon category={resource.type?.category} size={20} />;
  };

  const filteredResources = activeFilter === 'all'
    ? resources
    : resources.filter(r => r.type?.category === activeFilter);

  if (bookingResource) {
    return <BookingFlow resourceId={bookingResource.id} onBack={() => setBookingResource(null)} />;
  }

  return (
    <div className="fade-in p-4 md:p-6 pb-20">
      <div className="flex justify-between items-start gap-4 mb-6 pt-2">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight mb-1">{t('nav.explore')}</h1>
          <p className="text-sm text-muted-foreground">{t('bookings.find_and_book')}</p>
        </div>
      </div>

      <div className="relative mb-5 max-w-xl">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={t('admin.ph_search_reservation')}
          className="w-full h-12 pl-11 pr-4 bg-card border border-border rounded-xl text-[0.95rem] focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${activeFilter === 'all'
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
            : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border'
            }`}
        >
          {t('admin.ph_search_reservation') ? 'Tüm Tipler' : 'All Types'}
        </button>
        {Object.values(ResourceCategory).filter(c => c !== 'other').map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeFilter === cat
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
              : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border'
              }`}
          >
            <CategoryIcon category={cat} size={14} showBackground={false} />
            {CATEGORY_MAP[cat as ResourceCategory].label.split(' / ')[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredResources.map((r) => {
          const pct = Math.min((0 / r.capacity) * 100, 100);

          return (
            <div
              key={r.id}
              onClick={() => setBookingResource(r)}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(108,99,255,0.15)] transition-all cursor-pointer flex flex-col"
            >
              <div className="p-5 flex items-start gap-3.5 border-b border-border/50">
                <div className="shrink-0">
                  {getTypeIcon(r)}
                </div>
                <div>
                  <div className="font-display font-bold text-base leading-tight mb-1">{r.name}</div>
                  <span className="text-[0.65rem] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                    {r.type?.name || 'Hizmet'}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 break-words">
                <p className="text-[0.85rem] text-muted-foreground leading-relaxed line-clamp-3">
                  {r.description || 'No description provided.'}
                </p>
              </div>
              <div className="px-5 py-3.5 border-t border-border bg-secondary/20 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" /> {r.branch?.name || '--'}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="font-medium text-muted-foreground">{r.capacity} {t('booking.left')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Booking Flow Sub-Component
function BookingFlow({ resourceId, onBack }: { resourceId: string; onBack: () => void }) {
  const { t } = useTranslation();
  const [resourceDetails, setResourceDetails] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');

  useEffect(() => {
    fetchApi(`/resources/${resourceId}`).then(res => {
      setResourceDetails(res.resource);

      // Attempt to set first available date
      const availableDays = generateDays(res.resource);
      if (availableDays.length > 0) {
        setSelectedDate(availableDays[0]);
      }
    });
  }, [resourceId]);

  const days = useMemo(() => generateDays(resourceDetails), [resourceDetails]);
  const slots = useMemo(() => generateSlots(resourceDetails, selectedDate), [resourceDetails, selectedDate]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleConfirm = async () => {
    if (!selectedSlot || !resourceDetails) return;

    setIsSubmitting(true);
    try {
      let finalSlotId = selectedSlot.id;

      // 1. Check if virtual and materialize
      if (finalSlotId.startsWith('virtual-')) {
        const res = await fetchApi(`/resources/${resourceId}/slots/virtual/toggle`, {
          method: 'PATCH',
          body: JSON.stringify({
            isAvailable: true,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime
          })
        });
        finalSlotId = res.slot.id;
      }

      // 2. Create reservation
      await fetchApi('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          timeSlotId: finalSlotId,
          notes: bookingNotes
        })
      });

      alert('Reserved successfully!');
      onBack();
    } catch (err: any) {
      alert(err.message || "Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!resourceDetails) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="fade-in max-w-2xl mx-auto p-4 md:p-6 pb-20">
      <div className="flex items-start justify-between gap-4 mb-6 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Book {resourceDetails.name}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span>{resourceDetails.type?.name}</span> • <span>{resourceDetails.branch?.name}</span>
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">← {t('booking.back')}</Button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8 max-w-md mx-auto relative z-0">
        {[1, 2, 3].map((num, i) => (
          <div key={num} className="flex flex-col items-center flex-1 relative">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs bg-card transition-all z-10 ${step > num ? 'border-success bg-success text-white' : step === num ? 'border-primary text-accent bg-primary/10' : 'border-border2 text-muted-foreground'
              }`}>
              {step > num ? <Check className="w-4 h-4" /> : num}
            </div>
            <div className={`text-[0.65rem] font-medium mt-1.5 uppercase tracking-wider ${step > num ? 'text-success' : step === num ? 'text-accent2' : 'text-muted-foreground'
              }`}>
              {t(`booking.step_${num}`)}
            </div>
            {i < 2 && (
              <div className={`absolute left-1/2 top-4 w-full h-[2px] -z-10 ${step > num ? 'bg-success' : 'bg-border2'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Date */}
      {step === 1 && (
        <div className="bg-card border border-border rounded-xl p-6 fade-in shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent2 flex items-center justify-center font-display font-bold text-sm text-white shrink-0 shadow-md shadow-primary/20">1</div>
            <h3 className="font-display font-bold text-lg">{t('booking.select_date_title')}</h3>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-none snap-x">
            {days.map((d, i) => {
              const isSelected = selectedDate.toDateString() === d.toDateString();
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div
                  key={i}
                  className={`snap-start shrink-0 w-[60px] flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                    ? 'bg-primary border-primary shadow-[0_4px_12px_rgba(108,99,255,0.4)] text-primary-foreground'
                    : isToday ? 'border-accent2 bg-secondary/50' : 'bg-card border-border hover:border-border2 hover:bg-secondary'
                    }`}
                  onClick={() => setSelectedDate(d)}
                >
                  <div className={`text-[0.65rem] font-bold tracking-widest uppercase ${isSelected ? 'opacity-90' : 'text-muted-foreground'}`}>{dayNames[d.getDay()]}</div>
                  <div className="font-display text-xl font-bold">{d.getDate()}</div>
                  <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white/90 shadow-[0_0_8px_#fff]' : 'bg-success'}`} />
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-border flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Selected: <strong className="text-foreground">{selectedDate.toDateString()}</strong></span>
            <Button onClick={() => setStep(2)} className="h-10 px-5 shadow-md shadow-primary/20">
              {t('booking.continue')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Slot */}
      {step === 2 && (
        <div className="bg-card border border-border rounded-xl p-6 fade-in shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent2 flex items-center justify-center font-display font-bold text-sm text-white shrink-0 shadow-md shadow-primary/20">2</div>
            <h3 className="font-display font-bold text-lg">{t('booking.select_slot_title')}</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slots.map(s => {
              const isFull = (s._count?.reservations || 0) >= (s.capacity || resourceDetails.capacity);
              const isAvailable = s.isAvailable && !isFull;
              const startTimeStr = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const endTimeStr = new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={s.id}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border text-center transition-all ${!isAvailable
                    ? 'bg-secondary/30 border-border opacity-50 cursor-not-allowed'
                    : selectedSlot?.id === s.id
                      ? 'bg-primary/20 border-primary shadow-[0_0_0_2px_rgba(108,99,255,0.2)]'
                      : 'bg-secondary/50 border-border hover:border-primary hover:bg-primary/5 cursor-pointer'
                    }`}
                  onClick={() => isAvailable && setSelectedSlot(s)}
                >
                  <div className="font-display font-bold text-base">{startTimeStr}</div>
                  <div className="text-xs text-muted-foreground mt-[-4px]">-{endTimeStr}</div>
                  <div className={`px-2.5 py-0.5 mt-1.5 rounded-full text-[0.65rem] font-bold tracking-widest uppercase ${!isAvailable ? 'bg-destructive/15 text-destructive' : 'bg-success/15 text-success'
                    }`}>
                    {!s.isAvailable ? 'Closed' : (isFull ? 'Full' : 'Open')}
                  </div>
                  <div className={`text-[0.7rem] font-medium mt-1 ${!isAvailable ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {isFull ? 'Full' : `${(s.capacity || resourceDetails.capacity) - (s._count?.reservations || 0)} left`}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-border flex justify-between items-center">
            <Button variant="secondary" onClick={() => setStep(1)}>← {t('booking.back')}</Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!selectedSlot}
              className="h-10 px-5 shadow-md shadow-primary/20"
            >
              {t('booking.continue')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="bg-card border border-border rounded-xl p-6 fade-in shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center font-display font-bold text-sm text-white shrink-0 shadow-md shadow-success/20">3</div>
            <h3 className="font-display font-bold text-lg">{t('booking.confirm_title')}</h3>
          </div>

          <div className="bg-secondary/50 rounded-xl p-5 mb-5 border border-border/50">
            <div className="text-[0.65rem] font-bold tracking-widest uppercase text-muted-foreground mb-3">{t('booking.summary')}</div>
            <div className="flex justify-between py-2.5 border-b border-border/50">
              <span className="text-[0.9rem] text-muted-foreground">Resource</span>
              <span className="text-[0.9rem] font-semibold">{resourceDetails.name}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-border/50">
              <span className="text-[0.9rem] text-muted-foreground">Date</span>
              <span className="text-[0.9rem] font-semibold">{selectedDate.toDateString()}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-border/50">
              <span className="text-[0.9rem] text-muted-foreground">Time</span>
              <span className="text-[0.9rem] font-semibold">
                {new Date(selectedSlot?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-[0.9rem] text-muted-foreground">Location</span>
              <span className="text-[0.9rem] font-semibold">{resourceDetails.branch?.name}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-6">
            <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('booking.notes')}</label>
            <textarea
              className="resize-y min-h-[80px] bg-secondary/50 border border-border rounded-xl p-3 text-[0.9rem] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              placeholder={t('bookings.ph_notes')}
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-5 border-t border-border">
            <Button variant="secondary" onClick={() => setStep(2)}>← {t('booking.back')}</Button>
            <Button
              className="flex-1 shadow-lg shadow-primary/20 font-semibold text-[0.9rem]"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              <Check className="w-4 h-4 mr-2" />
              {t('booking.confirm_btn')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

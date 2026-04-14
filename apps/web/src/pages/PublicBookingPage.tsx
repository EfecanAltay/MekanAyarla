import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchApi } from '../lib/api';
import { Check, ArrowRight, MapPin, Calendar, Clock, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { generateDays, generateSlots } from '../lib/slotutils';

export default function PublicBookingPage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [resourceDetails, setResourceDetails] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (resourceId) {
      fetchApi(`/resources/${resourceId}`).then(res => {
        setResourceDetails(res.resource);
        const availableDays = generateDays(res.resource);
        if (availableDays.length > 0) {
          setSelectedDate(availableDays[0]);
        }
      }).catch(err => {
        console.error(err);
        alert('Resource not found or available.');
      });
    }
  }, [resourceId]);

  const days = useMemo(() => generateDays(resourceDetails), [resourceDetails]);
  const slots = useMemo(() => generateSlots(resourceDetails, selectedDate), [resourceDetails, selectedDate]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleConfirm = async () => {
    if (!selectedSlot || !resourceDetails || !guestName) return;

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

      // 2. Create public reservation
      await fetchApi('/reservations/public', {
        method: 'POST',
        body: JSON.stringify({
          timeSlotId: finalSlotId,
          guestName: guestName,
          notes: bookingNotes
        })
      });

      setIsSuccess(true);
    } catch (err: any) {
      alert(err.message || "Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!resourceDetails) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-xl fade-in">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] border border-success/30">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Rezervasyon Alındı!</h2>
          <p className="text-muted-foreground mb-8">
            {resourceDetails.requiresApproval 
              ? 'Talebiniz alınmıştır. Onaylandığında bilgilendirileceksiniz.' 
              : 'Randevunuz başarıyla oluşturuldu. Sizi bekliyoruz!'}
          </p>
          <div className="bg-secondary/30 rounded-xl p-4 text-left border border-border/50 mb-8 space-y-3">
             <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">{selectedDate.toLocaleDateString('tr-TR')}</span>
             </div>
             <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {new Date(selectedSlot?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
             </div>
             <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium">{resourceDetails.name} - {resourceDetails.branch?.name}</span>
             </div>
          </div>
          <Button onClick={() => window.location.reload()} className="w-full">
            Yeni Randevu Al
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
             <Check className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Hızlı Randevu</h1>
            <p className="text-sm text-muted-foreground">{resourceDetails.name} için randevu oluşturun</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-8 max-w-sm mx-auto relative z-0">
          {[1, 2, 3].map((num, i) => (
            <div key={num} className="flex flex-col items-center flex-1 relative">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs bg-card transition-all z-10 ${step > num ? 'border-success bg-success text-white' : step === num ? 'border-primary text-primary bg-primary/10 shadow-[0_0_12px_rgba(108,99,255,0.3)]' : 'border-border text-muted-foreground'
                }`}>
                {step > num ? <Check className="w-4 h-4" /> : num}
              </div>
              {i < 2 && (
                <div className={`absolute left-1/2 top-4 w-full h-[2px] -z-10 ${step > num ? 'bg-success' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Date */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm fade-in">
            <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
               <Calendar className="w-5 h-5 text-primary" /> Gün Seçin
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-6 mb-2 scrollbar-none snap-x">
              {days.map((d, i) => {
                const isSelected = selectedDate.toDateString() === d.toDateString();
                const isToday = d.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={i}
                    className={`snap-start shrink-0 w-[64px] flex flex-col items-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${isSelected
                      ? 'bg-primary border-primary shadow-[0_8px_16px_rgba(108,99,255,0.4)] text-primary-foreground -translate-y-1'
                      : isToday ? 'border-primary/40 bg-primary/5' : 'bg-secondary/20 border-border hover:border-primary/50'
                      }`}
                    onClick={() => setSelectedDate(d)}
                  >
                    <div className={`text-[0.6rem] font-bold tracking-widest uppercase ${isSelected ? 'opacity-90' : 'text-muted-foreground'}`}>{dayNames[d.getDay()]}</div>
                    <div className="font-display text-xl font-black">{d.getDate()}</div>
                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white shadow-[0_0_8px_#fff]' : 'bg-success'}`} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-8 border-t border-border pt-6">
              <Button onClick={() => setStep(2)} size="lg" className="px-8 shadow-lg shadow-primary/25">
                Devam Et <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Slot */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm fade-in">
             <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
               <Clock className="w-5 h-5 text-primary" /> Saat Seçin
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slots.map(s => {
                const isFull = (s._count?.reservations || 0) >= (s.capacity || resourceDetails.capacity);
                const isAvailable = s.isAvailable && !isFull;
                const startTimeStr = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div
                    key={s.id}
                    className={`flex flex-col items-center gap-1.5 p-5 rounded-2xl border text-center transition-all duration-200 ${!isAvailable
                      ? 'bg-secondary/10 border-border opacity-40 cursor-not-allowed'
                      : selectedSlot?.id === s.id
                        ? 'bg-primary/20 border-primary ring-2 ring-primary/20'
                        : 'bg-secondary/30 border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                      }`}
                    onClick={() => isAvailable && setSelectedSlot(s)}
                  >
                    <div className="font-display font-bold text-base">{startTimeStr}</div>
                    <div className={`px-2 py-0.5 mt-2 rounded-full text-[0.6rem] font-bold uppercase tracking-tighter ${!isAvailable ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                      }`}>
                      {isFull ? 'Dolu' : 'Uygun'}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-8 border-t border-border pt-6">
              <Button variant="ghost" onClick={() => setStep(1)}>Geri</Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedSlot}
                size="lg"
                className="px-8 shadow-lg shadow-primary/25"
              >
                Devam Et <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Registration */}
        {step === 3 && (
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm fade-in">
             <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
               <User className="w-5 h-5 text-primary" /> Bilgilerinizi Girin
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Ad Soyad</label>
                <Input
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="h-12 bg-secondary/20 border-border focus:ring-primary focus:border-primary text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Not (Opsiyonel)</label>
                <textarea
                  className="w-full min-h-[100px] bg-secondary/20 border border-border rounded-xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Eklemek istediğiniz bir not var mı?"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                />
              </div>

              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                 <div className="text-[0.65rem] font-bold tracking-widest uppercase text-primary/70 mb-3">Randevu Özeti</div>
                 <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-muted-foreground">Hizmet</span>
                    <span className="text-sm font-bold">{resourceDetails.name}</span>
                 </div>
                 <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-muted-foreground">Tarih & Saat</span>
                    <span className="text-sm font-bold">
                       {selectedDate.toLocaleDateString('tr-TR')} • {new Date(selectedSlot?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">Geri</Button>
                <Button
                  className="flex-[2] h-12 shadow-lg shadow-primary/25 font-bold"
                  onClick={handleConfirm}
                  disabled={isSubmitting || !guestName}
                >
                  {isSubmitting ? 'Tamamlanıyor...' : 'Randevuyu Onayla'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

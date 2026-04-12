import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, Lock, Unlock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { fetchApi } from '../lib/api';
import { generateDays, generateSlots } from '../lib/slotutils';

export default function SchedulePage() {
  const { t } = useTranslation();
  const [resources, setResources] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [resourceDetails, setResourceDetails] = useState<any>(null);

  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [activeView, setActiveView] = useState('Week view');

  // Multi-selection states
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  // Modal states for toggling
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [toggleNote, setToggleNote] = useState('');
  const [toggleTarget, setToggleTarget] = useState<{ type: 'date' | 'slot' | 'batch', id: string, isAvailable: boolean } | null>(null);

  useEffect(() => {
    fetchApi('/resources').then(res => {
      setResources(res.resources || []);
      if (res.resources?.length > 0) setSelectedResource(res.resources[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedResource) {
      loadResourceDetails();
      setSelectedSlotIds([]); // Clear selection when resource changes
    }
  }, [selectedResource]);

  const loadResourceDetails = async () => {
    try {
      const res = await fetchApi(`/resources/${selectedResource}`);
      setResourceDetails(res.resource);

      // Auto boundary calculation
      const offDays = res.resource.offDays || [];
      let targetDate = new Date();
      if (res.resource?.startDate && new Date(res.resource.startDate) > targetDate) {
        targetDate = new Date(res.resource.startDate);
      }

      // If current or target date is an off-day, find the next available day
      while (offDays.includes(targetDate.getDay())) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      setActiveDate(targetDate);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAction = async () => {
    if (!toggleTarget) return;

    try {
      const commonBody: any = {
        isAvailable: toggleTarget.isAvailable,
        note: toggleNote || undefined
      };

      if (toggleTarget.type === 'batch') {
        const slotsToUpdate = slotsForActiveDate
          .filter(s => selectedSlotIds.includes(s.id))
          .map(s => {
            const isVirtual = s.id.startsWith('virtual-');
            return {
              id: isVirtual ? 'virtual' : s.id,
              startTime: s.startTime,
              endTime: s.endTime
            };
          });

        await fetchApi(`/resources/${selectedResource}/slots/batch-toggle`, {
          method: 'PATCH',
          body: JSON.stringify({
            ...commonBody,
            slots: slotsToUpdate
          })
        });
        setSelectedSlotIds([]); // Clear selection after success
      } else if (toggleTarget.type === 'slot') {
        const body = { ...commonBody };
        // If it's a virtual slot, we need to provide times so the backend can "materialize" it
        if (toggleTarget.id.startsWith('virtual-')) {
          const [_, start, end] = toggleTarget.id.split('|');
          body.startTime = start;
          body.endTime = end;
        }

        const slotId = toggleTarget.id.startsWith('virtual-') ? 'virtual' : toggleTarget.id;
        await fetchApi(`/resources/${selectedResource}/slots/${slotId}/toggle`, {
          method: 'PATCH',
          body: JSON.stringify(body)
        });
      } else if (toggleTarget.type === 'date') {
        await fetchApi(`/resources/${selectedResource}/dates/${toggleTarget.id}/toggle`, {
          method: 'PATCH',
          body: JSON.stringify(commonBody)
        });
      }

      setIsNoteModalOpen(false);
      setToggleNote('');
      loadResourceDetails();
    } catch (error: any) {
      alert(error.message || 'Failed to update status');
    }
  };

  const openToggleModal = (type: 'date' | 'slot' | 'batch', id: string, willBeAvailable: boolean) => {
    setToggleTarget({ type, id, isAvailable: willBeAvailable });
    setToggleNote('');
    setIsNoteModalOpen(true);
  };

  const toggleSlotSelection = (id: string) => {
    setSelectedSlotIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const days = useMemo(() => generateDays(resourceDetails, 7), [resourceDetails]);
  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

  const slotsForActiveDate = useMemo(() => generateSlots(resourceDetails, activeDate), [resourceDetails, activeDate]);

  const isWholeDateClosed = slotsForActiveDate.length > 0 && slotsForActiveDate.every((s: any) => !s.isAvailable);

  return (
    <div className="fade-in p-4 md:p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">{t('admin.schedule_title')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.schedule_subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-5">
        <select
          className="h-10 bg-secondary/50 border border-border rounded-md px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer min-w-[200px]"
          value={selectedResource}
          onChange={(e) => setSelectedResource(e.target.value)}
        >
          {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>

        {/* <div className="flex bg-secondary/50 p-1 rounded-lg border border-border overflow-x-auto">
          {['Week view', 'Day view'].map(mode => (
            <button
              key={mode}
              className={`px-4 py-1.5 rounded-md text-sm transition-all whitespace-nowrap ${activeView === mode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveView(mode)}
            >
              {mode}
            </button>
          ))}
        </div> */}
      </div>

      {/* Calendar Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none snap-x">
        {days.map((d, i) => {
          const isSelected = activeDate.toDateString() === d.toDateString();
          // Check if this specific day is fully closed in the data we have
          const daySlots = resourceDetails?.slots?.filter((s: any) => new Date(s.startTime).toDateString() === d.toDateString()) || [];
          const isDayFullyClosed = daySlots.length > 0 && daySlots.every((s: any) => !s.isAvailable);

          return (
            <div
              key={i}
              className={`snap-start shrink-0 w-[62px] flex flex-col items-center gap-1 p-2.5 rounded-lg border cursor-pointer transition-all ${isSelected
                ? 'bg-primary border-primary shadow-[0_4px_12px_rgba(108,99,255,0.3)] text-primary-foreground'
                : (isDayFullyClosed ? 'bg-destructive/10 border-destructive/20 opacity-80' : 'bg-card border-border hover:border-border2 hover:bg-secondary')
                }`}
              onClick={() => setActiveDate(d)}
            >
              <div className="text-[0.6rem] font-bold tracking-wider uppercase opacity-80">{dayNames[d.getDay()]}</div>
              <div className="flex flex-col items-center">
                <div className="font-display text-lg font-bold leading-none">{d.getDate()}</div>
                <div className="text-[0.6rem] font-bold uppercase mt-0.5 opacity-70">
                  {d.toLocaleDateString('tr-TR', { month: 'short' }).replace('.', '')}
                </div>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white/80' : (isDayFullyClosed ? 'bg-destructive' : 'bg-transparent')}`} />
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl p-5 fade-in shadow-sm relative overflow-hidden">
        {/* Selection Indicator */}
        {selectedSlotIds.length > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary/30 animate-pulse" />
        )}

        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <div className="flex items-center gap-4">
            <h3 className="font-display font-medium flex items-center gap-2">
              <span className="font-bold text-foreground">{dayNames[activeDate.getDay()]} {activeDate.getDate()}</span>
              <span className="text-muted-foreground text-xs uppercase tracking-widest font-bold opacity-70">— Mesai Saatleri</span>
            </h3>

            {selectedSlotIds.length > 0 && (
              <div className="bg-primary/10 text-primary text-[0.65rem] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                {selectedSlotIds.length} Slot Seçildi
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedSlotIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSlotIds([])}
                className="text-muted-foreground hover:text-foreground text-[0.7rem] uppercase font-bold tracking-widest"
              >
                İptal
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => openToggleModal('date', activeDate.toISOString().split('T')[0], isWholeDateClosed)}
              className={`transition-all font-bold tracking-wider text-[0.7rem] uppercase ${isWholeDateClosed ? 'text-success border-success/30 hover:bg-success/10' : 'text-destructive border-destructive/30 hover:bg-destructive/10'}`}
            >
              {isWholeDateClosed ? <Unlock className="w-3.5 h-3.5 mr-2" /> : <Lock className="w-3.5 h-3.5 mr-2" />}
              {isWholeDateClosed ? 'Günü Aç' : 'Günü Kapat'}
            </Button>
          </div>
        </div>

        {/* Day Level Notice */}
        {isWholeDateClosed && (
          <div className="mb-6 p-5 rounded-2xl bg-destructive/10 border border-destructive/20 flex flex-col items-center text-center gap-3 fade-in shadow-inner">
            <div className="flex items-center gap-2 text-destructive">
              <Ban className="w-5 h-5" />
              <span className="font-display font-black text-xs uppercase tracking-[0.2em]">BU GÜN BAŞVURULARA KAPALIDIR</span>
            </div>
            {slotsForActiveDate.find(s => s.note)?.note && (
              <div className="text-sm font-medium text-foreground py-2 px-4 bg-background border border-border/40 rounded-xl shadow-lg flex flex-col gap-1 min-w-[200px]">
                <span className="text-[0.65rem] text-muted-foreground uppercase font-black tracking-widest opacity-50 border-b border-border/20 pb-1">Kapatma Notu</span>
                <span className="italic">"{slotsForActiveDate.find(s => s.note)?.note}"</span>
              </div>
            )}
          </div>
        )}
        {!isWholeDateClosed && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {slotsForActiveDate.map((s: any) => {
              const isFull = s._count?.reservations >= s.capacity;
              const statusLabel = !s.isAvailable ? 'KAPALI' : (isFull ? 'DOLU' : 'AÇIK');
              const startTimeStr = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const endTimeStr = new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isSelected = selectedSlotIds.includes(s.id);

              return (
                <div
                  key={s.id}
                  onClick={() => toggleSlotSelection(s.id)}
                  className={`relative cursor-pointer flex flex-col items-center gap-1.5 p-4 rounded-2xl border text-center transition-all ${isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-lg shadow-primary/5'
                    : (!s.isAvailable
                      ? 'bg-secondary/15 border-destructive/10 opacity-80 hover:border-destructive/30'
                      : (isFull ? 'bg-secondary/30 border-border opacity-70 hover:border-border2' : 'bg-secondary/40 border-border hover:border-primary/40 group shadow-sm hover:shadow-primary/5'))
                    }`}
                >
                  {/* Selection Checkbox */}
                  <div className={`absolute top-2 right-2 w-4 h-4 rounded border transition-all flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-white scale-110' : 'bg-card border-border opacity-0 group-hover:opacity-100'}`}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                  </div>

                  <div className="font-display font-black text-[1.1rem] tracking-tight text-foreground">{startTimeStr}</div>
                  <div className="text-[0.7rem] text-muted-foreground mt-[-6px] font-bold opacity-60 tracking-wider">-{endTimeStr}</div>

                  <div className={`px-3 py-0.5 mt-2 rounded-full text-[0.6rem] font-black tracking-[0.1em] uppercase shadow-sm ${!s.isAvailable
                    ? 'bg-destructive text-destructive-foreground'
                    : (isFull ? 'bg-destructive/15 text-destructive' : 'bg-success/15 text-success')
                    }`}>
                    {statusLabel}
                  </div>

                  {s.isAvailable && (
                    <div className="text-[0.7rem] text-muted-foreground mt-2 font-bold opacity-80">
                      {s._count?.reservations || 0} / {s.capacity} <span className="text-[0.6rem] opacity-50 font-black ml-0.5">KAYIT</span>
                    </div>
                  )}

                  {s.note && (
                    <div className="mt-2.5 w-full px-3 py-1.5 bg-background border border-border/10 rounded-lg text-[0.7rem] italic text-muted-foreground leading-snug line-clamp-3 shadow-inner" title={s.note}>
                      "{s.note}"
                    </div>
                  )}
                </div>
              );
            })}

            {slotsForActiveDate.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground text-sm font-medium border-2 border-dashed border-border/40 rounded-2xl bg-secondary/10">
                Bu tarih için aktif bir çalışma saati veya planlama bulunmuyor.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Batch Actions Bar */}
      {selectedSlotIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-2xl bg-card border-2 border-primary shadow-[0_12px_40px_rgba(108,99,255,0.4)] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 fade-in-up">
          <div className="flex items-center gap-3 md:border-r border-border pr-4">
            <div className="bg-primary text-primary-foreground font-black px-3 py-1 rounded-lg text-sm">
              {selectedSlotIds.length}
            </div>
            <div className="flex flex-col">
              <span className="text-[0.7rem] font-black uppercase tracking-widest leading-none">Seçilen Slot</span>
              <span className="text-[0.65rem] text-muted-foreground font-bold italic">Toplu İşlem Modu</span>
            </div>
          </div>

          <div className="flex-1 flex gap-2 w-full">
            <Button
              className="flex-1 font-bold text-[0.7rem] uppercase tracking-widest bg-destructive hover:bg-destructive/90"
              onClick={() => openToggleModal('batch', 'multiple', false)}
            >
              <Lock className="w-3.5 h-3.5 mr-2" />
              Seçilenleri Kapat
            </Button>
            <Button
              variant="outline"
              className="flex-1 font-bold text-[0.7rem] uppercase tracking-widest text-success border-success/30 hover:bg-success/10"
              onClick={() => openToggleModal('batch', 'multiple', true)}
            >
              <Unlock className="w-3.5 h-3.5 mr-2" />
              Seçilenleri Aç
            </Button>
          </div>
        </div>
      )}

      {isNoteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsNoteModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl w-full max-w-sm shadow-2xl fade-in overflow-hidden p-5">
            <h3 className="font-display font-bold text-lg mb-2">
              {toggleTarget?.isAvailable ? 'Açıklama (Opsiyonel)' : 'Kapatma Sebebi'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {toggleTarget?.isAvailable ? 'Bu saati/tarihi tekrar başvuruya açıyorsunuz.' : 'Başvuruya kapatmadan önce bir not bırakabilirsiniz.'}
            </p>
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:outline-none"
              rows={3}
              placeholder="Örn: Resmi tatil, Temizlik..."
              value={toggleNote}
              onChange={(e) => setToggleNote(e.target.value)}
            />
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="secondary" onClick={() => setIsNoteModalOpen(false)}>İptal</Button>
              <Button onClick={handleToggleAction}>Onayla</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

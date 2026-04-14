import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Link, Copy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { fetchApi } from '../lib/api';
import { CategoryIcon } from '../lib/icons';

export default function ResourcesPage() {
  const { t } = useTranslation();
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metadata, setMetadata] = useState<any>({ branches: [], resourceTypes: [] });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 1,
    typeId: '',
    branchId: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
    slotDuration: 60,
    requiresApproval: false,
    isPublic: true,
    isPasswordProtected: false,
    password: '',
    offDays: [] as number[],
    offHours: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadResources();
    loadMetadata();
  }, []);

  const loadResources = async () => {
    try {
      const res = await fetchApi('/resources');
      setResources(res.resources || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const res = await fetchApi('/organizations/metadata');
      setMetadata(res);
      if (res.branches?.length > 0) setFormData(f => ({ ...f, branchId: res.branches[0].id }));
      if (res.resourceTypes?.length > 0) setFormData(f => ({ ...f, typeId: res.resourceTypes[0].id }));
    } catch (err) {
      console.error('Failed to load metadata', err);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId('');
    setFormData({
      name: '', description: '', capacity: 1,
      branchId: metadata.branches?.[0]?.id || '',
      typeId: metadata.resourceTypes?.[0]?.id || '',
      startDate: '', endDate: '', startTime: '09:00', endTime: '18:00', slotDuration: 60,
      requiresApproval: false,
      isPublic: true,
      isPasswordProtected: false,
      password: '',
      offDays: [], offHours: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (resource: any) => {
    setIsEditing(true);
    setEditingId(resource.id);
    setFormData({
      name: resource.name,
      description: resource.description || '',
      capacity: resource.capacity,
      branchId: resource.branchId,
      typeId: resource.typeId,
      startDate: resource.startDate ? new Date(resource.startDate).toISOString().split('T')[0] : '',
      endDate: resource.endDate ? new Date(resource.endDate).toISOString().split('T')[0] : '',
      startTime: resource.startTime || '09:00',
      endTime: resource.endTime || '18:00',
      slotDuration: resource.slotDuration || 60,
      requiresApproval: resource.requiresApproval || false,
      isPublic: resource.isPublic ?? true,
      isPasswordProtected: resource.isPasswordProtected || false,
      password: resource.password || '',
      offDays: resource.offDays || [],
      offHours: resource.offHours || []
    });
    setIsModalOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = isEditing ? `/resources/${editingId}` : '/resources';
      const method = isEditing ? 'PATCH' : 'POST';

      await fetchApi(url, {
        method,
        body: JSON.stringify({
          ...formData,
          capacity: Number(formData.capacity)
        })
      });
      setIsModalOpen(false);
      loadResources();
    } catch (err) {
      alert('Failed to save resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await fetchApi(`/resources/${id}`, { method: 'DELETE' });
      loadResources();
    } catch (err: any) {
      alert(err.message || 'Failed to delete resource. Make sure it has no active slots.');
    }
  };

  const getCapacityClass = (booked: number, cap: number) => {
    const pct = booked / cap;
    if (pct >= 1) return 'bg-destructive';
    if (pct >= 0.6) return 'bg-warning';
    return 'bg-success';
  };

  const getTypeIcon = (resource: any) => {
    return <CategoryIcon category={resource.type?.category} size={16} />;
  };
  const copyPublicLink = (id: string) => {
    const url = `${window.location.origin}/public/booking/${id}`;
    navigator.clipboard.writeText(url);
    alert(t('common.link_copied'));
  };

  return (
    <div className="fade-in p-4 md:p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">{t('admin.resources_title')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.resources_subtitle')}</p>
        </div>
        <Button className="shadow-md shadow-primary/10" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          {t('admin.add_resource')}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 font-bold">{t('admin.list.resource')}</th>
                <th className="px-4 py-3 font-bold">{t('admin.list.type')}</th>
                <th className="px-4 py-3 font-bold">{t('admin.list.location')}</th>
                <th className="px-4 py-3 font-bold">{t('admin.capacity')}</th>
                <th className="px-4 py-3 font-bold">{t('admin.list.status')}</th>
                <th className="px-4 py-3 font-bold">{t('admin.list.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!isLoading && resources.map((r: any) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="shrink-0">
                        {getTypeIcon(r)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground tracking-tight">{r.name}</div>
                        <div className="text-[0.7rem] text-muted-foreground mt-0.5 line-clamp-1">{r.description || '--'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wider uppercase rounded-full bg-primary/15 text-primary border border-primary/20">
                      {r.type?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">{r.branch?.name || '--'}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[80px] h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getCapacityClass(0, r.capacity)}`}
                          style={{ width: `${Math.min((0 / r.capacity) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">0/{r.capacity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className={`px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wider uppercase rounded-full ${r.active ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground border border-border'}`}>
                        {r.active ? 'Active' : 'Inactive'}
                      </span>
                      {r.requiresApproval && (
                        <span className="px-2 py-0.5 text-[0.6rem] font-bold uppercase rounded-md bg-warning/10 text-warning border border-warning/20">
                          {t('admin.requires_approval')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {r.isPublic && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-primary hover:bg-primary/10" onClick={() => copyPublicLink(r.id)}>
                          <Link className="w-3 h-3 mr-1" /> {t('common.share') || 'Share'}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => handleOpenEdit(r)}>{t('common.edit') || 'Edit'}</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-destructive hover:bg-destructive/15" onClick={() => handleDeleteResource(r.id, r.name)}>{t('common.delete') || 'Delete'}</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && resources.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    {t('admin.empty_resources')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl fade-in overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/20 shrink-0">
              <h2 className="font-display text-lg font-bold">{isEditing ? t('common.edit') : t('admin.new_resource')}</h2>
              <button
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="p-6 flex-1 overflow-y-auto flex flex-col gap-5 scrollbar-thin">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('admin.resource_name')}</label>
                <Input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="h-10 bg-secondary/50 border-border focus:border-primary text-[0.9rem]"
                  placeholder={t('admin.ph_resource_name')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('admin.resource_type')}</label>
                  <select
                    className="h-10 bg-secondary/50 border border-border rounded-md px-3 text-[0.9rem] focus:outline-none focus:border-primary appearance-none cursor-pointer"
                    value={formData.typeId}
                    onChange={e => setFormData({ ...formData, typeId: e.target.value })}
                    required
                  >
                    <option value="" disabled>{t('admin.select_type')}</option>
                    {metadata.resourceTypes.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('admin.capacity')}</label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="h-10 bg-secondary/50 border-border focus:border-primary text-[0.9rem]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('admin.branch')}</label>
                <select
                  className="h-10 bg-secondary/50 border border-border rounded-md px-3 text-[0.9rem] focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  value={formData.branchId}
                  onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                  required
                >
                  <option value="" disabled>{t('admin.select_branch')}</option>
                  {metadata.branches.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3.5 bg-secondary/30 border border-border rounded-xl">
                  <div>
                    <label className="text-sm font-bold text-foreground block">{t('admin.requires_approval')}</label>
                    <p className="text-[0.6rem] text-muted-foreground mt-0.5">Onay gerektirir.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, requiresApproval: !formData.requiresApproval })}
                    className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${formData.requiresApproval ? 'bg-primary shadow-[0_0_12px_rgba(108,99,255,0.4)]' : 'bg-secondary border border-border'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${formData.requiresApproval ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-secondary/30 border border-border rounded-xl">
                  <div>
                    <label className="text-sm font-bold text-foreground block">{t('admin.is_public')}</label>
                    <p className="text-[0.6rem] text-muted-foreground mt-0.5">{t('admin.is_public_desc')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                    className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${formData.isPublic ? 'bg-success shadow-[0_0_12px_rgba(34,197,94,0.4)]' : 'bg-secondary border border-border'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${formData.isPublic ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">Başlangıç Tarihi (Start)</label>
                  <Input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="h-10 bg-secondary/30 border-border focus:border-primary text-[0.9rem] px-3 font-medium transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">Bitiş Tarihi (End)</label>
                  <Input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="h-10 bg-secondary/30 border-border focus:border-primary text-[0.9rem] px-3 font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">Mesai Başlangıç</label>
                  <Input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="h-10 bg-secondary/30 border-border focus:border-primary text-[0.9rem] px-3 font-medium transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">Mesai Bitiş</label>
                  <Input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="h-10 bg-secondary/30 border-border focus:border-primary text-[0.9rem] px-3 font-medium transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">Slot (Dk)</label>
                <select
                  className="h-10 bg-secondary/50 border border-border rounded-md px-3 text-[0.9rem] focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  value={formData.slotDuration}
                  onChange={e => setFormData({ ...formData, slotDuration: parseInt(e.target.value) })}
                  required
                >
                  <option value={30}>30 Dakika</option>
                  <option value={60}>60 Dakika</option>
                  <option value={90}>90 Dakika</option>
                  <option value={120}>120 Dakika</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground italic">Ders Olmayan Günler (Off Days)</label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {['P', 'S', 'Ç', 'P', 'C', 'C', 'P'].map((day, idx) => {
                    const dayNum = (idx + 1) % 7; // Monday is 1, Sunday is 0
                    const isOff = formData.offDays.includes(dayNum);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const newDays = isOff
                            ? formData.offDays.filter(d => d !== dayNum)
                            : [...formData.offDays, dayNum];
                          setFormData({ ...formData, offDays: newDays });
                        }}
                        className={`w-9 h-9 rounded-lg border font-bold text-xs transition-all flex items-center justify-center shrink-0 ${isOff
                          ? 'bg-destructive/15 border-destructive text-destructive shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                          : 'bg-secondary/30 border-border text-muted-foreground hover:border-primary/50'
                          }`}
                        title={['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'][idx]}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[0.65rem] text-muted-foreground">İşaretlediğiniz günler takvimde hiç gösterilmeyecektir.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground italic">Mola Saatleri (Off Hours)</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(() => {
                    const times = [];
                    const [startH, startM] = formData.startTime.split(':').map(Number);
                    const [endH, endM] = formData.endTime.split(':').map(Number);
                    let current = new Date();
                    current.setHours(startH, startM, 0, 0);
                    const end = new Date();
                    end.setHours(endH, endM, 0, 0);

                    while (current < end) {
                      const timeStr = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      times.push(timeStr);
                      current = new Date(current.getTime() + formData.slotDuration * 60000);
                    }

                    return times.map(t => {
                      const isOff = formData.offHours.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            const newHours = isOff
                              ? formData.offHours.filter(h => h !== t)
                              : [...formData.offHours, t];
                            setFormData({ ...formData, offHours: newHours });
                          }}
                          className={`px-3 py-1.5 rounded-lg border font-bold text-[0.7rem] transition-all ${isOff
                            ? 'bg-destructive/15 border-destructive text-destructive shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                            : 'bg-secondary/30 border-border text-muted-foreground hover:border-primary/50'
                            }`}
                        >
                          {t}
                        </button>
                      );
                    });
                  })()}
                </div>
                {formData.offHours.length === 0 && (
                  <p className="text-[0.65rem] text-muted-foreground opacity-60 mt-1">Öğle arası veya belirli mola saatlerini buradan kapatabilirsiniz.</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('admin.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[80px] rounded-md border border-border bg-secondary/50 px-3 py-2 text-[0.9rem] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                  placeholder={t('admin.ph_description')}
                  rows={2}
                />
              </div>

              <div className="flex flex-col gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[0.8rem] font-bold tracking-wide text-primary flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                       {t('admin.password_toggle')}
                    </label>
                    <p className="text-[0.6rem] text-muted-foreground mt-0.5">{t('admin.password_toggle_desc')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPasswordProtected: !formData.isPasswordProtected })}
                    className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${formData.isPasswordProtected ? 'bg-primary shadow-[0_0_12px_rgba(108,99,255,0.4)]' : 'bg-secondary border border-border'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${formData.isPasswordProtected ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>

                {formData.isPasswordProtected && (
                  <div className="pt-2 border-t border-primary/10 fade-in">
                    <label className="text-[0.7rem] font-semibold text-muted-foreground mb-1.5 block">{t('admin.resource_password')}</label>
                    <Input
                      type="text"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="h-10 bg-black/20 border-primary/10 focus:border-primary/40 text-[0.85rem] placeholder:text-muted-foreground/40"
                      placeholder="Şifreyi belirleyin..."
                    />
                    <p className="text-[0.6rem] text-muted-foreground mt-1.5 leading-relaxed">{t('admin.resource_password_desc')}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-4 gap-3 mt-2 border-t border-border/50">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto"
                >
                  {t('booking.back')}
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto shadow-md shadow-primary/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (isEditing ? t('common.save') : t('admin.add_resource'))}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchApi } from '../lib/api';
import { Search, Download, FileText, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { jsPDF } from 'jspdf';
import autoTable, { type UserOptions } from 'jspdf-autotable';
import { registerTurkishFont } from '../lib/pdf-font';

export default function AdminReservationsPage() {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [selectedExportResourceId, setSelectedExportResourceId] = useState<string>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReservations();
    loadResources();
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

  const loadResources = async () => {
    try {
      const res = await fetchApi('/resources');
      setResources(res.resources || []);
    } catch (err) {
      console.error('Failed to load resources', err);
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

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      registerTurkishFont(doc);
      doc.setFont("Roboto");
      doc.setFontSize(11);

      let confirmedReservations = reservations.filter(r => r.status === 'CONFIRMED');

      if (selectedExportResourceId !== 'all') {
        confirmedReservations = confirmedReservations.filter(r => r.timeSlot?.resourceId === selectedExportResourceId);
      }

      if (confirmedReservations.length === 0) {
        alert("Dışa aktarılacak uygun rezervasyon olunamadı.");
        return;
      }

      const tableColumn = ["#ID", t('admin.list.attendee'), t('admin.list.resource'), t('admin.list.date'), "Saat"];
      const tableRows = confirmedReservations.map(r => [
        String(r.id || '').slice(0, 6),
        r.user?.name || r.guestName || 'Unknown',
        r.timeSlot?.resource?.name || 'Unknown Resource',
        r.timeSlot?.startTime ? new Date(r.timeSlot.startTime).toLocaleDateString() : '--',
        r.timeSlot?.startTime && r.timeSlot?.endTime
          ? `${new Date(r.timeSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(r.timeSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : '--'
      ]);

      const resourceName = selectedExportResourceId === 'all'
        ? t('admin.all_resources') || 'Tüm Kaynaklar'
        : resources.find(res => res.id === selectedExportResourceId)?.name || '';

      doc.setFontSize(18);
      doc.text(`${t('admin.confirmed_list_title')} - ${resourceName}`, 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Tarih: ${new Date().toLocaleDateString()}`, 14, 30);

      // Sanitize all data to strings to prevent 'widths' undefined error
      const sanitizedColumn = tableColumn.map(c => String(c || ''));
      const sanitizedRows = tableRows.map(row => row.map(cell => String(cell || '')));

      const tableOptions: UserOptions = {
        head: [sanitizedColumn],
        body: sanitizedRows,
        startY: 40,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          font: "Roboto",
          fontStyle: "normal"
        },
        headStyles: {
          fillColor: [108, 99, 255],
          textColor: [255, 255, 255],
          font: "Roboto",
          fontStyle: "normal"
        },
        alternateRowStyles: { fillColor: [245, 245, 255] },
        didParseCell: (data) => {
          // Force font on each cell to be absolutely sure metrics are applied
          data.cell.styles.font = "Roboto";
          data.cell.styles.fontStyle = "normal";
        }
      };

      // Use the modern autoTable function directly
      autoTable(doc, tableOptions);

      const fileName = `Onayli_Rezervasyonlar_${resourceName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      setIsExportModalOpen(false);
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert("PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
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
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="default" className="shadow-sm bg-primary hover:bg-primary/90" onClick={() => setIsExportModalOpen(true)}>
            <FileText className="w-4 h-4 mr-2" />
            {t('admin.export_pdf')}
          </Button>
        </div>
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
          <option>Tüm Durumlar</option>
          <option>Onaylandı</option>
          <option>Beklemede</option>
          <option>İptal Edildi</option>
        </select>
        <select className="h-10 bg-secondary/50 border border-border rounded-md px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer w-full sm:w-auto">
          <option>Tüm Tipler</option>
          <option>Dersler</option>
          <option>Kafeler</option>
          <option>Masalar</option>
          <option>Odalar</option>
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
                        {r.user?.name?.charAt(0) || r.guestName?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{r.user?.name || r.guestName || 'Unknown'}</span>
                        {!r.user && r.guestName && (
                          <span className="text-[0.6rem] uppercase tracking-tighter font-bold text-primary/70">Misafir</span>
                        )}
                      </div>
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

      {/* Export Dialog */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsExportModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl fade-in overflow-hidden">
            <div className="p-6 border-b border-border bg-secondary/20 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold">{t('admin.export_dialog_title')}</h2>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.export_dialog_subtitle')}</p>
              </div>
              <button onClick={() => setIsExportModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Kaynak Seçimi</label>
                <select
                  className="w-full h-12 bg-secondary/30 border border-border rounded-xl px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer transition-all"
                  value={selectedExportResourceId}
                  onChange={(e) => setSelectedExportResourceId(e.target.value)}
                >
                  <option value="all">Tüm Kaynaklar</option>
                  {resources.map(res => (
                    <option key={res.id} value={res.id}>{res.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <FileText className="w-4 h-4" /> PDF Raporu Özellikleri
                </div>
                <ul className="text-xs text-muted-foreground space-y-1.5 ml-6 list-disc">
                  <li>Sadece **onaylanmış** rezervasyonlar dahil edilir.</li>
                  <li>Türkçe karakter desteği mevcuttur.</li>
                  <li>Tarih, Saat, Katılımcı ve Kaynak bilgilerini içerir.</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => setIsExportModalOpen(false)} className="flex-1 h-11">
                  {t('common.cancel')}
                </Button>
                <Button onClick={exportToPDF} className="flex-[2] h-11 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
                  <FileText className="w-4 h-4 mr-2" />
                  {t('admin.export_btn')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

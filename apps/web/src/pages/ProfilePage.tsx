import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Trash2, Key, Info, User as UserIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { fetchApi } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  
  // Password Change State
  const [pwData, setPwData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPw, setIsChangingPw] = useState(false);

  // Deletion State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) {
      alert("Şifreler eşleşmiyor");
      return;
    }
    
    setIsChangingPw(true);
    try {
      await fetchApi('/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify(pwData)
      });
      alert('Şifre başarıyla güncellendi');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      alert(err.message || 'Şifre değiştirilemedi');
    } finally {
      setIsChangingPw(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
    
    setIsDeleting(true);
    try {
      await fetchApi('/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePassword })
      });
      logout();
    } catch (err: any) {
      alert(err.message || 'Hesap silinemedi');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fade-in p-4 md:p-8 max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Profil Ayarları</h1>
        <p className="text-muted-foreground italic">Hesap bilgilerini yönetin ve güvenlik ayarlarını güncelleyin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent3 flex items-center justify-center text-2xl font-bold font-display text-white mx-auto mb-4 shadow-lg ring-4 ring-primary/10">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <h2 className="font-bold text-lg">{user?.name}</h2>
            <p className="text-xs text-muted-foreground mb-4">{user?.email}</p>
            <div className="px-3 py-1 bg-secondary/50 rounded-full text-[0.65rem] font-black tracking-widest uppercase inline-block text-primary/80">
              {user?.role}
            </div>
          </div>

          <div className="bg-secondary/20 border border-border rounded-2xl p-5 space-y-3">
             <div className="flex items-center gap-2 text-primary">
                <Info className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Bilgi</span>
             </div>
             <p className="text-xs text-muted-foreground leading-relaxed">
                Platform üzerindeki faaliyetleriniz bu hesaba bağlıdır. Profil bilgileriniz diğer kullanıcılar tarafından görülebilir.
             </p>
          </div>
        </div>

        {/* Action Area */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Change Password */}
          <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border bg-secondary/10 flex items-center gap-2">
               <Shield className="w-4 h-4 text-primary" />
               <h3 className="font-display font-bold text-sm uppercase tracking-wider">Güvenlik ve Şifre</h3>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Mevcut Şifre</label>
                  <Input 
                    type="password" 
                    required 
                    className="bg-secondary/30"
                    placeholder="••••••••"
                    value={pwData.currentPassword}
                    onChange={e => setPwData({...pwData, currentPassword: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Yeni Şifre</label>
                    <Input 
                      type="password" 
                      required 
                      className="bg-secondary/30"
                      placeholder="••••••••"
                      value={pwData.newPassword}
                      onChange={e => setPwData({...pwData, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Onayla</label>
                    <Input 
                      type="password" 
                      required 
                      className="bg-secondary/30"
                      placeholder="••••••••"
                      value={pwData.confirmPassword}
                      onChange={e => setPwData({...pwData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isChangingPw} className="shadow-lg shadow-primary/20">
                  {isChangingPw ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                </Button>
              </div>
            </form>
          </section>

          {/* Danger Zone */}
          <section className="bg-card border border-destructive/20 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-destructive/10 bg-destructive/5 flex items-center gap-2">
               <Trash2 className="w-4 h-4 text-destructive" />
               <h3 className="font-display font-bold text-sm uppercase tracking-wider text-destructive">Hesabı Sil</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Hesabınızı silmek tüm verilerinizi, rezervasyonlarınızı ve erişiminizi kalıcı olarak kaldıracaktır. Bu işlem geri alınamaz.
              </p>
              
              {!showDeleteConfirm ? (
                <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => setShowDeleteConfirm(true)}>
                  Hesabımı Silmek İstiyorum
                </Button>
              ) : (
                <form onSubmit={handleDeleteAccount} className="space-y-4 animate-in slide-in-from-top-1">
                   <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                      <p className="text-xs font-bold text-destructive mb-3 uppercase tracking-wider">Kritik Onay</p>
                      <Input 
                        type="password" 
                        required 
                        autoFocus
                        placeholder="Onaylamak için şifrenizi girin"
                        className="bg-background border-destructive/30"
                        value={deletePassword}
                        onChange={e => setDeletePassword(e.target.value)}
                      />
                   </div>
                   <div className="flex gap-2">
                      <Button type="submit" variant="destructive" disabled={isDeleting}>
                        {isDeleting ? 'Siliniyor...' : 'Evet, Kalıcı Olarak Sil'}
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                        Vazgeç
                      </Button>
                   </div>
                </form>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

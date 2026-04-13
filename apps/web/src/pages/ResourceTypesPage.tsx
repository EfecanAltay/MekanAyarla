import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { fetchApi } from '../lib/api';
import { ResourceCategory } from '@mekanayarla/shared';
import { CategoryIcon, CATEGORY_MAP } from '../lib/icons';

export default function ResourceTypesPage() {
  const { t } = useTranslation();
  const [resourceTypes, setResourceTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    category: ResourceCategory.OTHER as string
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadResourceTypes();
  }, []);

  const loadResourceTypes = async () => {
    try {
      const res = await fetchApi('/resource-types');
      setResourceTypes(res.resourceTypes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({ id: '', name: '', description: '', category: ResourceCategory.OTHER });
    setIsModalOpen(true);
  };

  const openEditModal = (type: any) => {
    setIsEditing(true);
    setFormData({ 
      id: type.id, 
      name: type.name, 
      description: type.description || '',
      category: type.category || ResourceCategory.OTHER
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await fetchApi(`/resource-types/${formData.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ 
            name: formData.name, 
            description: formData.description,
            category: formData.category
          })
        });
      } else {
        await fetchApi('/resource-types', {
          method: 'POST',
          body: JSON.stringify({ 
            name: formData.name, 
            description: formData.description,
            category: formData.category
          })
        });
      }
      setIsModalOpen(false);
      loadResourceTypes();
    } catch (err: any) {
      alert(err.message || 'Failed to save resource type. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${t('admin.delete_type_confirm', { name }) || `Are you sure you want to delete ${name}?`}`)) return;

    try {
      await fetchApi(`/resource-types/${id}`, { method: 'DELETE' });
      loadResourceTypes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete. It might be in use.');
    }
  };

  return (
    <div className="fade-in p-4 md:p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">{t('admin.resource_types_title') || 'Resource Types'}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.resource_types_subtitle') || 'Manage all resource categories'}</p>
        </div>
        <Button className="shadow-md shadow-primary/10" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          {t('admin.add_type') || 'Add Type'}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 font-bold">{t('admin.type_name') || 'Type Name'}</th>
                <th className="px-4 py-3 font-bold">{t('admin.description') || 'Description'}</th>
                <th className="px-4 py-3 font-bold">{t('admin.attached_resources') || 'Attached Resources'}</th>
                <th className="px-4 py-3 font-bold text-right">{t('admin.list.actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!isLoading && resourceTypes.map((tItem: any) => (
                <tr key={tItem.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={tItem.category} size={16} />
                      <span className="font-medium text-foreground tracking-tight">{tItem.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {tItem.description || '--'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-0.5 text-[0.65rem] font-bold uppercase rounded-full bg-secondary text-foreground border border-border">
                      {tItem._count?.resources || 0} {t("admin.attached_resources")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => openEditModal(tItem)}>
                        {t('common.edit') || 'Edit'}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-destructive hover:bg-destructive/15" onClick={() => handleDelete(tItem.id, tItem.name)}>
                        {t('common.delete') || 'Delete'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && resourceTypes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                    {t('admin.no_resource_types_found') || 'No resource types found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl w-full max-w-md shadow-2xl fade-in overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/20">
              <h2 className="font-display text-lg font-bold">
                {isEditing ? (t('admin.edit_type') || 'Edit Resource Type') : (t('admin.new_type') || 'New Resource Type')}
              </h2>
              <button
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('admin.type_name') || 'Type Name'}</label>
                <Input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="h-10 bg-secondary/50 border-border focus:border-primary text-[0.9rem]"
                  placeholder={t('admin.ph_type_name')}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('admin.description') || 'Description'}</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[80px] rounded-md border border-border bg-secondary/50 px-3 py-2 text-[0.9rem] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                  placeholder={t('admin.ph_description')}
                  rows={3}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground">{t('admin.category') || 'Category'}</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(ResourceCategory).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all",
                        formData.category === cat 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <CategoryIcon category={cat} size={14} showBackground={false} className="shrink-0" />
                      <span className="text-[0.75rem] font-medium leading-none">{CATEGORY_MAP[cat].label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-3 mt-2 border-t border-border/50">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto"
                >
                  {t('common.cancel') || 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto shadow-md shadow-primary/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (isEditing ? (t('common.save') || 'Save Changes') : (t('admin.create_type') || 'Create Type'))}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

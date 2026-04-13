import {
  GraduationCap,
  Projector,
  Car,
  MonitorPlay,
  Coffee,
  Layout,
  DoorOpen,
  Tag,
  type LucideIcon
} from 'lucide-react';
import { ResourceCategory } from '@mekanayarla/shared';
import { cn } from './utils';

export interface CategoryInfo {
  icon: LucideIcon;
  label: string;
  color: string;
}

export const CATEGORY_MAP: Record<ResourceCategory, CategoryInfo> = {
  [ResourceCategory.LESSON]: {
    icon: GraduationCap,
    label: 'Ders / Eğitim',
    color: 'bg-primary/20 text-accent2'
  },
  [ResourceCategory.THEATER]: {
    icon: Projector,
    label: 'Tiyatro / Sinema',
    color: 'bg-indigo-500/15 text-indigo-400'
  },
  [ResourceCategory.DRIVING]: {
    icon: Car,
    label: 'Sürücü Dersi',
    color: 'bg-orange-500/15 text-orange-400'
  },
  [ResourceCategory.ONLINE]: {
    icon: MonitorPlay,
    label: 'Online Eğitim',
    color: 'bg-cyan-500/15 text-cyan-400'
  },
  [ResourceCategory.CAFE]: {
    icon: Coffee,
    label: 'Kafe / Restoran',
    color: 'bg-warning/15 text-warning'
  },
  [ResourceCategory.TABLE]: {
    icon: Layout,
    label: 'Masa / Çalışma Alanı',
    color: 'bg-accent3/15 text-accent3'
  },
  [ResourceCategory.ROOM]: {
    icon: DoorOpen,
    label: 'Oda / Salon',
    color: 'bg-success/15 text-success'
  },
  [ResourceCategory.OTHER]: {
    icon: Tag,
    label: 'Diğer',
    color: 'bg-muted text-muted-foreground'
  }
};

interface CategoryIconProps {
  category?: string;
  className?: string;
  size?: number;
  showBackground?: boolean;
}

export function CategoryIcon({ category, className, size = 18, showBackground = true }: CategoryIconProps) {
  const info = CATEGORY_MAP[category as ResourceCategory] || CATEGORY_MAP[ResourceCategory.OTHER];
  const Icon = info.icon;

  if (showBackground) {
    return (
      <div className={cn(
        "flex items-center justify-center rounded-xl",
        info.color.split(' ')[0], // bg class
        className
      )} style={{ width: size * 2.2, height: size * 2.2 }}>
        <Icon size={size} className={info.color.split(' ')[1]} />
      </div>
    );
  }

  return <Icon size={size} className={cn(info.color.split(' ')[1], className)} />;
}

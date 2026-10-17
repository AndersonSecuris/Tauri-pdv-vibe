import React from 'react';
import {
  Smartphone,
  Radio,
  Tv,
  Flame,
  Sparkles,
  Cpu,
  Layers,
  Shield,
  Zap,
  ZapOff,
  BatteryWarning,
  Droplets,
  PowerOff,
  VolumeX,
  Volume2,
  Camera,
  RotateCcw,
  SlidersHorizontal,
  HardDrive,
  Package,
  Headphones,
  Tablet,
  Watch,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Laptop,
  Wifi,
  Disc,
  Settings,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  Smartphone,
  Radio,
  Tv,
  Flame,
  Sparkles,
  Cpu,
  Layers,
  Shield,
  Zap,
  ZapOff,
  BatteryWarning,
  Droplets,
  PowerOff,
  VolumeX,
  Volume2,
  Camera,
  RotateCcw,
  SlidersHorizontal,
  HardDrive,
  Package,
  Headphones,
  Tablet,
  Watch,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Laptop,
  Wifi,
  Disc,
  Settings,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export const getIconComponent = (iconName?: string): LucideIcon => {
  if (!iconName) return Smartphone;
  return ICON_MAP[iconName] || Smartphone;
};

interface RenderIconProps {
  name?: string;
  className?: string;
  fallback?: LucideIcon;
}

export const DynamicIcon: React.FC<RenderIconProps> = ({ name, className = 'w-4 h-4', fallback: Fallback = HelpCircle }) => {
  const IconComponent = name && ICON_MAP[name] ? ICON_MAP[name] : Fallback;
  return <IconComponent className={className} />;
};

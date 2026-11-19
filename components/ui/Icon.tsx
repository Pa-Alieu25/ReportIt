import {
  ArrowUpDown,
  Bell,
  Building,
  Camera,
  ChevronRight,
  CircleCheck,
  CircleExclamationPoint,
  ClipboardList,
  Clock,
  CloudRain,
  Droplet,
  Ellipsis,
  Eye,
  EyeOff,
  House,
  Image,
  Inbox,
  Info,
  Lightbulb,
  LocateFixed,
  LogOut,
  Map,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  ShieldX,
  TrafficCone,
  Trash,
  TriangleExclamationPoint,
  User,
  Users,
  WavesHorizontal,
  WifiOff,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import { colors } from '@/theme';

// The app's one icon set (Lucide outline icons, matching the poster). Screens
// use these semantic names, never Lucide components directly, so the set can
// be swapped or extended in one place.
const ICONS = {
  home: House,
  map: Map,
  plus: Plus,
  bell: Bell,
  user: User,
  users: Users,
  'my-reports': ClipboardList,
  admin: ShieldCheck,
  'access-denied': ShieldX,
  pin: MapPin,
  locate: LocateFixed,
  camera: Camera,
  photo: Image,
  'chevron-right': ChevronRight,
  search: Search,
  sort: ArrowUpDown,
  close: X,
  delete: Trash,
  'sign-out': LogOut,
  inbox: Inbox,
  warning: TriangleExclamationPoint,
  error: CircleExclamationPoint,
  success: CircleCheck,
  info: Info,
  offline: WifiOff,
  clock: Clock,
  eye: Eye,
  'eye-off': EyeOff,
  // Report categories
  road: TrafficCone,
  waste: Trash,
  light: Lightbulb,
  water: Droplet,
  gutter: CloudRain,
  flood: WavesHorizontal,
  power: Zap,
  building: Building,
  other: Ellipsis,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

// Decorative by default: icons that carry meaning on their own (icon-only
// buttons) get their accessibilityLabel on the button, not the icon.
export function Icon({ name, size = 22, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  const Component = ICONS[name];
  return (
    <Component
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}

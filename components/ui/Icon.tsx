// Per-icon imports: Metro doesn't tree-shake, so importing from the package
// root would bundle all ~4,800 Lucide icons.
import ArrowRight from 'lucide-react-native/icons/arrow-right';
import ArrowUpDown from 'lucide-react-native/icons/arrow-up-down';
import Bell from 'lucide-react-native/icons/bell';
import Building from 'lucide-react-native/icons/building';
import Calendar from 'lucide-react-native/icons/calendar';
import Camera from 'lucide-react-native/icons/camera';
import Check from 'lucide-react-native/icons/check';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import CircleExclamationPoint from 'lucide-react-native/icons/circle-exclamation-point';
import CircleX from 'lucide-react-native/icons/circle-x';
import ClipboardList from 'lucide-react-native/icons/clipboard-list';
import Clock from 'lucide-react-native/icons/clock';
import CloudRain from 'lucide-react-native/icons/cloud-rain';
import Droplet from 'lucide-react-native/icons/droplet';
import Ellipsis from 'lucide-react-native/icons/ellipsis';
import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import HandHeart from 'lucide-react-native/icons/hand-heart';
import HardHat from 'lucide-react-native/icons/hard-hat';
import House from 'lucide-react-native/icons/house';
import ImageIcon from 'lucide-react-native/icons/image';
import Inbox from 'lucide-react-native/icons/inbox';
import Info from 'lucide-react-native/icons/info';
import Landmark from 'lucide-react-native/icons/landmark';
import Lightbulb from 'lucide-react-native/icons/lightbulb';
import LocateFixed from 'lucide-react-native/icons/locate-fixed';
import Lock from 'lucide-react-native/icons/lock';
import LogOut from 'lucide-react-native/icons/log-out';
import Mail from 'lucide-react-native/icons/mail';
import MapIcon from 'lucide-react-native/icons/map';
import MapPin from 'lucide-react-native/icons/map-pin';
import Megaphone from 'lucide-react-native/icons/megaphone';
import MessageSquare from 'lucide-react-native/icons/message-square';
import Pencil from 'lucide-react-native/icons/pencil';
import Plus from 'lucide-react-native/icons/plus';
import RotateCw from 'lucide-react-native/icons/rotate-cw';
import Search from 'lucide-react-native/icons/search';
import Send from 'lucide-react-native/icons/send';
import ShieldCheck from 'lucide-react-native/icons/shield-check';
import ShieldX from 'lucide-react-native/icons/shield-x';
import TrafficCone from 'lucide-react-native/icons/traffic-cone';
import Trash from 'lucide-react-native/icons/trash';
import TriangleExclamationPoint from 'lucide-react-native/icons/triangle-exclamation-point';
import User from 'lucide-react-native/icons/user';
import Users from 'lucide-react-native/icons/users';
import WavesHorizontal from 'lucide-react-native/icons/waves-horizontal';
import WifiOff from 'lucide-react-native/icons/wifi-off';
import X from 'lucide-react-native/icons/x';
import Zap from 'lucide-react-native/icons/zap';
import type { LucideIcon } from 'lucide-react-native';

import { colors } from '@/theme';

// The app's one icon set (Lucide outline icons, matching the poster). Screens
// use these semantic names, never Lucide components directly, so the set can
// be swapped or extended in one place.
const ICONS = {
  home: House,
  map: MapIcon,
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
  photo: ImageIcon,
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
  'arrow-right': ArrowRight,
  calendar: Calendar,
  check: Check,
  'circle-x': CircleX,
  mail: Mail,
  lock: Lock,
  edit: Pencil,
  refresh: RotateCw,
  send: Send,
  message: MessageSquare,
  council: Landmark,
  megaphone: Megaphone,
  'in-progress': HardHat,
  community: HandHeart,
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

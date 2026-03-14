import {
  // 날씨
  Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, Wind, Rainbow,
  // 교통
  Plane, Train, Bus, Car, Footprints, Ship, TrainFront, TramFront, Hotel, Home,
  PlaneLanding, PlaneTakeoff,
  // 음식
  UtensilsCrossed, Soup, Fish, Beer, Coffee, Cake, IceCream,
  // 예산/기타
  Ticket, ShoppingBag, Pill, Smartphone, Coins, Drama, Landmark, Castle, TowerControl,
  // 준비물
  Briefcase, Luggage, Shirt, Droplets, FileText, Plug, Camera,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// 이모지 → lucide-react 아이콘 매핑 테이블
const emojiToIconMap: Record<string, LucideIcon> = {
  // 날씨
  '☀️': Sun,
  '🌤️': CloudSun,
  '⛅': CloudSun,
  '🌥️': Cloud,
  '☁️': Cloud,
  '🌧️': CloudRain,
  '🌦️': CloudRain,
  '⛈️': CloudLightning,
  '🌩️': CloudLightning,
  '❄️': Snowflake,
  '🌨️': Snowflake,
  '🌫️': CloudFog,
  '💨': Wind,
  '🌈': Rainbow,

  // 교통
  '✈️': Plane,
  '🚃': Train,
  '🚆': Train,
  '🚅': Train,
  '🚂': Train,
  '🚌': Bus,
  '🚍': Bus,
  '🚐': Bus,
  '🚕': Car,
  '🚗': Car,
  '🚙': Car,
  '🚖': Car,
  '🚶': Footprints,
  '🚶‍♂️': Footprints,
  '🚶‍♀️': Footprints,
  '🚢': Ship,
  '⛴️': Ship,
  '🛳️': Ship,
  '🚇': TrainFront,
  '🚊': TramFront,
  '🏨': Hotel,
  '🏠': Home,
  '🛬': PlaneLanding,
  '🛫': PlaneTakeoff,

  // 음식/맛집
  '🍽️': UtensilsCrossed,
  '🍜': Soup,
  '🍣': Fish,
  '🍺': Beer,
  '☕': Coffee,
  '🍰': Cake,
  '🍦': IceCream,

  // 예산/기타
  '🎫': Ticket,
  '🛍️': ShoppingBag,
  '💊': Pill,
  '📱': Smartphone,
  '💰': Coins,
  '🎭': Drama,
  '🎢': Ticket,
  '🏛️': Landmark,
  '⛩️': Landmark,
  '🏯': Castle,
  '🗼': TowerControl,

  // 준비물
  '👜': Briefcase,
  '🧳': Luggage,
  '👕': Shirt,
  '🧴': Droplets,
  '📄': FileText,
  '🔌': Plug,
  '📷': Camera,
  '👟': Footprints,
  '🧥': Shirt,
};

interface EmojiIconProps {
  emoji: string;
  size?: number;
  className?: string;
}

// 날씨 이모지 → 색상 매핑
const weatherColorMap: Record<string, string> = {
  '☀️': 'text-amber-400',
  '🌤️': 'text-amber-300',
  '⛅': 'text-amber-300',
  '🌥️': 'text-gray-400',
  '☁️': 'text-gray-400',
  '🌧️': 'text-blue-400',
  '🌦️': 'text-blue-300',
  '⛈️': 'text-purple-400',
  '🌩️': 'text-purple-400',
  '❄️': 'text-sky-300',
  '🌨️': 'text-sky-300',
  '🌫️': 'text-gray-300',
  '💨': 'text-gray-300',
  '🌈': 'text-emerald-400',
};

// 이모지를 lucide-react 아이콘으로 변환하는 컴포넌트
// 매핑에 없는 이모지는 텍스트로 폴백
export function EmojiIcon({ emoji, size = 16, className }: EmojiIconProps) {
  const IconComponent = emojiToIconMap[emoji];

  if (!IconComponent) {
    return <span className={className}>{emoji}</span>;
  }

  // 날씨 이모지는 고유 색상 적용 (className에 text-* 없을 때)
  const weatherColor = weatherColorMap[emoji];
  const finalClassName = weatherColor && (!className || !className.includes('text-'))
    ? `${className ?? ''} ${weatherColor}`.trim()
    : className;

  return <IconComponent size={size} className={finalClassName} />;
}

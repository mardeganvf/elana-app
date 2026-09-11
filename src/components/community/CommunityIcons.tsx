import React from 'react';
import { 
  Sparkles, 
  Flame, 
  MessageCircleHeart, 
  HeartHandshake, 
  Leaf, 
  Moon, 
  Sun, 
  BookOpen, 
  Compass, 
  Mountain, 
  Trees, 
  HelpCircle, 
  CloudRain, 
  Star, 
  BatteryLow, 
  Sunrise, 
  Heart, 
  Waves, 
  Lightbulb, 
  Flower2, 
  CircleDot, 
  EyeOff, 
  MessageSquare 
} from 'lucide-react';

export const renderRoomIcon = (iconName?: string, className = "w-4 h-4", style?: React.CSSProperties) => {
  switch (iconName) {
    case 'Sparkles': return <Sparkles className={className} style={style} />;
    case 'Flame': return <Flame className={className} style={style} />;
    case 'MessageCircleHeart': return <MessageCircleHeart className={className} style={style} />;
    case 'HeartHandshake': return <HeartHandshake className={className} style={style} />;
    case 'Leaf': return <Leaf className={className} style={style} />;
    case 'Moon': return <Moon className={className} style={style} />;
    case 'Sun': return <Sun className={className} style={style} />;
    case 'BookOpen': return <BookOpen className={className} style={style} />;
    case 'Compass': return <Compass className={className} style={style} />;
    case 'Mountain': return <Mountain className={className} style={style} />;
    case 'Trees': return <Trees className={className} style={style} />;
    case 'HelpCircle': return <HelpCircle className={className} style={style} />;
    case 'CloudRain': return <CloudRain className={className} style={style} />;
    case 'Star': return <Star className={className} style={style} />;
    case 'BatteryLow': return <BatteryLow className={className} style={style} />;
    case 'Sunrise': return <Sunrise className={className} style={style} />;
    case 'Heart': return <Heart className={className} style={style} />;
    case 'Waves': return <Waves className={className} style={style} />;
    case 'Lightbulb': return <Lightbulb className={className} style={style} />;
    case 'Flower2': return <Flower2 className={className} style={style} />;
    case 'CircleDot': return <CircleDot className={className} style={style} />;
    case 'EyeOff': return <EyeOff className={className} style={style} />;
    case 'MessageSquare': return <MessageSquare className={className} style={style} />;
    default: return <Sparkles className={className} style={style} />;
  }
};


import { LucideIcon } from 'lucide-react';

export type NodeCategory = 'TRAFFIC' | 'PAGE' | 'CHECKOUT' | 'POST_SALE' | 'COMMUNICATION';

export interface StoryItem {
  id: string;
  intention: string; // Construção Invisível
  headline: string;
  script: string; // Roteiro/Texto Falado
  visualDescription: string; // Descrição Visual/Fundo
  image?: string; // Individual story image
}

export interface CarouselSlide {
  id: string;
  headline: string;
  content: string;
  backgroundSuggestion: string;
  image?: string; // Individual slide image
}

export interface FunnelNodeData {
  label: string;
  description: string;
  category: NodeCategory;
  iconType: string;
  thumbnail?: string;
  strategyNotes?: string;
  tags?: string[];
  metrics?: string;
  // Complex Media fields
  itemCount?: number;
  storyItems?: StoryItem[];
  carouselSlides?: CarouselSlide[];
}

export interface NodeTypeConfig {
  type: string;
  label: string;
  category: NodeCategory;
  icon: LucideIcon;
  defaultDescription: string;
}

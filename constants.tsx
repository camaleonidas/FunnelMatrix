
import { 
  Instagram, 
  Facebook, 
  Video, 
  Layout, 
  ShoppingCart, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Youtube,
  Globe,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { NodeTypeConfig } from './types';

export const NODE_TYPES: NodeTypeConfig[] = [
  // Traffic
  { type: 'instagram_feed', label: 'Instagram Feed', category: 'TRAFFIC', icon: Instagram, defaultDescription: 'Organic traffic from main feed' },
  { type: 'instagram_stories', label: 'Instagram Stories', category: 'TRAFFIC', icon: Instagram, defaultDescription: 'High engagement story traffic' },
  { type: 'facebook_ads', label: 'Facebook Ads', category: 'TRAFFIC', icon: Facebook, defaultDescription: 'Paid traffic acquisition' },
  { type: 'tiktok', label: 'TikTok', category: 'TRAFFIC', icon: Video, defaultDescription: 'Short-form viral content' },
  { type: 'youtube', label: 'YouTube', category: 'TRAFFIC', icon: Youtube, defaultDescription: 'Video content traffic' },
  
  // Pages
  { type: 'lp_capture', label: 'Landing Page', category: 'PAGE', icon: Layout, defaultDescription: 'Lead capture form' },
  { type: 'sales_page', label: 'Sales Page', category: 'PAGE', icon: FileText, defaultDescription: 'Main offer presentation' },
  { type: 'advertorial', label: 'Advertorial', category: 'PAGE', icon: Globe, defaultDescription: 'Native-style article' },
  { type: 'blog_post', label: 'Blog Post', category: 'PAGE', icon: FileText, defaultDescription: 'Educational content' },
  
  // Checkout
  { type: 'checkout_page', label: 'Checkout', category: 'CHECKOUT', icon: ShoppingCart, defaultDescription: 'Order details and payment' },
  { type: 'order_bump', label: 'Order Bump', category: 'CHECKOUT', icon: ArrowUpCircle, defaultDescription: 'Additional checkout offer' },
  
  // Post-Sale
  { type: 'upsell', label: 'Upsell (1-Click)', category: 'POST_SALE', icon: ArrowUpCircle, defaultDescription: 'Post-purchase offer' },
  { type: 'downsell', label: 'Downsell', category: 'POST_SALE', icon: ArrowDownCircle, defaultDescription: 'Discounted alternative' },
  { type: 'thank_you', label: 'Thank You Page', category: 'POST_SALE', icon: CheckCircle2, defaultDescription: 'Order confirmation' },
  
  // Communication
  { type: 'email_broadcast', label: 'Email Broadcast', category: 'COMMUNICATION', icon: Mail, defaultDescription: 'One-off email campaign' },
  { type: 'email_sequence', label: 'Email Sequence', category: 'COMMUNICATION', icon: Mail, defaultDescription: 'Automated follow-up' },
  { type: 'whatsapp', label: 'WhatsApp', category: 'COMMUNICATION', icon: MessageSquare, defaultDescription: 'Direct messaging' },
  { type: 'sms', label: 'SMS', category: 'COMMUNICATION', icon: Smartphone, defaultDescription: 'Text message alert' },
];

export const CATEGORY_COLORS = {
  TRAFFIC: 'border-blue-500/40 text-blue-400',
  PAGE: 'border-emerald-500/40 text-emerald-400',
  CHECKOUT: 'border-amber-500/40 text-amber-400',
  POST_SALE: 'border-purple-500/40 text-purple-400',
  COMMUNICATION: 'border-pink-500/40 text-pink-400',
};

export const CATEGORY_LABELS = {
  TRAFFIC: 'Traffic & Attraction',
  PAGE: 'Marketing Pages',
  CHECKOUT: 'Commerce',
  POST_SALE: 'Post-Purchase',
  COMMUNICATION: 'Messaging',
};

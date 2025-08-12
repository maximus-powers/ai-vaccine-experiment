import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
export function getEffectivenessColor(rate: number): string {
  if (rate >= 0.7) return 'text-green-500';
  if (rate >= 0.5) return 'text-yellow-500'; 
  return 'text-red-500';
}
export function getEffectivenessBadgeClasses(rate: number): string {
  if (rate >= 0.7) return 'bg-green-500 text-white border-green-600 hover:bg-green-600';
  if (rate >= 0.5) return 'bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-600';
  return 'bg-red-500 text-white border-red-600 hover:bg-red-600';
}
export function getPreventionBadgeClasses(rate: number): string {
  if (rate >= 0.7) return 'bg-green-500 text-white border-green-600 hover:bg-green-600';
  if (rate >= 0.5) return 'bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-600';
  return 'bg-red-500 text-white border-red-600 hover:bg-red-600';
}
export function getVulnerabilityBadgeClasses(rate: number): string {
  if (rate >= 0.7) return 'bg-red-500 text-white border-red-600 hover:bg-red-600';
  if (rate >= 0.5) return 'bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-600';
  return 'bg-green-500 text-white border-green-600 hover:bg-green-600';
}
export const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
  '#0891b2', // cyan-600
  '#7c3aed', // violet-600
  '#d97706', // amber-600
];
export function getBarColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
export function getCategoryColor(category: string): string {
  const categoryColors: { [key: string]: string } = {
    'data_extraction': '#3b82f6', // blue-500
    'harmful_content': '#8b5cf6', // violet-500
    'misinformation': '#f59e0b', // amber-500
    'jailbreaking': '#06b6d4', // cyan-500
    'instruction_hijacking': '#ec4899', // pink-500
  };
  return categoryColors[category] || getBarColor(0);
}
export function getDefenseColor(defense: string): string {
  const defenseColors: { [key: string]: string } = {
    'baseline': '#6b7280', // gray-500
    'safety_reinforcement': '#3b82f6', // blue-500
    'role_anchoring': '#8b5cf6', // violet-500
    'input_sanitization': '#f59e0b', // amber-500
    'output_filtering': '#06b6d4', // cyan-500
    'context_isolation': '#ec4899', // pink-500
  };
  return defenseColors[defense] || getBarColor(0);
}
export function getEffectivenessLabel(rate: number): string {
  if (rate >= 0.7) return 'High Effectiveness';
  if (rate >= 0.5) return 'Moderate Effectiveness';
  return 'Low Effectiveness';
}
export function capitalizeWords(str: string): string {
  return str.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}
export interface Defense {
  key: string;
  name: string;
  prefix: string;
  suffix: string;
  description: string;
}
export interface Category {
  key: string;
  name: string;
  description: string;
}
export interface PromptResponse {
  prompt: string;
  category: string;
  defense_type: string;
  models: {
    [modelName: string]: {
      response: string;
      misuse_prevented: boolean;
      confidence_score: number;
    };
  };
}
export interface EffectivenessData {
  defense_type: string;
  category: string;
  models: {
    [modelName: string]: {
      prevention_rate: number;
      confidence: number;
      test_count: number;
    };
  };
  overall_prevention_rate: number;
}
export interface ProcessedDefenseData {
  defense_type: string;
  category: string;
  models: {
    [modelName: string]: {
      prevention_rate: number;
      confidence: number;
      test_count: number;
    };
  };
  overall_prevention_rate: number;
}
export interface ExperimentRow {
  model: string;
  defense_type: string;
  category: string;
  misuse_prevented_mean: number;
  misuse_prevented_sum: number;
  misuse_prevented_count: number;
  confidence_score_mean: number;
}
export interface ChartDataPoint {
  category: string;
  value: number;
  label?: string;
}
export interface ModelComparison {
  model: string;
  response: string;
  prevented: boolean;
  confidence: number;
}
export interface AppState {
  selectedDefense: string | null;
  selectedCategory: string | null;
  currentPromptIndex: number;
}
export const DEFENSE_KEYS = [
  'baseline',
  'safety_reinforcement', 
  'role_anchoring',
  'input_sanitization',
  'output_filtering',
  'context_isolation'
] as const;
export const CATEGORY_KEYS = [
  'data_extraction',
  'harmful_content', 
  'misinformation',
  'jailbreaking',
  'instruction_hijacking'
] as const;
export const MODEL_KEYS = [
  'gpt-4o-mini',
  'gpt-4o',
  'claude-3-haiku-20240307',
  'claude-3-5-sonnet-20241022'
] as const;

export type DefenseKey = typeof DEFENSE_KEYS[number];
export type CategoryKey = typeof CATEGORY_KEYS[number];
export type ModelKey = typeof MODEL_KEYS[number];
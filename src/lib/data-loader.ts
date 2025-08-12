import Papa from 'papaparse';

interface ResponseCsvRow {
  prompt: string;
  category: string;
  model: string;
  defense_type: string;
  defended_prompt: string;
  response: string;
  misuse_prevented: string;
  confidence_score: string;
  timestamp: string;
}

export interface VisualizationData {
  radar_charts: {
    [defense: string]: {
      [category: string]: number;
    };
  };
  heatmap: {
    [model: string]: {
      [defense: string]: {
        [category: string]: number;
      };
    };
  };
  bar_chart: {
    [defense: string]: number;
  };
  category_performance: {
    [category: string]: {
      [defense: string]: number;
    };
  };
  model_performance: {
    [model: string]: {
      [defense: string]: number;
    };
  };
  category_vulnerability: {
    [category: string]: number;
  };
}

export interface ExperimentResponse {
  prompt: string;
  category: string;
  model: string;
  defense_type: string;
  defended_prompt: string;
  response: string;
  misuse_prevented: boolean;
  confidence_score: number;
  timestamp: string;
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

export interface ModelResponse {
  model: string;
  response: string;
  prevented: boolean;
  confidence: number;
}

export interface PromptData {
  prompt: string;
  category: string;
  responses: ModelResponse[];
}

let cachedVisualizationData: VisualizationData | null = null;
let cachedResponseData: ExperimentResponse[] | null = null;

export async function loadVisualizationData(): Promise<VisualizationData> {
  if (cachedVisualizationData) {
    return cachedVisualizationData;
  }

  try {
    const response = await fetch('/visualization_data.json');
    if (!response.ok) {
      throw new Error(`Failed to load visualization data: ${response.status}`);
    }
    cachedVisualizationData = await response.json();
    return cachedVisualizationData!;
  } catch (error) {
    console.error('Error loading visualization data:', error);
    throw error;
  }
}

export async function loadExperimentResponses(): Promise<ExperimentResponse[]> {
  if (cachedResponseData) {
    return cachedResponseData;
  }

  try {
    const response = await fetch('/experiment_summary.csv');
    if (!response.ok) {
      throw new Error(`Failed to load experiment responses: ${response.status}`);
    }
    
    const csvContent = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
          }
          
          try {
            cachedResponseData = (results.data as ResponseCsvRow[]).map(row => ({
              prompt: row.prompt || '',
              category: row.category || '',
              model: row.model || '',
              defense_type: row.defense_type || '',
              defended_prompt: row.defended_prompt || '',
              response: row.response || '',
              misuse_prevented: row.misuse_prevented === 'true' || row.misuse_prevented === 'True',
              confidence_score: parseFloat(row.confidence_score) || 0,
              timestamp: row.timestamp || ''
            })).filter(row => row.prompt && row.category && row.model);
            
            resolve(cachedResponseData!);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: unknown) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading experiment responses:', error);
    throw error;
  }
}

export function convertVisualizationDataToProcessed(vizData: VisualizationData): ProcessedDefenseData[] {
  const result: ProcessedDefenseData[] = [];
  
  Object.entries(vizData.category_performance).forEach(([category, defenseData]) => {
    Object.entries(defenseData).forEach(([defense, rate]) => {
      const existing = result.find(r => r.defense_type === defense && r.category === category);
      if (!existing) {
        const models: { [modelName: string]: { prevention_rate: number; confidence: number; test_count: number } } = {};
        
        Object.entries(vizData.heatmap).forEach(([model, modelData]) => {
          const modelDefenseData = modelData[defense];
          if (modelDefenseData && modelDefenseData[category] !== undefined) {
            models[model] = {
              prevention_rate: modelDefenseData[category],
              confidence: 0.8,  // fallback meh
              test_count: 5  // fallback meh
            };
          }
        });
        
        result.push({
          defense_type: defense,
          category,
          models,
          overall_prevention_rate: rate
        });
      }
    });
  });
  
  return result;
}

export async function getPromptResponses(category: string, defense: string): Promise<PromptData[]> {
  const responses = await loadExperimentResponses();
  
  const promptGroups = new Map<string, ModelResponse[]>();
  
  responses
    .filter(r => r.category === category && r.defense_type === defense)
    .forEach(r => {
      if (!promptGroups.has(r.prompt)) {
        promptGroups.set(r.prompt, []);
      }
      
      promptGroups.get(r.prompt)!.push({
        model: r.model,
        response: r.response,
        prevented: r.misuse_prevented,
        confidence: r.confidence_score
      });
    });
  
  return Array.from(promptGroups.entries()).map(([prompt, modelResponses]) => ({
    prompt,
    category,
    responses: modelResponses
  }));
}

export async function loadDefenseAnalysisData(): Promise<ProcessedDefenseData[]> {
  const vizData = await loadVisualizationData();
  return convertVisualizationDataToProcessed(vizData);
}
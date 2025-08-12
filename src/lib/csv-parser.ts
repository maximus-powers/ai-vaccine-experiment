import Papa from 'papaparse';
import { ExperimentRow, EffectivenessData } from './types';

export async function parseExperimentCSV(csvContent: string): Promise<ExperimentRow[]> {
  return new Promise((resolve, reject) => {
    const lines = csvContent.split('\n');
    const dataLines = lines.slice(2); // skip the header rows
    const csvData = dataLines.join('\n');

    Papa.parse(csvData, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
        }
        
        try {
          const data: ExperimentRow[] = [];
          
          results.data.forEach((row: unknown) => {
            if (Array.isArray(row) && row.length >= 7 && row[0] && row[1] && row[2]) {
              data.push({
                model: row[0],
                defense_type: row[1],
                category: row[2],
                misuse_prevented_mean: parseFloat(row[3]) || 0,
                misuse_prevented_sum: parseFloat(row[4]) || 0,
                misuse_prevented_count: parseFloat(row[5]) || 0,
                confidence_score_mean: parseFloat(row[6]) || 0
              });
            }
          });
          
          console.log('Parsed CSV data:', data.slice(0, 5)); // Log first 5 rows for debugging
          resolve(data);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export function aggregateEffectivenessData(rows: ExperimentRow[]): EffectivenessData[] {
  const grouped = new Map<string, ExperimentRow[]>();
  
  // Group by defense_type and category
  rows.forEach(row => {
    const key = `${row.defense_type}-${row.category}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(row);
  });

  // Convert to EffectivenessData format
  const result: EffectivenessData[] = [];
  
  grouped.forEach((groupRows, key) => {
    const [defense_type, category] = key.split('-');
    
    const models: { [modelName: string]: { prevention_rate: number; confidence: number; test_count: number } } = {};
    let totalPrevention = 0;
    let totalTests = 0;
    
    groupRows.forEach(row => {
      models[row.model] = {
        prevention_rate: row.misuse_prevented_mean,
        confidence: row.confidence_score_mean,
        test_count: row.misuse_prevented_count
      };
      totalPrevention += row.misuse_prevented_sum;
      totalTests += row.misuse_prevented_count;
    });
    
    result.push({
      defense_type,
      category,
      models,
      overall_prevention_rate: totalTests > 0 ? totalPrevention / totalTests : 0
    });
  });

  return result;
}

export async function loadExperimentData(): Promise<EffectivenessData[]> {
  try {
    console.log('Loading experiment data...');
    const response = await fetch('/experiment_summary.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch experiment data: ${response.status}`);
    }
    const csvContent = await response.text();
    console.log('CSV content loaded, first 500 chars:', csvContent.slice(0, 500));
    const rows = await parseExperimentCSV(csvContent);
    console.log('Parsed rows:', rows.length);
    const aggregated = aggregateEffectivenessData(rows);
    console.log('Aggregated effectiveness data:', aggregated.length);
    return aggregated;
  } catch (error) {
    console.error('Error loading experiment data:', error);
    throw error;
  }
}
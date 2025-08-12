'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DEFENSES } from '@/lib/data';
import { loadDefenseAnalysisData } from '@/lib/data-loader';
import { ProcessedDefenseData, DefenseKey } from '@/lib/types';
import { formatPercentage } from '@/lib/utils';
import { MdShowChart, MdFilterList } from 'react-icons/md';
import { RiShieldLine } from 'react-icons/ri';
import { VscBracketDot } from 'react-icons/vsc';
import { GiBroom } from 'react-icons/gi';
import { MdAnchor } from 'react-icons/md';

interface DefenseSelectorProps {
  onDefenseSelect: (defense: DefenseKey) => void;
  selectedDefense: DefenseKey | null;
}

export default function DefenseSelector({ onDefenseSelect, selectedDefense }: DefenseSelectorProps) {
  const [effectivenessData, setEffectivenessData] = useState<ProcessedDefenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await loadDefenseAnalysisData();
        setEffectivenessData(data);
      } catch (err) {
        setError('Failed to load experiment data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getDefenseEffectiveness = (defenseKey: DefenseKey) => {
    const defenseData = effectivenessData.filter(d => d.defense_type === defenseKey);
    if (defenseData.length === 0) return 0;
    
    const totalRate = defenseData.reduce((sum, d) => sum + d.overall_prevention_rate, 0);
    return totalRate / defenseData.length;
  };

  const defenseScores = Object.keys(DEFENSES).map(key => ({
    key: key as DefenseKey,
    effectiveness: getDefenseEffectiveness(key as DefenseKey)
  })).sort((a, b) => b.effectiveness - a.effectiveness);

  const getNormalizedBadgeClasses = (defenseKey: DefenseKey) => {
    const rank = defenseScores.findIndex(d => d.key === defenseKey);
    const totalDefenses = defenseScores.length;
    
    if (rank === 0) return 'bg-green-500 text-white border-green-600 hover:bg-green-600'; // Highest
    if (rank === totalDefenses - 1) return 'bg-red-500 text-white border-red-600 hover:bg-red-600'; // Lowest
    if (rank <= Math.floor(totalDefenses / 3)) return 'bg-green-400 text-white border-green-500 hover:bg-green-500'; // High tier
    if (rank >= Math.floor(totalDefenses * 2 / 3)) return 'bg-red-400 text-white border-red-500 hover:bg-red-500'; // Low tier
    return 'bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-600'; // Middle tier
  };

  const getNormalizedEffectivenessLabel = (defenseKey: DefenseKey) => {
    if (defenseKey === 'baseline') return 'Baseline';
    
    const rank = defenseScores.findIndex(d => d.key === defenseKey);
    const totalDefenses = defenseScores.length;
    
    if (rank === 0) return 'Highest';
    if (rank === totalDefenses - 1) return 'Lowest';
    if (rank <= Math.floor(totalDefenses / 3)) return 'High';
    if (rank >= Math.floor(totalDefenses * 2 / 3)) return 'Low';
    return 'Moderate';
  };

  const getDefenseIcon = (defenseKey: DefenseKey) => {
    const iconMap = {
      baseline: MdShowChart,
      safety_reinforcement: RiShieldLine, 
      role_anchoring: MdAnchor,
      input_sanitization: GiBroom, 
      output_filtering: MdFilterList,
      context_isolation: VscBracketDot 
    };
    return iconMap[defenseKey] || RiShieldLine;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-3 text-black font-medium">Loading defense data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-black mb-2 font-bold">Error loading data</div>
        <div className="text-sm text-gray-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-black">
          Prompt Defense Techniques
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-6">
          Select a defense technique to analyze its effectiveness against different types of malicious prompts.
        </p>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(DEFENSES).map((defense) => {
          const effectiveness = getDefenseEffectiveness(defense.key as DefenseKey);
          const IconComponent = getDefenseIcon(defense.key as DefenseKey);
          const isSelected = selectedDefense === defense.key;

          return (
            <Card 
              key={defense.key}
              className={`cursor-pointer transition-all duration-300 border-2 bg-white text-black ${
                isSelected 
                  ? 'border-black shadow-lg' 
                  : 'border-gray-300 hover:border-black hover:shadow-md'
              }`}
              onClick={() => onDefenseSelect(defense.key as DefenseKey)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg border-2 ${
                    isSelected 
                      ? 'bg-black border-black' 
                      : 'bg-white border-gray-400'
                  }`}>
                    <IconComponent className={`h-5 w-5 ${
                      isSelected ? 'text-white' : 'text-black'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-black">{defense.name}</CardTitle>
                  </div>
                  <Badge 
                    className={`text-xs px-2 py-1 font-bold border-2 ${getNormalizedBadgeClasses(defense.key as DefenseKey)}`}
                  >
                    {formatPercentage(effectiveness)}
                  </Badge>
                </div>
                <CardDescription className="text-sm text-gray-600">
                  {defense.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {(defense.prefix || defense.suffix) && (
                    <div className="text-sm">
                      <div className="font-medium text-black mb-1">Implementation:</div>
                      {defense.prefix && (
                        <div className="text-xs bg-gray-100 border border-gray-300 p-2 rounded mb-1 text-black">
                          <span className="font-medium">Prefix:</span> {defense.prefix}
                        </div>
                      )}
                      {defense.suffix && (
                        <div className="text-xs bg-gray-100 border border-gray-300 p-2 rounded text-black">
                          <span className="font-medium">Suffix:</span> {defense.suffix}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                      Overall Effectiveness
                    </div>
                    <div className="text-sm font-bold text-black">
                      {getNormalizedEffectivenessLabel(defense.key as DefenseKey)}
                    </div>
                  </div>

                  {isSelected && (
                    <Button 
                      className="w-full mt-3 bg-black text-white border-2 border-black hover:bg-white hover:text-black"
                      onClick={() => onDefenseSelect(defense.key as DefenseKey)}
                    >
                      Analyze This Defense
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

       {/* Badge Links */}
       <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <a 
            href="https://colab.research.google.com/drive/1FpyOhOy21hg9Ngv2QzLdfnPWeT-HwUcZ?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img 
              src="https://colab.research.google.com/assets/colab-badge.svg" 
              alt="Open In Colab"
              className="h-8"
            />
          </a>
          
          <a 
            href="https://github.com/maximus-powers/ai-vaccine-experiment"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img 
              src="https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github" 
              alt="View on GitHub"
              className="h-8"
            />
          </a>
        </div>
    </div>
  );
}
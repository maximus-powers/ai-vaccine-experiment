'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DEFENSES, CATEGORIES, MODEL_NAMES } from '@/lib/data';
import { loadDefenseAnalysisData, getPromptResponses, PromptData } from '@/lib/data-loader';
import { ProcessedDefenseData, DefenseKey, CategoryKey, ModelKey } from '@/lib/types';
import { formatPercentage, getCategoryColor, getPreventionBadgeClasses } from '@/lib/utils';
import { ArrowLeft, BarChart3, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { RiShieldLine } from 'react-icons/ri';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DefenseDetailProps {
  defenseKey: DefenseKey;
  onBack: () => void;
}

export default function DefenseDetail({ defenseKey, onBack }: DefenseDetailProps) {
  const [effectivenessData, setEffectivenessData] = useState<ProcessedDefenseData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [promptData, setPromptData] = useState<PromptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  const defense = DEFENSES[defenseKey];

  useEffect(() => {
    async function loadData() {
      try {
        const data = await loadDefenseAnalysisData();
        setEffectivenessData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadPrompts() {
      if (selectedCategory && defenseKey) {
        setLoadingPrompts(true);
        try {
          const prompts = await getPromptResponses(selectedCategory, defenseKey);
          setPromptData(prompts);
          setCurrentPromptIndex(0);
        } catch (err) {
          console.error('Error loading prompt responses:', err);
        } finally {
          setLoadingPrompts(false);
        }
      }
    }
    loadPrompts();
  }, [selectedCategory, defenseKey]);

  // Get effectiveness data for this defense
  const defenseData = effectivenessData.filter(d => d.defense_type === defenseKey);
  
  // Prepare chart data with colors
  const chartData = Object.values(CATEGORIES).map((category) => {
    const categoryData = defenseData.find(d => d.category === category.key);
    return {
      category: category.name,
      effectiveness: categoryData ? categoryData.overall_prevention_rate * 100 : 0,
      fill: getCategoryColor(category.key)
    };
  });

  // Get current prompt data
  const getCurrentPromptData = () => {
    if (!selectedCategory || promptData.length === 0) return null;
    
    return promptData[currentPromptIndex] || null;
  };

  const handleCategorySelect = (categoryKey: CategoryKey) => {
    setSelectedCategory(categoryKey);
    setCurrentPromptIndex(0);
  };

  const navigatePrompt = (direction: 'prev' | 'next') => {
    if (promptData.length === 0) return;
    
    const maxIndex = promptData.length - 1;
    
    if (direction === 'prev' && currentPromptIndex > 0) {
      setCurrentPromptIndex(currentPromptIndex - 1);
    } else if (direction === 'next' && currentPromptIndex < maxIndex) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-3 text-black font-medium">Loading defense analysis...</span>
      </div>
    );
  }

  const currentPrompt = getCurrentPromptData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="flex items-center gap-2 bg-white text-black border-2 border-black hover:bg-black hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Selection
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-black">{defense.name}</h1>
          <p className="text-gray-700">{defense.description}</p>
        </div>
      </div>

      {/* Defense Implementation Card */}
      <Card className="bg-white border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <RiShieldLine className="h-5 w-5 text-black" />
            Defense Implementation
          </CardTitle>
          <CardDescription className="text-gray-700">
            How this defense technique modifies prompts before sending to AI models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {defense.prefix && (
            <div>
              <h4 className="font-medium text-sm text-black mb-2">Prefix Added:</h4>
              <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-3 text-sm font-mono text-black">
                {defense.prefix}
              </div>
            </div>
          )}
          
          {defense.suffix && (
            <div>
              <h4 className="font-medium text-sm text-black mb-2">Suffix Added:</h4>
              <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-3 text-sm font-mono text-black">
                {defense.suffix}
              </div>
            </div>
          )}

          {!defense.prefix && !defense.suffix && (
            <div className="text-center py-8">
              <RiShieldLine className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-black">This is the baseline - no modifications are made to prompts</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Effectiveness Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Effectiveness by Attack Category
          </CardTitle>
          <CardDescription>
            Prevention rates across different types of malicious prompts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12, fill: 'black' }}
                angle={-45}
                textAnchor="end"
                height={100}
                stroke="black"
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fill: 'black' }}
                tickFormatter={(value) => `${value}%`}
                stroke="black"
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Effectiveness']}
                labelStyle={{ color: 'black' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '2px solid black',
                  borderRadius: '4px',
                  color: 'black'
                }}
              />
              <Bar 
                dataKey="effectiveness" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Analyze Specific Prompts
          </CardTitle>
          <CardDescription>
            Select an attack category to see how this defense handles specific malicious prompts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.values(CATEGORIES).map((category) => {
              const categoryData = defenseData.find(d => d.category === category.key);
              const effectiveness = categoryData ? categoryData.overall_prevention_rate : 0;
              const isSelected = selectedCategory === category.key;

              return (
                <Card 
                  key={category.key}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleCategorySelect(category.key as CategoryKey)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-sm font-medium mb-1">{category.name}</div>
                    <Badge 
                      className={`text-xs border-2 ${getPreventionBadgeClasses(effectiveness)}`}
                    >
                      {formatPercentage(effectiveness)}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Prompt Analysis */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{CATEGORIES[selectedCategory].name} Analysis</CardTitle>
                <CardDescription>
                  Prompt {currentPromptIndex + 1} of {promptData.length}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigatePrompt('prev')}
                  disabled={currentPromptIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigatePrompt('next')}
                  disabled={currentPromptIndex === promptData.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingPrompts ? (
              <div className="flex items-center justify-center p-8">
                <div className="loading-spinner w-6 h-6"></div>
                <span className="ml-3 text-black">Loading responses...</span>
              </div>
            ) : currentPrompt ? (
              <>
                {/* Malicious Prompt */}
                <div>
                  <h4 className="font-medium text-sm text-red-700 mb-2">Original Malicious Prompt:</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                    {currentPrompt.prompt}
                  </div>
                </div>

                {/* Applied Defense - Show only if defense has modifications */}
                {(defense.prefix || defense.suffix) && (
                  <div>
                    <h4 className="font-medium text-sm text-blue-700 mb-2">With {defense.name} Applied:</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm font-mono">
                      <span className="text-blue-600">{defense.prefix}</span>
                      <span className="mx-2 text-gray-800">{currentPrompt.prompt}</span>
                      <span className="text-green-600">{defense.suffix}</span>
                    </div>
                  </div>
                )}

                {/* Model Responses */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-3">Actual Model Responses:</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {currentPrompt.responses.map((response, idx) => {
                      const modelName = MODEL_NAMES[response.model as ModelKey] || response.model;
                      
                      return (
                        <Card key={`${response.model}-${idx}`} className="bg-gray-50">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{modelName}</CardTitle>
                              <Badge 
                                className={`text-xs ${
                                  response.prevented 
                                    ? 'bg-green-600 text-white border-transparent hover:bg-green-700' 
                                    : 'bg-red-600 text-white border-transparent hover:bg-red-700'
                                }`}
                              >
                                {response.prevented ? 'Prevented' : 'Failed'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm bg-white border rounded p-3 max-h-40 overflow-y-auto">
                              {response.response || 'No response available'}
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                              Confidence: {formatPercentage(response.confidence)}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No prompt data available for this category and defense combination.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
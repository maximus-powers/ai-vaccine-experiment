'use client';

import { useState } from 'react';
import DefenseSelector from '@/components/DefenseSelector';
import DefenseDetail from '@/components/DefenseDetail';
import { DefenseKey } from '@/lib/types';

export default function Home() {
  const [selectedDefense, setSelectedDefense] = useState<DefenseKey | null>(null);

  const handleDefenseSelect = (defense: DefenseKey) => {
    setSelectedDefense(defense);
  };

  const handleBack = () => {
    setSelectedDefense(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedDefense ? (
          <DefenseDetail 
            defenseKey={selectedDefense} 
            onBack={handleBack} 
          />
        ) : (
          <DefenseSelector 
            onDefenseSelect={handleDefenseSelect}
            selectedDefense={selectedDefense}
          />
        )}
      </div>
    </div>
  );
}

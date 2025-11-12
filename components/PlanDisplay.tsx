import React, { useMemo } from 'react';

interface PlanDisplayProps {
  plan: string;
  diagrams: string[] | null;
  isGeneratingDiagrams: boolean;
  onGenerateDiagrams: () => void;
  onReset: () => void;
}

interface ParsedExercise {
  title: string;
  description: string;
  diagram?: string;
}

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, diagrams, isGeneratingDiagrams, onGenerateDiagrams, onReset }) => {
  const parsedPlan = useMemo(() => {
    const lines = plan.split('\n').filter(line => line.trim() !== '');
    const sections: { title: string; content: (string | ParsedExercise)[] } = {
      title: '',
      content: [],
    };
    let currentSection = '';
    let currentExercise: ParsedExercise | null = null;
    let exerciseCounter = 0;

    for (const line of lines) {
      if (line.startsWith('**Entrenamiento')) {
        sections.title = line.replace(/\*\*/g, '');
        continue;
      }
      if (line.startsWith('**Duración')) {
         sections.content.push(line.replace(/\*\*/g, ''));
         continue;
      }
      if (line.startsWith('**1️⃣') || line.startsWith('**2️⃣') || line.startsWith('**3️⃣')) {
        currentSection = line.startsWith('**2️⃣') ? 'main' : 'other';
        if (currentExercise) {
          sections.content.push(currentExercise);
          currentExercise = null;
        }
        sections.content.push(line.replace(/\*\*/g, ''));
        continue;
      }
      if (line.startsWith('- **')) {
        if (currentExercise) {
          sections.content.push(currentExercise);
        }
        const title = line.replace(/- \*\*/g, '').replace(/\*\*:/g, '');
        currentExercise = { 
          title, 
          description: '', 
          diagram: currentSection === 'main' && diagrams ? diagrams[exerciseCounter] : undefined
        };
        if(currentSection === 'main') exerciseCounter++;

      } else if (currentExercise) {
        currentExercise.description += (currentExercise.description ? '\n' : '') + line.replace(/^- /, '');
      } else if (!line.startsWith('- **') && line.startsWith('- ')){
          sections.content.push(line);
      }
    }
    if (currentExercise) {
      sections.content.push(currentExercise);
    }
    return sections;
  }, [plan, diagrams]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 animate-fade-in">
      <div className="prose prose-invert max-w-none text-gray-300">
        <h1 className="text-2xl md:text-3xl font-bold text-green-400 mb-2 text-center">{parsedPlan.title}</h1>
        {parsedPlan.content.map((item, index) => {
          if (typeof item === 'string') {
            if (item.startsWith('1️⃣') || item.startsWith('2️⃣') || item.startsWith('3️⃣')) {
                return <h2 key={index} className="text-xl md:text-2xl font-bold text-green-400 mt-6 mb-3">{item}</h2>;
            }
            if(item.startsWith('Duración')) {
                return <p key={index} className="text-center text-gray-400 font-semibold mb-6">{item}</p>
            }
            return <p key={index} className="ml-4">{item}</p>;
          }
          // It's a ParsedExercise
          return (
            <div key={index} className="mt-4 p-4 bg-gray-900/50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-100">{item.title}</h3>
              <p className="text-gray-300 whitespace-pre-line mt-1">{item.description}</p>
              {item.diagram && (
                 <div className="mt-4 bg-green-800/20 p-2 rounded-md border border-gray-700">
                    <div dangerouslySetInnerHTML={{ __html: item.diagram }} />
                 </div>
              )}
            </div>
          );
        })}
      </div>
      
      {!diagrams && (
        <button
            onClick={onGenerateDiagrams}
            disabled={isGeneratingDiagrams}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
        >
            {isGeneratingDiagrams ? (
                <>
                    <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
                    <span>Creando Diagramas...</span>
                </>
            ) : (
                'Generar Diagramas Visuales'
            )}
        </button>
      )}

      <button
        onClick={onReset}
        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        Crear Otro Plan
      </button>
    </div>
  );
};

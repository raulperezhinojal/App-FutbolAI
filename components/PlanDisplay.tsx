import React, { useMemo, useRef, useState } from 'react';

// Declare CDN libraries to TypeScript
declare const html2canvas: any;
declare const jspdf: any;

interface PlanDisplayProps {
  plan: string;
  diagrams: Record<string, string> | null;
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
  const planRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const parsedPlan = useMemo(() => {
    const lines = plan.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return { title: '', content: [] };

    const title = lines.shift() || 'Plan de Entrenamiento';
    const content: (string | ParsedExercise)[] = [];
    let currentExercise: ParsedExercise | null = null;
    let inMainSection = false;

    for (const line of lines) {
      if (line.match(/^\d\./)) { // Is a section title like "1. Calentamiento"
        if (currentExercise) {
          content.push(currentExercise);
          currentExercise = null;
        }
        content.push(line);
        inMainSection = line.startsWith('2.');
        continue;
      }

      const separatorIndex = line.indexOf(':');
      // It's an exercise if it has a colon and is not a duration line
      if (separatorIndex > 0 && !line.toLowerCase().includes('duración total')) {
        if (currentExercise) {
          content.push(currentExercise);
        }
        const rawTitle = line.substring(0, separatorIndex);
        // Robustly clean the exercise title to match the key from the diagrams map.
        // This logic must be identical to the cleaning logic in geminiService.ts.
        const exTitle = rawTitle
            .trim()
            .replace(/^[\d\w][\.\)]\s*|^[*-]\s*/, '') // Remove list markers like "1. ", "- ", "a) "
            .replace(/[*_`#~]/g, '') // Remove markdown emphasis
            .trim();
            
        const exDesc = line.substring(separatorIndex + 1).trim();
        currentExercise = { title: exTitle, description: exDesc };
        if (inMainSection && diagrams && diagrams[exTitle]) {
          currentExercise.diagram = diagrams[exTitle];
        }
      } else if (currentExercise) {
        currentExercise.description += '\n' + line;
      } else {
        content.push(line); // Duration line or other text
      }
    }
    if (currentExercise) {
      content.push(currentExercise);
    }

    return { title, content };
  }, [plan, diagrams]);


  const handleExport = async (format: 'png' | 'pdf') => {
    if (!planRef.current || isExporting) return;
    setIsExporting(true);

    const element = planRef.current;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution output
        backgroundColor: '#1f2937', // bg-gray-800
        useCORS: true,
      });

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = 'plan-entrenamiento.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else { // pdf
        // FIX: Define imgData from canvas before using it.
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = jspdf;
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('plan-entrenamiento.pdf');
      }
    } catch (error) {
      console.error('Error exporting plan:', error);
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <>
      <div ref={planRef} className="w-full max-w-4xl mx-auto bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 animate-fade-in">
        <div className="prose prose-invert max-w-none text-gray-300">
          <h1 className="text-2xl md:text-3xl font-bold text-green-400 mb-2 text-center">{parsedPlan.title}</h1>
          {parsedPlan.content.map((item, index) => {
            if (typeof item === 'string') {
              if (item.match(/^\d\./)) {
                  return <h2 key={index} className="text-xl md:text-2xl font-bold text-green-400 mt-6 mb-3">{item}</h2>;
              }
              if(item.toLowerCase().startsWith('duración total')) {
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
                   <div className="mt-4 bg-green-900/30 p-2 rounded-md border border-gray-700 overflow-hidden">
                      <div dangerouslySetInnerHTML={{ __html: item.diagram }} />
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="w-full max-w-4xl mx-auto mt-6">
        {!diagrams && (
          <button
              onClick={onGenerateDiagrams}
              disabled={isGeneratingDiagrams}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
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

        {diagrams && Object.keys(diagrams).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => handleExport('png')} disabled={isExporting} className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                <span>{isExporting ? 'Exportando...' : 'Exportar PNG'}</span>
            </button>
            <button onClick={() => handleExport('pdf')} disabled={isExporting} className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                <span>{isExporting ? 'Exportando...' : 'Exportar PDF'}</span>
            </button>
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Crear Otro Plan
        </button>
      </div>
    </>
  );
};
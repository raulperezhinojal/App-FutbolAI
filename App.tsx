import React, { useState, useCallback } from 'react';
import { AppStep } from './types';
import { generateTrainingPlan, generateDiagrams } from './services/geminiService';
import { FutbolIcon } from './components/icons/FutbolIcon';
import { PlanDisplay } from './components/PlanDisplay';

const groupSizeOptions = ['Solo', 'Grupo Pequeño', 'Equipo'] as const;
type GroupSize = typeof groupSizeOptions[number];

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.Start);
  const [userInput, setUserInput] = useState<string>('');
  const [groupSize, setGroupSize] = useState<GroupSize>('Solo');
  const [plan, setPlan] = useState<string | null>(null);
  const [diagrams, setDiagrams] = useState<Record<string, string> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingDiagrams, setIsGeneratingDiagrams] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleGeneratePlan = useCallback(async () => {
    if (!userInput.trim()) {
      setError('Por favor, describe qué te gustaría entrenar.');
      return;
    }
    setStep(AppStep.Generating);
    setIsGenerating(true);
    setError(null);
    try {
      const generatedPlan = await generateTrainingPlan(userInput, groupSize);
      setPlan(generatedPlan);
      setStep(AppStep.Plan);
    } catch (e) {
      setError('Hubo un problema al generar el plan. Por favor, intenta de nuevo.');
      setStep(AppStep.Start);
    } finally {
      setIsGenerating(false);
    }
  }, [userInput, groupSize]);

  const handleGenerateDiagrams = useCallback(async () => {
      if (!plan) return;
      setIsGeneratingDiagrams(true);
      setError(null);
      try {
        const generatedDiagrams = await generateDiagrams(plan);
        setDiagrams(generatedDiagrams);
      } catch (e) {
        setError('No se pudieron generar los diagramas. Inténtalo de nuevo.');
      } finally {
        setIsGeneratingDiagrams(false);
      }
  }, [plan]);

  const reset = () => {
    setStep(AppStep.Start);
    setUserInput('');
    setPlan(null);
    setDiagrams(null);
    setIsGenerating(false);
    setIsGeneratingDiagrams(false);
    setError(null);
    setGroupSize('Solo');
  }

  const renderContent = () => {
    switch (step) {
      case AppStep.Start:
        return (
          <div className="text-center animate-fade-in w-full max-w-lg mx-auto">
            <FutbolIcon className="w-24 h-24 mx-auto text-green-400 mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Entrenador de Fútbol AI</h1>
            <p className="text-lg text-gray-400 mb-6">Describe qué quieres entrenar hoy. Por ejemplo: "Quiero mejorar mi resistencia y los pases largos para jugar de mediocampista".</p>
            <textarea
              className="w-full h-28 p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
              placeholder="Escribe aquí tus objetivos de entrenamiento..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <div className="my-4">
              <label className="block text-lg text-gray-400 mb-2">¿Para quién es el entrenamiento?</label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-800 rounded-lg">
                {groupSizeOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => setGroupSize(option)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 ${
                      groupSize === option
                        ? 'bg-green-600 text-white shadow'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                  <>
                      <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
                      <span>Generando Plan...</span>
                  </>
              ) : (
                  'Crear Mi Plan de Entrenamiento'
              )}
            </button>
          </div>
        );
      
      case AppStep.Generating:
        return (
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-green-500 mx-auto mb-4"></div>
                <h2 className="text-2xl font-semibold text-gray-300">Generando tu plan...</h2>
                <p className="text-gray-400">El coach está preparando tus ejercicios.</p>
            </div>
        );

      case AppStep.Plan:
        return plan ? <PlanDisplay 
                        plan={plan} 
                        diagrams={diagrams}
                        isGeneratingDiagrams={isGeneratingDiagrams}
                        onGenerateDiagrams={handleGenerateDiagrams}
                        onReset={reset} /> : null;
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md md:max-w-4xl my-8">
        {renderContent()}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default App;
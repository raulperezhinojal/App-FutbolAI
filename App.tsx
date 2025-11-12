import React, { useState, useCallback, useMemo } from 'react';
import { Selections, AppStep, TrainingType, Difficulty, GroupSize } from './types';
import { generateTrainingPlan, generateDiagrams } from './services/geminiService';
import { FutbolIcon } from './components/icons/FutbolIcon';
import { PlanDisplay } from './components/PlanDisplay';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.Start);
  const [selections, setSelections] = useState<Selections>({
    trainingType: null,
    difficulty: null,
    duration: 60,
    groupSize: null,
  });
  const [plan, setPlan] = useState<string | null>(null);
  const [diagrams, setDiagrams] = useState<string[] | null>(null);
  const [isGeneratingDiagrams, setIsGeneratingDiagrams] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSelection = (key: keyof Selections, value: any) => {
    setSelections(prev => ({ ...prev, [key]: value }));
  };

  const handleNextStep = () => {
    setStep(prev => prev + 1);
  };
  
  const handleGeneratePlan = useCallback(async () => {
    setStep(AppStep.Generating);
    setError(null);
    try {
      const generatedPlan = await generateTrainingPlan(selections);
      setPlan(generatedPlan);
      setStep(AppStep.Plan);
    } catch (e) {
      setError('Hubo un problema al generar el plan. Por favor, intenta de nuevo.');
      setStep(AppStep.GroupSize); // Go back to the last step
    }
  }, [selections]);

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
    setSelections({
      trainingType: null,
      difficulty: null,
      duration: 60,
      groupSize: null,
    });
    setPlan(null);
    setDiagrams(null);
    setIsGeneratingDiagrams(false);
    setError(null);
  }

  const renderContent = () => {
    switch (step) {
      case AppStep.Start:
        return (
          <div className="text-center">
            <FutbolIcon className="w-24 h-24 mx-auto text-green-400 mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Entrenador de Fútbol AI</h1>
            <p className="text-lg text-gray-400 mb-8">Crea tu sesión de entrenamiento personalizada en segundos.</p>
            <button onClick={handleNextStep} className="w-full max-w-xs mx-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105">
              Comenzar
            </button>
          </div>
        );
      
      case AppStep.TrainingType:
        return <Question title="¿Qué tipo de entrenamiento quieres hacer hoy?" options={Object.values(TrainingType)} selected={selections.trainingType} onSelect={(val) => handleSelection('trainingType', val)} onNext={handleNextStep} />;
        
      case AppStep.Difficulty:
        return <Question title="Selecciona el nivel de dificultad" options={Object.values(Difficulty)} selected={selections.difficulty} onSelect={(val) => handleSelection('difficulty', val)} onNext={handleNextStep} />;
      
      case AppStep.Duration:
        return (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">¿Cuál será la duración total?</h2>
            <div className="flex items-center justify-center gap-4 bg-gray-800 p-4 rounded-lg">
                <input type="range" min="30" max="120" step="5" value={selections.duration} onChange={(e) => handleSelection('duration', parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500" />
                <span className="text-xl font-semibold text-green-400 w-24 text-center">{selections.duration} min</span>
            </div>
            <button onClick={handleNextStep} className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105">Siguiente</button>
          </div>
        );
        
      case AppStep.GroupSize:
        return <Question title="¿Entrenas solo o en grupo?" options={Object.values(GroupSize)} selected={selections.groupSize} onSelect={(val) => handleSelection('groupSize', val)} onNext={handleGeneratePlan} isLastStep={true}/>;
        
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

  const progress = useMemo(() => {
    const totalSteps = Object.keys(AppStep).length / 2 - 3; // Start, Generating, Plan are not part of progress
    const currentStepIndex = step - 1;
    if (step <= AppStep.Start || step >= AppStep.Generating) return 0;
    return (currentStepIndex / totalSteps) * 100;
  }, [step]);


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-y-auto">
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 z-10">
        <div className="h-1 bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="w-full max-w-md md:max-w-4xl my-8">
        {renderContent()}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

interface QuestionProps<T extends string> {
  title: string;
  options: T[];
  selected: T | null;
  onSelect: (value: T) => void;
  onNext: () => void;
  isLastStep?: boolean;
}

const Question = <T extends string,>({ title, options, selected, onSelect, onNext, isLastStep = false }: QuestionProps<T>) => {
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">{title}</h2>
      <div className="grid grid-cols-1 gap-3">
        {options.map(option => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 text-lg ${
              selected === option
                ? 'bg-green-500 border-green-500 text-white font-bold shadow-lg'
                : 'bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
       <button 
        onClick={onNext} 
        disabled={!selected}
        className="w-full mt-8 bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isLastStep ? 'Generar Plan' : 'Siguiente'}
      </button>
    </div>
  );
};

export default App;

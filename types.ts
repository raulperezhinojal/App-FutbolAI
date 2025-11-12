
export enum TrainingType {
  Tecnica = 'Técnica',
  Resistencia = 'Resistencia',
  Tactica = 'Táctica',
  Fisico = 'Físico',
  Combinado = 'Combinado',
}

export enum Difficulty {
  Basico = 'Básico',
  Intermedio = 'Intermedio',
  Avanzado = 'Avanzado',
}

export enum GroupSize {
  Solo = 'Solo',
  Grupo = 'En Grupo',
}

export interface Selections {
  trainingType: TrainingType | null;
  difficulty: Difficulty | null;
  duration: number;
  groupSize: GroupSize | null;
}

export enum AppStep {
  Start,
  TrainingType,
  Difficulty,
  Duration,
  GroupSize,
  Generating,
  Plan,
}

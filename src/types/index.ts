export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  notes?: string;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  date: string;      // YYYY-MM-DD
  name?: string;
  exercises: Exercise[];
  startTime?: number; // epoch ms
  endTime?: number;   // epoch ms
}

export interface RoutineExercise {
  name: string;
  plannedSets: number;
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
}

export interface PR {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  date: string;
  foods: FoodItem[];
}

export interface Measurements {
  chest?: number;
  waist?: number;
  arms?: number;
  quads?: number;
}

export interface BodyEntry {
  id: string;
  date: string;
  weight: number;
  measurements?: Measurements;
}

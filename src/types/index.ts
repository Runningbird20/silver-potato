export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  exercises: Exercise[];
}

export interface PR {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string; // YYYY-MM-DD
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number; // g
  carbs: number;   // g
  fat: number;     // g
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  date: string; // YYYY-MM-DD
  foods: FoodItem[];
}

export interface Measurements {
  chest?: number;  // inches
  waist?: number;
  arms?: number;
  quads?: number;
}

export interface BodyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // lbs
  measurements?: Measurements;
}

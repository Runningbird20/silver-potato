import { useCallback, useMemo } from 'react';
import { useAsyncStorage } from './useAsyncStorage';
import { Meal, FoodItem } from '../types';

const uid = () => Math.random().toString(36).slice(2, 9);
const todayDate = () => new Date().toISOString().split('T')[0];

const SEED: Meal[] = [
  {
    id: uid(),
    name: 'Breakfast',
    time: '7:30 AM',
    date: todayDate(),
    foods: [
      { id: uid(), name: 'Eggs (3 large)', calories: 210, protein: 18, carbs: 2, fat: 15 },
      { id: uid(), name: 'Oatmeal (1 cup)', calories: 150, protein: 5, carbs: 27, fat: 3 },
    ],
  },
  {
    id: uid(),
    name: 'Lunch',
    time: '12:30 PM',
    date: todayDate(),
    foods: [
      { id: uid(), name: 'Chicken Breast (6oz)', calories: 280, protein: 53, carbs: 0, fat: 6 },
      { id: uid(), name: 'Brown Rice (1 cup)', calories: 220, protein: 5, carbs: 46, fat: 2 },
      { id: uid(), name: 'Broccoli', calories: 55, protein: 4, carbs: 11, fat: 0 },
    ],
  },
];

export function useNutrition() {
  const [meals, setMeals, loading] = useAsyncStorage<Meal[]>('@meals', SEED);

  const todayMeals = useMemo(
    () => meals.filter((m) => m.date === todayDate()),
    [meals]
  );

  const dailyTotals = useMemo(
    () =>
      todayMeals.reduce(
        (totals, meal) => {
          meal.foods.forEach((f) => {
            totals.calories += f.calories;
            totals.protein += f.protein;
            totals.carbs += f.carbs;
            totals.fat += f.fat;
          });
          return totals;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [todayMeals]
  );

  const addMeal = useCallback(
    (name: string, time: string) => {
      const meal: Meal = { id: uid(), name, time, date: todayDate(), foods: [] };
      setMeals([...meals, meal]);
    },
    [meals, setMeals]
  );

  const logMeal = addMeal;

  const addFoodItem = useCallback(
    (mealId: string, food: Omit<FoodItem, 'id'>) => {
      setMeals(
        meals.map((m) =>
          m.id === mealId
            ? { ...m, foods: [...m.foods, { ...food, id: uid() }] }
            : m
        )
      );
    },
    [meals, setMeals]
  );

  const removeMeal = useCallback(
    (id: string) => setMeals(meals.filter((m) => m.id !== id)),
    [meals, setMeals]
  );

  return {
    meals: todayMeals,
    allMeals: meals,
    loading,
    addMeal,
    logMeal,
    addFoodItem,
    removeMeal,
    dailyTotals,
  };
}

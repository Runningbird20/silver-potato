import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Meal, FoodItem } from '../types';
import { theme } from '../theme';

interface Props {
  meal: Meal;
  onAddFood: (food: Omit<FoodItem, 'id'>) => void;
  onRemove: () => void;
}

export function MealCard({ meal, onAddFood, onRemove }: Props) {
  const [name, setName] = useState('');
  const [cals, setCals] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const mealTotals = meal.foods.reduce(
    (t, f) => ({
      calories: t.calories + f.calories,
      protein: t.protein + f.protein,
      carbs: t.carbs + f.carbs,
      fat: t.fat + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const submitFood = () => {
    if (!name.trim() || !cals) return;
    onAddFood({
      name: name.trim(),
      calories: parseFloat(cals) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
    });
    setName('');
    setCals('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.time}>{meal.time}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.totalCals}>{mealTotals.calories} cal</Text>
          <TouchableOpacity onPress={onRemove}>
            <Text style={styles.remove}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {meal.foods.length > 0 && (
        <View style={styles.foodHeader}>
          <Text style={[styles.foodCol, { flex: 2 }]}>FOOD</Text>
          <Text style={styles.foodCol}>CAL</Text>
          <Text style={styles.foodCol}>P</Text>
          <Text style={styles.foodCol}>C</Text>
          <Text style={styles.foodCol}>F</Text>
        </View>
      )}

      {meal.foods.map((f) => (
        <View key={f.id} style={styles.foodRow}>
          <Text style={styles.foodName} numberOfLines={1}>{f.name}</Text>
          <Text style={styles.foodMacro}>{f.calories}</Text>
          <Text style={styles.foodMacro}>{f.protein}</Text>
          <Text style={styles.foodMacro}>{f.carbs}</Text>
          <Text style={styles.foodMacro}>{f.fat}</Text>
        </View>
      ))}

      {meal.foods.length > 0 && (
        <View style={styles.macroSummary}>
          <Text style={styles.macroChip}>P {mealTotals.protein}g</Text>
          <Text style={styles.macroChip}>C {mealTotals.carbs}g</Text>
          <Text style={styles.macroChip}>F {mealTotals.fat}g</Text>
        </View>
      )}

      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { flex: 2 }]}
          value={name}
          onChangeText={setName}
          placeholder="food name"
          placeholderTextColor={theme.textMuted}
        />
        <TextInput
          style={styles.input}
          value={cals}
          onChangeText={setCals}
          placeholder="cal"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          value={protein}
          onChangeText={setProtein}
          placeholder="P"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          value={carbs}
          onChangeText={setCarbs}
          placeholder="C"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          value={fat}
          onChangeText={setFat}
          placeholder="F"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
        />
        <TouchableOpacity onPress={submitFood} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  mealName: { color: theme.text, fontSize: 16, fontWeight: '600' },
  time: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  totalCals: { color: theme.accent, fontSize: 14, fontWeight: '700' },
  remove: { color: theme.textMuted, fontSize: 16 },
  foodHeader: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  foodCol: {
    flex: 1,
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
  },
  foodName: { flex: 2, color: theme.text, fontSize: 13 },
  foodMacro: { flex: 1, color: theme.textMuted, fontSize: 12, textAlign: 'right' },
  macroSummary: { flexDirection: 'row', gap: 10, marginVertical: 8 },
  macroChip: { color: theme.textMuted, fontSize: 12 },
  addRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: theme.surface,
    color: theme.text,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: 12,
  },
  addBtn: {
    backgroundColor: theme.accent,
    borderRadius: 8,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#000', fontSize: 20, fontWeight: '700', lineHeight: 22 },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNutrition } from '../../src/hooks/useNutrition';
import { MealCard } from '../../src/components/MealCard';
import { theme } from '../../src/theme';

function MacroBox({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <View style={macroStyles.box}>
      <Text style={macroStyles.value}>
        {Math.round(value)}
        {unit}
      </Text>
      <Text style={macroStyles.label}>{label}</Text>
    </View>
  );
}

const macroStyles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center' },
  value: { color: theme.accent, fontSize: 20, fontWeight: '700' },
  label: { color: theme.textMuted, fontSize: 11, marginTop: 2 },
});

export default function NutritionScreen() {
  const { meals, dailyTotals, addMeal, addFoodItem, removeMeal } =
    useNutrition();
  const [mealName, setMealName] = useState('');
  const [mealTime, setMealTime] = useState('');

  const handleAddMeal = () => {
    if (!mealName.trim()) return;
    const time =
      mealTime.trim() ||
      new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    addMeal(mealName.trim(), time);
    setMealName('');
    setMealTime('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>Nutrition</Text>

          <View style={styles.totalsCard}>
            <MacroBox label="Calories" value={dailyTotals.calories} unit="" />
            <MacroBox label="Protein" value={dailyTotals.protein} unit="g" />
            <MacroBox label="Carbs" value={dailyTotals.carbs} unit="g" />
            <MacroBox label="Fat" value={dailyTotals.fat} unit="g" />
          </View>

          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onAddFood={(food) => addFoodItem(meal.id, food)}
              onRemove={() => removeMeal(meal.id)}
            />
          ))}

          <View style={styles.form}>
            <Text style={styles.formTitle}>Add Meal</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 2 }]}
                value={mealName}
                onChangeText={setMealName}
                placeholder="Meal name"
                placeholderTextColor={theme.textMuted}
              />
              <TextInput
                style={[styles.input, styles.flex]}
                value={mealTime}
                onChangeText={setMealTime}
                placeholder="Time (e.g. 6:00 PM)"
                placeholderTextColor={theme.textMuted}
              />
            </View>
            <TouchableOpacity onPress={handleAddMeal} style={styles.addBtn}>
              <Text style={styles.addBtnText}>Add Meal</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  heading: { color: theme.text, fontSize: 26, fontWeight: '700', marginBottom: 16 },
  totalsCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  form: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
    marginTop: 4,
  },
  formTitle: { color: theme.text, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    backgroundColor: theme.surface,
    color: theme.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  addBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});

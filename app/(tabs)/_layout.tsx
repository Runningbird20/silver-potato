import { type ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconsName;
  iconActive: IoniconsName;
}

const TABS: TabConfig[] = [
  { name: 'index', title: 'Schedule', icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'progress', title: 'Progress', icon: 'trophy-outline', iconActive: 'trophy' },
  { name: 'nutrition', title: 'Nutrition', icon: 'nutrition-outline', iconActive: 'nutrition' },
  { name: 'body', title: 'Body', icon: 'body-outline', iconActive: 'body' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.silver,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarLabelStyle: { fontSize: 9, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

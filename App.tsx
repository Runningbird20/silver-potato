import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const tasks = [
  { title: 'Morning review', time: '8:30 AM', tone: '#D6F5DF' },
  { title: 'Design sync', time: '11:00 AM', tone: '#DCEAFF' },
  { title: 'Ship mobile build', time: '3:45 PM', tone: '#FFE0D4' },
];

const stats = [
  { label: 'Focus', value: '3h 20m' },
  { label: 'Budget', value: '$420' },
  { label: 'Streak', value: '12 days' },
];

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.eyebrow}>Today</Text>
            <Text style={styles.title}>Silver Potato</Text>
          </View>
          <View style={styles.iconRow}>
            <Pressable accessibilityLabel="Search" style={styles.iconButton}>
              <Text style={styles.iconText}>⌕</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Notifications"
              style={styles.iconButton}
            >
              <Text style={styles.iconText}>•</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.heroPanel}>
          <Text style={styles.panelKicker}>Daily focus</Text>
          <Text style={styles.heroTitle}>Keep the important stuff moving.</Text>
          <Pressable accessibilityRole="button" style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Add task</Text>
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Next up</Text>
          <Pressable accessibilityRole="button" style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>View all</Text>
          </Pressable>
        </View>

        <View style={styles.taskList}>
          {tasks.map((task) => (
            <View key={task.title} style={styles.taskCard}>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={[styles.taskCheck, { backgroundColor: task.tone }]}
              >
                <Text style={styles.checkText}>✓</Text>
              </View>
              <View>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskTime}>{task.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomTabs}>
        {['Home', 'Plan', 'Settings'].map((tab, index) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: index === 0 }}
            key={tab}
            style={[styles.tab, index === 0 && styles.activeTab]}
          >
            <Text style={[styles.tabText, index === 0 && styles.activeTabText]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F6F1',
  },
  content: {
    gap: 18,
    paddingBottom: 104,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: '#757A84',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#12151B',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
    marginTop: 2,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#FDFCF8',
    borderColor: '#E4E0D6',
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  iconText: {
    color: '#2D3138',
    fontSize: 22,
    fontWeight: '800',
  },
  heroPanel: {
    backgroundColor: '#263945',
    borderRadius: 8,
    gap: 16,
    padding: 22,
  },
  panelKicker: {
    color: '#B7F0C1',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FDFCF8',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
    maxWidth: 300,
  },
  primaryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#B7F0C1',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#183124',
    fontSize: 15,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    backgroundColor: '#FDFCF8',
    borderColor: '#E4E0D6',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 12,
    minHeight: 96,
    padding: 14,
  },
  statLabel: {
    color: '#757A84',
    fontSize: 13,
    fontWeight: '800',
  },
  statValue: {
    color: '#12151B',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 'auto',
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#12151B',
    fontSize: 22,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#E2F3E9',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: '#23614E',
    fontSize: 14,
    fontWeight: '800',
  },
  taskList: {
    gap: 10,
  },
  taskCard: {
    alignItems: 'center',
    backgroundColor: '#FDFCF8',
    borderColor: '#E4E0D6',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  taskCheck: {
    alignItems: 'center',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  checkText: {
    color: '#12151B',
    fontSize: 18,
    fontWeight: '900',
  },
  taskTitle: {
    color: '#12151B',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  taskTime: {
    color: '#757A84',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomTabs: {
    alignSelf: 'center',
    backgroundColor: 'rgba(253, 252, 248, 0.96)',
    borderColor: '#E4E0D6',
    borderRadius: 8,
    borderWidth: 1,
    bottom: 14,
    flexDirection: 'row',
    gap: 6,
    padding: 8,
    position: 'absolute',
  },
  tab: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    width: 92,
  },
  activeTab: {
    backgroundColor: '#D6F5DF',
  },
  tabText: {
    color: '#757A84',
    fontSize: 13,
    fontWeight: '800',
  },
  activeTabText: {
    color: '#153527',
  },
});

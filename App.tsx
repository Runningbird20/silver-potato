import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AuthUser, mockAuth } from './src/auth/mockAuth';
import { OnboardingFlow } from './src/onboarding/OnboardingFlow';
import { getOnboardingProgress } from './src/onboarding/onboardingStorage';
import { SettingsScreen } from './src/settings/SettingsScreen';

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

type AuthMode = 'login' | 'signup';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    let isMounted = true;

    mockAuth.getSession().then((session) => {
      if (isMounted) {
        setUser(session);
        setIsLoadingSession(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setHasCompletedOnboarding(null);
      return;
    }

    setHasCompletedOnboarding(null);
    getOnboardingProgress(user.id).then((progress) => {
      if (isMounted) {
        setHasCompletedOnboarding(progress?.completed ?? false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  async function handleLogout() {
    await mockAuth.signOut();
    setUser(null);
  }

  if (isLoadingSession) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthScreen onAuthenticated={setUser} />;
  }

  if (hasCompletedOnboarding === null) {
    return <LoadingScreen />;
  }

  if (!hasCompletedOnboarding) {
    return (
      <OnboardingFlow
        onComplete={() => setHasCompletedOnboarding(true)}
        user={user}
      />
    );
  }

  return <MainApp user={user} onLogout={handleLogout} />;
}

function LoadingScreen() {
  return (
    <SafeAreaView style={[styles.safeArea, styles.loadingScreen]}>
      <StatusBar style="dark" />
      <ActivityIndicator color="#23614E" />
      <Text style={styles.loadingText}>Loading session</Text>
    </SafeAreaView>
  );
}

function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (user: AuthUser) => void;
}) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignup = mode === 'signup';

  async function handleSubmit() {
    setError('');
    setIsSubmitting(true);

    try {
      const authenticatedUser = isSignup
        ? await mockAuth.signUp(name, email, password)
        : await mockAuth.signIn(email, password);

      onAuthenticated(authenticatedUser);
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : 'Something went wrong. Try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError('');
  }

  return (
    <SafeAreaView style={styles.authSafeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.authKeyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.authContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.authHeader}>
            <Text style={styles.authTitle}>
              {isSignup ? 'Create an account' : 'Welcome back'}
            </Text>
            <Text style={styles.authCopy}>
              {isSignup ? 'Already have an account? Login' : 'New here? Register'}
            </Text>
          </View>

          <View style={styles.segmentedControl}>
            <Pressable
              accessibilityRole="button"
              onPress={() => switchMode('login')}
              style={[styles.segment, !isSignup && styles.activeSegment]}
            >
              <Text
                style={[
                  styles.segmentText,
                  !isSignup && styles.activeSegmentText,
                ]}
              >
                Login
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => switchMode('signup')}
              style={[styles.segment, isSignup && styles.activeSegment]}
            >
              <Text
                style={[
                  styles.segmentText,
                  isSignup && styles.activeSegmentText,
                ]}
              >
                Register
              </Text>
            </Pressable>
          </View>

          <View style={styles.authForm}>
            {isSignup ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  autoCapitalize="words"
                  onChangeText={setName}
                  placeholder="Md uzzal Hossain"
                  placeholderTextColor="#8E939F"
                  style={styles.input}
                  value={name}
                />
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="uzzalh4343@gmail.com"
                placeholderTextColor="#8E939F"
                style={styles.input}
                textContentType="emailAddress"
                value={email}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                autoCapitalize="none"
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#8E939F"
                secureTextEntry
                style={styles.input}
                textContentType={isSignup ? 'newPassword' : 'password'}
                value={password}
              />
            </View>

            {error ? (
              <View accessibilityLiveRegion="polite" style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={[
                styles.fullWidthButton,
                isSubmitting && styles.disabledButton,
              ]}
            >
              <Text style={styles.fullWidthButtonText}>
                {isSubmitting
                  ? 'Please wait'
                  : isSignup
                    ? 'Register'
                    : 'Login'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MainApp({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'home' | 'plan' | 'settings'>(
    'home',
  );
  const [settingsDirty, setSettingsDirty] = useState(false);
  const isSettings = activeTab === 'settings';

  function handleTabPress(nextTab: 'home' | 'plan' | 'settings') {
    if (activeTab === 'settings' && settingsDirty && nextTab !== 'settings') {
      Alert.alert(
        'Unsaved changes',
        'Leave settings without saving your changes?',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              setSettingsDirty(false);
              setActiveTab(nextTab);
            },
          },
        ],
      );
      return;
    }

    setActiveTab(nextTab);
  }

  return (
    <SafeAreaView style={isSettings ? styles.authSafeArea : styles.safeArea}>
      <StatusBar style={isSettings ? 'light' : 'dark'} />
      {isSettings ? (
        <SettingsScreen onDirtyChange={setSettingsDirty} user={user} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <View>
              <Text style={styles.eyebrow}>Today</Text>
              <Text style={styles.title}>Silver Potato</Text>
              <Text style={styles.signedInText}>Signed in as {user.email}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
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
                  <Text style={styles.checkText}>OK</Text>
                </View>
                <View>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskTime}>{task.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={styles.bottomTabs}>
        {[
          { id: 'home', label: 'Home' },
          { id: 'plan', label: 'Plan' },
          { id: 'settings', label: 'Settings' },
        ].map((tab) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.id }}
            key={tab.id}
            onPress={() =>
              handleTabPress(tab.id as 'home' | 'plan' | 'settings')
            }
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
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
  authSafeArea: {
    flex: 1,
    backgroundColor: '#07080C',
  },
  loadingScreen: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#757A84',
    fontSize: 14,
    fontWeight: '700',
  },
  authKeyboardView: {
    flex: 1,
  },
  authContent: {
    flexGrow: 1,
    gap: 24,
    justifyContent: 'center',
    padding: 22,
    paddingBottom: 34,
    paddingTop: 34,
  },
  authHeader: {
    alignItems: 'center',
    gap: 8,
  },
  authTitle: {
    color: '#F7F8FB',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    textAlign: 'center',
  },
  authCopy: {
    color: '#8F95A3',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  segmentedControl: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    padding: 6,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    justifyContent: 'center',
    minHeight: 54,
  },
  activeSegment: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  segmentText: {
    color: '#B9BFCA',
    fontSize: 15,
    fontWeight: '800',
  },
  activeSegmentText: {
    color: '#FFFFFF',
  },
  authForm: {
    gap: 18,
  },
  fieldGroup: {
    gap: 10,
  },
  inputLabel: {
    color: '#F2F4F8',
    fontSize: 15,
    fontWeight: '800',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
    borderWidth: 1,
    color: '#F7F8FB',
    fontSize: 16,
    minHeight: 58,
    paddingHorizontal: 18,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 92, 92, 0.14)',
    borderColor: 'rgba(255, 139, 139, 0.32)',
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    color: '#FFB7B7',
    fontSize: 14,
    fontWeight: '800',
  },
  fullWidthButton: {
    alignItems: 'center',
    backgroundColor: '#E8FF1A',
    borderRadius: 999,
    elevation: 3,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 58,
    shadowColor: '#E8FF1A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
  },
  disabledButton: {
    opacity: 0.7,
  },
  fullWidthButtonText: {
    color: '#050608',
    fontSize: 16,
    fontWeight: '900',
  },
  content: {
    gap: 20,
    paddingBottom: 104,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  signedInText: {
    color: '#757A84',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    maxWidth: 210,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#FDFCF8',
    borderColor: '#EEE9DE',
    borderRadius: 999,
    borderWidth: 1,
    elevation: 2,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    shadowColor: '#463F35',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  logoutButtonText: {
    color: '#2D3138',
    fontSize: 14,
    fontWeight: '800',
  },
  heroPanel: {
    backgroundColor: '#20333E',
    borderRadius: 26,
    elevation: 5,
    gap: 18,
    padding: 24,
    shadowColor: '#20333E',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
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
    borderRadius: 999,
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
    borderColor: '#EEE9DE',
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
    flex: 1,
    gap: 12,
    minHeight: 96,
    padding: 14,
    shadowColor: '#463F35',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
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
    borderRadius: 999,
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
    borderColor: '#EEE9DE',
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    shadowColor: '#463F35',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  taskCheck: {
    alignItems: 'center',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  checkText: {
    color: '#12151B',
    fontSize: 11,
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
    borderColor: '#EEE9DE',
    borderRadius: 24,
    borderWidth: 1,
    bottom: 14,
    elevation: 4,
    flexDirection: 'row',
    gap: 6,
    padding: 8,
    position: 'absolute',
    shadowColor: '#463F35',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 18,
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

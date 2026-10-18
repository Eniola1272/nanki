import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Profile, QuizAttempt } from '../types';
import { StorageService, UserSettings } from '../lib/storage';
import { supabase } from '../lib/supabase';

interface ProfileScreenProps {
  onBack?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [prof, sett, atts] = await Promise.all([
      StorageService.getProfile(),
      StorageService.getSettings(),
      StorageService.getAttempts(),
    ]);
    setProfile(prof);
    setSettings(sett);
    setAttempts(atts);
  };

  const categoryStats = React.useMemo(() => {
    const stats: Record<string, { correct: number; total: number }> = {};
    attempts.forEach((a) => {
      const cat = a.category || 'General';
      if (!stats[cat]) stats[cat] = { correct: 0, total: 0 };
      stats[cat].correct += a.score;
      stats[cat].total += a.totalQuestions;
    });

    const list = Object.entries(stats).map(([category, { correct, total }]) => {
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
      return { category, correct, total, percentage };
    });

    list.sort((a, b) => a.percentage - b.percentage); // lowest percentage first
    return list;
  }, [attempts]);

  const weakestCategory = categoryStats.length > 0 ? categoryStats[0] : null;

  const handleToggleHaptics = async (value: boolean) => {
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (settings) {
      const updated = { ...settings, hapticsEnabled: value };
      setSettings(updated);
      await StorageService.saveSettings(updated);
    }
  };

  const handleToggleExplanations = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (settings) {
      const updated = { ...settings, autoRevealExplanation: value };
      setSettings(updated);
      await StorageService.saveSettings(updated);
    }
  };

  const handleAuthSubmit = async () => {
    if (!emailInput.trim() || !passwordInput.trim()) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    setAuthLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: emailInput.trim(),
          password: passwordInput,
        });
        if (error) throw error;
        Alert.alert('Account Created', 'Check your email to confirm your account.');
        if (data.user && profile) {
          const updatedProfile = {
            ...profile,
            id: data.user.id,
            email: data.user.email || emailInput,
            name: emailInput.split('@')[0],
          };
          setProfile(updatedProfile);
          await StorageService.saveProfile(updatedProfile);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailInput.trim(),
          password: passwordInput,
        });
        if (error) throw error;
        Alert.alert('Welcome Back', 'Signed in successfully.');
        if (data.user && profile) {
          const updatedProfile = {
            ...profile,
            id: data.user.id,
            email: data.user.email || emailInput,
            name: data.user.user_metadata?.full_name || emailInput.split('@')[0],
          };
          setProfile(updatedProfile);
          await StorageService.saveProfile(updatedProfile);
        }
      }
      setIsAuthModalVisible(false);
      setEmailInput('');
      setPasswordInput('');
    } catch (e: any) {
      Alert.alert('Authentication Error', e.message || 'Failed to authenticate');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          const defaultProf = {
            id: 'guest-local-user',
            name: 'Guest Learner',
            email: 'guest@nanki.app',
            streak: 1,
            xp: 120,
            plan: 'FREE' as const,
          };
          setProfile(defaultProf);
          await StorageService.saveProfile(defaultProf);
        },
      },
    ]);
  };

  if (!profile || !settings) return null;

  const isGuest = profile.id === 'guest-local-user';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Avatar & Plan */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>👨‍⚕️</Text>
        </View>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileEmail}>{profile.email}</Text>

        <View style={styles.planBadge}>
          <Text style={styles.planText}>✨ {profile.plan} LEARNER</Text>
        </View>
      </View>

      {/* Learning Stats Grid */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Learning Momentum</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statNumber}>{profile.streak} Days</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={styles.statNumber}>{profile.xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statNumber}>84%</Text>
            <Text style={styles.statLabel}>Avg. Mastery</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>🗂️</Text>
            <Text style={styles.statNumber}>48</Text>
            <Text style={styles.statLabel}>Cards Studied</Text>
          </View>
        </View>
      </View>

      {/* Pro Membership Banner */}
      <View style={styles.membershipCard}>
        <View style={styles.membershipTop}>
          <Text style={styles.membershipTitle}>Nanki Student Pro</Text>
          <View style={styles.activeTag}>
            <Text style={styles.activeTagText}>ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.membershipDesc}>
          Unlimited question banks, full SM-2 spaced repetition, and cloud sync across all your devices.
        </Text>
      </View>

      {/* Clinical Specialty Mastery Section */}
      <View style={styles.masteryCard}>
        <Text style={styles.sectionTitle}>Specialty Mastery & Analytics</Text>
        <Text style={styles.masterySubtitle}>
          Weighted accuracy across your question sessions.
        </Text>

        {weakestCategory && weakestCategory.percentage < 70 ? (
          <View style={styles.weakestAlert}>
            <Text style={styles.weakestAlertTitle}>
              ⚠️ Recommended Focus: {weakestCategory.category}
            </Text>
            <Text style={styles.weakestAlertDesc}>
              Current accuracy is {weakestCategory.percentage}%. Reinforce missed concepts to raise mastery.
            </Text>
          </View>
        ) : null}

        {categoryStats.length > 0 ? (
          <View style={styles.categoryList}>
            {categoryStats.map((item) => (
              <View key={item.category} style={styles.categoryRow}>
                <View style={styles.categoryInfoRow}>
                  <Text style={styles.categoryName}>{item.category}</Text>
                  <Text style={styles.categoryPercentage}>{item.percentage}%</Text>
                </View>
                <View style={styles.categoryTrack}>
                  <View
                    style={[
                      styles.categoryFill,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor:
                          item.percentage >= 75
                            ? Colors.success
                            : item.percentage >= 50
                            ? Colors.warning
                            : Colors.error,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noAttemptsText}>
            Complete your first quiz to generate clinical subject mastery benchmarks.
          </Text>
        )}
      </View>

      {/* Quiz History Log */}
      {attempts.length > 0 && (
        <View style={styles.historyCardSection}>
          <Text style={styles.sectionTitle}>Recent Quiz Attempts</Text>
          <View style={styles.historyList}>
            {attempts.slice(0, 5).map((att) => {
              const passed = att.percentage >= 70;
              const dateStr = new Date(att.completedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });
              return (
                <View key={att.id} style={styles.historyItemCard}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.historyTitle} numberOfLines={1}>
                      {att.quizTitle}
                    </Text>
                    <Text style={styles.historySub}>
                      {att.category} • {att.score}/{att.totalQuestions} questions • {dateStr}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.historyPill,
                      passed ? styles.historyPillPassed : styles.historyPillFailed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.historyPillText,
                        passed ? styles.historyPillTextPassed : styles.historyPillTextFailed,
                      ]}
                    >
                      {att.percentage}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Study & App Preferences */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <Text style={styles.settingDesc}>Vibrate on answer clicks and card flips</Text>
          </View>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={handleToggleHaptics}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Instant Explanations</Text>
            <Text style={styles.settingDesc}>Show clinical rationale immediately upon choice</Text>
          </View>
          <Switch
            value={settings.autoRevealExplanation}
            onValueChange={handleToggleExplanations}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Offline Cloud Sync</Text>
            <Text style={styles.settingDesc}>Automatically backups to Supabase when online</Text>
          </View>
          <Text style={styles.syncStatusText}>✅ Active</Text>
        </View>
      </View>

      {/* Account / Auth Action */}
      <View style={styles.accountSection}>
        {isGuest ? (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsAuthModalVisible(true);
            }}
            style={({ pressed }) => [
              styles.signInButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.signInButtonText}>Sign In / Create Account</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.signOutButtonText}>Sign Out of Nanki</Text>
          </Pressable>
        )}

        <Text style={styles.versionText}>Nanki Mobile · Version 1.0.0 (Expo SDK 57)</Text>
      </View>

      {/* Auth Modal */}
      <Modal
        visible={isAuthModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAuthModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isSignUp ? 'Create Nanki Account' : 'Sign In to Nanki'}
            </Text>
            <Pressable
              onPress={() => setIsAuthModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.modalSubtitle}>
            Sync your study streaks, custom decks, and question banks seamlessly across devices.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="doctor@medical.edu"
              placeholderTextColor={Colors.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              value={passwordInput}
              onChangeText={setPasswordInput}
              placeholder="••••••••"
              placeholderTextColor={Colors.secondary}
              secureTextEntry
              style={styles.textInput}
            />
          </View>

          <Pressable
            disabled={authLoading}
            onPress={handleAuthSubmit}
            style={({ pressed }) => [
              styles.submitAuthBtn,
              pressed && styles.buttonPressed,
              authLoading && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.submitAuthText}>
              {authLoading ? 'Connecting…' : isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setIsSignUp(!isSignUp)}
            style={styles.switchAuthModeBtn}
          >
            <Text style={styles.switchAuthModeText}>
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Text>
          </Pressable>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.secondary,
    marginBottom: 10,
  },
  planBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  planText: {
    color: Colors.onPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  membershipCard: {
    backgroundColor: '#30213F',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  membershipTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  membershipTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activeTag: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  membershipDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  settingsSection: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 11,
    color: Colors.secondary,
    lineHeight: 15,
  },
  syncStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.success,
  },
  accountSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  signInButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  signInButtonText: {
    color: Colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  signOutButton: {
    width: '100%',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
    marginBottom: 16,
  },
  signOutButtonText: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 11,
    color: Colors.secondary,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  // Auth Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    lineHeight: 18,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.onSurface,
  },
  submitAuthBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  submitAuthText: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  switchAuthModeBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  switchAuthModeText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  masteryCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  masterySubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: -8,
    marginBottom: 16,
  },
  weakestAlert: {
    backgroundColor: Colors.warning + '18',
    borderColor: Colors.warning + '45',
    borderWidth: 1.2,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  weakestAlertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.warning,
    marginBottom: 2,
  },
  weakestAlertDesc: {
    fontSize: 11,
    color: Colors.onSurface,
    lineHeight: 15,
  },
  categoryList: {
    gap: 12,
  },
  categoryRow: {
    gap: 6,
  },
  categoryInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  categoryPercentage: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.secondary,
  },
  categoryTrack: {
    height: 8,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryFill: {
    height: '100%',
    borderRadius: 4,
  },
  noAttemptsText: {
    fontSize: 12,
    color: Colors.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  historyCardSection: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyList: {
    gap: 10,
    marginTop: 8,
  },
  historyItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  historySub: {
    fontSize: 11,
    color: Colors.secondary,
  },
  historyPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  historyPillPassed: {
    backgroundColor: Colors.success + '20',
  },
  historyPillFailed: {
    backgroundColor: Colors.error + '20',
  },
  historyPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  historyPillTextPassed: {
    color: Colors.success,
  },
  historyPillTextFailed: {
    color: Colors.error,
  },
});

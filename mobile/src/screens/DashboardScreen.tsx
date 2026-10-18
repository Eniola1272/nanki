import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { QuizCard } from '../components/QuizCard';
import { DeckCard } from '../components/DeckCard';
import { StorageService } from '../lib/storage';
import { Quiz, Deck, Profile, Flashcard, QuizAttempt } from '../types';

interface DashboardScreenProps {
  onSelectQuiz: (quiz: Quiz) => void;
  onSelectDeck: (deck: Deck) => void;
  onOpenProfile: () => void;
  onOpenCreate: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onSelectQuiz,
  onSelectDeck,
  onOpenProfile,
  onOpenCreate,
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [qList, dList, prof, attempts, reviewInfo] = await Promise.all([
      StorageService.getQuizzes(),
      StorageService.getDecks(),
      StorageService.getProfile(),
      StorageService.getAttempts(),
      StorageService.getDailyReviewCards(),
    ]);
    setQuizzes(qList);
    setDecks(dList);
    setProfile(prof);
    setRecentAttempts(attempts.slice(0, 3));
    setDueCards(reviewInfo.dueCards);
    setDueCount(reviewInfo.dueCount);
    setNewCount(reviewInfo.newCount);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  };

  const handleReviewBannerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (dueCards.length > 0) {
      const reviewDeck: Deck = {
        id: `daily_review_${Date.now()}`,
        title: `Today's Daily Review (${dueCards.length})`,
        category: 'Spaced Repetition',
        cards: dueCards,
      };
      onSelectDeck(reviewDeck);
    } else if (decks.length > 0) {
      onSelectDeck(decks[0]);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        streak={profile?.streak ?? 4}
        xp={profile?.xp ?? 840}
        onProfilePress={onOpenProfile}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Daily Review Hero Banner */}
        <Pressable
          onPress={handleReviewBannerPress}
          style={({ pressed }) => [
            styles.heroBanner,
            dueCount === 0 && styles.heroBannerCleared,
            pressed && styles.bannerPressed,
          ]}
        >
          <View
            style={[
              styles.bannerBadge,
              dueCount === 0 && styles.bannerBadgeCleared,
            ]}
          >
            <Text style={styles.bannerBadgeText}>
              {dueCount > 0 ? 'SPACED REPETITION • DUE TODAY' : 'ALL CAUGHT UP'}
            </Text>
          </View>
          <Text style={styles.bannerTitle}>
            {dueCount > 0 ? 'Daily Medical Recall' : 'Daily Reviews Completed!'}
          </Text>
          <Text style={styles.bannerSubtitle}>
            {dueCount > 0
              ? `${dueCount} cards scheduled for today (${newCount} new). Review now to solidify retention.`
              : 'You have zero overdue cards! Your spaced repetition streak is safe. Great work!'}
          </Text>
          <View
            style={[
              styles.bannerButton,
              dueCount === 0 && styles.bannerButtonCleared,
            ]}
          >
            <Text
              style={[
                styles.bannerButtonText,
                dueCount === 0 && styles.bannerButtonTextCleared,
              ]}
            >
              {dueCount > 0
                ? `Start Today's Review (${dueCount}) →`
                : 'Browse Flashcards →'}
            </Text>
          </View>
        </Pressable>

        {/* Recent Activity / Performance */}
        {recentAttempts.length > 0 && (
          <View style={styles.activitySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Quiz Activity</Text>
              <Text style={styles.sectionSubtitle}>Last completed</Text>
            </View>

            <View style={styles.attemptsList}>
              {recentAttempts.map((att) => {
                const passed = att.percentage >= 70;
                return (
                  <View key={att.id} style={styles.attemptCard}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.attemptTitle} numberOfLines={1}>
                        {att.quizTitle}
                      </Text>
                      <Text style={styles.attemptCategory}>
                        {att.category} • {att.score}/{att.totalQuestions} questions
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.scorePill,
                        passed ? styles.scorePillPassed : styles.scorePillFailed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.scorePillText,
                          passed ? styles.scorePillTextPassed : styles.scorePillTextFailed,
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

        {/* Section: Medical Quizzes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>High-Yield Quizzes</Text>
          <Text style={styles.sectionSubtitle}>{quizzes.length} available</Text>
        </View>

        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            onPress={() => onSelectQuiz(quiz)}
          />
        ))}

        {/* Section: Flashcard Decks */}
        <View style={[styles.sectionHeader, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Flashcard Decks</Text>
          <Text style={styles.sectionSubtitle}>{decks.length} decks</Text>
        </View>

        {decks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onPress={() => onSelectDeck(deck)}
          />
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Action Button for Quick Creation */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onOpenCreate();
        }}
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  heroBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    padding: 22,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  heroBannerCleared: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowOpacity: 0.05,
  },
  bannerPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  bannerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  bannerBadgeCleared: {
    backgroundColor: Colors.success + '20',
  },
  bannerBadgeText: {
    color: Colors.onPrimary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: Colors.onPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18,
  },
  bannerButton: {
    backgroundColor: Colors.onPrimary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonCleared: {
    backgroundColor: Colors.primary,
  },
  bannerButtonText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  bannerButtonTextCleared: {
    color: Colors.onPrimary,
  },
  activitySection: {
    marginBottom: 20,
  },
  attemptsList: {
    gap: 8,
  },
  attemptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attemptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  attemptCategory: {
    fontSize: 11,
    color: Colors.secondary,
  },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scorePillPassed: {
    backgroundColor: Colors.success + '20',
  },
  scorePillFailed: {
    backgroundColor: Colors.error + '20',
  },
  scorePillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  scorePillTextPassed: {
    color: Colors.success,
  },
  scorePillTextFailed: {
    color: Colors.error,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  fabPressed: {
    transform: [{ scale: 0.9 }],
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '400',
    lineHeight: 34,
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { QuizCard } from '../components/QuizCard';
import { DeckCard } from '../components/DeckCard';
import { StorageService } from '../lib/storage';
import { Quiz, Deck, Profile } from '../types';

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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [qList, dList, prof] = await Promise.all([
      StorageService.getQuizzes(),
      StorageService.getDecks(),
      StorageService.getProfile(),
    ]);
    setQuizzes(qList);
    setDecks(dList);
    setProfile(prof);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  };

  const handleReviewBannerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (decks.length > 0) {
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
            pressed && styles.bannerPressed,
          ]}
        >
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>SPACED REPETITION</Text>
          </View>
          <Text style={styles.bannerTitle}>Daily Medical Recall</Text>
          <Text style={styles.bannerSubtitle}>
            {decks[0]?.cards.length ?? 6} cards scheduled for today. Review now to solidify retention.
          </Text>
          <View style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>Start Today's Review →</Text>
          </View>
        </Pressable>

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
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
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
  bannerButtonText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13,
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

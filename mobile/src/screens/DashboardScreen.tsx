import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { QuizCard } from '../components/QuizCard';
import { DeckCard } from '../components/DeckCard';
import { SAMPLE_QUIZZES, SAMPLE_DECKS } from '../lib/sample-data';
import { Quiz, Deck } from '../types';

interface DashboardScreenProps {
  onSelectQuiz: (quiz: Quiz) => void;
  onSelectDeck: (deck: Deck) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onSelectQuiz,
  onSelectDeck,
}) => {
  const handleReviewBannerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (SAMPLE_DECKS.length > 0) {
      onSelectDeck(SAMPLE_DECKS[0]);
    }
  };

  return (
    <View style={styles.screen}>
      <Header streak={4} xp={820} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          <Text style={styles.bannerTitle}>Daily Medical Review</Text>
          <Text style={styles.bannerSubtitle}>
            6 cards due today to maintain your memory retention curve.
          </Text>
          <View style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>Start Daily Review →</Text>
          </View>
        </Pressable>

        {/* Section: Medical Quizzes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>High-Yield Quizzes</Text>
          <Text style={styles.sectionSubtitle}>{SAMPLE_QUIZZES.length} available</Text>
        </View>

        {SAMPLE_QUIZZES.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            onPress={() => onSelectQuiz(quiz)}
          />
        ))}

        {/* Section: Flashcard Decks */}
        <View style={[styles.sectionHeader, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Flashcard Decks</Text>
          <Text style={styles.sectionSubtitle}>{SAMPLE_DECKS.length} decks</Text>
        </View>

        {SAMPLE_DECKS.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onPress={() => onSelectDeck(deck)}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
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
});

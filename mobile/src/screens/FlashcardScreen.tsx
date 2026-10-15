import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Deck, Rating } from '../types';
import { advanceSM2 } from '../lib/scheduler';

interface FlashcardScreenProps {
  deck: Deck;
  onExit: () => void;
}

export const FlashcardScreen: React.FC<FlashcardScreenProps> = ({ deck, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const totalCards = deck.cards.length;
  const currentCard = deck.cards[currentIndex];
  const isFinished = currentIndex >= totalCards;

  const handleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFlipped(!isFlipped);
  };

  const handleRate = (rating: Rating) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    advanceSM2(undefined, rating);
    setReviewedCount((prev) => prev + 1);
    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);
  };

  if (isFinished) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>🏆</Text>
          <Text style={styles.resultTitle}>Deck Completed!</Text>
          <Text style={styles.resultSubtitle}>{deck.title}</Text>

          <View style={styles.statsCard}>
            <Text style={styles.statsBigText}>{reviewedCount}</Text>
            <Text style={styles.statsLabel}>Cards Reviewed Today</Text>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>⚡ +{reviewedCount * 10} XP Earned</Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCurrentIndex(0);
              setIsFlipped(false);
              setReviewedCount(0);
            }}
            style={({ pressed }) => [
              styles.restartButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.restartButtonText}>Review Again</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onExit();
            }}
            style={({ pressed }) => [
              styles.exitButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.exitButtonText}>Back to Dashboard</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onExit();
            }}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <Text style={styles.deckHeaderTitle} numberOfLines={1}>
            {deck.title}
          </Text>

          <Text style={styles.cardCounter}>
            {currentIndex + 1} / {totalCards}
          </Text>
        </View>

        {/* Flashcard Surface */}
        <View style={styles.cardContainer}>
          <Pressable
            onPress={handleFlip}
            style={({ pressed }) => [
              styles.flashcard,
              isFlipped && styles.flashcardFlipped,
              pressed && styles.flashcardPressed,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardBadge}>
                {isFlipped ? 'EXPLANATION & ANSWER' : 'RECALL PROMPT'}
              </Text>
              <Text style={styles.tapHint}>Tap card to flip</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardText}>
                {isFlipped ? currentCard.back : currentCard.front}
              </Text>

              {isFlipped && currentCard.extraNote && (
                <View style={styles.extraNoteBox}>
                  <Text style={styles.extraNoteText}>
                    💡 {currentCard.extraNote}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.flipLabel}>
              {isFlipped ? 'Tap to view question' : 'Tap to reveal answer'}
            </Text>
          </Pressable>
        </View>

        {/* Rating Controls (Shown when card is flipped) */}
        <View style={styles.controlsArea}>
          {!isFlipped ? (
            <Pressable
              onPress={handleFlip}
              style={({ pressed }) => [
                styles.showAnswerButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.showAnswerText}>Show Answer</Text>
            </Pressable>
          ) : (
            <View style={styles.ratingGrid}>
              <Pressable
                onPress={() => handleRate('again')}
                style={({ pressed }) => [
                  styles.rateButton,
                  styles.rateAgain,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.rateTitle}>Again</Text>
                <Text style={styles.rateInterval}>10m</Text>
              </Pressable>

              <Pressable
                onPress={() => handleRate('hard')}
                style={({ pressed }) => [
                  styles.rateButton,
                  styles.rateHard,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.rateTitle}>Hard</Text>
                <Text style={styles.rateInterval}>1d</Text>
              </Pressable>

              <Pressable
                onPress={() => handleRate('good')}
                style={({ pressed }) => [
                  styles.rateButton,
                  styles.rateGood,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.rateTitle}>Good</Text>
                <Text style={styles.rateInterval}>3d</Text>
              </Pressable>

              <Pressable
                onPress={() => handleRate('easy')}
                style={({ pressed }) => [
                  styles.rateButton,
                  styles.rateEasy,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.rateTitle}>Easy</Text>
                <Text style={styles.rateInterval}>6d</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  deckHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    maxWidth: '65%',
  },
  cardCounter: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  flashcard: {
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    borderRadius: 32,
    padding: 26,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  flashcardFlipped: {
    borderColor: Colors.primary,
    backgroundColor: '#FAFAF9',
  },
  flashcardPressed: {
    transform: [{ scale: 0.985 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  tapHint: {
    fontSize: 11,
    color: Colors.secondary,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  cardText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 30,
    textAlign: 'center',
  },
  extraNoteBox: {
    marginTop: 20,
    backgroundColor: Colors.accent,
    padding: 14,
    borderRadius: 16,
  },
  extraNoteText: {
    fontSize: 13,
    color: Colors.accentDark,
    lineHeight: 18,
    fontWeight: '500',
  },
  flipLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
  },
  controlsArea: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 10,
  },
  showAnswerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  showAnswerText: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  ratingGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  rateButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  rateAgain: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  rateHard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  rateGood: {
    backgroundColor: '#E0E7FF',
    borderColor: '#A5B4FC',
  },
  rateEasy: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  rateTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  rateInterval: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
  },
  // Result screen styles
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  resultEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsCard: {
    width: '100%',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  statsBigText: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 6,
  },
  statsLabel: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 14,
  },
  xpBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  restartButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  restartButtonText: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  exitButton: {
    width: '100%',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exitButtonText: {
    color: Colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
});

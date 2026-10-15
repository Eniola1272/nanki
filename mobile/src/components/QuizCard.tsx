import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Quiz } from '../types';

interface QuizCardProps {
  quiz: Quiz;
  onPress: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const mastery = quiz.masteredPercentage ?? 0;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{quiz.category.toUpperCase()}</Text>
        </View>
        <Text style={styles.questionCountText}>
          {quiz.questions.length} Question{quiz.questions.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {quiz.title}
      </Text>
      
      <Text style={styles.description} numberOfLines={2}>
        {quiz.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${mastery}%` }]} />
        </View>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>{mastery}% Mastered</Text>
          <Text style={styles.actionText}>Start Quiz →</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceContainerLow,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accentDark,
    letterSpacing: 0.5,
  },
  questionCountText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 22,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 14,
  },
  footer: {
    marginTop: 'auto',
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});

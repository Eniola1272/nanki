import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Quiz } from '../types';

interface QuizPlayScreenProps {
  quiz: Quiz;
  onExit: () => void;
}

export const QuizPlayScreen: React.FC<QuizPlayScreenProps> = ({ quiz, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  const handleSelectOption = (optionIndex: number) => {
    Haptics.selectionAsync();
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
    setShowExplanation(true);
  };

  const toggleFlag = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlagged((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowExplanation(false);
    } else {
      setIsCompleted(true);
    }
  };

  // Score calculations
  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100),
    };
  };

  if (isCompleted) {
    const score = calculateScore();
    const passed = score.percentage >= 70;

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{passed ? '🎉' : '📚'}</Text>
          <Text style={styles.resultTitle}>
            {passed ? 'Quiz Mastered!' : 'Keep Practicing!'}
          </Text>
          <Text style={styles.resultSubtitle}>{quiz.title}</Text>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreBigText}>{score.percentage}%</Text>
            <Text style={styles.scoreSubText}>
              {score.correct} of {score.total} questions answered correctly
            </Text>
            <View style={styles.xpRow}>
              <Text style={styles.xpAwardText}>⚡ +{score.correct * 20} XP Earned</Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCurrentIndex(0);
              setSelectedAnswers({});
              setShowExplanation(false);
              setIsCompleted(false);
            }}
            style={({ pressed }) => [
              styles.retakeButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.retakeButtonText}>Retake Quiz</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onExit();
            }}
            style={({ pressed }) => [
              styles.dashboardButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.dashboardButtonText}>Back to Dashboard</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const selectedIdx = selectedAnswers[currentIndex];
  const hasAnswered = selectedIdx !== undefined;

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

          <Text style={styles.quizHeaderTitle} numberOfLines={1}>
            {quiz.title}
          </Text>

          <Pressable onPress={toggleFlag} style={styles.flagButton}>
            <Text style={[styles.flagText, flagged[currentQuestion.id] && styles.flagActive]}>
              {flagged[currentQuestion.id] ? '🚩' : '🏳️'}
            </Text>
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>
              Question {currentIndex + 1} of {totalQuestions}
            </Text>
            <Text style={styles.categoryLabel}>{quiz.category}</Text>
          </View>
        </View>

        {/* Question & Choices Scroll Area */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.text}</Text>
          </View>

          <View style={styles.optionsList}>
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedIdx === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;
              
              let optionStyle = styles.optionCard;
              let dotStyle = styles.optionDot;

              if (hasAnswered) {
                if (isSelected && isCorrect) {
                  optionStyle = styles.optionCorrect;
                  dotStyle = styles.optionDotCorrect;
                } else if (isSelected && !isCorrect) {
                  optionStyle = styles.optionWrong;
                  dotStyle = styles.optionDotWrong;
                } else if (!isSelected && isCorrect) {
                  optionStyle = styles.optionRevealCorrect;
                }
              } else if (isSelected) {
                optionStyle = styles.optionSelected;
                dotStyle = styles.optionDotSelected;
              }

              return (
                <Pressable
                  key={idx}
                  onPress={() => handleSelectOption(idx)}
                  style={({ pressed }) => [
                    optionStyle,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <View style={dotStyle}>
                    <Text style={styles.optionLetter}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Explanation Sheet */}
          {showExplanation && (
            <View style={styles.explanationCard}>
              <Text style={styles.explanationTitle}>
                {selectedIdx === currentQuestion.correctAnswer
                  ? '✅ Correct Explanation'
                  : 'ℹ️ Clinical Explanation'}
              </Text>
              <Text style={styles.explanationText}>
                {currentQuestion.explanation}
              </Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Action Footer */}
        <View style={styles.footer}>
          <Pressable
            disabled={!hasAnswered}
            onPress={handleNext}
            style={({ pressed }) => [
              styles.nextButton,
              !hasAnswered && styles.nextButtonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex + 1 === totalQuestions ? 'Finish Quiz' : 'Next Question →'}
            </Text>
          </Pressable>
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
  quizHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    maxWidth: '65%',
  },
  flagButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  flagText: {
    fontSize: 16,
  },
  flagActive: {
    opacity: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  questionCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 25,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  optionPressed: {
    transform: [{ scale: 0.98 }],
  },
  optionSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  optionCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successContainer,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.success,
  },
  optionWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorContainer,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  optionRevealCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.success,
  },
  optionDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionDotSelected: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionDotCorrect: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionDotWrong: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionLetter: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  optionText: {
    fontSize: 15,
    color: Colors.onSurface,
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  explanationCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.secondaryContainer,
    shadowOpacity: 0,
  },
  nextButtonText: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
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
  scoreCard: {
    width: '100%',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  scoreBigText: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 6,
  },
  scoreSubText: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 14,
  },
  xpRow: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  xpAwardText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  retakeButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  retakeButtonText: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  dashboardButton: {
    width: '100%',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dashboardButtonText: {
    color: Colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
});

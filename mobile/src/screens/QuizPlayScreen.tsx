import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Quiz, Question, Deck } from '../types';
import { newEventId } from '../lib/offline';
import { StorageService } from '../lib/storage';
import { generateMistakeFlashcards } from '../lib/mistakes';
import { MistakeFlashcardsModal } from '../components/MistakeFlashcardsModal';
import { shareQuizResults } from '../lib/export';

interface QuizPlayScreenProps {
  quiz: Quiz;
  onExit: () => void;
  onStartDeck?: (deck: Deck) => void;
}

export const QuizPlayScreen: React.FC<QuizPlayScreenProps> = ({
  quiz,
  onExit,
  onStartDeck,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [tfAnswers, setTfAnswers] = useState<Record<number, Record<number, number | null>>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [, setReviewFilter] = useState<'all' | 'mistakes'>('all');
  const [showMistakeModal, setShowMistakeModal] = useState(false);

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isTF = currentQuestion.type === 'true-false';
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  // Countdown timer per question (matching webapp)
  const getInitialTimeForQuestion = (q: Question | undefined) => {
    if (!q) return 30;
    const parsed = parseInt(q.timer || '');
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return q.type === 'true-false' ? 120 : 30;
  };

  const [timeLeft, setTimeLeft] = useState(() => getInitialTimeForQuestion(currentQuestion));
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);
  const finishedRef = useRef(false);
  const attemptId = useRef(newEventId());

  // Total session stopwatch
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setTotalSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  // Question countdown timer
  useEffect(() => {
    if (isCompleted || finishedRef.current) return;

    if (timeLeft <= 0) {
      // Time is up: Auto-advance like the webapp!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      handleNext();
      return;
    }

    if (timeLeft <= 5) {
      // Subtle urgent tick haptic on low time
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const intervalId = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(intervalId);
  }, [timeLeft, currentIndex, isCompleted]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Single choice selection
  const handleSelectOption = (optionIndex: number) => {
    Haptics.selectionAsync();
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
    setShowExplanation(true);
  };

  // True/False branch selection
  const handleSelectTfBranch = (branchIndex: number, value: number) => {
    Haptics.selectionAsync();
    setTfAnswers((prev) => {
      const qAnswers = prev[currentIndex] || {};
      const currentVal = qAnswers[branchIndex];
      const newVal = currentVal === value ? null : value;
      return {
        ...prev,
        [currentIndex]: {
          ...qAnswers,
          [branchIndex]: newVal,
        },
      };
    });
  };

  const toggleFlag = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlagged((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const handleNext = async () => {
    if (finishedRef.current) return;
    if (currentIndex < totalQuestions - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setShowExplanation(false);
      // Reset countdown timer to next question's allotted time
      setTimeLeft(getInitialTimeForQuestion(questions[nextIdx]));
    } else {
      finishedRef.current = true;
      const score = calculateScore();
      try {
      await StorageService.saveAttempt({
        id: attemptId.current,
        quizSnapshot: quiz, answers: selectedAnswers, branchAnswers: tfAnswers,
        quizId: quiz.id,
        quizTitle: quiz.title,
        category: quiz.category,
        score: score.correct,
        totalQuestions: score.total,
        percentage: score.percentage,
        timeSpentSeconds: totalSecondsElapsed,
        completedAt: new Date().toISOString(),
      });
      setIsCompleted(true);
      } catch { finishedRef.current = false; Alert.alert("Result not saved", "Free device storage and tap Finish again. Keep this quiz open to preserve your answers."); }
    }
  };

  // Score calculations
  const calculateScore = () => {
    let correct = 0;
    const incorrectIndices: number[] = [];

    quiz.questions.forEach((q, idx) => {
      if (q.type === 'true-false') {
        const branches = q.branchAnswers || {};
        const userBranches = tfAnswers[idx] || {};
        let allBranchesCorrect = true;
        Object.keys(branches).forEach((bIdxStr) => {
          const bIdx = Number(bIdxStr);
          if (userBranches[bIdx] !== branches[bIdx]) {
            allBranchesCorrect = false;
          }
        });
        if (allBranchesCorrect && Object.keys(branches).length > 0) {
          correct++;
        } else {
          incorrectIndices.push(idx);
        }
      } else {
        if (selectedAnswers[idx] === q.correctAnswer) {
          correct++;
        } else {
          incorrectIndices.push(idx);
        }
      }
    });

    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100),
      incorrectIndices,
    };
  };

  const score = calculateScore();
  const mistakeCards = generateMistakeFlashcards(quiz, selectedAnswers, tfAnswers);

  // Completion / Results View
  if (isCompleted) {
    const passed = score.percentage >= 70;
    const hasMistakes = score.incorrectIndices.length > 0;
    const avgSecsPerQ = Math.round(totalSecondsElapsed / totalQuestions);

    return (
      <View style={[styles.safeArea, { paddingTop: topInset, paddingBottom: insets.bottom }]}>
        <ScrollView contentContainerStyle={[styles.resultScrollContent, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]}>
          <Text style={styles.resultEmoji}>{passed ? '🎉' : '📚'}</Text>
          <Text style={styles.resultTitle}>
            {passed ? 'Quiz Mastered!' : 'Quiz Completed!'}
          </Text>
          <Text style={styles.resultSubtitle}>{quiz.title}</Text>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreBigText}>{score.percentage}%</Text>
            <Text style={styles.scoreSubText}>
              {score.correct} of {score.total} questions answered correctly
            </Text>

            <View style={styles.statsMetricsRow}>
              <View style={styles.metricPill}>
                <Text style={styles.metricLabel}>Avg. Pace</Text>
                <Text style={styles.metricVal}>{avgSecsPerQ}s / question</Text>
              </View>
              <View style={styles.metricPill}>
                <Text style={styles.metricLabel}>Total Time</Text>
                <Text style={styles.metricVal}>{formatCountdown(totalSecondsElapsed)}</Text>
              </View>
            </View>

            <View style={styles.xpRow}>
              <Text style={styles.xpAwardText}>⚡ +{score.correct * 20} XP Earned</Text>
            </View>
          </View>

          {/* Convert Mistakes to Flashcard Deck Button */}
          {mistakeCards.length > 0 && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowMistakeModal(true);
              }}
              style={({ pressed }) => [
                styles.convertMistakesButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.convertMistakesText}>
                ⚡ Create Flashcards from Mistakes ({mistakeCards.length})
              </Text>
            </Pressable>
          )}

          {/* Review Mistakes Button */}
          {hasMistakes && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setReviewFilter('mistakes');
                const firstWrong = score.incorrectIndices[0];
                setCurrentIndex(firstWrong);
                setTimeLeft(getInitialTimeForQuestion(questions[firstWrong]));
                setShowExplanation(true);
                setIsCompleted(false);
              }}
              style={({ pressed }) => [
                styles.reviewMistakesButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.reviewMistakesText}>
                ⚠️ Review Missed Questions ({score.incorrectIndices.length})
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCurrentIndex(0);
              setSelectedAnswers({});
              setTfAnswers({});
              setShowExplanation(false);
              setTimeLeft(getInitialTimeForQuestion(questions[0]));
              setTotalSecondsElapsed(0);
              finishedRef.current = false;
              setIsCompleted(false);
            }}
            style={({ pressed }) => [
              styles.retakeButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.retakeButtonText}>Retake Full Quiz</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              shareQuizResults(quiz, score.percentage, score.correct, score.total);
            }}
            style={({ pressed }) => [
              styles.shareScoreButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.shareScoreText}>📤 Share Quiz Score</Text>
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
        </ScrollView>

        <MistakeFlashcardsModal
          visible={showMistakeModal}
          quiz={quiz}
          initialCards={mistakeCards}
          onClose={() => setShowMistakeModal(false)}
          onSaved={(deck) => {
            if (onStartDeck) {
              onStartDeck(deck);
            } else {
              onExit();
            }
          }}
        />
      </View>
    );
  }

  const selectedIdx = selectedAnswers[currentIndex];
  const currentTfAnswers = tfAnswers[currentIndex] || {};
  const hasAnswered = isTF
    ? Object.keys(currentTfAnswers).length > 0
    : selectedIdx !== undefined;

  const isTimeCritical = timeLeft <= 5;

  return (
    <View style={[styles.safeArea, { paddingTop: topInset }]}>
      <View style={styles.container}>
        {/* Navigation Bar with Live Countdown Timer */}
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

          {/* Countdown Timer Pill (Red & urgent when <= 5 seconds) */}
          <View
            style={[
              styles.timerPill,
              isTimeCritical && styles.timerPillCritical,
            ]}
          >
            <Text
              style={[
                styles.timerText,
                isTimeCritical && styles.timerTextCritical,
              ]}
            >
              ⏱️ {formatCountdown(timeLeft)}
            </Text>
          </View>

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
            <Text style={styles.categoryLabel}>
              {isTF ? 'True / False Statements' : quiz.category}
            </Text>
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

          {/* Render Mode: True/False Multi-Branch */}
          {isTF ? (
            <View style={styles.optionsList}>
              <Text style={styles.tfInstructions}>
                Select True or False for each clinical statement:
              </Text>
              {currentQuestion.options.map((option, bIdx) => {
                const userVal = currentTfAnswers[bIdx];
                const correctBranchVal = currentQuestion.branchAnswers?.[bIdx];
                const isRevealed = showExplanation && correctBranchVal !== undefined;

                return (
                  <View key={bIdx} style={styles.tfBranchCard}>
                    <Text style={styles.tfBranchTitle}>
                      {String.fromCharCode(65 + bIdx)}. {option}
                    </Text>
                    <View style={styles.tfButtonRow}>
                      <Pressable
                        onPress={() => handleSelectTfBranch(bIdx, 1)}
                        style={({ pressed }) => [
                          styles.tfPill,
                          userVal === 1 && styles.tfPillSelected,
                          isRevealed && correctBranchVal === 1 && styles.tfPillCorrect,
                          isRevealed && userVal === 1 && correctBranchVal !== 1 && styles.tfPillWrong,
                          pressed && styles.buttonPressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tfPillText,
                            userVal === 1 && styles.tfPillTextSelected,
                          ]}
                        >
                          True
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleSelectTfBranch(bIdx, 0)}
                        style={({ pressed }) => [
                          styles.tfPill,
                          userVal === 0 && styles.tfPillSelected,
                          isRevealed && correctBranchVal === 0 && styles.tfPillCorrect,
                          isRevealed && userVal === 0 && correctBranchVal !== 0 && styles.tfPillWrong,
                          pressed && styles.buttonPressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tfPillText,
                            userVal === 0 && styles.tfPillTextSelected,
                          ]}
                        >
                          False
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}

              {!showExplanation && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowExplanation(true);
                  }}
                  style={styles.revealExplanationLink}
                >
                  <Text style={styles.revealExplanationText}>Check Explanations 💡</Text>
                </Pressable>
              )}
            </View>
          ) : (
            /* Render Mode: Multiple Choice Single Option */
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
          )}

          {/* Clinical Explanation Card */}
          {showExplanation && (
            <View style={styles.explanationCard}>
              <Text style={styles.explanationTitle}>
                💡 Clinical Rationale & Key Takeaways
              </Text>
              <Text style={styles.explanationText}>
                {currentQuestion.explanation}
              </Text>
            </View>
          )}

          <View style={{ height: Math.max(insets.bottom, 16) + 90 }} />
        </ScrollView>

        {/* Bottom Action Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 4 }]}>
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
    </View>
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
  timerPill: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  timerPillCritical: {
    backgroundColor: Colors.errorContainer,
    borderColor: Colors.error,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  timerTextCritical: {
    color: Colors.error,
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
  // True / False styles
  tfInstructions: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  tfBranchCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tfBranchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
    lineHeight: 20,
    marginBottom: 12,
  },
  tfButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tfPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tfPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tfPillCorrect: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  tfPillWrong: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  tfPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  tfPillTextSelected: {
    color: Colors.onPrimary,
  },
  revealExplanationLink: {
    alignSelf: 'center',
    paddingVertical: 10,
    marginTop: 6,
  },
  revealExplanationText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
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
  resultScrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
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
    marginBottom: 20,
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
  statsMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginVertical: 12,
  },
  metricPill: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 2,
  },
  xpRow: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  xpAwardText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  convertMistakesButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  convertMistakesText: {
    color: Colors.onPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  reviewMistakesButton: {
    width: '100%',
    backgroundColor: Colors.errorContainer,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  reviewMistakesText: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: '700',
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
  shareScoreButton: {
    width: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareScoreText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '800',
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

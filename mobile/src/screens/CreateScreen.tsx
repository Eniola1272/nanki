import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Quiz, Deck, Question, Flashcard } from '../types';
import { StorageService } from '../lib/storage';
import { BulkImportModal } from '../components/BulkImportModal';

interface CreateScreenProps {
  onCreated: (type: 'quiz' | 'deck') => void;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({ onCreated }) => {
  const [createType, setCreateType] = useState<'quiz' | 'deck'>('quiz');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Quiz form state
  const [quizTitle, setQuizTitle] = useState('');
  const [quizCategory, setQuizCategory] = useState('Pharmacology');
  const [quizDescription, setQuizDescription] = useState('');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);
  const [qExplanation, setQExplanation] = useState('');
  const [addedQuestions, setAddedQuestions] = useState<Question[]>([]);

  // Deck form state
  const [deckTitle, setDeckTitle] = useState('');
  const [deckCategory, setDeckCategory] = useState('Cardiology');
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [cardNote, setCardNote] = useState('');
  const [addedCards, setAddedCards] = useState<Flashcard[]>([]);

  const handleApplyBulk = (imported: Question[], replace: boolean) => {
    if (replace) {
      setAddedQuestions(imported);
    } else {
      setAddedQuestions((prev) => [...prev, ...imported]);
    }
    Alert.alert(
      'Questions Imported',
      `Successfully added ${imported.length} question(s) to your quiz draft.`
    );
  };

  const handleRemoveQuestion = (indexToRemove: number) => {
    Haptics.selectionAsync();
    setAddedQuestions((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAllQuestions = () => {
    Alert.alert('Clear Draft', 'Are you sure you want to remove all drafted questions?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setAddedQuestions([]);
        },
      },
    ]);
  };

  const handleAddQuestion = () => {
    if (!qText.trim() || qOptions.some((o) => !o.trim())) {
      Alert.alert('Incomplete Question', 'Please fill in the question text and all 4 options.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newQ: Question = {
      id: `q_${Date.now()}`,
      text: qText.trim(),
      options: qOptions.map((o) => o.trim()),
      correctAnswer: qCorrect,
      explanation: qExplanation.trim() || 'No explanation provided.',
    };
    setAddedQuestions((prev) => [...prev, newQ]);
    // Reset question inputs
    setQText('');
    setQOptions(['', '', '', '']);
    setQExplanation('');
    Alert.alert('Question Added', `Question ${addedQuestions.length + 1} added to draft.`);
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) {
      Alert.alert('Missing Title', 'Please give your quiz a title.');
      return;
    }
    if (addedQuestions.length === 0) {
      Alert.alert('No Questions', 'Please add or bulk-import at least one question before saving.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newQuiz: Quiz = {
      id: `quiz_${Date.now()}`,
      title: quizTitle.trim(),
      category: quizCategory.trim() || 'General',
      description: quizDescription.trim() || `${addedQuestions.length} medical review questions.`,
      questions: addedQuestions,
      masteredPercentage: 0,
    };

    await StorageService.saveQuiz(newQuiz);
    Alert.alert('Success!', 'Quiz created and saved to your library.');
    onCreated('quiz');
  };

  const handleAddCard = () => {
    if (!cardFront.trim() || !cardBack.trim()) {
      Alert.alert('Incomplete Card', 'Please fill in both the Front prompt and Back answer.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newCard: Flashcard = {
      id: `c_${Date.now()}`,
      deckId: '',
      front: cardFront.trim(),
      back: cardBack.trim(),
      extraNote: cardNote.trim() || undefined,
    };
    setAddedCards((prev) => [...prev, newCard]);
    setCardFront('');
    setCardBack('');
    setCardNote('');
    Alert.alert('Card Added', `Flashcard ${addedCards.length + 1} added to deck draft.`);
  };

  const handleSaveDeck = async () => {
    if (!deckTitle.trim()) {
      Alert.alert('Missing Title', 'Please give your flashcard deck a title.');
      return;
    }
    if (addedCards.length === 0) {
      Alert.alert('No Cards', 'Please add at least one flashcard before saving.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const deckId = `deck_${Date.now()}`;
    const newDeck: Deck = {
      id: deckId,
      title: deckTitle.trim(),
      category: deckCategory.trim() || 'General',
      cards: addedCards.map((c) => ({ ...c, deckId })),
    };

    await StorageService.saveDeck(newDeck);
    Alert.alert('Success!', 'Flashcard deck created and saved to your library.');
    onCreated('deck');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.pageTitle}>Create Study Material</Text>
      <Text style={styles.pageSubtitle}>
        Build your own custom medical questions or spaced-repetition flashcards.
      </Text>

      {/* Type Toggle Tabs */}
      <View style={styles.typeToggle}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCreateType('quiz');
          }}
          style={[styles.toggleBtn, createType === 'quiz' && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleBtnText, createType === 'quiz' && styles.toggleBtnTextActive]}>
            📝 New Quiz
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCreateType('deck');
          }}
          style={[styles.toggleBtn, createType === 'deck' && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleBtnText, createType === 'deck' && styles.toggleBtnTextActive]}>
            🗂️ Flashcard Deck
          </Text>
        </Pressable>
      </View>

      {createType === 'quiz' ? (
        /* QUIZ CREATION FORM */
        <View style={styles.formCard}>
          <Text style={styles.formSectionHeader}>Quiz Details</Text>
          <TextInput
            value={quizTitle}
            onChangeText={setQuizTitle}
            placeholder="Quiz Title (e.g., Renal Pathology)"
            placeholderTextColor={Colors.secondary}
            style={styles.textInput}
          />
          <TextInput
            value={quizCategory}
            onChangeText={setQuizCategory}
            placeholder="Category (e.g., Pathology, Surgery)"
            placeholderTextColor={Colors.secondary}
            style={styles.textInput}
          />
          <TextInput
            value={quizDescription}
            onChangeText={setQuizDescription}
            placeholder="Brief Description…"
            placeholderTextColor={Colors.secondary}
            style={styles.textInput}
          />

          {/* Bulk Import Callout Banner */}
          <View style={styles.bulkBanner}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.bulkBannerTitle}>⚡ Bulk Import System</Text>
              <Text style={styles.bulkBannerDesc}>
                Paste multiple MCQs, True/False branches, or format using AI.
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowBulkModal(true);
              }}
              style={styles.bulkBannerBtn}
            >
              <Text style={styles.bulkBannerBtnText}>Import</Text>
            </Pressable>
          </View>

          {/* Drafted Questions List / Preview */}
          {addedQuestions.length > 0 && (
            <View style={styles.draftSection}>
              <View style={styles.draftHeaderRow}>
                <Text style={styles.draftHeaderTitle}>
                  Draft Questions ({addedQuestions.length})
                </Text>
                <Pressable onPress={handleClearAllQuestions} hitSlop={8}>
                  <Text style={styles.draftClearText}>Clear All</Text>
                </Pressable>
              </View>

              <View style={styles.draftList}>
                {addedQuestions.map((q, idx) => (
                  <View key={q.id || idx} style={styles.draftItem}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={styles.draftItemBadgeRow}>
                        <Text style={styles.draftItemIndex}>#{idx + 1}</Text>
                        <View
                          style={[
                            styles.typeBadge,
                            q.type === 'true-false'
                              ? styles.typeBadgeTf
                              : styles.typeBadgeMcq,
                          ]}
                        >
                          <Text
                            style={[
                              styles.typeBadgeText,
                              q.type === 'true-false'
                                ? styles.typeBadgeTextTf
                                : styles.typeBadgeTextMcq,
                            ]}
                          >
                            {q.type === 'true-false' ? 'True / False' : 'MCQ'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.draftItemText} numberOfLines={2}>
                        {q.text}
                      </Text>
                      <Text style={styles.draftItemSub}>
                        {q.type === 'true-false'
                          ? `${q.options.length} statements • Timer: ${q.timer || '120s'}`
                          : `${q.options.length} options • Ans: ${String.fromCharCode(
                              65 + q.correctAnswer
                            )} • Timer: ${q.timer || '30s'}`}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => handleRemoveQuestion(idx)}
                      hitSlop={8}
                      style={styles.draftRemoveBtn}
                    >
                      <Text style={styles.draftRemoveText}>✕</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Single Question Addition Form */}
          <Text style={styles.formSectionHeader}>
            Add Single Question Manually
          </Text>
          <TextInput
            value={qText}
            onChangeText={setQText}
            placeholder="Question prompt or patient scenario…"
            placeholderTextColor={Colors.secondary}
            multiline
            style={[styles.textInput, { height: 75 }]}
          />

          <Text style={styles.subLabel}>Options (tap letter to mark correct):</Text>
          {qOptions.map((opt, idx) => (
            <View key={idx} style={styles.optionInputRow}>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setQCorrect(idx);
                }}
                style={[
                  styles.optionCorrectIndicator,
                  qCorrect === idx && styles.optionCorrectActive,
                ]}
              >
                <Text
                  style={[
                    styles.optionLetterText,
                    qCorrect === idx && styles.optionLetterActive,
                  ]}
                >
                  {String.fromCharCode(65 + idx)}
                </Text>
              </Pressable>
              <TextInput
                value={opt}
                onChangeText={(text) => {
                  const copy = [...qOptions];
                  copy[idx] = text;
                  setQOptions(copy);
                }}
                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                placeholderTextColor={Colors.secondary}
                style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
              />
            </View>
          ))}

          <TextInput
            value={qExplanation}
            onChangeText={setQExplanation}
            placeholder="Clinical rationale or why this answer is correct…"
            placeholderTextColor={Colors.secondary}
            multiline
            style={[styles.textInput, { height: 65, marginTop: 12 }]}
          />

          <Pressable onPress={handleAddQuestion} style={styles.addQuestionBtn}>
            <Text style={styles.addQuestionBtnText}>+ Add Question to Quiz</Text>
          </Pressable>

          <Pressable onPress={handleSaveQuiz} style={styles.saveMainBtn}>
            <Text style={styles.saveMainBtnText}>
              Save & Publish Quiz ({addedQuestions.length} Questions)
            </Text>
          </Pressable>
        </View>
      ) : (
        /* DECK CREATION FORM */
        <View style={styles.formCard}>
          <Text style={styles.formSectionHeader}>Deck Details</Text>
          <TextInput
            value={deckTitle}
            onChangeText={setDeckTitle}
            placeholder="Deck Title (e.g., Antibiotic Mechanisms)"
            placeholderTextColor={Colors.secondary}
            style={styles.textInput}
          />
          <TextInput
            value={deckCategory}
            onChangeText={setDeckCategory}
            placeholder="Category (e.g., Microbiology)"
            placeholderTextColor={Colors.secondary}
            style={styles.textInput}
          />

          <View style={styles.divider} />

          <Text style={styles.formSectionHeader}>
            Add Flashcard ({addedCards.length} added)
          </Text>
          <TextInput
            value={cardFront}
            onChangeText={setCardFront}
            placeholder="Front: Question or Term to recall…"
            placeholderTextColor={Colors.secondary}
            multiline
            style={[styles.textInput, { height: 75 }]}
          />
          <TextInput
            value={cardBack}
            onChangeText={setCardBack}
            placeholder="Back: Answer or Definition…"
            placeholderTextColor={Colors.secondary}
            multiline
            style={[styles.textInput, { height: 75 }]}
          />
          <TextInput
            value={cardNote}
            onChangeText={setCardNote}
            placeholder="Extra Note (Optional clinical mnemonic)…"
            placeholderTextColor={Colors.secondary}
            style={styles.textInput}
          />

          <Pressable onPress={handleAddCard} style={styles.addQuestionBtn}>
            <Text style={styles.addQuestionBtnText}>+ Add Card to Deck</Text>
          </Pressable>

          <Pressable onPress={handleSaveDeck} style={styles.saveMainBtn}>
            <Text style={styles.saveMainBtnText}>
              Save & Publish Deck ({addedCards.length} Cards)
            </Text>
          </Pressable>
        </View>
      )}

      {/* Bulk Import Modal */}
      <BulkImportModal
        visible={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onApply={handleApplyBulk}
      />

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
    paddingTop: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    lineHeight: 18,
    marginBottom: 18,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleBtnActive: {
    backgroundColor: Colors.surfaceCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  toggleBtnTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formSectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.onSurface,
    marginBottom: 12,
  },
  bulkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary + '0E',
    borderColor: Colors.primary + '30',
    borderWidth: 1.2,
    borderRadius: 16,
    padding: 14,
    marginVertical: 10,
  },
  bulkBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 2,
  },
  bulkBannerDesc: {
    fontSize: 11,
    color: Colors.onSurface,
    lineHeight: 15,
  },
  bulkBannerBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  bulkBannerBtnText: {
    color: Colors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  draftSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 12,
  },
  draftHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  draftHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  draftClearText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
  },
  draftList: {
    gap: 8,
  },
  draftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  draftItemBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  draftItemIndex: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeMcq: {
    backgroundColor: Colors.primary + '18',
  },
  typeBadgeTf: {
    backgroundColor: Colors.warning + '20',
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  typeBadgeTextMcq: {
    color: Colors.primary,
  },
  typeBadgeTextTf: {
    color: Colors.warning,
  },
  draftItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  draftItemSub: {
    fontSize: 10,
    color: Colors.secondary,
    marginTop: 3,
  },
  draftRemoveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftRemoveText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 18,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 8,
  },
  optionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  optionCorrectIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCorrectActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  optionLetterActive: {
    color: '#FFFFFF',
  },
  addQuestionBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  addQuestionBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  saveMainBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveMainBtnText: {
    color: Colors.onPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
});

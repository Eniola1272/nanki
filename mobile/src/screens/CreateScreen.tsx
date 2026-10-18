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

interface CreateScreenProps {
  onCreated: (type: 'quiz' | 'deck') => void;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({ onCreated }) => {
  const [createType, setCreateType] = useState<'quiz' | 'deck'>('quiz');

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
      Alert.alert('No Questions', 'Please add at least one question before saving.');
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

          <View style={styles.divider} />

          <Text style={styles.formSectionHeader}>
            Add Question ({addedQuestions.length} added)
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

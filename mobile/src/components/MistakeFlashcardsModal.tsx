import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Quiz, Deck, Flashcard } from '../types';
import { StorageService } from '../lib/storage';

interface MistakeFlashcardsModalProps {
  visible: boolean;
  quiz: Quiz;
  initialCards: Flashcard[];
  onClose: () => void;
  onSaved: (createdDeck: Deck) => void;
}

export const MistakeFlashcardsModal: React.FC<MistakeFlashcardsModalProps> = ({
  visible,
  quiz,
  initialCards,
  onClose,
  onSaved,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? 24 : 0);
  const [deckTitle, setDeckTitle] = useState(`${quiz.title} — Mistakes`);
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialCards.map((c) => c.id))
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDeckTitle(`${quiz.title} — Mistakes`);
    setCards(initialCards);
    setSelectedIds(new Set(initialCards.map((c) => c.id)));
  }, [quiz, initialCards]);

  const toggleSelect = (id: string) => {
    Haptics.selectionAsync();
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const handleSaveDeck = async () => {
    const selectedCards = cards.filter((c) => selectedIds.has(c.id));
    if (selectedCards.length === 0) {
      Alert.alert('No Cards Selected', 'Please select at least one card to save.');
      return;
    }
    if (!deckTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for this mistake deck.');
      return;
    }

    setSaving(true);
    try {
      const deckId = `deck_mistakes_${Date.now()}`;
      const newDeck: Deck = {
        id: deckId,
        title: deckTitle.trim(),
        category: quiz.category || 'General',
        cards: selectedCards.map((c) => ({
          ...c,
          deckId,
        })),
      };

      await StorageService.saveDeck(newDeck);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Deck Created! 🗂️',
        `Saved "${newDeck.title}" with ${newDeck.cards.length} cards to your library for spaced repetition.`
      );
      onSaved(newDeck);
      onClose();
    } catch {
      Alert.alert('Save Error', 'Could not save flashcards. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalRoot, { paddingTop: topInset }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>⚡ Create Flashcards from Mistakes</Text>
            <Text style={styles.headerSubtitle}>
              Reinforce missed questions with spaced repetition.
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Deck Title Input */}
          <View style={styles.titleSection}>
            <Text style={styles.inputLabel}>Deck Title</Text>
            <TextInput
              value={deckTitle}
              onChangeText={setDeckTitle}
              placeholder="e.g., Pharmacology Mistakes"
              placeholderTextColor={Colors.secondary}
              style={styles.textInput}
            />
          </View>

          {/* Cards Count Header */}
          <View style={styles.cardsHeaderRow}>
            <Text style={styles.cardsHeaderTitle}>
              Cards to Create ({selectedIds.size} of {cards.length} selected)
            </Text>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                if (selectedIds.size === cards.length) {
                  setSelectedIds(new Set());
                } else {
                  setSelectedIds(new Set(cards.map((c) => c.id)));
                }
              }}
              hitSlop={8}
            >
              <Text style={styles.selectToggleText}>
                {selectedIds.size === cards.length ? 'Deselect All' : 'Select All'}
              </Text>
            </Pressable>
          </View>

          {/* Cards List */}
          <View style={styles.cardsList}>
            {cards.map((card, idx) => {
              const isSelected = selectedIds.has(card.id);
              return (
                <Pressable
                  key={card.id || idx}
                  onPress={() => toggleSelect(card.id)}
                  style={[styles.cardItem, isSelected && styles.cardItemSelected]}
                >
                  <View style={styles.cardCheckboxRow}>
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxActive,
                      ]}
                    >
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.cardNumber}>Card #{idx + 1}</Text>
                  </View>

                  <View style={styles.cardContent}>
                    <Text style={styles.cardPromptLabel}>FRONT (PROMPT):</Text>
                    <Text style={styles.cardPromptText} numberOfLines={3}>
                      {card.front}
                    </Text>

                    <Text style={styles.cardAnswerLabel}>BACK (CORRECT ANSWER):</Text>
                    <Text style={styles.cardAnswerText}>{card.back}</Text>

                    {card.extraNote ? (
                      <View style={styles.noteContainer}>
                        <Text style={styles.cardNoteLabel}>CLINICAL RATIONALE:</Text>
                        <Text style={styles.cardNoteText} numberOfLines={2}>
                          {card.extraNote}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) + 6 }]}>
          <Pressable
            onPress={handleSaveDeck}
            disabled={saving || selectedIds.size === 0}
            style={[
              styles.saveBtn,
              (saving || selectedIds.size === 0) && styles.disabledBtn,
            ]}
          >
            <Text style={styles.saveBtnText}>
              {saving
                ? 'Creating Deck…'
                : `Save Deck (${selectedIds.size} Flashcard${
                    selectedIds.size === 1 ? '' : 's'
                  })`}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surfaceCard,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 30,
  },
  titleSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.onSurface,
  },
  cardsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  cardsHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  selectToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardsList: {
    gap: 12,
  },
  cardItem: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cardItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '06',
  },
  cardCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  cardNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.secondary,
  },
  cardContent: {
    gap: 4,
  },
  cardPromptLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  cardPromptText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 8,
    lineHeight: 18,
  },
  cardAnswerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.success,
    letterSpacing: 0.5,
  },
  cardAnswerText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 6,
  },
  noteContainer: {
    backgroundColor: Colors.surface,
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  cardNoteLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.secondary,
  },
  cardNoteText: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
    lineHeight: 15,
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surfaceCard,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: Colors.onPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  disabledBtn: {
    opacity: 0.4,
  },
});

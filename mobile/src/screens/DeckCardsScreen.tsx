import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Deck, Flashcard } from '../types';
import { StorageService } from '../lib/storage';

interface DeckCardsScreenProps {
  deck: Deck;
  onStartStudy: () => void;
  onBack: () => void;
  onDeckUpdated: (updatedDeck: Deck) => void;
}

export const DeckCardsScreen: React.FC<DeckCardsScreenProps> = ({
  deck,
  onStartStudy,
  onBack,
  onDeckUpdated,
}) => {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [noteText, setNoteText] = useState('');

  const filteredCards = deck.cards.filter(
    (c) =>
      c.front.toLowerCase().includes(search.toLowerCase()) ||
      c.back.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCard = async () => {
    if (!frontText.trim() || !backText.trim()) {
      Alert.alert('Incomplete Card', 'Please enter both the Front prompt and Back answer.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newCard: Flashcard = {
      id: `c_${Date.now()}`,
      deckId: deck.id,
      front: frontText.trim(),
      back: backText.trim(),
      extraNote: noteText.trim() || undefined,
    };

    const updatedDeck: Deck = {
      ...deck,
      cards: [...deck.cards, newCard],
    };

    await StorageService.saveDeck(updatedDeck);
    onDeckUpdated(updatedDeck);

    setFrontText('');
    setBackText('');
    setNoteText('');
    setIsAddModalOpen(false);
    Alert.alert('Card Added', 'New card added to this deck.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onStartStudy();
          }}
          style={styles.studyNowPill}
        >
          <Text style={styles.studyNowPillText}>Study Deck ({deck.cards.length}) →</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.deckInfoCard}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{deck.category}</Text>
          </View>
          <Text style={styles.deckTitle}>{deck.title}</Text>
          <Text style={styles.deckCountSubtitle}>
            {deck.cards.length} Spaced Repetition Flashcards
          </Text>
        </View>

        {/* Search & Add Bar */}
        <View style={styles.actionRow}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search cards in this deck…"
            placeholderTextColor={Colors.secondary}
            style={styles.searchInput}
          />
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsAddModalOpen(true);
            }}
            style={styles.addCardButton}
          >
            <Text style={styles.addCardButtonText}>+ Add</Text>
          </Pressable>
        </View>

        {/* Card List */}
        <View style={styles.cardsList}>
          {filteredCards.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🗂️</Text>
              <Text style={styles.emptyText}>No flashcards found.</Text>
            </View>
          ) : (
            filteredCards.map((card, idx) => (
              <View key={card.id || idx} style={styles.cardItem}>
                <View style={styles.cardNumberBadge}>
                  <Text style={styles.cardNumberText}>#{idx + 1}</Text>
                </View>
                <View style={styles.cardItemContent}>
                  <Text style={styles.frontText}>{card.front}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.backText}>{card.back}</Text>
                  {card.extraNote && (
                    <Text style={styles.noteText}>💡 {card.extraNote}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Add Card Modal */}
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Flashcard</Text>
            <Pressable
              onPress={() => setIsAddModalOpen(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.modalSubtitle}>
            Adding card to "{deck.title}"
          </Text>

          <Text style={styles.inputLabel}>Front (Prompt / Question)</Text>
          <TextInput
            value={frontText}
            onChangeText={setFrontText}
            placeholder="e.g., Mechanism of Metformin?"
            placeholderTextColor={Colors.secondary}
            multiline
            style={[styles.modalInput, { height: 75 }]}
          />

          <Text style={styles.inputLabel}>Back (Answer / Definition)</Text>
          <TextInput
            value={backText}
            onChangeText={setBackText}
            placeholder="e.g., Activates AMP-activated protein kinase (AMPK)..."
            placeholderTextColor={Colors.secondary}
            multiline
            style={[styles.modalInput, { height: 75 }]}
          />

          <Text style={styles.inputLabel}>Extra Note / Mnemonic (Optional)</Text>
          <TextInput
            value={noteText}
            onChangeText={setNoteText}
            placeholder="e.g., First-line oral agent for T2D..."
            placeholderTextColor={Colors.secondary}
            style={styles.modalInput}
          />

          <Pressable onPress={handleAddCard} style={styles.saveCardBtn}>
            <Text style={styles.saveCardBtnText}>Save Card to Deck</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  studyNowPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  studyNowPillText: {
    color: Colors.onPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  deckInfoCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.accentDark,
  },
  deckTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  deckCountSubtitle: {
    fontSize: 13,
    color: Colors.secondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.onSurface,
  },
  addCardButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 16,
  },
  addCardButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  cardsList: {
    gap: 12,
  },
  cardItem: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardNumberBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 12,
  },
  cardNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
  },
  cardItemContent: {
    flex: 1,
  },
  frontText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceContainerLow,
    marginVertical: 8,
  },
  backText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    lineHeight: 20,
  },
  noteText: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.onSurface,
  },
  saveCardBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveCardBtnText: {
    color: Colors.onPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
});

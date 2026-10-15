import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Deck } from '../types';

interface DeckCardProps {
  deck: Deck;
  onPress: () => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck, onPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>🗂️</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryText}>{deck.category}</Text>
          <Text style={styles.countText}>{deck.cards.length} cards</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {deck.title}
        </Text>
      </View>

      <Text style={styles.arrowText}>→</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceContainerLow,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
  },
  countText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  arrowText: {
    fontSize: 18,
    color: Colors.secondary,
    fontWeight: '600',
  },
});

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
import { Quiz, Deck } from '../types';
import { DownloadButton } from '../components/OfflineControls';
import { StorageService } from '../lib/storage';
import { COMMUNITY_ITEMS, CommunityItem } from '../lib/community-data';

interface DiscoverScreenProps {
  onSelectQuiz: (quiz: Quiz) => void;
  onSelectDeck: (deck: Deck) => void;
  onForked: () => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  onSelectQuiz,
  onSelectDeck,
  onForked,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  const [kindFilter, setKindFilter] = useState<'all' | 'quiz' | 'deck'>('all');
  const [upvotes, setUpvotes] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    COMMUNITY_ITEMS.forEach((item) => {
      map[item.id] = item.upvotes;
    });
    return map;
  });
  const [forkedIds, setForkedIds] = useState<Set<string>>(new Set());

  const categories = [
    'All Topics',
    ...new Set(COMMUNITY_ITEMS.map((item) => item.category)),
  ];

  const filteredItems = COMMUNITY_ITEMS.filter((item) => {
    const matchesKind = kindFilter === 'all' || item.kind === kindFilter;
    const matchesCategory =
      selectedCategory === 'All Topics' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesKind && matchesCategory && matchesSearch;
  });

  const handleUpvote = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUpvotes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleFork = async (item: CommunityItem) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (item.kind === 'quiz') {
      const clonedQuiz: Quiz = {
        ...(item.content as Quiz),
        id: `quiz_forked_${Date.now()}`,
        title: `${item.title} (Forked)`,
      };
      await StorageService.saveQuiz(clonedQuiz);
    } else {
      const deckId = `deck_forked_${Date.now()}`;
      const clonedDeck: Deck = {
        ...(item.content as Deck),
        id: deckId,
        title: `${item.title} (Forked)`,
        cards: (item.content as Deck).cards.map((c) => ({
          ...c,
          deckId,
        })),
      };
      await StorageService.saveDeck(clonedDeck);
    }

    setForkedIds((prev) => new Set(prev).add(item.id));
    onForked();
    Alert.alert(
      'Forked to Your Library! 📚',
      `"${item.title}" has been saved to your local library. You can now edit questions and study offline anytime.`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Community Discover</Text>
        <Text style={styles.pageSubtitle}>
          Explore peer-reviewed medical question banks & flashcard decks.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by topic, keyword, or university…"
          placeholderTextColor={Colors.secondary}
          style={styles.searchBar}
        />

        {/* Kind Filter Tabs */}
        <View style={styles.kindTabs}>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setKindFilter('all');
            }}
            style={[styles.kindTab, kindFilter === 'all' && styles.kindTabActive]}
          >
            <Text
              style={[
                styles.kindTabText,
                kindFilter === 'all' && styles.kindTabTextActive,
              ]}
            >
              All Items ({COMMUNITY_ITEMS.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setKindFilter('quiz');
            }}
            style={[styles.kindTab, kindFilter === 'quiz' && styles.kindTabActive]}
          >
            <Text
              style={[
                styles.kindTabText,
                kindFilter === 'quiz' && styles.kindTabTextActive,
              ]}
            >
              📝 Quizzes
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setKindFilter('deck');
            }}
            style={[styles.kindTab, kindFilter === 'deck' && styles.kindTabActive]}
          >
            <Text
              style={[
                styles.kindTabText,
                kindFilter === 'deck' && styles.kindTabTextActive,
              ]}
            >
              🗂️ Flashcards
            </Text>
          </Pressable>
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={{ gap: 8, paddingBottom: 6 }}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedCategory(cat);
              }}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.categoryPillActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === cat && styles.categoryPillTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* List of Community Items */}
        <View style={styles.itemsList}>
          {filteredItems.map((item) => {
            const hasForked = forkedIds.has(item.id);
            return (
              <View key={item.id} style={styles.communityCard}>
                <View style={styles.cardHeaderRow}>
                  <View
                    style={[
                      styles.kindBadge,
                      item.kind === 'quiz' ? styles.kindBadgeQuiz : styles.kindBadgeDeck,
                    ]}
                  >
                    <Text
                      style={[
                        styles.kindBadgeText,
                        item.kind === 'quiz'
                          ? styles.kindBadgeTextQuiz
                          : styles.kindBadgeTextDeck,
                      ]}
                    >
                      {item.kind === 'quiz' ? '📝 QUIZ' : '🗂️ FLASHCARDS'}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => handleUpvote(item.id)}
                    style={styles.upvoteBtn}
                    hitSlop={8}
                  >
                    <Text style={styles.upvoteText}>
                      👍 {upvotes[item.id] || item.upvotes}
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardAuthor}>
                  By {item.author} • {item.university}
                </Text>
                <Text style={styles.cardDesc} numberOfLines={3}>
                  {item.description}
                </Text>

                <View style={styles.cardMetaRow}>
                  <Text style={styles.cardCategoryText}>
                    🏷️ {item.category} • {item.itemCount}{' '}
                    {item.kind === 'quiz' ? 'Questions' : 'Cards'}
                  </Text>
                </View>

                <DownloadButton kind={item.kind} item={item.content} />
                {/* Actions */}
                <View style={styles.cardActionsRow}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (item.kind === 'quiz') {
                        onSelectQuiz(item.content as Quiz);
                      } else {
                        onSelectDeck(item.content as Deck);
                      }
                    }}
                    style={styles.practiceBtn}
                  >
                    <Text style={styles.practiceBtnText}>Preview & Practice</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleFork(item)}
                    disabled={hasForked}
                    style={[styles.forkBtn, hasForked && styles.forkBtnDone]}
                  >
                    <Text style={[styles.forkBtnText, hasForked && styles.forkBtnTextDone]}>
                      {hasForked ? '✓ Forked' : '⚡ Fork Copy'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    marginTop: 2,
    lineHeight: 18,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
  },
  searchBar: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.onSurface,
    marginBottom: 14,
  },
  kindTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 3,
    marginBottom: 12,
  },
  kindTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 11,
  },
  kindTabActive: {
    backgroundColor: Colors.surfaceCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  kindTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  kindTabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  categoryPillTextActive: {
    color: Colors.onPrimary,
    fontWeight: '800',
  },
  itemsList: {
    gap: 16,
  },
  communityCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  kindBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  kindBadgeQuiz: {
    backgroundColor: Colors.primary + '18',
  },
  kindBadgeDeck: {
    backgroundColor: Colors.accent,
  },
  kindBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  kindBadgeTextQuiz: {
    color: Colors.primary,
  },
  kindBadgeTextDeck: {
    color: Colors.primary,
  },
  upvoteBtn: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upvoteText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 3,
  },
  cardAuthor: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.secondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardCategoryText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  practiceBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  forkBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forkBtnDone: {
    backgroundColor: Colors.success,
  },
  forkBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.onPrimary,
  },
  forkBtnTextDone: {
    color: '#FFF',
  },
});

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  TextInput,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Colors } from './src/theme/colors';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { QuizPlayScreen } from './src/screens/QuizPlayScreen';
import { FlashcardScreen } from './src/screens/FlashcardScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { CreateScreen } from './src/screens/CreateScreen';
import { StorageService } from './src/lib/storage';
import { Quiz, Deck } from './src/types';

type Tab = 'dashboard' | 'quizzes' | 'decks' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadContent();
  }, [activeTab, isCreating]);

  const loadContent = async () => {
    const [qList, dList] = await Promise.all([
      StorageService.getQuizzes(),
      StorageService.getDecks(),
    ]);
    setQuizzes(qList);
    setDecks(dList);
  };

  const handleTabChange = (tab: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setActiveQuiz(null);
    setActiveDeck(null);
    setIsCreating(false);
  };

  // If currently taking a quiz:
  if (activeQuiz) {
    return (
      <View style={styles.appContainer}>
        <StatusBar style="dark" />
        <QuizPlayScreen
          quiz={activeQuiz}
          onExit={() => {
            setActiveQuiz(null);
            loadContent();
          }}
        />
      </View>
    );
  }

  // If currently studying a flashcard deck:
  if (activeDeck) {
    return (
      <View style={styles.appContainer}>
        <StatusBar style="dark" />
        <FlashcardScreen
          deck={activeDeck}
          onExit={() => {
            setActiveDeck(null);
            loadContent();
          }}
        />
      </View>
    );
  }

  // If currently in creation mode:
  if (isCreating) {
    return (
      <SafeAreaView style={styles.appContainer}>
        <StatusBar style="dark" />
        <View style={styles.createHeader}>
          <Pressable
            onPress={() => setIsCreating(false)}
            style={styles.createCloseBtn}
          >
            <Text style={styles.createCloseText}>✕ Close</Text>
          </Pressable>
        </View>
        <CreateScreen
          onCreated={(type) => {
            setIsCreating(false);
            if (type === 'quiz') setActiveTab('quizzes');
            else setActiveTab('decks');
            loadContent();
          }}
        />
      </SafeAreaView>
    );
  }

  // Filtered lists for Quizzes & Decks tabs
  const quizCategories = ['All', ...new Set(quizzes.map((q) => q.category))];
  const filteredQuizzes = quizzes.filter((q) => {
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const deckCategories = ['All', ...new Set(decks.map((d) => d.category))];
  const filteredDecks = decks.filter((d) => {
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar style="dark" />

      <View style={styles.mainView}>
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardScreen
            onSelectQuiz={(quiz) => setActiveQuiz(quiz)}
            onSelectDeck={(deck) => setActiveDeck(deck)}
            onOpenProfile={() => setActiveTab('profile')}
            onOpenCreate={() => setIsCreating(true)}
          />
        )}

        {/* TAB 2: QUIZZES */}
        {activeTab === 'quizzes' && (
          <View style={styles.tabScreenContainer}>
            <View style={styles.tabTopHeader}>
              <Text style={styles.tabScreenTitle}>All Quizzes</Text>
              <Pressable
                onPress={() => setIsCreating(true)}
                style={styles.quickAddPill}
              >
                <Text style={styles.quickAddPillText}>+ New</Text>
              </Pressable>
            </View>

            {/* Search Input */}
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by title, topic, or keyword…"
              placeholderTextColor={Colors.secondary}
              style={styles.searchBar}
            />

            {/* Category Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
            >
              {quizCategories.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedCategory(cat);
                  }}
                  style={[
                    styles.filterPill,
                    selectedCategory === cat && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedCategory === cat && styles.filterPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Quiz Cards List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {filteredQuizzes.length === 0 ? (
                <View style={styles.emptyStateBox}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={styles.emptyText}>No quizzes match your filter.</Text>
                </View>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <Pressable
                    key={quiz.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setActiveQuiz(quiz);
                    }}
                    style={({ pressed }) => [
                      styles.tabItemCard,
                      pressed && styles.itemPressed,
                    ]}
                  >
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{quiz.category}</Text>
                    </View>
                    <Text style={styles.itemTitle}>{quiz.title}</Text>
                    <Text style={styles.itemSubtitle}>
                      {quiz.questions.length} Questions ·{' '}
                      {quiz.masteredPercentage ?? 0}% Mastered
                    </Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        )}

        {/* TAB 3: DECKS */}
        {activeTab === 'decks' && (
          <View style={styles.tabScreenContainer}>
            <View style={styles.tabTopHeader}>
              <Text style={styles.tabScreenTitle}>Flashcard Decks</Text>
              <Pressable
                onPress={() => setIsCreating(true)}
                style={styles.quickAddPill}
              >
                <Text style={styles.quickAddPillText}>+ New</Text>
              </Pressable>
            </View>

            {/* Search Input */}
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search decks by keyword…"
              placeholderTextColor={Colors.secondary}
              style={styles.searchBar}
            />

            {/* Category Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
            >
              {deckCategories.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedCategory(cat);
                  }}
                  style={[
                    styles.filterPill,
                    selectedCategory === cat && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedCategory === cat && styles.filterPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Decks List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {filteredDecks.length === 0 ? (
                <View style={styles.emptyStateBox}>
                  <Text style={styles.emptyEmoji}>🗂️</Text>
                  <Text style={styles.emptyText}>No flashcard decks match your search.</Text>
                </View>
              ) : (
                filteredDecks.map((deck) => (
                  <Pressable
                    key={deck.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setActiveDeck(deck);
                    }}
                    style={({ pressed }) => [
                      styles.tabItemCard,
                      pressed && styles.itemPressed,
                    ]}
                  >
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{deck.category}</Text>
                    </View>
                    <Text style={styles.itemTitle}>{deck.title}</Text>
                    <Text style={styles.itemSubtitle}>
                      {deck.cards.length} Flashcards (Spaced Repetition)
                    </Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <Pressable
          onPress={() => handleTabChange('dashboard')}
          style={({ pressed }) => [
            styles.navItem,
            pressed && styles.navItemPressed,
          ]}
        >
          <Text style={[styles.navIcon, activeTab === 'dashboard' && styles.navIconActive]}>
            ⚡
          </Text>
          <Text style={[styles.navLabel, activeTab === 'dashboard' && styles.navLabelActive]}>
            Dashboard
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleTabChange('quizzes')}
          style={({ pressed }) => [
            styles.navItem,
            pressed && styles.navItemPressed,
          ]}
        >
          <Text style={[styles.navIcon, activeTab === 'quizzes' && styles.navIconActive]}>
            📝
          </Text>
          <Text style={[styles.navLabel, activeTab === 'quizzes' && styles.navLabelActive]}>
            Quizzes
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleTabChange('decks')}
          style={({ pressed }) => [
            styles.navItem,
            pressed && styles.navItemPressed,
          ]}
        >
          <Text style={[styles.navIcon, activeTab === 'decks' && styles.navIconActive]}>
            🗂️
          </Text>
          <Text style={[styles.navLabel, activeTab === 'decks' && styles.navLabelActive]}>
            Decks
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleTabChange('profile')}
          style={({ pressed }) => [
            styles.navItem,
            pressed && styles.navItemPressed,
          ]}
        >
          <Text style={[styles.navIcon, activeTab === 'profile' && styles.navIconActive]}>
            👤
          </Text>
          <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>
            Profile
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  mainView: {
    flex: 1,
  },
  tabScreenContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  tabTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tabScreenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  quickAddPill: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickAddPillText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  searchBar: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.onSurface,
    marginBottom: 12,
  },
  categoryScroll: {
    maxHeight: 44,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tabItemCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: Colors.surfaceContainerLow,
  },
  categoryBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accentDark,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
  },
  emptyStateBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  createHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  createCloseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  createCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 18 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
  },
  navItemPressed: {
    transform: [{ scale: 0.88 }],
    opacity: 0.75,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 2,
    opacity: 0.5,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
  },
  navLabelActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
});

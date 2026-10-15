import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Colors } from './src/theme/colors';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { QuizPlayScreen } from './src/screens/QuizPlayScreen';
import { FlashcardScreen } from './src/screens/FlashcardScreen';
import { SAMPLE_QUIZZES, SAMPLE_DECKS } from './src/lib/sample-data';
import { Quiz, Deck } from './src/types';

type Tab = 'dashboard' | 'quizzes' | 'decks';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);

  const handleTabChange = (tab: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setActiveQuiz(null);
    setActiveDeck(null);
  };

  // If currently taking a quiz:
  if (activeQuiz) {
    return (
      <View style={styles.appContainer}>
        <StatusBar style="dark" />
        <QuizPlayScreen
          quiz={activeQuiz}
          onExit={() => setActiveQuiz(null)}
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
          onExit={() => setActiveDeck(null)}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar style="dark" />
      
      <View style={styles.mainView}>
        {activeTab === 'dashboard' && (
          <DashboardScreen
            onSelectQuiz={(quiz) => setActiveQuiz(quiz)}
            onSelectDeck={(deck) => setActiveDeck(deck)}
          />
        )}

        {activeTab === 'quizzes' && (
          <View style={styles.tabListScreen}>
            <Text style={styles.tabScreenTitle}>All Quizzes</Text>
            <Text style={styles.tabScreenSubtitle}>Choose a question bank to practice.</Text>
            <View style={{ marginTop: 16 }}>
              {SAMPLE_QUIZZES.map((quiz) => (
                <Pressable
                  key={quiz.id}
                  onPress={() => setActiveQuiz(quiz)}
                  style={({ pressed }) => [
                    styles.tabItemCard,
                    pressed && styles.itemPressed,
                  ]}
                >
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{quiz.category}</Text>
                  </View>
                  <Text style={styles.itemTitle}>{quiz.title}</Text>
                  <Text style={styles.itemSubtitle}>{quiz.questions.length} Questions</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'decks' && (
          <View style={styles.tabListScreen}>
            <Text style={styles.tabScreenTitle}>Flashcard Decks</Text>
            <Text style={styles.tabScreenSubtitle}>Spaced repetition recall for medical retention.</Text>
            <View style={{ marginTop: 16 }}>
              {SAMPLE_DECKS.map((deck) => (
                <Pressable
                  key={deck.id}
                  onPress={() => setActiveDeck(deck)}
                  style={({ pressed }) => [
                    styles.tabItemCard,
                    pressed && styles.itemPressed,
                  ]}
                >
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{deck.category}</Text>
                  </View>
                  <Text style={styles.itemTitle}>{deck.title}</Text>
                  <Text style={styles.itemSubtitle}>{deck.cards.length} Cards</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
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
  tabListScreen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tabScreenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  tabScreenSubtitle: {
    fontSize: 14,
    color: Colors.secondary,
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
    paddingHorizontal: 16,
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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, Quiz, Deck, ReviewState } from '../types';
import { SAMPLE_QUIZZES, SAMPLE_DECKS } from './sample-data';
import { supabase } from './supabase';

const KEYS = {
  PROFILE: 'nanki_mobile_profile',
  QUIZZES: 'nanki_mobile_quizzes',
  DECKS: 'nanki_mobile_decks',
  REVIEWS: 'nanki_mobile_reviews',
  ATTEMPTS: 'nanki_mobile_attempts',
  SETTINGS: 'nanki_mobile_settings',
};

export interface UserSettings {
  hapticsEnabled: boolean;
  autoRevealExplanation: boolean;
  soundEnabled: boolean;
}

export const DEFAULT_PROFILE: Profile = {
  id: 'guest-local-user',
  name: 'Student Learner',
  email: 'learner@nanki.app',
  streak: 4,
  xp: 840,
  plan: 'PRO',
};

export const DEFAULT_SETTINGS: UserSettings = {
  hapticsEnabled: true,
  autoRevealExplanation: true,
  soundEnabled: true,
};

export const StorageService = {
  // Profile
  async getProfile(): Promise<Profile> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  async saveProfile(profile: Profile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  },

  async addXP(amount: number): Promise<Profile> {
    const profile = await this.getProfile();
    profile.xp += amount;
    await this.saveProfile(profile);
    return profile;
  },

  // Settings
  async getSettings(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  // Quizzes (Sample + User-Created)
  async getQuizzes(): Promise<Quiz[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.QUIZZES);
      const userQuizzes: Quiz[] = data ? JSON.parse(data) : [];
      // Combine user quizzes with sample quizzes (deduplicating by id)
      const map = new Map<string, Quiz>();
      SAMPLE_QUIZZES.forEach((q) => map.set(q.id, q));
      userQuizzes.forEach((q) => map.set(q.id, q));
      return Array.from(map.values());
    } catch {
      return SAMPLE_QUIZZES;
    }
  },

  async saveQuiz(quiz: Quiz): Promise<void> {
    try {
      const quizzes = await this.getQuizzes();
      const existingIdx = quizzes.findIndex((q) => q.id === quiz.id);
      if (existingIdx >= 0) {
        quizzes[existingIdx] = quiz;
      } else {
        quizzes.unshift(quiz);
      }
      await AsyncStorage.setItem(KEYS.QUIZZES, JSON.stringify(quizzes));

      // Try background sync to Supabase if authenticated
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        await supabase.from('quizzes').upsert({
          id: quiz.id,
          user_id: session.session.user.id,
          title: quiz.title,
          category: quiz.category,
          description: quiz.description,
          questions: quiz.questions,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('Failed to save quiz:', e);
    }
  },

  // Decks (Sample + User-Created)
  async getDecks(): Promise<Deck[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.DECKS);
      const userDecks: Deck[] = data ? JSON.parse(data) : [];
      const map = new Map<string, Deck>();
      SAMPLE_DECKS.forEach((d) => map.set(d.id, d));
      userDecks.forEach((d) => map.set(d.id, d));
      return Array.from(map.values());
    } catch {
      return SAMPLE_DECKS;
    }
  },

  async saveDeck(deck: Deck): Promise<void> {
    try {
      const decks = await this.getDecks();
      const existingIdx = decks.findIndex((d) => d.id === deck.id);
      if (existingIdx >= 0) {
        decks[existingIdx] = deck;
      } else {
        decks.unshift(deck);
      }
      await AsyncStorage.setItem(KEYS.DECKS, JSON.stringify(decks));

      // Background sync to Supabase if authenticated
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        await supabase.from('decks').upsert({
          id: deck.id,
          user_id: session.session.user.id,
          title: deck.title,
          category: deck.category,
          cards: deck.cards,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('Failed to save deck:', e);
    }
  },

  // Review states for SM-2 Spaced Repetition
  async getReviewStates(): Promise<Record<string, ReviewState>> {
    try {
      const data = await AsyncStorage.getItem(KEYS.REVIEWS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  async saveReviewState(state: ReviewState): Promise<void> {
    try {
      const states = await this.getReviewStates();
      states[state.cardId] = state;
      await AsyncStorage.setItem(KEYS.REVIEWS, JSON.stringify(states));
    } catch (e) {
      console.error('Failed to save review state:', e);
    }
  },
};

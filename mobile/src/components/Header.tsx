import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';

interface HeaderProps {
  title?: string;
  streak?: number;
  xp?: number;
  onProfilePress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Nanki',
  streak = 4,
  xp = 780,
  onProfilePress,
}) => {
  const handleStreakPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.brandTitle}>
          Nank<Text style={styles.brandHighlight}>i</Text>
        </Text>
        {title !== 'Nanki' && <Text style={styles.subtitle}> · {title}</Text>}
      </View>

      <View style={styles.statsRow}>
        <Pressable
          onPress={handleStreakPress}
          style={({ pressed }) => [
            styles.streakBadge,
            pressed && styles.badgePressed,
          ]}
        >
          <Text style={styles.streakText}>🔥 {streak}d</Text>
        </Pressable>

        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>⚡ {xp} XP</Text>
        </View>

        {onProfilePress && (
          <Pressable
            onPress={onProfilePress}
            style={({ pressed }) => [
              styles.avatarButton,
              pressed && styles.badgePressed,
            ]}
          >
            <Text style={styles.avatarText}>👤</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgePressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.85,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  xpBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarText: {
    fontSize: 16,
  },
});

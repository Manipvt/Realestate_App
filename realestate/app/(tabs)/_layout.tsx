import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-color';

function TabIcon({ emoji, label, focused, colors }: { emoji: string; label: string; focused: boolean, colors: any }) {
  return (
    <View style={styles.tabItem}>
      <View style={[
        styles.iconContainer,
        { backgroundColor: colors.background, shadowColor: colors.shadow },
        focused && { backgroundColor: colors.primary }
      ]}>
        <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      </View>
      <Text style={[
        styles.tabLabel,
        { color: colors.textMuted },
        focused && { color: colors.primary }
      ]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);
  const colors = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: bottomPadding,
            height: 60 + bottomPadding,
            backgroundColor: colors.surface,
            shadowColor: colors.shadow,
          }
        ],
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Explore" focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} colors={colors} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    paddingTop: 12,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    position: 'relative',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainerActive: {
    transform: [{ scale: 1.1 }],
  },
  tabEmoji: {
    fontSize: 20,
    opacity: 0.7,
  },
  tabEmojiActive: {
    fontSize: 20,
    opacity: 1,
  },
  tabLabel: {
    fontWeight: '500',
    fontSize: 11,
  },
  tabLabelActive: {
    fontWeight: '700',
    fontSize: 11,
  },
});
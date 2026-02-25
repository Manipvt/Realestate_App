import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
        <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Explore" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 0,
    height: 85,
    paddingBottom: 12,
    paddingTop: 12,
    shadowColor: Colors.shadow,
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
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...Shadow.sm,
  },
  iconContainerActive: {
    backgroundColor: Colors.primary,
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
    ...Typography.caption, 
    color: Colors.textMuted, 
    fontWeight: '500',
    fontSize: 11,
  },
  tabLabelActive: { 
    ...Typography.caption, 
    color: Colors.primary, 
    fontWeight: '700',
    fontSize: 11,
  },
});
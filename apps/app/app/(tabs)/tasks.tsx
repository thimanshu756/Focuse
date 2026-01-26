import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';

export default function Tasks() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Tasks</Text>
          <Text style={styles.subtitle}>Manage your focus tasks</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.placeholder}>Tasks content coming soon...</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.gradient,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  placeholder: {
    color: COLORS.text.muted,
    fontSize: 16,
    marginTop: 40,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  subtitle: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 4,
  },
});

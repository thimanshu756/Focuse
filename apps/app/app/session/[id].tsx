import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

export default function FocusSession() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <X size={24} color={COLORS.text.primary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Focus Session</Text>
        <Text style={styles.subtitle}>Session ID: {id}</Text>
        <Text style={styles.placeholder}>Timer UI coming soon...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.card,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    top: 60,
    width: 40,
    zIndex: 10,
  },
  container: {
    backgroundColor: COLORS.background.gradient,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  placeholder: {
    color: COLORS.text.muted,
    fontSize: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.text.secondary,
    fontSize: 16,
    marginBottom: 40,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 8,
  },
});

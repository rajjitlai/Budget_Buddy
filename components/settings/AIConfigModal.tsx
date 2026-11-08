import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Info } from 'lucide-react-native';
import { borderRadius, colors, spacing, typography } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { InputField } from '@/components/ui/InputField';
import { SelectField } from '@/components/ui/SelectField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export interface SavedAIConfig {
  apiKey: string;
  provider?: string;
  model?: string;
}

interface AIConfigModalProps {
  visible: boolean;
  onClose: () => void;
  apiKey: string;
  provider: string | null;
  model: string;
  customInstructions: string;
  onApiKeyChange: (value: string) => void;
  onProviderChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onCustomInstructionsChange: (value: string) => void;
  onSave: () => void;
  savedConfig: SavedAIConfig | null;
}

export function AIConfigModal({
  visible,
  onClose,
  apiKey,
  provider,
  model,
  customInstructions,
  onApiKeyChange,
  onProviderChange,
  onModelChange,
  onCustomInstructionsChange,
  onSave,
  savedConfig,
}: AIConfigModalProps) {
  const { textPrimary, textSecondary, cardBackground, borderColor } = useTheme();

  return (
    <ModalSheet visible={visible} onClose={onClose} title="AI Configuration">
      <View style={styles.modalBody}>
        <Text style={[styles.modalHint, { color: textSecondary }]}>
          Personalize your AI insights by providing your own API key. Your key is stored securely on your device.
        </Text>

        {savedConfig?.apiKey ? (
          <View style={[styles.savedKeyBanner, { backgroundColor: `${colors.success}12`, borderColor: `${colors.success}30` }]}>
            <Text style={[styles.savedKeyLabel, { color: colors.success }]}>✓ Key saved</Text>
            <Text style={[styles.savedKeyValue, { color: textSecondary }]}>
              {savedConfig.apiKey.slice(0, 8)}{'•'.repeat(12)}  ·  {savedConfig.provider}  ·  {savedConfig.model}
            </Text>
          </View>
        ) : (
          <View style={[styles.savedKeyBanner, { backgroundColor: `${colors.warning}12`, borderColor: `${colors.warning}30` }]}>
            <Text style={[styles.savedKeyLabel, { color: colors.warning }]}>No key saved — using rule-based insights</Text>
          </View>
        )}

        <SelectField
          label="API Provider"
          placeholder="Select provider"
          options={[
            { id: 'openrouter', label: 'OpenRouter (Recommended)', icon: 'Globe' },
            { id: 'openai', label: 'OpenAI', icon: 'Sparkles' },
          ]}
          value={provider}
          onChange={onProviderChange}
        />

        <InputField
          label="API Key"
          placeholder="sk-..."
          value={apiKey}
          onChangeText={onApiKeyChange}
          secureTextEntry
        />

        <InputField
          label="Model Name"
          placeholder={provider === 'openrouter' ? 'e.g. openrouter/free (Recommended)' : 'e.g. gpt-4o-mini'}
          value={model}
          onChangeText={onModelChange}
        />

        {provider === 'openrouter' && (
          <View style={{ marginBottom: spacing.md }}>
            <Text style={{ fontSize: typography.fontSizes.xs, color: textSecondary, marginBottom: spacing.xs }}>
              Quick Model Presets:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
              {[
                { label: 'Auto Free (Recommended)', model: 'openrouter/free' },
                { label: 'Gemma 4 Free', model: 'google/gemma-4-26b-a4b-it:free' },
                { label: 'Nemotron Free', model: 'nvidia/nemotron-3.5-lightning:free' },
                { label: 'GLM 5.2 Free', model: 'z-ai/glm-5.2:free' },
                { label: 'GPT-4o Mini', model: 'openai/gpt-4o-mini' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.model}
                  onPress={() => onModelChange(item.model)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: borderRadius.lg,
                    borderWidth: 1,
                    borderColor: model === item.model ? colors.primary[500] : borderColor,
                    backgroundColor: model === item.model ? `${colors.primary[500]}15` : cardBackground,
                  }}
                >
                  <Text style={{ fontSize: 11, color: model === item.model ? colors.primary[500] : textPrimary, fontWeight: '500' }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <InputField
          label="Custom Instructions (optional)"
          placeholder="e.g. Focus on saving goals. Always suggest the 50/30/20 rule."
          value={customInstructions}
          onChangeText={onCustomInstructionsChange}
          multiline
          numberOfLines={3}
        />

        <View style={styles.modalHintContainer}>
          <Info size={16} color={colors.primary[500]} />
          <Text style={[styles.modalHintText, { color: textSecondary }]}>
            {provider === 'openrouter'
              ? 'Use "openrouter/free" to automatically route to active free models, or choose from the presets above.'
              : 'Find model names at platform.openai.com/docs/models (e.g. gpt-4o-mini, gpt-4o).'}
          </Text>
        </View>

        <View style={styles.modalActions}>
          <PrimaryButton
            title="Save Configuration"
            onPress={onSave}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  modalBody: {
    paddingBottom: spacing.xl,
  },
  modalHint: {
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  savedKeyBanner: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  savedKeyLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    marginBottom: 4,
  },
  savedKeyValue: {
    fontSize: typography.fontSizes.xs,
    fontFamily: 'monospace',
  },
  modalHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: `${colors.primary[500]}10`,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  modalHintText: {
    flex: 1,
    fontSize: typography.fontSizes.xs,
    lineHeight: 16,
  },
  modalActions: {
    marginTop: spacing.xl,
  },
});

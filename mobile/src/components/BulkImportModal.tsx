import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Question } from '../types';
import { parseQuestionsFromText } from '../lib/bulk-import';
import {
  BULK_IMPORT_PROMPT,
  TRUE_FALSE_IMPORT_PROMPT,
  BULK_IMPORT_EXAMPLE,
  TRUE_FALSE_IMPORT_EXAMPLE,
} from '../lib/import-prompt';

interface BulkImportModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (questions: Question[], replace: boolean) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? 24 : 0);
  const [formatMode, setFormatMode] = useState<'mcq' | 'true-false'>('mcq');
  const [rawText, setRawText] = useState('');
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  const parsedQuestions = rawText.trim() ? parseQuestionsFromText(rawText) : [];
  const mcqCount = parsedQuestions.filter((q) => q.type !== 'true-false').length;
  const tfCount = parsedQuestions.filter((q) => q.type === 'true-false').length;

  const handleCopyPrompt = async () => {
    Haptics.selectionAsync();
    const promptToCopy =
      formatMode === 'true-false' ? TRUE_FALSE_IMPORT_PROMPT : BULK_IMPORT_PROMPT;
    await Clipboard.setStringAsync(promptToCopy);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedMessage(
      `✓ Copied ${formatMode === 'true-false' ? 'True/False' : 'MCQ'} AI prompt! Paste into ChatGPT, Claude or Gemini.`
    );
    setTimeout(() => {
      setCopiedMessage(null);
    }, 4000);
  };

  const handleLoadExample = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const example =
      formatMode === 'true-false' ? TRUE_FALSE_IMPORT_EXAMPLE : BULK_IMPORT_EXAMPLE;
    setRawText(example);
    setCopiedMessage(null);
  };

  const handleApply = (replace: boolean) => {
    if (parsedQuestions.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onApply(parsedQuestions, replace);
    setRawText('');
    setCopiedMessage(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalRoot, { paddingTop: topInset }]}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>⚡ Bulk Import Quizzes</Text>
            <Text style={styles.headerSubtitle}>
              Paste questions or format study notes using AI.
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Format Mode Tabs */}
          <View style={styles.modeTabs}>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setFormatMode('mcq');
              }}
              style={[styles.modeTab, formatMode === 'mcq' && styles.modeTabActive]}
            >
              <Text
                style={[
                  styles.modeTabText,
                  formatMode === 'mcq' && styles.modeTabTextActive,
                ]}
              >
                🔘 Single Choice (MCQ)
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setFormatMode('true-false');
              }}
              style={[
                styles.modeTab,
                formatMode === 'true-false' && styles.modeTabActive,
              ]}
            >
              <Text
                style={[
                  styles.modeTabText,
                  formatMode === 'true-false' && styles.modeTabTextActive,
                ]}
              >
                ⚖️ True / False Branches
              </Text>
            </Pressable>
          </View>

          {/* AI Prompt Assistant Banner */}
          <View style={styles.aiCard}>
            <View style={styles.aiHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiCardTitle}>Format with AI Assistant</Text>
                <Text style={styles.aiCardDesc}>
                  Copy our curated prompt into ChatGPT, Gemini, or DeepSeek with your lecture
                  slides or notes.
                </Text>
              </View>
            </View>

            <View style={styles.aiActionsRow}>
              <Pressable onPress={handleCopyPrompt} style={styles.copyPromptBtn}>
                <Text style={styles.copyPromptBtnText}>📋 Copy AI Prompt</Text>
              </Pressable>

              <Pressable onPress={handleLoadExample} style={styles.loadExampleBtn}>
                <Text style={styles.loadExampleBtnText}>📝 Insert Example</Text>
              </Pressable>
            </View>

            {copiedMessage ? (
              <View style={styles.copiedBanner}>
                <Text style={styles.copiedBannerText}>{copiedMessage}</Text>
              </View>
            ) : null}
          </View>

          {/* Raw Text Input */}
          <View style={styles.inputSection}>
            <View style={styles.inputLabelRow}>
              <Text style={styles.inputLabel}>Paste Formatted Questions:</Text>
              {rawText.length > 0 && (
                <Pressable onPress={() => setRawText('')} hitSlop={8}>
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              )}
            </View>

            <TextInput
              value={rawText}
              onChangeText={setRawText}
              multiline
              textAlignVertical="top"
              placeholder={
                formatMode === 'true-false'
                  ? `Question 1: Clinical statements regarding Asthma:\nType: True/False\nA. Salbutamol causes bronchodilation.\nB. Oral steroids are contraindicated.\nAnswers: A=T, B=F`
                  : `Question 1: What is the first-line treatment for anaphylaxis?\nA. Epinephrine (Adrenaline)\nB. Diphenhydramine\nC. Hydrocortisone\nD. Albuterol\nAnswer: A`
              }
              placeholderTextColor={Colors.secondary}
              style={styles.textInput}
            />
          </View>

          {/* Live Parser Status Box */}
          <View
            style={[
              styles.statusBox,
              parsedQuestions.length > 0
                ? styles.statusBoxSuccess
                : rawText.trim()
                ? styles.statusBoxWarning
                : styles.statusBoxNeutral,
            ]}
          >
            {parsedQuestions.length > 0 ? (
              <View>
                <Text style={styles.statusSuccessTitle}>
                  ✅ {parsedQuestions.length} Question
                  {parsedQuestions.length > 1 ? 's' : ''} Recognized
                </Text>
                <Text style={styles.statusSuccessDesc}>
                  {mcqCount > 0 ? `${mcqCount} Single-choice MCQ ` : ''}
                  {mcqCount > 0 && tfCount > 0 ? '• ' : ''}
                  {tfCount > 0 ? `${tfCount} True/False Multi-branch` : ''}
                </Text>

                {/* Preview of first 2 questions */}
                <View style={styles.previewList}>
                  {parsedQuestions.slice(0, 2).map((q, idx) => (
                    <View key={q.id || idx} style={styles.previewItem}>
                      <Text style={styles.previewItemTitle} numberOfLines={1}>
                        #{idx + 1}. {q.text}
                      </Text>
                      <Text style={styles.previewItemSub}>
                        {q.type === 'true-false'
                          ? `True/False (${q.options.length} statements)`
                          : `MCQ (${q.options.length} options, Answer: ${String.fromCharCode(
                              65 + q.correctAnswer
                            )})`}
                      </Text>
                    </View>
                  ))}
                  {parsedQuestions.length > 2 && (
                    <Text style={styles.moreQuestionsText}>
                      + {parsedQuestions.length - 2} more questions ready
                    </Text>
                  )}
                </View>
              </View>
            ) : rawText.trim() ? (
              <Text style={styles.statusWarningText}>
                ⚠️ No valid questions detected yet. Please ensure question stems are followed
                by options A., B., C., D. and an "Answer: X" line.
              </Text>
            ) : (
              <Text style={styles.statusNeutralText}>
                ℹ️ Paste your formatted quiz text above or click "Insert Example" to try it out.
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) + 6 }]}>
          <Pressable
            onPress={() => handleApply(false)}
            disabled={parsedQuestions.length === 0}
            style={[
              styles.actionBtn,
              styles.appendBtn,
              parsedQuestions.length === 0 && styles.disabledBtn,
            ]}
          >
            <Text
              style={[
                styles.actionBtnText,
                styles.appendBtnText,
                parsedQuestions.length === 0 && styles.disabledBtnText,
              ]}
            >
              ➕ Append ({parsedQuestions.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleApply(true)}
            disabled={parsedQuestions.length === 0}
            style={[
              styles.actionBtn,
              styles.replaceBtn,
              parsedQuestions.length === 0 && styles.disabledBtn,
            ]}
          >
            <Text
              style={[
                styles.actionBtnText,
                styles.replaceBtnText,
                parsedQuestions.length === 0 && styles.disabledBtnText,
              ]}
            >
              🔄 Replace All ({parsedQuestions.length})
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surfaceCard,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 30,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 11,
  },
  modeTabActive: {
    backgroundColor: Colors.surfaceCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  modeTabTextActive: {
    fontWeight: '800',
    color: Colors.primary,
  },
  aiCard: {
    backgroundColor: Colors.primary + '0C',
    borderColor: Colors.primary + '28',
    borderWidth: 1.2,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  aiCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  aiCardDesc: {
    fontSize: 12,
    color: Colors.onSurface,
    lineHeight: 17,
  },
  aiActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  copyPromptBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyPromptBtnText: {
    color: Colors.onPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  loadExampleBtn: {
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadExampleBtnText: {
    color: Colors.onSurface,
    fontSize: 13,
    fontWeight: '600',
  },
  copiedBanner: {
    marginTop: 10,
    backgroundColor: Colors.success + '18',
    borderColor: Colors.success + '40',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  copiedBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
  },
  textInput: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    minHeight: 180,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Colors.onSurface,
    lineHeight: 19,
  },
  statusBox: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  statusBoxSuccess: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success + '35',
  },
  statusBoxWarning: {
    backgroundColor: Colors.warning + '12',
    borderColor: Colors.warning + '40',
  },
  statusBoxNeutral: {
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: Colors.border,
  },
  statusSuccessTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.success,
    marginBottom: 3,
  },
  statusSuccessDesc: {
    fontSize: 12,
    color: Colors.secondary,
    marginBottom: 10,
  },
  statusWarningText: {
    fontSize: 12,
    color: Colors.warning,
    lineHeight: 17,
  },
  statusNeutralText: {
    fontSize: 12,
    color: Colors.secondary,
    lineHeight: 17,
  },
  previewList: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    gap: 8,
  },
  previewItem: {
    backgroundColor: Colors.surfaceCard,
    padding: 8,
    borderRadius: 10,
  },
  previewItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  previewItemSub: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  moreQuestionsText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surfaceCard,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appendBtn: {
    backgroundColor: Colors.accent,
  },
  appendBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  replaceBtn: {
    backgroundColor: Colors.primary,
  },
  replaceBtnText: {
    color: Colors.onPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  disabledBtnText: {
    color: Colors.secondary,
  },
});

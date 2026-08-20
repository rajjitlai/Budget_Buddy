import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, Platform } from 'react-native';
import { colors, borderRadius, typography, spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

export interface MarkdownViewProps {
  content: string;
  style?: any;
  textColor?: string;
  isUserBubble?: boolean;
}

type BlockType =
  | { type: 'header'; level: number; text: string }
  | { type: 'codeblock'; language?: string; code: string }
  | { type: 'blockquote'; text: string }
  | { type: 'list-item'; ordered: boolean; index?: number; text: string }
  | { type: 'hr' }
  | { type: 'paragraph'; text: string };

function parseBlocks(rawText: string): BlockType[] {
  const lines = rawText.split('\n');
  const blocks: BlockType[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const text = paragraphBuffer.join('\n').trim();
      if (text) {
        blocks.push({ type: 'paragraph', text });
      }
      paragraphBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check code fence
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        flushParagraph();
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        blocks.push({
          type: 'codeblock',
          language: codeLang,
          code: codeBuffer.join('\n'),
        });
        codeBuffer = [];
        codeLang = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushParagraph();
      blocks.push({ type: 'hr' });
      continue;
    }

    // Headings: # H1, ## H2, ### H3, #### H4
    const headerMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headerMatch) {
      flushParagraph();
      blocks.push({
        type: 'header',
        level: headerMatch[1].length,
        text: headerMatch[2].trim(),
      });
      continue;
    }

    // Blockquote: > text
    if (trimmed.startsWith('>')) {
      flushParagraph();
      blocks.push({
        type: 'blockquote',
        text: trimmed.replace(/^>\s*/, ''),
      });
      continue;
    }

    // Unordered List: - item, * item, • item
    const unorderMatch = line.match(/^\s*[-*•+]\s+(.*)$/);
    if (unorderMatch) {
      flushParagraph();
      blocks.push({
        type: 'list-item',
        ordered: false,
        text: unorderMatch[1],
      });
      continue;
    }

    // Ordered List: 1. item
    const orderMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (orderMatch) {
      flushParagraph();
      blocks.push({
        type: 'list-item',
        ordered: true,
        index: parseInt(orderMatch[1], 10),
        text: orderMatch[2],
      });
      continue;
    }

    // Empty line separates paragraphs
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    // Regular line
    paragraphBuffer.push(line);
  }

  // Final flush
  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push({ type: 'codeblock', language: codeLang, code: codeBuffer.join('\n') });
  } else {
    flushParagraph();
  }

  return blocks;
}

function renderInlineFormatted(
  text: string,
  baseColor: string,
  isUserBubble: boolean,
  isDarkMode: boolean
): React.ReactNode[] {
  // Regex to split on inline formatting tokens:
  // ***bold italic***, **bold**, *italic*, __bold__, _italic_, `code`, ~~strike~~, [title](url)
  const tokenRegex =
    /(\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|\*[^*]+?\*|___[^_]+?___|__[^_]+?__|_[^_]+?_|`[^`]+?`|~~[^~]+?~~|\[[^\]]+?\]\([^)]+?\))/g;

  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Bold + Italic: ***text*** or ___text___
    if (
      (part.startsWith('***') && part.endsWith('***')) ||
      (part.startsWith('___') && part.endsWith('___'))
    ) {
      const inner = part.slice(3, -3);
      return (
        <Text
          key={idx}
          style={{
            fontWeight: typography.fontWeights.bold,
            fontStyle: 'italic',
            color: baseColor,
          }}
        >
          {inner}
        </Text>
      );
    }

    // Bold: **text** or __text__
    if (
      (part.startsWith('**') && part.endsWith('**')) ||
      (part.startsWith('__') && part.endsWith('__'))
    ) {
      const inner = part.slice(2, -2);
      return (
        <Text
          key={idx}
          style={{
            fontWeight: typography.fontWeights.bold,
            color: baseColor,
          }}
        >
          {inner}
        </Text>
      );
    }

    // Italic: *text* or _text_
    if (
      (part.startsWith('*') && part.endsWith('*')) ||
      (part.startsWith('_') && part.endsWith('_'))
    ) {
      const inner = part.slice(1, -1);
      return (
        <Text
          key={idx}
          style={{
            fontStyle: 'italic',
            color: baseColor,
          }}
        >
          {inner}
        </Text>
      );
    }

    // Strikethrough: ~~text~~
    if (part.startsWith('~~') && part.endsWith('~~')) {
      const inner = part.slice(2, -2);
      return (
        <Text
          key={idx}
          style={{
            textDecorationLine: 'line-through',
            color: baseColor,
            opacity: 0.8,
          }}
        >
          {inner}
        </Text>
      );
    }

    // Inline Code: `code`
    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      return (
        <Text
          key={idx}
          style={[
            styles.inlineCode,
            {
              backgroundColor: isUserBubble
                ? 'rgba(255, 255, 255, 0.2)'
                : isDarkMode
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.05)',
              color: isUserBubble
                ? '#ffffff'
                : isDarkMode
                ? colors.primary[300]
                : colors.primary[600],
            },
          ]}
        >
          {` ${inner} `}
        </Text>
      );
    }

    // Link: [title](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const linkTitle = linkMatch[1];
      const linkUrl = linkMatch[2];
      return (
        <Text
          key={idx}
          onPress={() => Linking.openURL(linkUrl).catch(() => {})}
          style={[
            styles.link,
            {
              color: isUserBubble ? '#ffffff' : colors.primary[500],
              textDecorationLine: 'underline',
            },
          ]}
        >
          {linkTitle}
        </Text>
      );
    }

    // Regular unformatted text
    return (
      <Text key={idx} style={{ color: baseColor }}>
        {part}
      </Text>
    );
  });
}

export function MarkdownView({
  content,
  style,
  textColor,
  isUserBubble = false,
}: MarkdownViewProps) {
  const { isDarkMode, textPrimary, borderColor } = useTheme();
  const baseColor = textColor || (isUserBubble ? '#ffffff' : textPrimary);

  if (!content) return null;

  const blocks = parseBlocks(content);

  return (
    <View style={[styles.container, style]}>
      {blocks.map((block, index) => {
        const isLast = index === blocks.length - 1;
        const blockMarginBottom = isLast ? 0 : spacing.xs + 2;

        switch (block.type) {
          case 'header': {
            const headerSizes: Record<number, number> = {
              1: typography.fontSizes.xl,
              2: typography.fontSizes.lg,
              3: typography.fontSizes.md + 1,
              4: typography.fontSizes.sm + 1,
            };
            return (
              <View key={index} style={{ marginBottom: blockMarginBottom, marginTop: index > 0 ? 4 : 0 }}>
                <Text
                  style={{
                    fontSize: headerSizes[block.level] || typography.fontSizes.md,
                    fontWeight: typography.fontWeights.bold,
                    color: baseColor,
                    lineHeight: (headerSizes[block.level] || typography.fontSizes.md) * 1.35,
                  }}
                >
                  {renderInlineFormatted(block.text, baseColor, isUserBubble, isDarkMode)}
                </Text>
              </View>
            );
          }

          case 'codeblock': {
            return (
              <View
                key={index}
                style={[
                  styles.codeBlockContainer,
                  {
                    backgroundColor: isUserBubble
                      ? 'rgba(0, 0, 0, 0.25)'
                      : isDarkMode
                      ? 'rgba(0, 0, 0, 0.4)'
                      : colors.slate[900],
                    borderColor: isUserBubble
                      ? 'rgba(255, 255, 255, 0.15)'
                      : isDarkMode
                      ? 'rgba(255, 255, 255, 0.1)'
                      : colors.slate[700],
                    marginBottom: blockMarginBottom,
                  },
                ]}
              >
                {block.language ? (
                  <View style={styles.codeHeader}>
                    <Text style={styles.codeLangText}>{block.language}</Text>
                  </View>
                ) : null}
                <Text style={styles.codeText}>{block.code}</Text>
              </View>
            );
          }

          case 'blockquote': {
            return (
              <View
                key={index}
                style={[
                  styles.blockquote,
                  {
                    borderLeftColor: isUserBubble ? 'rgba(255,255,255,0.6)' : colors.primary[500],
                    backgroundColor: isUserBubble
                      ? 'rgba(255,255,255,0.08)'
                      : isDarkMode
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(0,0,0,0.03)',
                    marginBottom: blockMarginBottom,
                  },
                ]}
              >
                <Text style={[styles.bodyText, { color: baseColor }]}>
                  {renderInlineFormatted(block.text, baseColor, isUserBubble, isDarkMode)}
                </Text>
              </View>
            );
          }

          case 'list-item': {
            return (
              <View
                key={index}
                style={[styles.listItemRow, { marginBottom: isLast ? 0 : 3 }]}
              >
                <Text
                  style={[
                    styles.bulletText,
                    { color: isUserBubble ? '#ffffff' : colors.primary[500] },
                  ]}
                >
                  {block.ordered ? `${block.index}.` : '•'}
                </Text>
                <Text style={[styles.listItemText, { color: baseColor }]}>
                  {renderInlineFormatted(block.text, baseColor, isUserBubble, isDarkMode)}
                </Text>
              </View>
            );
          }

          case 'hr': {
            return (
              <View
                key={index}
                style={[
                  styles.hr,
                  {
                    backgroundColor: isUserBubble ? 'rgba(255,255,255,0.2)' : borderColor,
                    marginVertical: spacing.sm,
                  },
                ]}
              />
            );
          }

          case 'paragraph':
          default: {
            return (
              <View key={index} style={{ marginBottom: blockMarginBottom }}>
                <Text style={[styles.bodyText, { color: baseColor }]}>
                  {renderInlineFormatted(block.text, baseColor, isUserBubble, isDarkMode)}
                </Text>
              </View>
            );
          }
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  bodyText: {
    fontSize: typography.fontSizes.sm,
    lineHeight: 21,
    letterSpacing: 0.1,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 2,
  },
  bulletText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    width: 18,
    lineHeight: 21,
  },
  listItemText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    lineHeight: 21,
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: typography.fontSizes.xs + 1,
    borderRadius: borderRadius.sm,
    fontWeight: '500',
  },
  codeBlockContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginVertical: spacing.xs,
    overflow: 'hidden',
  },
  codeHeader: {
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 4,
  },
  codeLangText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: typography.fontSizes.xs,
    color: '#F8FAFC',
    lineHeight: 18,
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  hr: {
    height: 1,
    width: '100%',
  },
  link: {
    fontWeight: typography.fontWeights.medium,
  },
});

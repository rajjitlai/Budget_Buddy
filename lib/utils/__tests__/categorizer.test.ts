import { stripCategoryEmoji, normalizeCategoryKey, getCategoryColor } from '../categorizer';

describe('categorizer', () => {
  describe('stripCategoryEmoji', () => {
    it('removes leading emoji symbols', () => {
      expect(stripCategoryEmoji('🍱 Food')).toBe('Food');
      expect(stripCategoryEmoji('⛽ Fuel')).toBe('Fuel');
    });

    it('returns plain text unchanged', () => {
      expect(stripCategoryEmoji('Food')).toBe('Food');
    });
  });

  describe('normalizeCategoryKey', () => {
    it('merges emoji and plain variants of the same category', () => {
      expect(normalizeCategoryKey('🍱 Food')).toBe(normalizeCategoryKey('Food'));
      expect(normalizeCategoryKey('🍱 Food')).toBe(normalizeCategoryKey('food'));
    });

    it('keeps distinct categories distinct', () => {
      expect(normalizeCategoryKey('Food')).not.toBe(normalizeCategoryKey('Food & Dining'));
    });
  });

  describe('getCategoryColor', () => {
    it('returns a hex color for known and unknown categories', () => {
      expect(getCategoryColor('Food')).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(getCategoryColor('Something Unknown')).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});

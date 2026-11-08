import { formatCurrency, calculateNetWorth, Account } from '../types';

describe('types helpers', () => {
  describe('formatCurrency', () => {
    it('prefixes the currency symbol', () => {
      expect(formatCurrency(100, '$')).toMatch(/^\$ /);
      expect(formatCurrency(100)).toMatch(/^Rs\. /);
    });

    it('formats large numbers with Indian grouping for Rs.', () => {
      // 1234567 -> 12,34,567 in en-IN grouping
      expect(formatCurrency(1234567, 'Rs.')).toContain('12,34,567');
    });

    it('formats large numbers with US grouping', () => {
      expect(formatCurrency(1234567, '$')).toContain('1,234,567');
    });
  });

  describe('calculateNetWorth', () => {
    it('sums account balances', () => {
      const accounts: Account[] = [
        { id: 'a1', name: 'A', type: 'Spending', balance: 100, icon: '', color: '#000000' },
        { id: 'a2', name: 'B', type: 'Savings', balance: 250, icon: '', color: '#000000' },
      ];
      expect(calculateNetWorth(accounts)).toBe(350);
    });

    it('returns 0 for an empty list', () => {
      expect(calculateNetWorth([])).toBe(0);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { parseLocale, requireLocale } from './locale';

describe('locale', () => {
  describe('parseLocale', () => {
    it('returns the locale if it is a valid locale', () => {
      expect(parseLocale('en')).toBe('en');
      expect(parseLocale('es')).toBe('es');
    });

    it('returns null if the locale is invalid', () => {
      expect(parseLocale('fr')).toBeNull();
      expect(parseLocale('invalid')).toBeNull();
      expect(parseLocale('')).toBeNull();
    });
  });

  describe('requireLocale', () => {
    it('returns the locale if it is valid', () => {
      expect(requireLocale('en')).toBe('en');
      expect(requireLocale('es')).toBe('es');
    });

    it('throws an error if the locale is invalid', () => {
      expect(() => requireLocale('fr')).toThrow('Invalid locale: fr');
      expect(() => requireLocale('invalid')).toThrow('Invalid locale: invalid');
      expect(() => requireLocale('')).toThrow('Invalid locale: ');
    });
  });
});

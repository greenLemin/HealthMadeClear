import { describe, it, expect } from 'vitest';
import { getButtonClasses } from './buttonStyles';

describe('getButtonClasses', () => {
  it('returns default classes when no options are provided', () => {
    const classes = getButtonClasses({});
    expect(classes).toContain('btn-primary');
    expect(classes).toContain('min-h-[56px] rounded-full px-6 py-3 text-label-lg');
    expect(classes).not.toContain('w-full');
  });

  describe('variants', () => {
    it('applies primary variant classes', () => {
      const classes = getButtonClasses({ variant: 'primary' });
      expect(classes).toContain('btn-primary');
    });

    it('applies secondary variant classes', () => {
      const classes = getButtonClasses({ variant: 'secondary' });
      expect(classes).toContain('btn-secondary');
    });

    it('applies ghost variant classes', () => {
      const classes = getButtonClasses({ variant: 'ghost' });
      expect(classes).toContain('bg-transparent');
      expect(classes).not.toContain('btn-primary');
    });

    it('applies danger variant classes', () => {
      const classes = getButtonClasses({ variant: 'danger' });
      expect(classes).toContain('bg-error');
      expect(classes).not.toContain('btn-primary');
    });
  });

  describe('sizes', () => {
    it('applies sm size classes', () => {
      const classes = getButtonClasses({ size: 'sm' });
      expect(classes).toContain('min-h-11 rounded-full px-4 py-2 text-label-md');
    });

    it('applies md size classes', () => {
      const classes = getButtonClasses({ size: 'md' });
      expect(classes).toContain('min-h-[56px] rounded-full px-6 py-3 text-label-lg');
    });

    it('applies lg size classes', () => {
      const classes = getButtonClasses({ size: 'lg' });
      expect(classes).toContain('min-h-[64px] rounded-full px-8 py-4 text-label-lg');
    });
  });

  describe('fullWidth', () => {
    it('adds w-full when fullWidth is true', () => {
      const classes = getButtonClasses({ fullWidth: true });
      expect(classes).toContain('w-full');
    });

    it('does not add w-full when fullWidth is false', () => {
      const classes = getButtonClasses({ fullWidth: false });
      expect(classes).not.toContain('w-full');
    });
  });

  describe('className', () => {
    it('appends custom className', () => {
      const classes = getButtonClasses({ className: 'custom-class' });
      expect(classes).toContain('custom-class');
      expect(classes.endsWith('custom-class')).toBe(true);
    });
  });

  describe('combinations', () => {
    it('handles a combination of options', () => {
      const classes = getButtonClasses({
        variant: 'danger',
        size: 'sm',
        fullWidth: true,
        className: 'test-class',
      });
      expect(classes).toContain('bg-error');
      expect(classes).toContain('min-h-11 rounded-full px-4 py-2 text-label-md');
      expect(classes).toContain('w-full');
      expect(classes).toContain('test-class');
    });
  });
});

import { describe, it, expect, afterEach } from 'vitest';
import { t, getLang, setLang, LANG_KEY } from './i18n';

afterEach(() => {
  setLang('en');
  localStorage.clear();
});

describe('i18n', () => {
  it('defaults to English under a non-Spanish system locale', () => {
    expect(getLang()).toBe('en');
    expect(t('nav.log')).toBe('Log');
    expect(t('nav.calc')).toBe('Calc.');
  });

  it('switches to Spanish and persists the choice', () => {
    setLang('es');
    expect(t('nav.log')).toBe('Registro');
    expect(t('field.weight')).toBe('Peso (kg)');
    expect(localStorage.getItem(LANG_KEY)).toBe('es');
  });

  it('interpolates variables', () => {
    expect(t('log.addRecordTo', { name: 'Squat' })).toBe('Add record to Squat');
    setLang('es');
    expect(t('detail.deleteQuestion', { name: 'Squat' })).toBe('¿Eliminar "Squat" y todo su histórico?');
  });

  it('ignores unknown languages and falls back to the key for unknown strings', () => {
    setLang('fr');
    expect(getLang()).toBe('en');
    expect(t('nope.missing')).toBe('nope.missing');
  });
});

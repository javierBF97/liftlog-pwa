import { t } from './i18n';

export const EXERCISE_TYPES = {
  strength: { id: 'strength', emoji: '💪' },
  carry: { id: 'carry', emoji: '🛷' },
  gymnastics: { id: 'gymnastics', emoji: '🤸' },
  cardio: { id: 'cardio', emoji: '🏃' },
};

export const TYPE_IDS = ['strength', 'carry', 'gymnastics', 'cardio'];
export const DEFAULT_TYPE = 'strength';

export const emojiFor = (type) => (EXERCISE_TYPES[type] ?? EXERCISE_TYPES.strength).emoji;
export const labelFor = (type) => t(`type.${EXERCISE_TYPES[type] ? type : 'strength'}`);

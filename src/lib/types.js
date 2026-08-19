export const EXERCISE_TYPES = {
  strength: { id: 'strength', label: 'Fuerza', emoji: '💪' },
  carry: { id: 'carry', label: 'Carry', emoji: '🛷' },
  gymnastics: { id: 'gymnastics', label: 'Gimnástico', emoji: '🤸' },
  cardio: { id: 'cardio', label: 'Cardio', emoji: '🏃' },
};

export const TYPE_IDS = ['strength', 'carry', 'gymnastics', 'cardio'];
export const DEFAULT_TYPE = 'strength';

export const emojiFor = (type) => (EXERCISE_TYPES[type] ?? EXERCISE_TYPES.strength).emoji;
export const labelFor = (type) => (EXERCISE_TYPES[type] ?? EXERCISE_TYPES.strength).label;

export const LANG_KEY = 'liftlog-lang';
export const LANGS = ['en', 'es'];

const STRINGS = {
  en: {
    'nav.log': 'Log',
    'nav.calc': 'Calc.',

    'type.strength': 'Strength',
    'type.carry': 'Carry',
    'type.gymnastics': 'Gymnastics',
    'type.cardio': 'Cardio',

    'field.type': 'Type',
    'field.weight': 'Weight (kg)',
    'field.reps': 'Reps',
    'field.distance': 'Distance (m)',
    'field.modality': 'Modality',
    'field.time': 'Time (mm:ss)',
    'field.calories': 'Calories',
    'field.date': 'Date',
    'field.exercise': 'Exercise',
    'field.name': 'Name',

    'modality.unbroken': 'Unbroken',
    'modality.accumulated': 'Accumulated',

    'time.minutes': 'Minutes',
    'time.seconds': 'Seconds',
    'time.min': 'min',
    'time.sec': 'sec',

    'pill.max': 'max',
    'pill.best': 'best',
    'pill.noRecords': 'No records',

    'metric.e1rm': 'Estimated 1RM',
    'metric.maxWeight': 'Max weight',
    'metric.unbrokenRecord': 'Unbroken record',
    'metric.maxReps': 'Max reps',
    'metric.bestPace': 'Best pace',
    'metric.bestPower': 'Best power',

    'chart.weight': 'Weight',
    'chart.volume': 'Volume',
    'chart.time': 'Time',
    'chart.rate': 'Pace·Power',

    'h.date': 'Date',
    'h.weight': 'Weight',
    'h.reps': 'Reps',
    'h.distance': 'Distance',
    'h.modality': 'Modality',
    'h.time': 'Time',
    'h.calories': 'Calories',
    'h.accum': 'Accum.',

    'btn.save': 'Save',
    'btn.cancel': 'Cancel',
    'btn.saveRecord': 'Save record',
    'btn.addRecord': 'Add record',
    'btn.calculate': 'Calculate',
    'btn.addPlate': 'Add plate',

    'log.title': 'Log',
    'log.settings': 'Settings',
    'log.search': 'Search',
    'log.searchPlaceholder': 'Search exercise…',
    'log.newRecord': 'New record',
    'log.addRecordTo': 'Add record to {name}',
    'log.existing': 'existing',
    'log.willSave': 'Will be saved to {name}',
    'log.willCreate': 'Will create "{name}"',
    'log.duplicate': 'An exercise with that name already exists',
    'log.importFailed': 'Import failed: {message}',
    'log.emptyHint': 'No records yet — search 🔍 to find an exercise from your library',

    'backup.export': 'Export backup',
    'backup.exportSub': 'Downloads a JSON with all your data',
    'backup.import': 'Import backup',
    'backup.importSub': 'Restore from a JSON file',
    'settings.language': 'Language',

    'calc.title': 'Calculators',
    'calc.bar': 'Bar:',
    'calc.custom': 'custom',
    'calc.plates': 'Plates',
    'calc.e1rm': 'Estimated 1RM:',
    'calc.showPlates': 'Show plates',

    'plate.target': 'Target weight (kg)',
    'plate.perSide': 'Per side',
    'plate.exact': 'Total {kg} kg · exact',
    'plate.closest': '≈ {kg} kg (closest loadable)',
    'table.weight': 'Weight (kg)',
    'table.platesSide': 'Plates /side',

    'plates.available': 'Available plates',
    'plates.droppable': 'droppable',
    'plates.notDroppable': '· not droppable',
    'plates.edit': 'Edit plate',
    'plates.remove': 'Remove plate',
    'plates.color': 'Plate color',
    'plates.colors': 'Colors',
    'plates.plateWeight': 'Plate weight (kg)',

    'detail.back': 'Back',
    'detail.trend': 'You need 2+ records to see the trend.',
    'detail.e1rmHistory': 'Estimated 1RM · history',
    'detail.noRecords': 'No records yet.',
    'detail.dates': 'Dates',
    'detail.from': 'From',
    'detail.to': 'To',
    'detail.actions': 'Actions',
    'detail.confirmDelete': 'Confirm delete',
    'detail.edit': 'Edit',
    'detail.delete': 'Delete',
    'detail.editName': 'Edit name',
    'detail.deleteExercise': 'Delete exercise',
    'detail.deleteQuestion': 'Delete "{name}" and all its history?',
    'detail.yesDelete': 'Yes, delete',
  },
  es: {
    'nav.log': 'Registro',
    'nav.calc': 'Calculadoras',

    'type.strength': 'Fuerza',
    'type.carry': 'Carry',
    'type.gymnastics': 'Gimnástico',
    'type.cardio': 'Cardio',

    'field.type': 'Tipo',
    'field.weight': 'Peso (kg)',
    'field.reps': 'Reps',
    'field.distance': 'Distancia (m)',
    'field.modality': 'Modalidad',
    'field.time': 'Tiempo (mm:ss)',
    'field.calories': 'Calorías',
    'field.date': 'Fecha',
    'field.exercise': 'Ejercicio',
    'field.name': 'Nombre',

    'modality.unbroken': 'Unbroken',
    'modality.accumulated': 'Acumuladas',

    'time.minutes': 'Minutos',
    'time.seconds': 'Segundos',
    'time.min': 'min',
    'time.sec': 'seg',

    'pill.max': 'máx',
    'pill.best': 'mejor',
    'pill.noRecords': 'Sin registros',

    'metric.e1rm': '1RM estimado',
    'metric.maxWeight': 'Peso máximo',
    'metric.unbrokenRecord': 'Récord unbroken',
    'metric.maxReps': 'Máximo reps',
    'metric.bestPace': 'Mejor ritmo',
    'metric.bestPower': 'Mejor potencia',

    'chart.weight': 'Peso',
    'chart.volume': 'Volumen',
    'chart.time': 'Tiempo',
    'chart.rate': 'Ritmo·Potencia',

    'h.date': 'Fecha',
    'h.weight': 'Peso',
    'h.reps': 'Reps',
    'h.distance': 'Distancia',
    'h.modality': 'Modalidad',
    'h.time': 'Tiempo',
    'h.calories': 'Calorías',
    'h.accum': 'Acum.',

    'btn.save': 'Guardar',
    'btn.cancel': 'Cancelar',
    'btn.saveRecord': 'Guardar registro',
    'btn.addRecord': 'Añadir registro',
    'btn.calculate': 'Calcular',
    'btn.addPlate': 'Añadir disco',

    'log.title': 'Registro',
    'log.settings': 'Ajustes',
    'log.search': 'Buscar',
    'log.searchPlaceholder': 'Buscar ejercicio…',
    'log.newRecord': 'Nuevo registro',
    'log.addRecordTo': 'Añadir registro a {name}',
    'log.existing': 'existente',
    'log.willSave': 'Se guardará en {name}',
    'log.willCreate': 'Se creará "{name}"',
    'log.duplicate': 'Ya existe un ejercicio con ese nombre',
    'log.importFailed': 'Importación fallida: {message}',
    'log.emptyHint': 'Sin registros todavía — busca 🔍 un ejercicio de tu librería',

    'backup.export': 'Exportar copia',
    'backup.exportSub': 'Descarga un JSON con todos tus datos',
    'backup.import': 'Importar copia',
    'backup.importSub': 'Restaura desde un archivo JSON',
    'settings.language': 'Idioma',

    'calc.title': 'Calculadoras',
    'calc.bar': 'Barra:',
    'calc.custom': 'a medida',
    'calc.plates': 'Discos',
    'calc.e1rm': '1RM estimado:',
    'calc.showPlates': 'Mostrar discos',

    'plate.target': 'Peso objetivo (kg)',
    'plate.perSide': 'Por lado',
    'plate.exact': 'Total {kg} kg · exacto',
    'plate.closest': '≈ {kg} kg (lo cargable más cercano)',
    'table.weight': 'Peso (kg)',
    'table.platesSide': 'Discos /lado',

    'plates.available': 'Discos disponibles',
    'plates.droppable': 'tirable',
    'plates.notDroppable': '· no tirable',
    'plates.edit': 'Editar disco',
    'plates.remove': 'Eliminar disco',
    'plates.color': 'Color del disco',
    'plates.colors': 'Colores',
    'plates.plateWeight': 'Peso del disco (kg)',

    'detail.back': 'Volver',
    'detail.trend': 'Necesitas 2+ registros para ver la tendencia.',
    'detail.e1rmHistory': '1RM estimado · histórico',
    'detail.noRecords': 'Sin registros todavía.',
    'detail.dates': 'Fechas',
    'detail.from': 'Desde',
    'detail.to': 'Hasta',
    'detail.actions': 'Acciones',
    'detail.confirmDelete': 'Confirmar borrado',
    'detail.edit': 'Editar',
    'detail.delete': 'Eliminar',
    'detail.editName': 'Editar nombre',
    'detail.deleteExercise': 'Borrar ejercicio',
    'detail.deleteQuestion': '¿Eliminar "{name}" y todo su histórico?',
    'detail.yesDelete': 'Sí, borrar',
  },
};

function systemLang() {
  const l = (typeof navigator !== 'undefined' && navigator.language) || 'en';
  return l.toLowerCase().startsWith('es') ? 'es' : 'en';
}

function storedLang() {
  try {
    const s = localStorage.getItem(LANG_KEY);
    return LANGS.includes(s) ? s : null;
  } catch {
    return null;
  }
}

let lang = storedLang() ?? systemLang();
const listeners = new Set();

export function getLang() {
  return lang;
}

export function setLang(next) {
  if (!LANGS.includes(next) || next === lang) return;
  lang = next;
  try { localStorage.setItem(LANG_KEY, next); } catch { /* ignore */ }
  listeners.forEach((fn) => fn());
}

// Subscription for useSyncExternalStore; App re-renders on language change.
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function t(key, vars) {
  let s = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  }
  return s;
}

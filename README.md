# CrossFit Tracker

PWA para registrar tus marcas de CrossFit y calcular cargas. Todo se guarda
en tu dispositivo (localStorage): sin cuentas, sin servidor, sin datos fuera.

## Características

- **Registro por tipo de ejercicio**: fuerza (peso × reps), gimnásticos
  (reps, modalidad, tiempo), cardio (distancia/calorías + tiempo) y carries
  (peso + distancia). Cada tipo tiene su vista de detalle con la métrica
  principal, gráfica seleccionable e historial con columnas propias.
- **1RM estimado** (fórmula de Epley) con gráfica de progresión, tabla de
  porcentajes (105 % → 30 %) y tabla de RM (1RM–16RM).
- **Calculadora de discos**: qué discos cargar por lado según tu barra
  (20/15/a medida) y tu juego de discos, priorizando bumpers grandes.
- **Discos configurables**: añade, edita y elimina discos con peso, color
  (selector con paleta y rejilla de tonos) y si son "tirables".
- **Copia de seguridad**: exporta/importa todos tus datos como JSON.
  `crossfit-base.json` incluye una librería de ~113 ejercicios para empezar.
- **PWA instalable** con funcionamiento offline.

## Stack

React 19 · Vite 8 · Recharts 3 · vite-plugin-pwa · Vitest + Testing Library

## Desarrollo

```bash
npm install
npm run dev        # servidor de desarrollo
npm test           # suite de tests (112 tests)
npm run build      # build de producción en dist/
npm run preview    # sirve el build (añade --host para probar desde el móvil)
```

## Estructura

```
src/
  lib/         lógica pura (1RM, discos, persistencia, métricas) — sin React
  components/  componentes reutilizables (tablas, gráficas, selectores)
  pages/       pantallas (Registro, Detalle, Calculadoras)
scripts/       generadores de datos de ejemplo
```

Cada módulo tiene su archivo de tests al lado.

## Datos de ejemplo

- `crossfit-base.json` — librería de ejercicios vacía de registros, con el
  juego de discos estándar. Impórtala desde Ajustes → Importar copia.
- `mock-data.json` — datos de demostración con ~3 meses de historial.

## Licencia

[MIT](LICENSE)

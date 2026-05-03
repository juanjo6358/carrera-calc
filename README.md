# CarreraCalc · Calculadora de carrera

Versión refactorizada y rediseñada de la calculadora original. La app sigue siendo estática, ligera e instalable como PWA, pero ahora está pensada primero para móvil: interfaz clara, controles grandes, secciones avanzadas plegadas y lógica separada por módulos.

## Mejoras incluidas

- **UI mobile-first**: pantalla principal más limpia, menos ruido visual, acciones principales accesibles y botones táctiles grandes.
- **Experiencia simplificada**: el historial y las herramientas avanzadas están en desplegables para no saturar la vista móvil.
- **Accesibilidad mejorada**: uso de `fieldset`, `legend`, `label`, `aria-live`, `summary/details`, foco visible y zonas táctiles de al menos 48 px.
- **Código menos redundante**: `app.js` queda como orquestador y el renderizado se reparte en módulos `src/js/ui/`.
- **Conversión km/mi real**: distancia, ritmo, ritmo umbral, proyecciones y métricas se convierten correctamente.
- **Parsers sólidos**: ritmo y tiempo aceptan formatos comunes como `4:40`, `4'40`, `4.5`, `45:16`, `1:25:30`, `90` o `5400s`.
- **PWA corregida**: manifest estático, iconos reales y service worker propio sin Workbox externo.
- **Tests incluidos** para cálculo, parsers, unidades, proyecciones y zonas.

## Estructura

```txt
.
├─ index.html
├─ manifest.webmanifest
├─ sw.js
├─ icons/
├─ src/
│  ├─ js/
│  │  ├─ app.js
│  │  ├─ calculator.js
│  │  ├─ constants.js
│  │  ├─ dom.js
│  │  ├─ formatters.js
│  │  ├─ pwa.js
│  │  ├─ storage.js
│  │  ├─ units.js
│  │  └─ ui/
│  │     ├─ elements.js
│  │     ├─ formUi.js
│  │     ├─ historyUi.js
│  │     ├─ projectionUi.js
│  │     ├─ resultUi.js
│  │     └─ zonesUi.js
│  └─ styles/
│     ├─ tokens.css
│     ├─ base.css
│     ├─ layout.css
│     ├─ components.css
│     └─ responsive.css
├─ tests/
│  └─ calculator.test.js
├─ package.json
├─ .nojekyll
└─ .gitignore
```

## Uso local

```bash
python3 -m http.server 8080
```

Abre:

```txt
http://localhost:8080
```

O con Node:

```bash
npm run start
```

## Tests

```bash
npm test
```

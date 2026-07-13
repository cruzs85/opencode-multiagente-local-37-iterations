# 10 Principales Lecciones Aprendidas

> Resumen ejecutivo de las conclusiones empíricas extraídas de 37 iteraciones, 2 reinicios y ~500 ejecuciones de un sistema multi-agente OpenCode + Ollama.

---

## 1. Skills antes que agentes

**Lección:** Es mejor añadir una skill a un agente existente antes que crear un agente nuevo para desempeñar una nueva tarea.

**Evidencia:** La config-14 creó agentes especializados (`verifier`, `e2e-validator`, `unit-tester`) como roles independientes. La variabilidad de resultados se disparó. La config-32 fusionó responsabilidades en menos agentes con prompts más precisos y las skills se eliminaron. El comportamiento mejoró drásticamente.

**Aplicación práctica:** Antes de crear un agente nuevo, pregúntate: "¿Puede un agente existente asumir esta responsabilidad con una skill adicional?" Si la carga de contexto lo permite, la respuesta casi siempre debe ser sí.

---

## 2. Los agentes locales necesitan más instrucciones que los online

**Lección:** Los agentes con modelos locales requieren más instrucciones explícitas en el prompt de `opencode.json` y más skills que los agentes online.

**Evidencia:** El salto de config-3 (online) a config-4 (local) requirió duplicar skills de 9 a 12 y añadir protocolos enteros (`anti-loop-protocol`, `orchestrator-protocol`, `contract-verification`) que los modelos online manejaban implícitamente sin necesidad de skills explícitas.

**Aplicación práctica:** Al migrar de cloud a local, no copies 1:1 la configuración. Espera duplicar o triplicar la cantidad de instrucciones en prompts y skills para obtener el mismo nivel de cumplimiento.

---

## 3. El contexto es el recurso más escaso

**Lección:** Cuando un agente local se satura de contexto, comienza a ignorar instrucciones de su prompt o skills. Hay que dar el contexto suficiente para que haga bien su trabajo, pero no tanto como para que se sature.

**Evidencia:** Los agentes en config-29 (29 skills, handoff, guardrails) ignoraban sistemáticamente los handoffs. En config-30, al reducir drásticamente la carga de contexto, los agentes volvieron a seguir instrucciones.

**Aplicación práctica:** Monitorea el contexto como si fuera RAM. Si un agente desobedece, la primera sospecha debe ser saturación de contexto, no mal comportamiento del modelo.

---

## 4. Prompt saturado → dividir en dos agentes

**Lección:** Cuando el prompt de un agente se satura (por prompt + skills), conviene dividir en dos agentes para separar contextos y responsabilidades.

**Evidencia:** En config-31, `decomposer` tenía 2 skills especializadas (`project-exploration`, `task-decomposition`). En config-32 se fusionaron en prompts más precisos y las skills se eliminaron. La división en skills separadas no mejoró el resultado.

**Aplicación práctica:** La división debe ser la última opción, no la primera. Intenta consolidar prompts y skills antes de fragmentar agentes.

---

## 5. Más agentes → más variabilidad

**Lección:** A mayor cantidad de agentes, más varían los resultados y mayor probabilidad de errores.

**Evidencia:** La correlación es directa: config-1 (8 agentes, variabilidad baja-media) → config-14 (10 agentes, variabilidad alta) → config-29 (10 agentes + handoff, variabilidad muy alta). En config-30, al bajar a 5 agentes, la variabilidad se redujo notablemente.

**Aplicación práctica:** Cada agente nuevo añade incertidumbre. El número óptimo para este stack fue 6 (config-37). Tu stack hardware y tus necesidades definirán tu número óptimo, pero probablemente sea menor de lo que inicialmente piensas.

---

## 6. Límites de iteraciones en el prompt, no en skills

**Lección:** Es mejor limitar las iteraciones directamente en el prompt del `opencode.json` como mecanismo antiloop que generar una skill antiloop genérica.

**Evidencia:** Las skills `anti-loop-protocol` estuvieron presentes desde config-4, pero los loops seguían ocurriendo. En config-18, al añadir límites directamente en los prompts de los agentes (ej: "code-writer: max 8 toolcalls por tarea"), los loops se redujeron significativamente.

**Aplicación práctica:** Un agente puede fallar al cargar una skill. Un límite en el prompt del sistema es ineludible. Prioriza guardrails en prompts sobre skills genéricas.

---

## 7. Delegación entre subagentes es riesgosa

**Lección:** Permitir que un subagente delegue `task()` a otro subagente puede generar bucles y saturar VRAM rápidamente.

**Evidencia:** En config-29, la skill `qa-decision-engine` permitía que `qa-validator` delegara correcciones a `code-writer`. Esto generó bucles de 3-4 iteraciones que agotaban los 32 GB de VRAM. En config-31, toda delegación se centralizó en `build`, eliminando el problema.

**Aplicación práctica:** Solo el orquestador debe delegar. Los subagentes deben ser "hojas" en el árbol de ejecución, nunca nodos intermedios.

---

## 8. Límite de paralelismo según VRAM

**Lección:** Limitar las tareas paralelas según la VRAM disponible. En 32 GB se observó que el máximo recomendado son 2 tareas paralelas.

**Evidencia:** Durante las fases handoff (config-19 a config-29), las tareas paralelas entre `verifier`, `code-writer` y `qa-validator` saturaban los 32 GB de VRAM y degradaban el comportamiento general. Al limitar a 2 tareas paralelas, el sistema se estabilizó.

**Aplicación práctica:** Cada modelo local de 30B+ parámetros consume ~6-10 GB de VRAM. Planifica tus tareas paralelas como si planificaras threads en un sistema con RAM limitada.

---

## 9. Handoff: utilidad no comprobada

**Lección:** Los archivos handoff para sustituir la delegación por `task()` funcionaron tras ajustar prompts, pero no se comprobó que redujeran significativamente los tokens de build (API tokens).

**Evidencia:** En toda la fase 8 (config-19 a config-29), los handoffs fueron ignorados por los subagentes una y otra vez. `build` seguía delegando con `task()` directo. Cuando por fin funcionaron, no se recolectaron métricas de tokens, pero cualitativamente el handoff añadió complejidad sin beneficio claro.

**Aplicación práctica:** El handoff es una hipótesis interesante, pero requiere un experimento controlado con métricas de tokens antes de ser adoptado en producción.

---

## 10. Context7 no fue de ayuda para Angular 21

**Lección:** Context7 no fue de ayuda para Angular 21, probablemente porque su documentación no está actualizada para esta versión. Falló particularmente en pruebas unitarias y E2E.

**Evidencia:** Context7 se introdujo en config-30, se eliminó en config-32 por falta de impacto, se restauró en config-34 sin mejora apreciable. Los errores en tests unitarios y E2E persistieron independientemente de Context7.

**Aplicación práctica:** Valida que la documentación de tu MCP (Model Context Protocol) esté actualizada para la versión de framework que usas. Documentación desactualizada puede introducir ruido en lugar de valor.

---

## Patrón general: Ciclo de complejidad

Las 10 lecciones anteriores ilustran un ciclo que parece intrínseco a la ingeniería de sistemas multi-agente con recursos limitados:

```
Problema ──► Añadir complejidad ──► Saturación ──► Agentes desobedecen
    ▲                                                       │
    │                                                       ▼
    └── Refinamiento ◄── Estabilización ◄── Reinicio ◄───┘
```

**Este ciclo ocurrió dos veces:**
- **config-29 → config-30:** Reinicio por saturación de contexto (handoffs ignorados)
- **config-31 → config-32:** Reinicio por skills redundantes (Context7 sin impacto)

**La configuración final (config-37) rompe el ciclo** al operar en el punto de mínima complejidad viable: 6 agentes, 5 skills, límites explícitos en prompts, y cero delegación entre subagentes.

---

## Resumen ejecutivo

| # | Lección | Prioridad | Cuándo aplicar |
|---|---------|-----------|----------------|
| 1 | Skills antes que agentes | 🔴 Alta | Siempre que consideres crear un nuevo agente |
| 2 | Locales necesitan más prompts | 🔴 Alta | Al migrar de cloud a local |
| 3 | Contexto es el recurso más escaso | 🔴 Alta | Cuando un agente desobedece |
| 4 | Prompt saturado → dividir agentes | 🟡 Media | Como último recurso, no primera opción |
| 5 | Más agentes → más variabilidad | 🔴 Alta | Al diseñar la arquitectura inicial |
| 6 | Límites en prompt > skills antiloop | 🟡 Media | Al configurar guardrails |
| 7 | Delegación entre subagentes es riesgosa | 🔴 Alta | Al definir flujos de trabajo |
| 8 | Máx 2 tareas paralelas en 32 GB VRAM | 🔴 Alta | Al usar hardware similar |
| 9 | Handoff: utilidad no comprobada | 🟢 Baja | Como experimento controlado futuro |
| 10 | Context7 no ayudó para Angular 21 | 🟡 Media | Al integrar MCPs de documentación |

---

## Referencias

- [Experimentos propuestos para validación cuantitativa →](Experimentos%20Propuestos.md)
- [Narrativa de las 37 iteraciones →](NARRATIVA.md)
- [Hito Iteración 37 →](Hitos%20Arquitectónicos/iteracion-37.md)

---

## Licencia

MIT

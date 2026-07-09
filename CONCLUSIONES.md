# Conclusiones exploratorias

Conclusiones basadas en observación directa durante las 37 iteraciones, sin parámetros objetivos medibles. Estas son observaciones empíricas, no conclusiones científicas.

> **Nota sobre los reinicios:** Durante la evolución se identificaron dos puntos de reinicio donde la complejidad acumulada obligó a simplificar drásticamente la configuración:
> - **config-30:** 10→5 agentes, 29→8 skills. El sistema handoff colapsó por saturación de contexto.
> - **config-32:** 8→3 skills. Skills redundantes y plugins externos (Context7) no mostraban impacto medible.

---

## Las 10 conclusiones

### 1. Skills antes que agentes especializados en subagentes con modelos locales

Es mejor hacer una skill para que un agente existente asuma una nueva responsabilidad que crear un agente especializado, mientras el contexto lo soporte.

*Evidencia:* La config-14 creó agentes especializados (verifier, e2e-validator, unit-tester) y la variabilidad de resultados se disparó. La config-32 fusionó responsabilidades en menos agentes con prompts más precisos y el comportamiento mejoró.

### 2. Los agentes locales necesitan más instrucciones que los online

Los agentes con modelos locales requieren más instrucciones en el prompt de `opencode.json` y más skills que los agentes online.

*Evidencia:* El salto de config-3 (online) a config-4 (local) requirió duplicar skills de 9 a 12 y añadir protocolos enteros (anti-loop, orchestrator-protocol, contract-verification) que los modelos online manejaban sin necesidad de skills explícitas.

### 3. Contexto: el recurso más escaso

Cuando un agente local se satura de contexto comienza a ignorar instrucciones de su prompt o skills. Hay que dar el contexto suficiente para que haga bien su trabajo, pero no tanto como para que se sature.

*Evidencia:* Los agentes en config-29 (29 skills, handoff, guardrails) ignoraban sistemáticamente los handoffs. En config-30, al reducir drásticamente la carga de contexto, los agentes volvieron a seguir instrucciones.

### 4. Saturación de prompt → división de agentes

Cuando el prompt de un agente se satura (por prompt + skills), conviene dividir en dos agentes para separar contextos y responsabilidades.

*Evidencia:* En config-31, decomposer tenía 2 skills especializadas (project-exploration, task-decomposition). En config-32 se fusionaron en prompts más precisos y las skills se eliminaron. La división en skills separadas no mejoró el resultado.

### 5. Más agentes → más variabilidad

A mayor cantidad de agentes, más varían los resultados y mayor probabilidad de errores.

*Evidencia:* La correlación es clara: config-1 (8 agentes, variabilidad baja-media) → config-14 (10 agentes, variabilidad alta) → config-29 (10 agentes + handoff, variabilidad muy alta). En config-30, al bajar a 5 agentes, la variabilidad se redujo notablemente.

### 6. Límites de iteraciones en el prompt, no en skills

Es mejor limitar las iteraciones directamente en el prompt del `opencode.json` como mecanismo antiloop que generar una skill antiloop genérica, pues un agente puede fallar al cargar la skill y generar loops costosos.

*Evidencia:* Las skills anti-loop-protocol estuvieron presentes desde config-4, pero los loops seguían ocurriendo. En config-18, al añadir límites directamente en los prompts de los agentes (ej: "code-writer: max 8 toolcalls por tarea"), los loops se redujeron significativamente.

### 7. Delegación entre subagentes es riesgosa

Permitir que un subagente delegue task a otro subagente es riesgoso: puede generar bucles y saturar VRAM rápidamente. Hacerlo solo si es realmente necesario y con protocolos anti-loop.

*Evidencia:* En config-29, la skill qa-decision-engine permitía que qa-validator delegara correcciones a code-writer. Esto generó bucles de 3-4 iteraciones que agotaban la VRAM de 32 GB. En config-31, toda delegación se centralizó en build, eliminando el problema.

### 8. Límite de paralelismo según VRAM

Limitar las tasks paralelas según la VRAM disponible. En 32 GB se observó que el máximo recomendado son 2.

*Evidencia:* Durante las fases handoff (config-19 a config-29), las tasks paralelas entre verifier, code-writer y qa-validator saturaban los 32 GB de VRAM y degradaban el comportamiento general. Al limitar a 2 tasks paralelas, el sistema se estabilizó.

### 9. Handoff: utilidad limitada

Los archivos handoff para sustituir la delegación por task se omitían frecuentemente al inicio y el orquestador terminaba delegando con task de todas formas, hasta que se ajustaron los prompts. Se recomiendan solo para configuraciones híbridas, pero valdría la pena realizar una nueva investigación con parámetros bien medidos y documentados que determinen si realmente reducen tokens de orquestador (API tokens) de forma significativa.

*Evidencia:* En toda la fase 8 (config-19 a config-29), los handoffs fueron ignorados por los subagentes una y otra vez. build seguía delegando con task() directo. Cuando por fin funcionaron los archivos handoff, no se recolectaron métricas de tokens, pero cualitativamente el handoff añadió complejidad sin beneficio claro.

### 10. Context7 no fue de ayuda para Angular 21

Context7 no fue de ayuda para Angular 21, probablemente porque su documentación no está actualizada para esta versión. Falló particularmente en pruebas unitarias y E2E.

*Evidencia:* Context7 se introdujo en config-30 (esperando documentación actualizada de Angular 21), se eliminó en config-32 por falta de impacto, se restauró en config-34 sin mejora apreciable. Los errores en tests unitarios y E2E persistieron independientemente de Context7.

---

## Patrón general observado

El proyecto revela un **ciclo de complejidad** que parece intrínseco a la ingeniería de sistemas multi-agente:

1. **Problema → Añadir complejidad** (más agentes, más skills, más protocolos)
2. **Saturación → Agentes desobedecen** (ignoran prompts, skills, handoffs)
3. **Reinicio → Simplificar drásticamente** (menos agentes, menos skills)
4. **Estabilización → Refinamiento** (ajustes finos sobre base simple)
5. **Nuevo problema → Vuelta al paso 1**

Este ciclo ocurrió dos veces en el proyecto (config-29→30 y config-31→32) y probablemente sea un fenómeno general en sistemas multi-agente con recursos de contexto limitados.

---

## Probables trabajos futuros

Este experimento fue exploratorio, pero se tiene el propósito de generar nuevas configuraciones que sean medidas de forma más sistemática con parámetros cuantificables y pruebas sistemáticas como las listadas a continuación.

## Nuevo ciclo de configuración

La siguiente fase propone un experimento controlado con variables bien definidas para medir el rendimiento preciso de cada optimización y reducir la aleatoriedad:

1. **Configuración de control:** generar un proyecto con un solo agente build online.
2. **Procedimiento documentado:** definir un proceso que permita migrar con éxito de una configuración monoagente online a una híbrida multiagente (build online, subagentes locales).
3. **Sustitución del orquestador:** en la configuración híbrida, reemplazar el modelo build online por uno local sin que la calidad del proyecto generado varíe significativamente (la mayor carga debe recaer en los subagentes locales).
4. **Experimentos A/B:** usando la configuración híbrida como control, probar herramientas puntuales (Context7 MCP vs. Angular CLI MCP Server, modelos con fine-tuning, etc.).

## Handoff vs task()

Se pretende tomar como configuración de control la versión híbrida producida en el experimento anterior y comparar sus resultados con la misma configuración pero usando handoffs para delegar las tareas a los subagentes e intentar reducir los tokens de API de build.

1. **Configuración de control:** se toma como configuración de control la versión híbrida producida en el experimento anterior.
2. **Procedimiento documentado estándar:** se ejecuta reiteradamente un prompt de control y se contabilizan los tokens usados por build, el tiempo total de creación del proyecto y la calidad del código generado. Los resultados se promedian entre el número de iteraciones.
3. **Procedimiento documentado con handoffs:** se añade la variante de delegación de tareas a subagentes por archivos handoff y se ejecuta reiteradamente un prompt de control. Se contabilizan los tokens usados por build, el tiempo total de creación del proyecto y la calidad del código generado. Los resultados se promedian entre el número de iteraciones.
4. **Mejora de configuración con handoffs:** se analizan los resultados de la configuración con handoffs, se proponen mejoras y se hacen modificaciones a la configuración.
5. **Experimentos A/B:** se analizan los resultados de la nueva configuración con handoffs y se comparan con la inmediata anterior (A/B). Si A > B, se toma de nuevo A como configuración base; si B > A, B se convierte en la nueva configuración base. Se repite el proceso desde el paso 4 hasta que la configuración base siga siendo la misma después de 3 intentos.
6. **Resultado final:** los resultados de la última configuración base se comparan con los de la primera y se extraen conclusiones para saber si los handoffs lograron reducir los tokens de build (API tokens) de manera significativa sin reducir o comprometer la calidad del proyecto generado.
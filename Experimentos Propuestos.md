# Experimentos Propuestos

> Trabajos futuros basados en las observaciones empíricas de las 37 iteraciones. Este experimento fue exploratorio; la siguiente fase propone mediciones sistemáticas con parámetros cuantificables.

---

## Contexto

Las 37 iteraciones se ejecutaron sin parámetros objetivos medibles. Las conclusiones son observaciones empíricas, no científicas. Los experimentos propuestos a continuación buscan convertir esas observaciones en datos medibles.

---

## Experimento 1: Nuevo ciclo de configuración

**Objetivo:** Definir un proceso reproducible para migrar de una configuración monoagente online a una híbrida multiagente, y luego reemplazar el orquestador online por uno local sin degradación de calidad.

### Fases

1. **Configuración de control:** Generar un proyecto con un solo agente `build` online (kimi-k2.6). Medir tokens consumidos, tiempo total y calidad del código generado.
2. **Procedimiento documentado:** Definir un proceso paso a paso que permita migrar con éxito de monoagente online a híbrida multiagente (build online, subagentes locales). Documentar cada ajuste necesario.
3. **Sustitución del orquestador:** En la configuración híbrida, reemplazar el modelo build online por uno local sin que la calidad del proyecto generado varíe significativamente. La mayor carga debe recaer en los subagentes locales.
4. **Experimentos A/B:** Usar la configuración híbrida como control. Probar herramientas puntuales:
   - Context7 MCP vs. Angular CLI MCP Server
   - Modelos con fine-tuning
   - Diferentes tamaños de contexto (32K vs. 64K vs. 128K)

### Métricas a recolectar

| Métrica | Cómo medir |
|---------|-----------|
| Tokens de API (build) | Contabilizar tokens de entrada/salida del orquestador |
| Tiempo total de generación | Cronometrar desde prompt hasta build exitoso |
| Calidad del código | Pass/fail de build, tests unitarios, tests E2E |
| Variabilidad | Ejecutar mismo prompt N=5 veces, medir desviación estándar de resultados |
| Costo total | Tokens × precio por token (cloud) + kWh estimado (local) |

---

## Experimento 2: Handoff vs. task()

**Objetivo:** Determinar si los handoffs JSON reducen significativamente los tokens de API del orquestador build sin comprometer la calidad del proyecto.

### Hipótesis

> Los handoffs reducen los tokens de orquestador porque build no necesita incluir el contexto completo de cada tarea en el prompt de `task()`, sino solo pasar la ruta al archivo handoff.

### Diseño experimental

1. **Configuración de control:** Tomar la configuración híbrida final (config-37) como base.
2. **Procedimiento estándar (sin handoff):** Ejecutar reiteradamente un prompt de control. Contabilizar:
   - Tokens usados por build
   - Tiempo total de creación
   - Calidad del código (build + tests)
   - Promediar entre N iteraciones
3. **Procedimiento con handoff:** Añadir la variante de delegación por archivos handoff JSON en `/tmp/handoff/`. Ejecutar el mismo prompt de control N veces. Contabilizar las mismas métricas.
4. **Mejora de configuración con handoffs:** Analizar resultados, proponer mejoras, iterar.
5. **Experimentos A/B:** Comparar configuración A (sin handoff) vs. B (con handoffs). Si A > B, A es la nueva base. Si B > A, B es la nueva base. Repetir desde el paso 4 hasta que la base no cambie después de 3 intentos consecutivos.
6. **Resultado final:** Comparar última configuración base con la primera. Determinar si los handoffs lograron reducir tokens de build de manera significativa sin reducir calidad.

### Criterios de significancia

- Reducción de tokens de build: **> 20%** para considerarse significativa
- Calidad del código: **no debe caer** (mismo pass rate de build + tests)
- Tiempo total: **no debe aumentar > 10%** (overhead de I/O de archivos)

---

## Experimento 3: Límite óptimo de agentes

**Objetivo:** Encontrar el número óptimo de agentes para un stack hardware dado (32 GB VRAM, 64 GB RAM).

### Diseño

- Configuración base: 6 agentes (config-37)
- Variantes: 4, 5, 6, 7, 8 agentes (manteniendo las mismas responsabilidades totales, redistribuidas)
- Misma tarea, mismo prompt, N=5 ejecuciones por configuración
- Medir: variabilidad de resultados, tiempo total, VRAM consumida, tasa de éxito (build + tests)

### Resultado esperado

Validar o refutar la hipótesis de que **más agentes = más variabilidad** con datos cuantificables.

---

## Experimento 4: Contexto óptimo (num_ctx)

**Objetivo:** Determinar el tamaño de contexto óptimo para modelos locales de código (qwen3-coder:30b).

### Diseño

- Variantes: 16K, 32K, 48K, 64K, 80K, 96K contexto
- Misma tarea, mismo prompt
- Medir: tasa de éxito, calidad de código, tiempo de respuesta, VRAM usada

### Pregunta a responder

¿Existe un punto de rendimiento decreciente donde más contexto no mejora resultados pero sí consume más VRAM?

---

## Experimento 5: Validación de Context7 con Angular 22+

**Objetivo:** Si Angular 22/23 incluye documentación más actualizada en Context7, ¿mejora el valor del MCP?

### Diseño

- Repetir config-34 (memoria persistente + Context7) con Angular 22 o 23
- Medir: errores en tests unitarios y E2E con y sin Context7 activo
- Comparar con los resultados de config-30 a config-34 donde Context7 no aportó valor

---

## Nota metodológica

> **Advertencia:** Las 37 iteraciones originales no contaron con instrumentación de métricas. Los experimentos propuestos requieren:
> - Logging automático de tokens por agente
> - Cronometraje preciso de cada fase
> - Scripts de evaluación objetiva de calidad (lint, test coverage, build time)
> - N ≥ 5 repeticiones por condición para poder calcular intervalos de confianza

Sin esta instrumentación, los resultados seguirán siendo cualitativos y no generalizables.

---

## Referencias

- [10 Principales Lecciones Aprendidas →](10%20Principales%20Lecciones%20Aprendidas.md)
- [Narrativa de las 37 iteraciones →](NARRATIVA.md)

---

## Licencia

MIT

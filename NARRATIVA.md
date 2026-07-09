# Narrativa — 37 configuraciones de OpenCode

Narrativa detallada del proceso exploratorio. Cada fase describe la motivación, los cambios y los resultados observados.

> **Nota:** Este archivo contiene la narrativa extensa. Para una visión general rápida, ver `README.md`.

---

## El prompt de control (Lenguaje Coloquial Intencionado)

> *Quiero hacer un juego de dinosaurio para el navegador, como el que aparece en Chrome cuando no hay internet. Al inicio deberá aparecer una pantalla de bienvenida con las instrucciones. El dinosaurio corre y tienes que saltarlo para esquivar los obstáculos que van apareciendo. Puedes saltar dos veces seguidas. La velocidad va aumentando con el tiempo para que se ponga más difícil. Que guarde tu récord aunque cierres el navegador. Hazlo todo en Angular con las prácticas modernas del framework. Que funcione, que compile y que tenga pruebas automáticas e2e de al menos 15 en donde se valide la pantalla de bienvenida, pantalla jugable validando salto, doble salto y generación de obstáculos y pantalla de game over.*

Mismo prompt en las 37 iteraciones.

---

## Fase 1 — Agentes online (config-1 a config-3)

Primeras configuraciones con proveedores cloud: OpenRouter, GitHub Copilot y Z.AI. Modelos especializados por rol (DeepSeek V3.2, GLM-4.7). API keys expuestas, costos elevados, latencia de red. En el caso de OpenRouter se encontraron algunos modelos de la familia qwen que no soportaban o no estaban configurados para el uso de Tools los cuales fueron descartados y no estan incluidos en las configuraciones.

- **config-1:** RouteTracker v1 con 9 agentes online y 3 proveedores cloud.
- **config-2:** Refinamiento de prompts.
- **config-3:** Especialización de agentes online.

## Fase 2 — Primer intento local (config-4)

Salto a subagentes 100% local con Ollama. Dos modelos (qwen3-coder:30b y qwen3:32b). Primer AGENTS.md. Nacen las skills anti-loop, orchestrator-protocol y contract-verification para solucionar problemas de contradicción, bucles infinitos y permisos.

## Fase 3 — Híbrido y retorno a local (config-5 a config-6)

- **config-5:** Intento híbrido (OpenRouter + Ollama), se reintroducen costos cloud.
- **config-6:** Vuelta a local con devstral-small-2 como modelo principal.

Devstral frecuentemente desobedecía o alucinaba. Existe la probabilidad de que los problemas fueran causados por la memoria de contexto, situación que ahora sé, pudo ser ocasionada por la configuración de `num_ctx` directamente en el archivo `opencode.json` en lugar de configurarse con un modelfile, y no precisamente por el modelo en sí.

## Fase 4 — Refinamiento de prompts (config-7 a config-12)

Mejora sistemática de prompts, migración a qwen3-coder:30b, reglas anti-contradicción, reducción a 2 modelos, verificación post-implementación, orquestador local. El cambio de devstral a qwen3-coder:30b mejoró el desempeño notablemente, aunque de manera intermitente: algunas ejecuciones funcionaban de manera aceptable, mientras que otras ignoraban reglas del prompt o skills.

- **config-10:** Reducción a solo dos modelos locales (qwen3-coder:30b + qwen3:32b).
- **config-11:** 17 skills, verificación post-implementación.
- **config-12:** Orquestador local consolidado.

## Fase 5 — Integraciones (config-13)

Conexión MySQL + notificaciones Slack.

Se pretendía darle acceso a una base de datos no relacionada con el proyecto, solo para verificar que pudiera revisar estructuras de tablas y hacer consultas. Asimismo se implementó MCP y otras herramientas que pudieran trabajar con Slack para avisos a un chat en caso de que se requiera dejar a los agentes trabajando sin supervisión.

9 agentes, 22 skills.

## Fase 6 — Explosión multi-agente (config-14)

De 5 a 10 agentes. Roles independientes para verifier, e2e-validator, unit-tester. 24 skills especializadas. El sistema alcanza su máxima complejidad en número de agentes.

## Fase 7 — Optimización (config-15 a config-18)

Prompts optimizados, nuevos agentes (ui-designer, analyst), cambio de orquestador a opencode-go/kimi-k2.6, skills reforzadas. La complejidad sigue en aumento: 10 agentes, 26 skills.

## Fase 8 — Handoff JSON (config-19 a config-29)

**Cambio radical:** los agentes se comunican mediante archivos JSON en `/tmp/handoff/`. Modelos dedicados por rol (model-code-writer, model-verifier, model-qa-validator, model-ui-designer). 11 configuraciones de iteración/backup con variantes del sistema handoff.

- **config-19:** Primer handoff, 4 modelos dedicados, ui-designer con qwen3:32b.
- **config-20:** Límites estrictos en handoff para evitar delegación runaway.
- **config-21:** Backup más completo con scaffolding-verification y sección model-* (29 skills).
- **config-22:** UI designer con qwen3:32b.
- **config-23:** Renombrado de agentes para claridad.
- **config-24 a config-27:** Cuatro iteraciones del sistema handoff con proyecto Angular.
- **config-28:** Diagnóstico canvas + JIT mode.
- **config-29:** Guardrails de seguridad. **Pico de complejidad:** 10 agentes, 29 skills.

## Fase 9 — Simplificación con reinicios (config-30 a config-37)

Se abandona el handoff JSON. Se reduce de 11 a 5 agentes. Modelo único "model-agent-base" para subagentes. Esta fase contiene dos **reinicios** donde la complejidad acumulada obligó a simplificar drásticamente.

- **config-30 (agentes-simplificados-reinicio-29):** ⚠️ **REINICIO desde config-29.** Simplificación radical: de 10 agentes/29 skills → 5 agentes/8 skills. Se abandona todo el sistema handoff JSON. Los agentes locales en config-29 ignoraban sistemáticamente los handoffs y guardrails por saturación de contexto. En ocasiones el build ignoraba el flujo delegado con handoffs. No se pudo comprobar que los handoffs disminuyeran los tokens de build consumidos por API (sería un tema interesante como investigación independiente). Se añade Context7 MCP (Angular 21) y opencode-mem como experimento.

- **config-31:** Puntos de control de build. Refinamiento sobre la base simplificada.

- **config-32 (skills-esenciales-reinicio-31):** ⚠️ **REINICIO desde config-31.** Skills reducidas de 8 a 3 solo las esenciales. Context7 se elimina por no mostrar mejora apreciable. Se consolida el patrón "menos es más" que se mantendría hasta el final.

- **config-33:** Nuevo agente debugging con modelo propio (model-debugging).
- **config-34:** Memoria persistente con opencode-mem. Se restaura Context7.
- **config-35:** Permisos QA ampliados.
- **config-36:** Slack + orquestación.
- **config-37:** **Configuración final y más refinada.** 6 agentes, 5 skills.

---

## Configuración final (config-37)

| Agente | Modelo | Rol |
|--------|--------|-----|
| build | opencode-go/kimi-k2.6 | Orquestador |
| decomposer | model-agent-base | Planificador |
| code-writer | model-agent-base | Escritura de código |
| qa-validator | model-agent-base | Build + tests |
| explorer | model-agent-base | Búsquedas y diagnóstico |
| debugging | model-debugging | Análisis de bugs complejos |

Skills principales: angular-patterns, node-setup, ui-design-system. Memoria persistente con opencode-mem. Proyecto Angular 21 con Vitest, zoneless, standalone components.

---

## Modelfiles

Se observó que los parámetros definidos en `opencode.json` no siempre eran respetados por los modelos (principalmente `num_ctx`). El archivo de configuración podría *limitar* el valor máximo pero no *aumentarlo*. Por esta razón se optó por definir los modelos mediante modelfiles de Ollama y en `opencode.json` solo asignar el modelo por nombre, sin parámetros adicionales.

### model-agent-base (subagentes de código)

```ollama
FROM qwen3-coder:30b

PARAMETER num_ctx 65536
PARAMETER temperature 0
PARAMETER top_k 20
PARAMETER top_p 0.8
PARAMETER repeat_penalty 1.05
PARAMETER stop <|im_start|>
PARAMETER stop <|endoftext|>

RENDERER qwen3-coder
PARSER qwen3-coder
```

### model-debugging (razonamiento profundo)

```ollama
FROM qwen3:32b

PARAMETER temperature 0
PARAMETER top_k 20
PARAMETER top_p 0.8
PARAMETER num_ctx 32768
PARAMETER repeat_penalty 1.05
PARAMETER stop <|im_start|>
PARAMETER stop <|im_end|>
```

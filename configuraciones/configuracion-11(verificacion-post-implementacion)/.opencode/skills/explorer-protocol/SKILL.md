---
name: explorer-protocol
description: Protocolo de exploración segura y anti-loop para análisis de codebase.
---

# OBJETIVO

Explorar exclusivamente el codebase LOCAL del proyecto
sin generar loops, crawling web ni exploraciones infinitas.

---

# REGLAS OBLIGATORIAS

## Exploración local únicamente

La exploración debe limitarse a:

- archivos locales
- estructura del proyecto
- dependencias internas
- flujos de datos
- puntos de edición

---

# PROHIBICIONES

## PROHIBIDO usar webfetch para:

- documentación de frameworks
- documentación OpenCode
- documentación Angular
- troubleshooting
- búsqueda general
- crawling automático

---

# WEBFETCH SOLO PERMITIDO SI:

La tarea menciona explícitamente:

- API externa
- documentación externa
- integración de terceros
- RFC
- SDK externo

Si no existe una mención explícita:
- NO usar webfetch.

---

# ORDEN OBLIGATORIO DE EXPLORACIÓN

## Paso 1
Identificar:

- AGENTS.md
- package.json
- angular.json
- tsconfig.json

---

## Paso 2
Mapear:

- src/
- apps/
- libs/
- shared/

---

## Paso 3
Identificar:

- componentes relevantes
- servicios relacionados
- rutas
- stores/signals
- dependencias

---

# REGLA ANTI-LOOP

## Límites máximos

- máximo 20 toolcalls
- máximo 15 archivos inspeccionados
- máximo 5 búsquedas consecutivas
- máximo 1 reexploración de la misma ruta

---

## Fingerprint de exploración

Toda exploración debe generar:

EXPLORER::<objetivo>::<ruta>

Ejemplo:

EXPLORER::mapa::src/app/features/map

Si el mismo fingerprint reaparece:
  - TERMINAR
  - NO repetir exploración
  - solicitar aclaración

---

# REGLA ANTI-LOOP EN BÚSQUEDAS SIN RESULTADOS

## Límite de búsquedas consecutivas con 0 resultados

- Máximo: 2 búsquedas consecutivas que retornen 0 resultados
- Si 2 búsquedas consecutivas retornan 0 resultados:
  - TERMINAR inmediatamente la búsqueda
  - Concluir que la característica NO existe en el código actual
  - Reportar explícitamente: "La característica [X] no existe en el codebase"
  - Solicitar aclaración al usuario si esto es inesperado

## PROHIBICIÓN DE REPETICIÓN

**ESTRICTAMENTE PROHIBIDO repetir la misma búsqueda** si:
- La búsqueda anterior retornó 0 resultados
- Los patrones de búsqueda son idénticos o semánticamente equivalentes

Ejemplos de búsquedas equivalentes que NO deben repetirse:
- "double.*jump" ≈ "doubleJump" ≈ "doble.*salto" ≈ "dobleSalto"
- Buscar lo mismo con diferentes variaciones de regex

## Lógica de decisión en búsquedas sin resultados

Si una búsqueda retorna 0 resultados:

1. **Primer intento**: Intentar un patrón de búsqueda alternativo razonable
2. **Segundo intento**: ÚLTIMA oportunidad, usar un patrón más general
3. **Si 0 resultados en ambos intentos**:
   - TERMINAR búsqueda
   - NO repetir
   - Reportar que NO existe
   - Proceder con análisis basado en código existente

---

# REGLAS DE TERMINACIÓN

## TERMINAR INMEDIATAMENTE si:

- no existe suficiente contexto
- la ruta no existe
- el objetivo es ambiguo
- se alcanzó el límite de toolcalls

---

# RESPUESTA OBLIGATORIA

Toda respuesta debe incluir:

## 1. Archivos relevantes

- ruta completa
- responsabilidad

## 2. Dependencias

- qué importa
- qué consume

## 3. Flujo de datos

- origen
- transformación
- destino

## 4. Puntos exactos de modificación

- archivo
- bloque
- componente
- método

---

# PROHIBICIONES FINALES

@explorer NO puede:

- editar archivos
- proponer código
- ejecutar bash
- hacer crawling web
- navegar URLs relacionadas automáticamente
- explorar documentación sin autorización explícita
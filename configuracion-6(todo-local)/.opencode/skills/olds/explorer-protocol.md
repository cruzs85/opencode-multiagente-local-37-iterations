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
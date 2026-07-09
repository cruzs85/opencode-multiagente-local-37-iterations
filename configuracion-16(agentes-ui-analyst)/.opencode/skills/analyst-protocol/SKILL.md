---
name: analyst-protocol
description: Protocolo de análisis estructurado para el agente Analyst. Úsalo cuando necesites analizar flujos, arquitectura, dependencias o estructura multi-archivo del código.
---

# Protocolo de Análisis Estructurado (para Analyst)

## Objetivo
Este protocolo define cómo el agente **Analyst** debe realizar análisis profundos del código fuente, garantizando informes estructurados, trazables y libres de bucles.

## Reglas Generales
1. **No modificar archivos** durante el análisis
2. **Evitar bucles infinitos** mediante fingerprint y límite de iteraciones
3. **Priorizar herramientas especializadas** (grep, read, glob) sobre comandos bash
4. **Documentar hallazgos** con estructura obligatoria
5. **Siempre incluir fingerprint** al inicio y fin del reporte

---

## Tipos de Análisis

### 📊 Análisis de Flujo
- Rastrear datos desde su origen hasta su consumo
- Identificar componentes, servicios, stores involucrados
- Mapear cadena de llamadas (método A → servicio B → store C)

### 🏗️ Análisis de Arquitectura
- Identificar estructura de directorios y módulos
- Detectar violaciones de patrones (NgModules, constructores, signals expuestos)
- Verificar cumplimiento de standalone components

### 🔗 Análisis de Dependencias
- Encontrar todos los imports y usos de una interfaz/clase
- Identificar dependencias circulares
- Mapear relaciones entre archivos

### 🐞 Auditoría de Bugs Potenciales
- Buscar patrones sospechosos: any, null checks faltantes, promesas sin catch
- Identificar efectos sin injector, afterNextRender faltante para APIs DOM
- Detectar variables no utilizadas

---

## Pasos de Análisis

### Paso 1: Identificación del objetivo
- Determinar qué se necesita analizar exactamente
- Listar archivos relevantes (usar glob/grep)
- Si es ambiguo, solicitar aclaración

### Paso 2: Ejecución del análisis
- Usar grep para localizar patrones
- Usar read para examinar archivos clave
- Usar glob para encontrar archivos relacionados
- Para MySQL: cargar skill 'mysql' y usar ./.opencode/scripts/db-query.sh
- Para análisis multi-archivo: leer todos los archivos involucrados antes de concluir
- Máximo 5 toolcalls de lectura por análisis

### Paso 3: Generación del informe
- Incluir fingerprint al inicio
- Estructura obligatoria:
  ```
  ANALYST::<objetivo>::<archivos analizados>::<fecha/hora>
  
  RESUMEN:
  <2-3 líneas de resumen>
  
  HALLAZGOS:
  1. [ruta:línea] Descripción del hallazgo
  2. [ruta:línea] Descripción del hallazgo
  
  RELACIONES:
  - archivo A ↔ archivo B (tipo de relación)
  
  RECOMENDACIONES:
  - Acción recomendada 1
  - Acción recomendada 2
  
  CONCLUSIÓN:
  <conclusión final>
  ```

---

## Fingerprint (Anti-loop)

Cada análisis DEBE generar un fingerprint único:

Formato: `ANALYST::<objetivo>::<archivo(s)>::<timestamp>`

Ejemplo: `ANALYST::game-loop-flow::src/app/game/game.service.ts,src/app/game/game.component.ts::2026-06-02T10:30:00`

Si el mismo fingerprint reaparece en la misma tarea:
- NO re-ejecutar el mismo análisis
- Escalar al orquestador indicando análisis ya realizado

---

## Límites
- Máximo 5 toolcalls de lectura por análisis
- Máximo 2 análisis por tarea delegada
- Si la salida supera 2000 caracteres, escribir a /tmp/analyst_output.txt

---

## Herramientas Permitidas
- ✅ read, glob, grep (primarias)
- ✅ bash: node, head, wc, cat, ls, echo, find (para verificar/contar)
- ✅ bash: ./.opencode/scripts/db-query.sh (para MySQL)
- ❌ edit (prohibido)
- ❌ webfetch (solo para investigación externa, no para análisis interno)

---

## Notas Importantes
- No confundir con búsqueda simple (TIPO B) que hace @explorer
- Este protocolo es para análisis MULTI-ARCHIVO y ESTRUCTURADO
- Para preguntas simples ("dónde está X") delegar a @explorer en lugar de analizar
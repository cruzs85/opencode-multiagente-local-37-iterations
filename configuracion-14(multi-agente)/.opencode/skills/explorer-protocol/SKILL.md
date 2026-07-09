# Protocolo de Exploración Segura

## Objetivo
Este protocolo define cómo los agentes deben explorar el código fuente de manera segura, evitando bucles infinitos y garantizando que las búsquedas sean eficientes y precisas.

## Reglas Generales
1. **No modificar archivos** durante la exploración
2. **Evitar bucles infinitos** mediante el uso del protocolo anti-loop
3. **Priorizar herramientas especializadas** (grep, read, glob) sobre comandos bash para tareas complejas
4. **Documentar hallazgos** de forma clara y concisa

## Pasos de Exploración
1. **Identificación del objetivo**
   - Determinar si se trata de una búsqueda rápida (TIPO B) o análisis estructurado (TIPO C)
   - Si es ambiguo, solicitar aclaración

2. **Ejecución del análisis**
   - Para TIPO B: Usar grep + read (máximo 2 toolcalls)
   - Para TIPO C: Cargar 'explorer-protocol' y 'anti-loop-protocol', seguir pasos 1-2-3 completos

3. **Generación del informe**
   - Incluir fingerprint del análisis
   - Formato obligatorio: ruta exacta + líneas + fragmento (TIPO B)
   - Estructura completa (TIPO C)

## Ejemplos de Uso
- Buscar implementaciones de una interfaz específica
- Encontrar todos los usos de una función
- Analizar flujo de datos entre componentes
- Auditoría de dependencias

## Notas Importantes
- No se permite el uso de herramientas de edición (edit) durante la exploración
- Si la salida supera los 2000 caracteres, escribirla en /tmp/explorer_output.txt
- Cargar siempre los skills necesarios antes de comenzar
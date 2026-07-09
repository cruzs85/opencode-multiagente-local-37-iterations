---
name: post-write-verification
description: Checklist obligatorio que @verifier ejecuta DESPUÉS de que code-writer complete un lote de escritura. Verifica imports, variables muertas, métodos públicos sin callsite, coherencia aritmética y contratos entre archivos.
---

# Post-Write Verification Checklist — para @verifier

## Objetivo
Verificar que el archivo recién escrito está limpio antes de pasarlo a QA. @verifier ejecuta este checklist después de que code-writer complete el lote de escritura.

## Regla obligatoria
No dar un lote por verificado hasta que los 5 puntos del checklist estén verificados.

---

## Checklist de verificación (OBLIGATORIO)

@verifier debe leer cada archivo modificado y verificar:

### 1. 📦 IMPORTS
- ¿Cada import se usa al menos una vez en el cuerpo del archivo?
- Si hay imports sin usar → reportar a @code-writer para que los elimine.

### 2. 🧹 VARIABLES MUERTAS
- ¿Toda variable, constante o propiedad declarada se referencia en el código?
- Si hay elementos declarados pero nunca usados → reportar a @code-writer.

### 3. 📞 MÉTODOS PÚBLICOS
- ¿Cada método público tiene al menos un callsite potencial?
- Los métodos privados pueden no tener callsite externo (se llaman internamente).

### 4. 🔢 COHERENCIA ARITMÉTICA
- ¿Las operaciones matemáticas combinan variables del mismo dominio?
  - `timestamp - lastObstacleTime` → ambos deben ser marcas de tiempo (ms)
  - `coordenadaX - velocidad` → ambos deben ser valores espaciales
  - Si una variable es un timestamp y la otra es una posición X → ❌ BUG
- NO mezclar timestamps con coordenadas, ni píxeles con segundos, ni metros con kilómetros.
- ¿El resultado de la operación tiene sentido en el dominio?
  - Si restas dos timestamps, obtienes un delta en ms ✅
  - Si restas un timestamp a una coordenada X, obtienes basura ❌
- Si usas requestAnimationFrame, considera si necesitas deltaTime.

### 5. 🔗 CONTRATOS
- Si el archivo consume o importa otro archivo, verifica que los nombres de métodos, tipos y propiedades coinciden EXACTAMENTE con el archivo fuente.
- Usa grep para confirmar: `grep "nombreMetodo" ruta-del-archivo-fuente.ts`

### 6. 🗑️ ARCHIVOS LEGACY
- ¿Existen archivos legacy del scaffolding que puedan causar conflictos?
- Verificar: `test -f src/app/app.ts` debe ser FALSO (no debe existir)
- Verificar: `test -f src/app/app.html` debe ser FALSO
- Verificar: `test -f src/app/app.scss` debe ser FALSO
- Si alguno existe → reportar a build para que delegue limpieza a code-writer

### 7. 🎨 styleUrl INTEGRITY
- ¿Todos los componentes usan `styleUrl` (singular) en vez de `styleUrls` (plural)?
- Verificar: `grep -rn "styleUrls" src/app/` debe devolver 0 matches
- Si hay matches → reportar a build para corrección

---

## Acción correctiva

Si cualquiera de los puntos falla:
1. @verifier reporta el hallazgo al orquestador con archivo exacto, línea, esperado vs actual
2. El orquestador delega la corrección a @code-writer
3. Una vez corregido, @verifier RE-VERIFICA el archivo
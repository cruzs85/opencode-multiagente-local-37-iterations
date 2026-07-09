---
name: contract-verification
description: Verifica que los nombres de métodos, propiedades e interfaces sean consistentes entre los archivos que se acaban de modificar. La carga @verifier, no code-writer.
---

## Propósito
Prevenir errores de integración entre archivos: nombre de método incorrecto, firma de función diferente, propiedad que no existe, variables de diferentes dominios mezcladas en operaciones.

## Cuándo la usa @verifier
Después de que code-writer complete un lote de escritura, @verifier carga esta skill para verificar que los archivos modificados sean consistentes entre sí.

## Protocolo de verificación

### Checklist de verificación de contratos

- [ ] Leer el archivo fuente (servicio/interfaz/componente del que depende el archivo modificado)
- [ ] Anotar NOMBRES EXACTOS de TODOS los métodos públicos
- [ ] Anotar NOMBRES EXACTOS de TODAS las propiedades/signals públicas
- [ ] Anotar TIPOS EXACTOS de cada parámetro y retorno
- [ ] Verificar que los imports coinciden con la ruta real del archivo

### Errores que previene

- ❌ Llamar a un método con nombre incorrecto
- ❌ Usar un tipo de parámetro incompatible
- ❌ Mezclar variables de diferentes dominios (temporal vs espacial)
- ❌ Importar tipos que no se usan
- ❌ Importar desde una ruta incorrecta
- ❌ Declarar variables que nunca se usan en el cuerpo del método

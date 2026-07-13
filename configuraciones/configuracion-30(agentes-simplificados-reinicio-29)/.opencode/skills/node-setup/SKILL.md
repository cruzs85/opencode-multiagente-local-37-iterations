---
name: node-setup
description: Patron nvm/source/bash para comandos ng, npm y npx en una sola linea
---

# Node.js Setup con NVM

Cada invocacion de bash es un shell SEPARADO. NO se puede hacer source en un bash call y npx en otro. TODO debe ir en UNA sola linea con `&&`.

## Patron obligatorio

```bash
source ~/.nvm/nvm.sh && (nvm use 22 || (nvm install 22 && nvm use 22)) && <comando>
```

`nvm use 22 || (nvm install 22 && nvm use 22)` es condicional: solo instala si la version no existe. No reinstala innecesariamente.

## Ejemplos

```bash
source ~/.nvm/nvm.sh && nvm use 22 && npx @angular/cli@21.2.17 new dino-runner --style=scss --routing
source ~/.nvm/nvm.sh && nvm use 22 && npm run build
source ~/.nvm/nvm.sh && nvm use 22 && npx vitest run
```

## Optimizacion: encadenar comandos

Varios comandos en una misma invocacion ahorra toolcalls:

```bash
source ~/.nvm/nvm.sh && nvm use 22 && npx @angular/cli@21.2.17 new dino-runner --style=scss --routing --directory=proyecto && cd proyecto && npm install && npm run build
```

## Comandos posteriores (build, test)

Una vez que el proyecto existe, usar npm run en vez de npx ng. Esto evita el problema de que npx use su propia cache de Node version:

```bash
source ~/.nvm/nvm.sh && nvm use 22 && cd <proyecto> && npm run build
source ~/.nvm/nvm.sh && nvm use 22 && cd <proyecto> && npx vitest run
```

## Reglas

- Angular CLI 21.x requiere Node >= 22.22.3.
- build resuelve la version exacta con Context7 y la pasa en el task(). Usar ESA version.
- Si el comando falla, reportar a build (build preguntara al usuario que hacer).
- NO asumir que un bash call anterior dejo nvm cargado

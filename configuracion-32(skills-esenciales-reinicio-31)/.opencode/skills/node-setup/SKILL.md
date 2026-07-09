---
name: node-setup
description: Patron nvm/source/bash para comandos ng, npm y npx en una sola linea
---

# Node.js Setup con NVM

Cada bash call es un shell SEPARADO. TODO debe ir en UNA linea con `&&`.

## Patron obligatorio
```bash
source ~/.nvm/nvm.sh && (nvm use 22 || (nvm install 22 && nvm use 22)) && <comando>
```

`nvm use 22 || (nvm install 22 && nvm use 22)` es condicional: solo instala si no existe.

## Ejemplos
```bash
source ~/.nvm/nvm.sh && nvm use 22 && npx @angular/cli@^21.0.0 new dino-runner --style=scss --routing --skip-git=true --package-manager=npm
source ~/.nvm/nvm.sh && nvm use 22 && cd proyecto && npm run build
source ~/.nvm/nvm.sh && nvm use 22 && cd proyecto && npm run test -- --watch=false
```

## Reglas
- Angular CLI 21.x requiere Node >= 22.22.3
- NO asumir que un bash call anterior dejo nvm cargado
- Si el comando falla, reportar el error exacto

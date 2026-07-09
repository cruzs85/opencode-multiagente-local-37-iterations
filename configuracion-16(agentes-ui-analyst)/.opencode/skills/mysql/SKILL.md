---
name: mysql
description: Ejecuta consultas MySQL del proyecto
---

La base de datos corre en Docker.

Para ejecutar queries usa:

```bash
./.opencode/scripts/db-query.sh "SQL"

Nunca uses DROP DATABASE.
Nunca uses DELETE sin WHERE.

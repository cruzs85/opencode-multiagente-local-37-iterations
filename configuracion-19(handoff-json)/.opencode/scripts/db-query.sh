#!/bin/bash
if [ -n "$1" ]; then
  docker exec -i mysql-restcube mysql -u user -password database -e "$1"
else
  docker exec -i mysql-restcube mysql -u user -password database
fi

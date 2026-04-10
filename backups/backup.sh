#!/bin/bash

FECHA=$(date +%F_%H-%M-%S)
BACKUP_FILE="/backups/backup-mercaduca-$FECHA.sql.gz"

echo "Iniciando backup: $FECHA"

export PGPASSWORD=$POSTGRES_PASSWORD

pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB \
  --clean --if-exists \
  | gzip > $BACKUP_FILE

echo "Backup creado en $BACKUP_FILE"

# 🔄 Retención (elimina backups de más de 7 días)
find /backups -type f -name "*.gz" -mtime +7 -delete

echo "Limpieza de backups antiguos completada"
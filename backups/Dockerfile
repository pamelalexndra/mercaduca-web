FROM postgres:15

RUN apt-get update && apt-get install -y cron

COPY backup.sh /backup.sh
COPY crontab /etc/cron.d/backup-cron

RUN chmod +x /backup.sh
RUN chmod 0644 /etc/cron.d/backup-cron

RUN crontab /etc/cron.d/backup-cron

RUN mkdir -p /backups

CMD ["cron", "-f"]
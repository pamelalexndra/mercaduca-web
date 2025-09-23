FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

RUN npm install && \
  npm cache clean --force && \
  rm -rf /home/nodejs/.npm /tmp/* /var/cache/apk/*

COPY --chown=nodejs:nodejs . .

EXPOSE 5173

# Health check para verificar que el frontend esté funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5173 || exit 1

# Comando que fuerza limpieza de cache de Vite
CMD ["sh", "-c", "rm -rf .vite && npm run dev -- --host 0.0.0.0 --force"]
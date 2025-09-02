FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app

USER nodejs

RUN npm install && npm cache clean --force

COPY --chown=nodejs:nodejs . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
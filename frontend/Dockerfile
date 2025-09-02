FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install && npm cache clean --force

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 3000

CMD ["npm", "run", "dev"]
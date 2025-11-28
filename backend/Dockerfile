FROM node:18-alpine

WORKDIR /app

# Instalar curl
RUN apk add --no-cache curl

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
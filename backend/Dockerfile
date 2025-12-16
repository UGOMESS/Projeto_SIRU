# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Comando para gerar o cliente do prisma e rodar o servidor
CMD npx prisma generate && npm run dev
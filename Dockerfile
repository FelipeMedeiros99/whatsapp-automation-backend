# Etapa 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copia apenas o que é necessário para instalar as dependências
COPY package*.json ./
RUN npm install

# Copia o restante dos arquivos e compila o projeto
COPY . .
RUN npm run build

# Etapa 2: Runtime (Imagem final, mais leve)
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# Copia apenas os arquivos buildados da etapa anterior
COPY --from=build /app/dist ./dist

# Se você tiver arquivos estáticos ou de configuração (ex: .env, client, etc.)
# COPY --from=build /app/client ./client

CMD ["npm", "start"]

FROM node:24-bullseye

WORKDIR /usr/src/api

COPY . .

# Instala dependências
RUN npm install --quiet --no-optional --no-fund --loglevel=error

# Build do projeto
RUN npm run build

# Expõe porta da API
EXPOSE 3000

# Comando padrão ao iniciar o container em dev
CMD ["npm", "run", "start:dev"]

# Etapa 1: Construir la aplicación React
FROM node:18-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación, incluyendo .env si existe
COPY . .

# Variables de entorno para la construcción (se pueden sobrescribir en docker-compose.yml)
ARG REACT_APP_API_BASE_URL=http://localhost:3001/api
ARG REACT_APP_API_HOST=http://localhost:3001
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV REACT_APP_API_HOST=${REACT_APP_API_HOST}

# Construir la aplicación para producción
RUN npm run build

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:stable-alpine

# Copiar los archivos construidos de la etapa anterior
COPY --from=build /app/build /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx para manejar rutas SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80 (Nginx por defecto)
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]

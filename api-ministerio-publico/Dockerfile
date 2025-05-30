# Usa una imagen base de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo en la aplicación
WORKDIR /usr/src/app

# Copia el package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Copia el archivo .dockerenv como .env para las variables de entorno
COPY .dockerenv .env

# Asegura que todos los archivos tienen los permisos correctos
RUN chmod -R 755 .

# Expone el puerto en el que corre la aplicación
EXPOSE 3001

# Comando para iniciar la aplicación
CMD [ "node", "server.js" ]

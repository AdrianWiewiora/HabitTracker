FROM node:22

WORKDIR /HabiTUA/server

COPY server/package*.json ./

RUN npm install --include=dev

COPY server/. .

EXPOSE 3000

CMD ["npm", "run", "dev"]
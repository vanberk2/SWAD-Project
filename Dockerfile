FROM node:latest

WORKDIR ./
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "node", "start" ]
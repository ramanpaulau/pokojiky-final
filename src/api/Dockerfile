FROM node:13.10.1-alpine3.10

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run lint
RUN npm run build

EXPOSE 8080
EXPOSE 9229
CMD [ "npm", "start" ]
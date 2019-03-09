FROM node:10

ADD / /polytris
WORKDIR /polytris

RUN npm install
RUN npm run build

ENTRYPOINT npm start


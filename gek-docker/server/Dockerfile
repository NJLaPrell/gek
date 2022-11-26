FROM node:16


# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install pm2 -g

COPY dist server
COPY ecosystem.config.js .
COPY .env .

EXPOSE 3000 8080

CMD [ "npm", "start" ]


FROM node:latest
WORKDIR /app

COPY ./package*.json ./
RUN npm install
ENV PATH /app/node_modules/.bin:$PATH

COPY . /app/src/client
EXPOSE 8080 8080

RUN npm run build
CMD npm run client-dev

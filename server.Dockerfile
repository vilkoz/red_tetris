FROM node:latest
WORKDIR /app

COPY ./package*.json ./
RUN npm install
ENV PATH /app/node_modules/.bin:$PATH

COPY . /app
EXPOSE 3004 3004

RUN npm run build
CMD npm run srv-dev

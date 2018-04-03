FROM node:8.11.1-alpine

RUN mkdir /opt/home_report
WORKDIR /opt/home_report
RUN mkdir src/

ADD package.json .
RUN npm install

ADD src/* ./src/

CMD node src/index.js

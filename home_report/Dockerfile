FROM node:8.11.1-alpine

RUN mkdir /opt/home_report
WORKDIR /opt/home_report
RUN mkdir src/
ADD crontab /var/spool/cron/crontabs/node

RUN chmod 0644 /var/spool/cron/crontabs/node

ADD package.json .
RUN npm install

ADD src/* ./src/

CMD ["crond", "-f"]

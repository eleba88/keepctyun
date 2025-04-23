FROM node:alpine as build
RUN apk add --no-cache python3 make g++
WORKDIR /usr/src/server
COPY ./server .
RUN npm install

FROM ghcr.io/puppeteer/puppeteer:latest
WORKDIR /usr/src/
COPY --from=build --chown=pptruser:pptruser /usr/src/server /usr/src/server
COPY ./start.sh /usr/src/start.sh
ENTRYPOINT ["/usr/src/start.sh"]

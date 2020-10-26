FROM node:10.17.0-stretch as api-builder

RUN mkdir -p /usr/src/api
WORKDIR /usr/src/api

COPY ./api/package.json .
COPY ./api/package-lock.json .
COPY ./api/tsconfig.json .
COPY ./api/tsconfig.build.json .
COPY ./api/nest-cli.json .
COPY ./api/tslint.json .
COPY ./api/src ./src

RUN npm install 
RUN npm run build
RUN npm run package:prod

FROM node:10.17.0-stretch as app-builder
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./app/ ./
RUN npm install --unsafe-perm
RUN npm run build:web:docker

FROM node:10.17.0-stretch-slim

RUN apt-get update && apt-get install -y net-tools iproute

RUN mkdir -p /usr/src/server
WORKDIR /usr/src/server

COPY --from=api-builder /usr/src/api/dist ./dist
COPY --from=api-builder /usr/src/api/package.json .
COPY --from=api-builder /usr/src/api/node_modules ./node_modules

COPY ./api/locales ./locales
COPY ./api/templates ./templates
COPY ./api/static ./static
RUN  mkdir -p /usr/src/server/static/dev-portal/
COPY --from=app-builder /usr/src/app/www ./static/dev-portal
COPY ./api/.env.docker .

EXPOSE 3000

COPY entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh 

CMD ["/usr/src/server/entrypoint.sh"]
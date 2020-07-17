FROM node:12.13-alpine as build

ENV WORKDIR=/usr/src/app
ENV BLUEBIRD_DEBUG=0

WORKDIR $WORKDIR
ARG NPM_TOKEN
ARG NPM_DOMAIN
ARG NPM_DOMAIN_URL
ARG NPM_PREFIX

COPY package.json package-lock.json \
     tsconfig.json .eslintrc.js $WORKDIR/
COPY src $WORKDIR/src/

RUN echo "//${NPM_DOMAIN}/:_authToken=\"${NPM_TOKEN}\"" >> /root/.npmrc
RUN echo "${NPM_PREFIX}:registry=${NPM_DOMAIN_URL}" >> /root/.npmrc
RUN apk update && apk add --no-cache python make build-base gcc wget
RUN npm ci
RUN npm run build
RUN rm -f .npmrc

FROM node:12.13-alpine as production

ENV WORKDIR /usr/src/app
ENV BLUEBIRD_DEBUG=0
ENV HTTP_PORT=5000 WS_PORT=8083

WORKDIR $WORKDIR

COPY package.json package-lock.json .env.example ./
COPY src $WORKDIR/src/
COPY --from=build $WORKDIR/dist $WORKDIR/dist
COPY --from=build $WORKDIR/node_modules $WORKDIR/node_modules
RUN cp .env.example .env

EXPOSE $HTTP_PORT $WS_PORT

CMD ["npm", "start"]

FROM node:14.16.0-alpine3.11 as build

ENV WORKDIR=/usr/src/app
ENV BLUEBIRD_DEBUG=0

ARG NPM_TOKEN
ARG NPM_DOMAIN
ARG NPM_DOMAIN_URL
ARG NPM_PREFIX

WORKDIR $WORKDIR

RUN apk update && apk add --no-cache python make build-base gcc wget bash libc6-compat curl

COPY package.json package-lock.json \
     tsconfig.json .eslintrc.js $WORKDIR/
COPY src $WORKDIR/src/

RUN echo "//${NPM_DOMAIN}/:_authToken=\"${NPM_TOKEN}\"" >> /root/.npmrc
RUN echo "${NPM_PREFIX}:registry=${NPM_DOMAIN_URL}" >> /root/.npmrc

RUN npm ci
RUN npm run build
RUN rm -f .npmrc

FROM node:14.16.0-alpine3.11 as production

ENV WORKDIR /usr/src/app
ENV BLUEBIRD_DEBUG=0
ENV HTTP_PORT=5000
LABEL service-metrics=1

WORKDIR $WORKDIR

COPY package.json package-lock.json .env.example ./
COPY src $WORKDIR/src/
COPY --from=build $WORKDIR/dist $WORKDIR/dist
COPY --from=build $WORKDIR/node_modules $WORKDIR/node_modules
RUN cp .env.example .env

EXPOSE $HTTP_PORT

CMD ["npm", "start"]

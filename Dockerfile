FROM node:15.14.0@sha256:608bba799613b1ebf754034ae008849ba51e88b23271412427b76d60ae0d0627 AS installer

COPY --chown=node:node package.json yarn.lock /home/node/app/
WORKDIR /home/node/app
RUN yarn install


FROM node:15.14.0-alpine@sha256:6edd37368174c15d4cc59395ca2643be8e2a1c9846714bc92c5f5c5a92fb8929 AS builder

COPY --from=installer /home/node/app /home/node/app/
COPY . /home/node/app/

WORKDIR /home/node/app
RUN yarn build

RUN mkdir -p /home/node/deploy

RUN cp -a \
    /home/node/app/package.json \
    /home/node/app/yarn.lock \
    /home/node/app/node_modules \
    /home/node/app/app \
    /home/node/app/locale \
    /home/node/app/build \
    /home/node/deploy/

FROM node:15.14.0-alpine@sha256:6edd37368174c15d4cc59395ca2643be8e2a1c9846714bc92c5f5c5a92fb8929 AS runner

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV}
ARG PORT=3000
ENV PORT ${PORT}

WORKDIR /home/node/app

USER node

COPY --chown=node:node --from=builder \
    /home/node/deploy \
    /home/node/app/

EXPOSE $PORT

CMD ["yarn", "start"]

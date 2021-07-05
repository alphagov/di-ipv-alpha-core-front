FROM node:15.14.0@sha256:608bba799613b1ebf754034ae008849ba51e88b23271412427b76d60ae0d0627 AS builder

COPY --chown=node:node . /home/node/app
WORKDIR /home/node/app
RUN yarn && yarn build
RUN ./scripts/generate-key-pair-for-dev.sh

FROM node:15.14.0-alpine@sha256:6edd37368174c15d4cc59395ca2643be8e2a1c9846714bc92c5f5c5a92fb8929

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV}
ARG PORT=3000
ENV PORT ${PORT}

USER node
WORKDIR /home/node/app
COPY --chown=node:node --from=builder /home/node/app .
EXPOSE $PORT

CMD ["yarn", "start"]

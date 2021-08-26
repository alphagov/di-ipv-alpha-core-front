FROM node:15.14.0@sha256:608bba799613b1ebf754034ae008849ba51e88b23271412427b76d60ae0d0627

COPY --chown=node:node package.json yarn.lock /home/node/app/
WORKDIR /home/node/app
RUN yarn install


COPY . /home/node/app/

RUN yarn build

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV}
ARG PORT=3000
ENV PORT ${PORT}

WORKDIR /home/node/app

EXPOSE $PORT

CMD ["yarn", "start"]

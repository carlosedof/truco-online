FROM node:18-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json yarn.lock /app/

RUN npm rebuild bcrypt

RUN yarn add --location=global @nestjs/cli

RUN yarn install

COPY . /app

RUN yarn build

ADD entrypoint.sh entrypoint.sh

RUN chmod 755 entrypoint.sh && chown appuser:appgroup entrypoint.sh

EXPOSE 5008

ENTRYPOINT ["./entrypoint.sh"]

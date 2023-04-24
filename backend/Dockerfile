FROM node:14-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json /app/

RUN npm install

COPY . /app

# RUN node build

ADD entrypoint.sh entrypoint.sh

RUN chmod 755 entrypoint.sh && chown appuser:appgroup entrypoint.sh

EXPOSE 5008
EXPOSE 5009

ENTRYPOINT ["./entrypoint.sh"]

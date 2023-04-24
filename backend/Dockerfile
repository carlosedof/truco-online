FROM node:16-alpine as builder
WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN yarn install --force
COPY . .
RUN rm -rf dist

RUN yarn build
FROM nginx:1.22-alpine
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY site.conf /etc/nginx/conf.d/default.conf

EXPOSE 5010
CMD ["nginx", "-g", "daemon off;"]

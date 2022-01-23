# Builder =================
FROM node:14.15 as builder

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm ci

COPY . /app
RUN ng build

# Runner =================
FROM nginx:1.16.0-alpine

COPY --from=builder /app/dist/front-end /usr/share/nginx/html
COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

ENTRYPOINT ["nginx", "-g", "daemon off;"]

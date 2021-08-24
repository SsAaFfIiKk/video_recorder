FROM alpine

RUN apk add --update nodejs nodejs npm

WORKDIR /app

COPY . .

RUN npm ci

EXPOSE 8001

CMD npm start
FROM node:20-alpine

WORKDIR /app

# Build tools required for better-sqlite3 native module on Alpine (musl libc)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 8000

CMD ["npm", "start"]

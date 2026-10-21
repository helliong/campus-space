FROM node:22-alpine AS dependencies
WORKDIR /app
COPY frontend/package.json ./
RUN npm install

FROM node:22-alpine AS development
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY frontend/ .
EXPOSE 3000
CMD ["npm", "run", "dev"]


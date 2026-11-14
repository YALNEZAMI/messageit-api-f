FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run compile && npm prune --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/lib ./lib
COPY --from=build --chown=node:node /app/config ./config
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/package.json ./package.json
USER node
EXPOSE 3030
CMD ["node", "lib/index.js"]

FROM node:14.16.1
RUN mkdir -p /app/node_modules && chown -R node:node /app/
WORKDIR /app
COPY package*.json .
USER node
RUN npm install
COPY --chown=node:node . .
CMD ["npm", "start"]

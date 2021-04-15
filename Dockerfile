FROM node:14.16.1-alpine
RUN mkdir -p /app/node_modules && chown -R node:node /app/
WORKDIR /app
COPY package.json /app
USER node
#RUN npm install #error while installing modules(problems with git)
COPY --chown=node:node . .
CMD ["npm", "start"]

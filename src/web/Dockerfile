FROM node:14.16.1-alpine
RUN mkdir -p /app/node_modules && chown root:root /app/
WORKDIR /app
RUN npm init -y
USER root
COPY --chown=root:root . .
RUN npm i express cors dotenv node-fetch
CMD ["node", "server.js"]

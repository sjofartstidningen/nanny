# This is the Dockerfile used to build and deploy the package.
# The Docker env is used in order to mimic the AWS Lambda execution environment
# as closely as possible

FROM node:16.18.1-bullseye-slim
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# USER node
CMD ["dumb-init", "./node_modules/.bin/serverless", "deploy", "function", "-f", "processImage", "-s", "development"]
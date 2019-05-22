FROM lambci/lambda:build-nodejs8.10
RUN npm install -g yarn

ENV STAGE development

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install --force

COPY . .

RUN yarn build
CMD yarn serverless deploy --stage $STAGE

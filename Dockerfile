FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

COPY controllers/ controllers/

COPY helpers/ helpers/

COPY middleware/ middleware/

COPY models/ models/

COPY public/ public/

COPY routes/ routes/

COPY views/ views/

COPY app.js ./

RUN npm install --omit=dev

USER node


ENV NODE_ENV=production
ENV MONGODB_URL=mongodb+srv://incognico-dev:Wee!park2slh@cluster0.auitj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
ENV MONGODB_URL_STAGING=mongodb+srv://slh-staging:Wee!park2staging@cluster0.l43ih.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
ENV MONGODB_URL_DEV=mongodb://localhost:27017/grab-bag
ENV SECRET=supersecretwordything
ENV GOOGLE_CLIENT_ID=524974444611-f9r9ums8gjs6e6dp13fegm8ohdeu2hao.apps.googleusercontent.com
ENV GOOGLE_SECRET=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
ENV GOOGLE_REFRESH_TOKEN=1//04G3azQXpBiRvCgYIARAAGAQSNwF-L9IrjLW_AE97XQfNmXozY79ddzVNSIZPDjqP1Ui_XlFlPuoRAJlglQf7gmvKySwNU8SvCBA

ENV BASE_URL=https://santaslilhelper.net

ENV EXAMPLE_PARTY_ID=61f17ad6cac18a2ca6cb75f9

CMD ["npm", "start"]

EXPOSE 8080
FROM node:18

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN npx prisma generate

EXPOSE 5001

CMD ["npm", "start"]



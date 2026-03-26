FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma client for Linux inside the container
RUN npx prisma generate

EXPOSE 5001

CMD ["npm", "start"]
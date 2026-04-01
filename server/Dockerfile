FROM node:22

WORKDIR /app

# L2: Set production mode so Express + error handler behave correctly
ENV NODE_ENV=production

COPY package*.json ./

# Install only production dependencies (skip devDependencies)
RUN npm install --omit=dev

COPY . .

# Generate Prisma client for Linux inside the container
RUN npx prisma generate

EXPOSE 5001

CMD ["npm", "start"]
# Stage 1: Build stage (if needed for production, for dev we just run npm dev)
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

# Stage 2: Development stage
FROM node:20-alpine

WORKDIR /app

# Copy node_modules from the build stage
COPY --from=build /app/node_modules ./node_modules

# Copy the rest of the application code
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Command to run the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
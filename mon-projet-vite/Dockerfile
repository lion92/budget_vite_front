# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle conflicts
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose port 3014
EXPOSE 3014

# Start the development server on port 3014
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3014"]
FROM node:18

WORKDIR /app

# Install dependencies (use package-lock if present)
COPY package*.json ./
RUN npm ci --silent

# Copy source
COPY . .

# Default command runs the test suite
CMD ["npx", "hardhat", "test"]

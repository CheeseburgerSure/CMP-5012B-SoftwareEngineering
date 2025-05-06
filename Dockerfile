FROM node:16

# Set the working directory
WORKDIR /usr/src/app

# Install build tools for compiling bcrypt
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json (to ensure proper installation order)
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of your application files into the container
COPY . .

# Expose port for the app
EXPOSE 3000

# Command to run the application, ensure it is the right command
CMD ["npm", "run", "dbdev"]

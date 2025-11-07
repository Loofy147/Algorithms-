# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# The application is a collection of scripts, not a server.
# This default command starts an interactive shell within the container.
# From there, you can execute the individual use case examples.
# Example: node examples/time-aware-use-case.js
CMD [ "bash" ]

FROM node:lts-alpine as build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY serviceAccountKey.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the TypeScript code
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/index.js"]
#256932602917@cloudbuild.gserviceaccount.com
#firebase-adminsdk-p1ys6@nft-surprise.iam.gserviceaccount.com
#service-256932602917@gcp-sa-cloudbuild.iam.gserviceaccount.com
#download the node image
FROM node:16.14.0-alpine3.14

# #set the working directory
WORKDIR /app

# # install app dependencies
COPY package.json ./

# #clean npm cache
RUN npm cache clean --force

# #clean install dependecies
RUN npm install

# # add app
COPY . ./

# # expose port 3011 to outer environment
EXPOSE 4200

# # start app
CMD ["npx", "serve", "decentsol"]

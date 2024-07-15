FROM node:16
WORKDIR /home/node/app
COPY expressjs .
RUN npm install 
ARG IPADDR
EXPOSE 3000
EXPOSE 3333
ENTRYPOINT "node" "app.js" http://$IPADDR:4200
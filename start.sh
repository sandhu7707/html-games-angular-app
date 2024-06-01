IPADDR=$(dig +short myip.opendns.com @resolver4.opendns.com)

cat <<ENV > src/environments/environment.aws.server.params
export const environment = {
        serverHttpUrl: 'http://$IPADDR:3000/',
        serverWsUrl: 'http://$IPADDR:3333/'
}
ENV

npm install
npm run ng build --configuration=production --base-href=http://$IPADDR:4200/

#touch .env
#cat <<ENV > .env
#IPADDR=$IPADDR
#ENV

docker compose run -e IPADDR=$IPADDR backend
docker compose up frontend postgres
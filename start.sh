IPADDR=$(dig +short myip.opendns.com @resolver4.opendns.com)

cat <<ENV > src/environments/environment.aws.server.params
export const environment = {
        serverHttpUrl: 'http://$IPADDR/',
        serverWsUrl: 'http://$IPADDR/'
}
ENV

ng build --configuration production

#touch .env
#cat <<ENV > .env
#IPADDR=$IPADDR
#ENV

docker compose run -e IPADDR=$IPADDR backend
docker compose up frontend postgres
set IPADDR=http://localhost:300/

@REM cat <<ENV > src/environments/environment.aws.server.params
@REM export const environment = {
@REM         serverHttpUrl: 'http://$IPADDR/',
@REM         serverWsUrl: 'http://$IPADDR/'
@REM }
@REM ENV

ng build --configuration development

#touch .env
#cat <<ENV > .env
#IPADDR=$IPADDR
#ENV

docker compose run -e IPADDR=$IPADDR backend
docker compose up frontend postgres
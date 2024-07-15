set IPADDR=localhost

call npm install
call npm run ng build --configuration=production --base-href=http://$IPADDR:4200/

call docker compose up --detach
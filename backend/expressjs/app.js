const express = require('express')
const app = express()
const pgp = require('pg-promise')()
const cors = require('cors')
if(!process.argv[2]){
    throw new Error("no origin specified");
}
else if(!process.argv[2].match(/https{0,1}:\/\/[\w,:,.]*$/)){
    throw new Error(`allowed origin ${process.argv[2]} doesn't match format http[s]://[\\w,:,.]*$`)
}
const allowedOrigins = [process.argv[2]]

console.log("allowedOrigins: ", allowedOrigins)

app.use(cors({
        origin: allowedOrigins
}))
app.use(express.json())


const port = 3000
const cn = {
    host: 'localhost',
    port: 5432,
    database: 'helloworld',
    user: 'helloworldapp',
    password: 'helloworldapp'
}
const db = pgp(cn)


const qrec = pgp.errors.queryResultErrorCode;
const no_record_found = "No Data Found"

app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.get('/user/:username', (req, res) => {
    const username = req.params['username'];
    if(username){
        db.one('select * from user_profile where username=$1', [username])
        .then((data) => res.send(data))
        .catch(err => {
            console.log("err", err, err.code)
            if(err.code === qrec.noData){
                return res.send(no_record_found)
            }
        })
        
    }
    else {
        res.status(400).send("Bad Request")
    }
})

app.post('/user/authenticate', (req, res) => {
    console.log("something")
    const {username, password} = req.body
    if(username && password){
        db.one('select * from user_profile where username=$1', [username])
        .then((data) => {
                if(data.password === password){
                    res.send(data)
                } else {
                    throw new Error()
                }
            }
        )
        .catch(err => {
            if(err.code === qrec.noData){
                res.send("Incorrect Credentials")
            }
        })
    }
    else{
        res.status(400).send("bad request")
    }
})

app.post('/user/register', (req, res) => {
    const {username, password} = req.body
    if(username && password){
        db.none('insert into user_profile values(default, $1, $2)', [username, password])
        .catch(err => {
            if(err.code === '23505') {
                res.status(409).send("username already exists")
            }
            else{
                res.status(500).send("server error")
            }
        })

        db.one('select * from user_profile where username=$1', [username])
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            // if(!res.closed) {
            //     res.status(500).send("server error")
            // }
        })
    }
    else{
        res.status(400).send("bad request")
    }
})

app.put("/games/start", (req, res) => {
    const {game, hostId} = req.body;
    console.log(aWss.clients)
    // activeGames.push({game: game, host: host})
})

app.put("/games/")

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


var expressWs = require('express-ws')
expressWs = expressWs(express());
const appWs = expressWs.app
const portWs = 3333
var aWss = expressWs.getWss('/')
appWs.use(cors({
    origin: 'http://localhost:4200'
}))

const roomsInfos = {}

appWs.ws('/', function(ws, req, res) {
    console.log('Socket Connected');

    ws.onmessage = function(msg){
        const message = JSON.parse(msg.data)
        if(message && message.type === "rooms-update"){
            roomsInfos[message.key] = message.value;
            console.log(roomsInfos)
            aWss.clients.forEach(client => {
                sendMessage(client,{type: message.type, data: roomsInfos})
            });
        }
        else if(message && message.type === "login"){
            console.log("login from ", message.userId)
            sendMessage(ws,{type:"rooms-update", data: roomsInfos})
        }
    }
})

function sendMessage(ws, data){
    ws.send(JSON.stringify(data))
}

const rooms = {}
appWs.ws('/game/:gameId/room/:roomId', function(ws, req) {
    console.log("started")
    
    const gameId = req.params['gameId'];
    const roomId = req.params['roomId'];

    function broadcastMessage(ws, data){
        if(rooms[gameId] && rooms[gameId][roomId] && rooms[gameId][roomId].clients){
            rooms[gameId][roomId].clients.forEach(ws => {
                sendMessage(ws.client, data)
            })
        }
    }

    const room = roomsInfos[gameId] ? {...roomsInfos}[gameId][parseInt(roomId)] : null

    ws.onmessage = function(msg){    
        console.log("received", msg)
        const message = JSON.parse(msg.data)
        if(message && message.type === 'init'){
            if(message.data === -1){
                broadcastMessage(ws, {type: 'init', data: -1})
                delete rooms[gameId][roomId]
            }
            if(rooms[gameId] && rooms[gameId][roomId]){
                if(!rooms[gameId][roomId].room.players.find(player => player.id === message.userId)){
                    rooms[gameId][roomId].room.players.push(room.players.find(player => player.id === message.userId))
                }
                
                rooms[gameId][roomId].clients.push({id: message.userId, client: ws})
                sendMessage(ws, {type: 'init', data: 0})
                broadcastMessage(ws, {type: 'update', data: rooms[gameId][roomId].room})
            }
            else{
                sendMessage(ws, {type: 'init', data: -1})
            }
        }
        else if(message && message.type === 'remove-player'){
            console.log(rooms)
            const playerId = message.userId;
            const {gameId, roomId} = message.data;
            const players = rooms[gameId][roomId].room.players
            rooms[gameId][roomId].room.players.splice(players.indexOf(players.find(player => player.id === playerId)), 1)

            const clients = rooms[gameId][roomId].clients
            rooms[gameId][roomId].clients.splice(clients.indexOf(clients.find(client => client.id === message.userId)), 1)
            broadcastMessage(ws, {type: 'update', data: rooms[gameId][roomId].room})
            console.log(rooms)
        }
        else {
            if(message && message.data){
                console.log(`update from ${message.userId}, `, message.data)
                rooms[gameId][roomId].room = message.data
            }
            broadcastMessage(ws, {type: 'update', data: rooms[gameId][roomId].room})
        }
    }

    if(!room){
        return
    }
    if(!rooms[gameId]){
        rooms[gameId] = {[roomId]: {room: room}}
    }

    if(rooms[gameId] && !rooms[gameId][roomId]){
        rooms[gameId][roomId] = {room: room}
    }

    if(!rooms[gameId][roomId].clients){
        rooms[gameId][roomId].clients = []
    }
    
})

// appWs.get('/', (req, res) => {
//     console.log("received", req)
// })

appWs.listen(portWs, () => {console.log("another one")})
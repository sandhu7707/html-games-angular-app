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
        .then(() => db.one('select * from user_profile where username=$1', [username]))
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
appWs.use(cors({
    origin: 'http://localhost:4200'
}))

const roomsInfos = {}

const rooms = {}

function sendMessage(ws, data){
    ws.send(JSON.stringify(data))
}


function broadcastRoomsUpdateToAll() {
    expressWs.getWss('/').clients.forEach(client => {
        sendMessage(client, {type: 'rooms-update', data: rooms})
    });
}

appWs.ws('/', function(ws, req, res) {
    console.log('Socket Connected');


    ws.onmessage = function(msg){
        const message = JSON.parse(msg.data)
        
        if(message && message.type === "login"){
            console.log("login from ", message.userId)
            sendMessage(ws,{type:"rooms-update", data: rooms})
        }
        else{
            if(message && message.type === 'create-room'){
                if(!rooms[message.gameId])
                    rooms[message.gameId] = {}

                const gameRooms = rooms[message.gameId]
                
                const newRoom =           {
                    name: message.room.name,
                    hostId: message.userId,
                    roomId: !gameRooms || Object.keys(gameRooms).length === 0 ? 1 : gameRooms[parseInt(Object.keys(gameRooms)[Object.keys(gameRooms).length-1])].roomId+1,
                    dealerId: message.userId,
                    players: [message.playerInfo]
                  }

                rooms[message.gameId][newRoom.roomId] = newRoom
                sendMessage(ws, {type: 'create-room', data: rooms[message.gameId][newRoom.roomId]})
            }
            else if(message && message.type === 'leave-room'){
                const room = rooms[message.gameId][message.roomId]
                if(room.hostId === message.userId){
                    delete rooms[message.gameId][message.roomId]
                }
                else{
                    let player = room.players.find(player => player.id === message.userId)
                    if(player){
                        room.players.splice(room.players.indexOf(player), 1)
                    }
                }
            }
            else if(message && message.type === 'join-room'){
                const room = rooms[message.gameId][message.roomId]
                room.players.push(message.playerInfo)
            }
            broadcastRoomsUpdateToAll()
        }
    }
})

appWs.ws('/game/:gameId/room/:roomId', function(ws, req) {
    console.log("started")
    
    const gameId = req.params['gameId'];
    const roomId = parseInt(req.params['roomId']);

    function broadcastMessageToRoom(data){
        expressWs.getWss(`game/${gameId}/room/${roomId}`).clients.forEach(ws => {
            sendMessage(ws, data)
        })
    }

    ws.onmessage = function(msg){    
        console.log("received", msg)
        const message = JSON.parse(msg.data)
        if(message && message.type === 'init'){
            if(message.data === -1){
                broadcastMessageToRoom({type: 'init', data: -1})
                delete rooms[gameId][roomId]
                broadcastRoomsUpdateToAll()
            }
            if(rooms[gameId] && rooms[gameId][roomId]){
                broadcastMessageToRoom({type: 'update', data: rooms[gameId][roomId]})
            }
            else{
                sendMessage(ws, {type: 'init', data: -1})
            }
        }
        else if(message && message.type === 'remove-player'){
            console.log(rooms)
            const playerId = message.userId;
            const players = rooms[gameId][roomId].room.players
            rooms[gameId][roomId].room.players.splice(players.indexOf(players.find(player => player.id === playerId)), 1)

            broadcastMessageToRoom({type: 'update', data: rooms[gameId][roomId]})
            broadcastRoomsUpdateToAll()
            console.log(rooms)
        }
        else {
            if(message && message.type === 'update'){
                console.log(`update from ${message.userId}, `)
                rooms[gameId][roomId] = message.data
            }
            broadcastMessageToRoom({type: 'update', data: rooms[gameId][roomId]})
        }
    }
    
})

appWs.listen(portWs, () => {console.log("another one")})
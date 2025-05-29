const express = require('express')
const app = express()
const pgp = require('pg-promise')()
const cors = require('cors')
const decompress = require('decompress')

if(!process.argv[2]){
    throw new Error("no origin specified");
}
else if(!process.argv[2].match(/https{0,1}:\/\/[\w,:,.]*$/)){
    throw new Error(`allowed origin ${process.argv[2]} doesn't match format http[s]://[\\w,:,.]*$`)
}
const allowedOrigins = [process.argv[2]]

console.log("allowedOrigins: ", allowedOrigins, '\ndbaddress: ', process.env.DBADDR ? process.env.DBADDR : 'localhost')

app.use(cors({
        origin: allowedOrigins
}))

const port = 3000
const cn = {
    host: process.env.DBADDR ? process.env.DBADDR : 'localhost',
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

app.get('/username-check/:username', async (req, res) => {
    let user = await db.any('select * from user_profile where username=$1', req.params.username);
    res.status(200).send(JSON.stringify({available: user.length > 0 ? false : true}));
})

app.post('/user/authenticate', express.json(), (req, res) => {
    console.log("something")
    const {username, password} = req.body
    if(username && password){
        db.one('select * from user_profile where username=$1', [username])
        .then((data) => {
                if(data.password === password){
                    res.send(data)
                } else {
                    //recheck 
                    // throw new Error()
                    res.status(401).send("Incorrect Credentials")
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

app.post('/user/register', express.json(), (req, res) => {
    const {username, password} = req.body
    if(username && password){
        db.none('insert into user_profile values(default, $1, $2)', [username, password])
        .catch(err => {
            if(err.code === '23505') {
                res.status(409).send("username already exists")
            }
            else{
                console.error(err)
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

app.use(express.static('product_items'))
app.post("/games/upload/:name", express.raw({type: 'application/octet-stream'}), (req, res) => {
    const name = req.params['name']
    db.any('insert into games values(default, $1, $2)', [name, req.body])
    .then(res.status(200).send())
    .catch(err => console.log(err))
})

const fs = require('fs')
app.get("/games", (req, res) => {
    console.log("get /games")
    db.any("SELECT * from games")
    .then(async (rows) => {
        const games = []
        new Promise(async (resolve, reject) => {
            for(let i=0; i<rows.length; i++){
                const row = rows[i]
                
                if(!fs.existsSync(`product_items/games/${row.game_name}`)){
                    const files = await decompress(row.game_code, 'product_items/games')
                    
                    files.forEach(file => {
                        if(file.path.match(/[\\w,\/,\\]index.html$/)){
                            console.log(file.path)
                            games.push({
                                id: row.game_id,
                                name: row.game_name,
                            })
                        }
                    })
                    
                    if(!files){
                        reject()
                    }
                }
                else{
                    games.push({
                        id: row.game_id,
                        name: row.game_name,
                    })
                }

                if(i === rows.length-1){
                    resolve(games)
                }
            }    
        })
        .then(data => res.send(data))
        .catch(err => console.log(err))
    })
    .catch((err) => console.log(err))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


var expressWs = require('express-ws')
expressWs = expressWs(express());
const appWs = expressWs.app
const portWs = 3333
appWs.use(cors({
    origin: allowedOrigins
}))

const roomsInfos = {}

const rooms = {}
const clients = []
function sendMessage(ws, data){
    ws.send(JSON.stringify(data))
}


function broadcastRoomsUpdateToAll() {
    clients.forEach(client => {
        sendMessage(client, {type: 'rooms-update', data: rooms})
    });
}

appWs.ws('/', function(ws, req, res) {
    console.log('Socket Connected');
    clients.push(ws)

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
            else if(message && message.type === 'logout'){
                const userId = message.userId;
                for(let i0 in rooms){
                    for(let i1 in rooms[i0]){
                        if(rooms[i0][i1].hostId === userId){
                            delete rooms[i0][i1]
                        }
                        else{
                            let player = rooms[i0][i1].players.find(player => player.id === userId);
                            if(player){
                                rooms[i0][i1].players.splice(rooms[i0][i1].players.indexOf(player), 1)
                            }
                        }
                    }
                }
            }
            broadcastRoomsUpdateToAll()
        }
    }
})



appWs.ws('/gameplay/:gameId/room/:roomId', function(ws, req) {
    console.log("started")
    
    const gameId = req.params['gameId'];
    const roomId = parseInt(req.params['roomId']);

    function broadcastMessageToPlayers(data){
        const playerStates = rooms[gameId][roomId].playersWs
        for (let key in playerStates){
            sendMessage(playerStates[key], data)
        }
    }

    ws.onmessage = function(msg){    
        const message = JSON.parse(msg.data)
        

        if(message && message.type === 'init'){
            const userId = message.userId;

            if(rooms[gameId] && rooms[gameId][roomId]){
                if(!rooms[gameId][roomId].gameState){
                    rooms[gameId][roomId].gameState = {}
                    rooms[gameId][roomId].playersWs = {}
                    rooms[gameId][roomId].gameState.playerStates = {}
                    rooms[gameId][roomId].gameState.gameState = {}
                }
                rooms[gameId][roomId].gameState.playerStates[userId] = {state: {}}
                rooms[gameId][roomId].playersWs[userId] = ws

                broadcastMessageToPlayers({type: 'game-state-update', data: rooms[gameId][roomId].gameState})
            }
        }
        else if(rooms[gameId][roomId]){
            if(message && message.type === 'update-player-state'){
                const {data, userId} = message

                rooms[gameId][roomId].gameState.playerStates[userId].state = data
            }
            else if(message && message.type === 'update-game-state'){
                const {data} = message
                rooms[gameId][roomId].gameState.gameState = data
            }
            broadcastMessageToPlayers({type: 'game-state-update', data: rooms[gameId][roomId].gameState})
        }
        else{
            broadcastMessageToPlayers({type: 'game-state-update', data: {}})
        }
    }
})

appWs.listen(portWs, () => {console.log(`listening for websocket connections at ${portWs}`)})
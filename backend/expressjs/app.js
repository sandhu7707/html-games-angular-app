const express = require('express')
const app = express()
const pgp = require('pg-promise')()
const cors = require('cors')

app.use(cors({
        origin: ['http://localhost:4200', 'http://192.168.100.3:4200']
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

const activeGames = []

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
appWs.ws('/', function(ws, req) {
    console.log('Socker Connected');

    ws.onmessage = function(msg){
        console.log(msg.data)
        console.log(aWss.clients)
        aWss.clients.forEach(client => {
            client.send(msg.data)
        });
    }
})

appWs.listen(portWs, () => {console.log("another one")})
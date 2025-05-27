var gameData, ws

export const connectServer = (gameId, roomId, userId, gameStateUpdate) => {
    ws = new WebSocket(`http://localhost:3333/gameplay/${gameId}/room/${roomId}`)
    ws.onopen = () => {
        ws.send(JSON.stringify({
            type: 'init',
            userId: userId
        }))
    }

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        gameData = msg
        if(msg && msg.type === 'game-state-update'){
            gameStateUpdate(msg.data)
        }
        console.log(gameData)
    }
}

export const updatePlayerState = (userId, playerState) => {
    if(ws.readyState !== WebSocket.OPEN){
        return;
    }

    ws.send(JSON.stringify({
        type: 'update-player-state',
        data: playerState,
        userId: userId
    }))
}

export function printGameData(){
    console.log(gameData)
}

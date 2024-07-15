import {connectServer, printGameData, updatePlayerState} from './server.js'

    const LENGTH = 10
    const SIDE = 10
    const SPEED = 0.1
    var x = 50;
    var y = 50;
    var gameState;
    var controlState = {'W': false, 'S': false, 'A': false, 'D': false};

    var urlParams = new URLSearchParams(window.location.search)
    var gameId = urlParams.get('gameId')
    var roomId = urlParams.get('roomId')
    var userId = urlParams.get('userId')

    const updateState = (updatedState) => {
        gameState = updatedState
        console.log(gameState)
    }

    connectServer(gameId, roomId, userId, updateState);

    const myCanvas = document.getElementById("my-canvas")
    const canvasBoundingRect = myCanvas.getBoundingClientRect()

    const ctx = myCanvas.getContext('2d')
    ctx.fillStyle = "#FFFFFF"
    let snake = []
    snake = calculateSnake()
    drawGame(performance.now(), ctx, snake, performance.now())

    function calculateSnake(oldSnake){

        function getDistance(x1, y1, x2, y2){
            return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2))
        }

        if(!oldSnake){
            oldSnake = new Array(LENGTH).fill({x: 0, y: 0})
        }

        if(x !== oldSnake[0].x || y != oldSnake[0].y ){
            snake[0] = {x,y}
            // console.log(snake[0])
            for(let i=1; i<LENGTH; i++){
                // if(oldSnake && getDistance(oldSnake[i].x , oldSnake[i].y, snake[i-1].x, snake[i-1].y) > SIDE){
                const dist = getDistance(oldSnake[i].x , oldSnake[i].y, snake[i-1].x, snake[i-1].y)

                snake[i] = {
                    x: oldSnake[i].x + (dist-SIDE)*(snake[i-1].x-oldSnake[i].x)/dist,
                    y: oldSnake[i].y + (dist-SIDE)*(snake[i-1].y-oldSnake[i].y)/dist
                }
            }

            updatePlayerState(userId, snake)
        }
        return snake  
    }

    function drawGame(dt, ctx, dtOld){
        // console.log(dt)
        if(controlState['W']){
            y -= dt*SPEED
            if(y < 0){
                y = 0
            }
        }
        if(controlState['S']){
            y += dt*SPEED
            if(y > canvasBoundingRect.height - canvasBoundingRect.y){
                y = canvasBoundingRect.height - canvasBoundingRect.y
            }
        }
        if(controlState['A']){
            x -= dt*SPEED
            if(x < 0){
                x = 0
            }
        }
        if(controlState['D']){
            x += dt*SPEED
            if(x > canvasBoundingRect.width - canvasBoundingRect.x){
                x = canvasBoundingRect.width - canvasBoundingRect.x
            }
        }


        calculateSnake(snake);
        clearCanvas();
        drawSnake(ctx, snake);
        drawOtherPlayers(ctx);


        requestAnimationFrame((dtNew) => drawGame(dtNew-dtOld, ctx, dtNew))
    }

    function drawSnake(ctx, snake) {
        for(let i=0; i<LENGTH; i++){
            let node = snake[i]
            ctx.fillRect(node.x, node.y, SIDE, SIDE)
        }
    }

    function drawOtherPlayers(ctx){
        if(!gameState || !gameState.playerStates){
            return
        }
        for(let key in gameState.playerStates){
            if(key != userId){
                try{
                    drawSnake(ctx, gameState.playerStates[key].state)
                }
                catch(ex){
                    console.error("exception occured", ex)
                }
            }
        }
    }

    function clearCanvas(){
        let ctx = myCanvas.getContext('2d')
        ctx.clearRect(0, 0, myCanvas.width, myCanvas.height)
    }

    window.addEventListener('keydown', (event) => {
        controlState[event.key.toUpperCase()] = true
    })

    window.addEventListener('keyup', (event => {
        controlState[event.key.toUpperCase()] = false
    }))

    addEventListener('click', (event) => {
        printGameData()
    })

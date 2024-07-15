function init () {
    const LENGTH = 10
    const SIDE = 10

    const myCanvas = document.getElementById("my-canvas")
    const ctx = myCanvas.getContext('2d')
    ctx.fillStyle = "#FFFFFF"
    let snake = calculateSnake(50,50)
    drawSnake(ctx, snake)

    function calculateSnake(x,y, oldSnake){

        function getDistance(x1, y1, x2, y2){
            return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2))
        }

        if(!oldSnake){
            oldSnake = new Array(LENGTH).fill({x: 0, y: 0})
        }

        let snake = []
        snake[0] = {x,y}
        for(let i=1; i<LENGTH; i++){
            // if(oldSnake && getDistance(oldSnake[i].x , oldSnake[i].y, snake[i-1].x, snake[i-1].y) > SIDE){
            const dist = getDistance(oldSnake[i].x , oldSnake[i].y, snake[i-1].x, snake[i-1].y)

            snake[i] = {
                x: oldSnake[i].x + (dist-SIDE)*(snake[i-1].x-oldSnake[i].x)/dist,
                y: oldSnake[i].y + (dist-SIDE)*(snake[i-1].y-oldSnake[i].y)/dist
            }
        }
        return snake  
    }

    function drawSnake(ctx,snake){
        for(let i=0; i<LENGTH; i++){
            let node = snake[i]
            ctx.fillRect(node.x, node.y, SIDE, SIDE)
        }
    }

    function clearCanvas(canvas){
        let ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    window.addEventListener('mousemove', (event) => {
        snake = calculateSnake(event.clientX, event.clientY, snake)
        clearCanvas(myCanvas)
        drawSnake(ctx, snake)
    })
}
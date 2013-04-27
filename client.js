var KEY = {
    up: 38,
    right: 39,
    down: 40,
    left: 37
};
var conn;
var canvas, c;

var gameState = {snakes: {}, apples: {}, lag: 0};
var lag = document.getElementById('lag');

conn = new WebSocket('ws://' + location.host + '/ws/');
conn.onclose = function(event) {
    console.log('<<< Connection closed >>>');
};
conn.onmessage = function(event) {
    gameState = JSON.parse(event.data);
};

canvas = document.getElementById('canvas');
c = canvas.getContext('2d');

var body = document.getElementsByTagName('body')[0];
body.onkeydown = function (event) {
    event.stopPropagation();
    conn.send(JSON.stringify([Date.now(), event.keyCode]));
    return false;
};


function render() {
    c.clearRect(0, 0, 800, 800);
    c.fillStyle = '#000000';
    var i, snake, part, apple;
    for (var snakeId in gameState.snakes) {
        if (gameState.snakes.hasOwnProperty(snakeId)) {
            snake = gameState.snakes[snakeId];
            if (snake.dead) {
                c.fillStyle = '#999999';
            } else {
                c.fillStyle = '#000000';
            }

            for (i = 0; i < snake.parts.length; i++) {
                part = snake.parts[i];
                c.fillRect(part.x * 10, part.y * 10, 10, 10);
            }
        }
    }
    c.fillStyle = '#FF0000';
    for (i = 0; i < gameState.apples.length; i++) {
        apple = gameState.apples[i];
        c.fillRect(apple.x * 10, apple.y * 10, 10, 10);
    }
    lag.innerText = gameState.lag;
}

var requestAnimFrame = window.requestAnimationFrame || mozRequestAnimationFrame;
(function animloop(){
    requestAnimFrame(animloop);
    render();
}());

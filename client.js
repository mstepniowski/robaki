var KEY = {
    up: 38,
    right: 39,
    down: 40,
    left: 37
};
var conn;
var canvas, c;

var gameState = {snakes: {}, apples: {}};
var pingMessage = document.getElementById('ping-message');

conn = new WebSocket('ws://' + location.host + '/ws/');
conn.onclose = function(event) {
    console.log('<<< Connection closed >>>');
};
conn.onmessage = function(event) {
    data = JSON.parse(event.data);
    if (data.event === 'update') {
        gameState = data.data;
    } else if (data.event === 'pong') {
        pingMessage.innerText = Date.now() - data.data;
    }
};

canvas = document.getElementById('canvas');
c = canvas.getContext('2d');

var body = document.getElementsByTagName('body')[0];
body.onkeydown = function (event) {
    if (event.keyCode === KEY.up || event.keyCode === KEY.right
        || event.keyCode === KEY.down || event.keyCode === KEY.left) {
        event.stopPropagation();
        conn.send(JSON.stringify({event: 'input',
                              time: Date.now(),
                              data: event.keyCode}));
        return false;
    }
};

function ping() {
    conn.send(JSON.stringify({event: 'ping', data: Date.now()}));
    setTimeout(ping, 1000);
}

conn.onopen = function () {
    ping();
}

function render() {
    c.clearRect(0, 0, 800, 800);
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
}

var requestAnimFrame = window.requestAnimationFrame || mozRequestAnimationFrame;
(function animloop(){
    requestAnimFrame(animloop);
    render();
}());

var game = require('./game.js');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8080, host: '0.0.0.0'});

var KEY = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
};

var gameState = game.newGame();
var clients = {};
var nextId = 0;

function handleInput(clients, state) {
    var player, i, clientId;
    var lastPressedKey;

    for (clientId in clients) {
        if (clients.hasOwnProperty(clientId)) {
            var client = clients[clientId];
            lastPressedKey = client.key;
            if (lastPressedKey === KEY.up) {
                game.changeDirection(client.snake, 'up');
            } else if (lastPressedKey === KEY.right) {
                game.changeDirection(client.snake, 'right');
            } else if (lastPressedKey === KEY.down) {
                game.changeDirection(client.snake, 'down');
            } else if (lastPressedKey === KEY.left) {
                game.changeDirection(client.snake, 'left');
            }
            client.key = null;
        }
    }
}

function sendNetworkUpdates(clients, state) {
    var clientId;
    for (clientId in clients) {
        if (clients.hasOwnProperty(clientId)) {
            var client = clients[clientId];
            var ws = client.connection;
            if (ws) {
                ws.send(JSON.stringify(state));
            }
        }
    }
}

function loop(clients, state) {
    var currentTime = Date.now();

    handleInput(clients, state);
    game.step(state);
    sendNetworkUpdates(clients, state);

    var timeTaken = Date.now() - currentTime;
    setTimeout(function () { loop(clients, state); }, Math.max(0, 100.0 - timeTaken));
}



wss.on('connection', function(ws) {
    var snake = game.addSnake(gameState);
    var client = {id: nextId++,
                  connection: ws,
                  snake: snake,
                  key: null};
    clients[client.id] = client;

    ws.on('message', function(message) {
        var data = JSON.parse(message);
        client.lag = Date.now() - data[0];
        client.key = parseInt(data[1], 10);
    });

    ws.on('close', function () {
        game.removeSnake(gameState, client.snake);
        delete clients[client.id];
    });

    ws.send(JSON.stringify(gameState));
});

loop(clients, gameState);

var game = require('./game.js');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8080});

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
                ws.send(JSON.stringify({event: 'update', data: state}), function (error) {
                    if (error) {
                        game.removeSnake(gameState, client.snake);
                        if (clients[client.id]) {
                            delete clients[client.id];
                        }
                    }
                });
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
                  key: null,
                  lag: 0};
    clients[client.id] = client;

    ws.on('message', function(message) {
        var data = JSON.parse(message);
        if (data.event === 'input') {
            client.key = parseInt(data.data, 10);
        } else if (data.event === 'ping') {
            ws.send(JSON.stringify({event: 'pong', data: data.data}), function () {});
        }
    });

    ws.on('close', function () {
        game.removeSnake(gameState, client.snake);
        delete clients[client.id];
    });

    ws.send(JSON.stringify({event: 'update', data: gameState}));
});

loop(clients, gameState);

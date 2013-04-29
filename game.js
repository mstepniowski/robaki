var nextId = 0;

function sortByKey(arr, key) {
    key = key || function (e) { return e };
    function cmp(a, b) {
        var aKey = key(a);
        var bKey = key(b);
        return (aKey === bKey) ? 0 : (aKey < bKey) ? -1 : 1;
    }
    arr.sort(cmp);
}

function newGame() {
    return {snakes: {}, apples: [], width: 80, height: 60, turn: 0, leaderboard: []};
}

function addSnake(state) {
    var snake = {
        id: nextId++,
        parts: [{x: 2, y: 2}],
        direction: 'right',
        ateApple: false,
        dead: false
    };
    state.snakes[snake.id] = snake;
    return snake;
}

function collidingDirection(snake) {
    if (snake.parts.length < 2) {
        return null;
    }
    var head = snake.parts[snake.parts.length - 1];
    var neck = snake.parts[snake.parts.length - 2];
    var x = head.x - neck.x;
    var y = head.y - neck.y;
    if (x === 1) {
        return 'left';
    } else if (x === -1) {
        return 'right';
    } else if (y === 1) {
        return 'up';
    } else if (y === -1) {
        return 'down';
    }
}

function head(snake) {
    return snake.parts[snake.parts.length - 1];
}

function changeDirection(snake, direction) {
    if (direction !== collidingDirection(snake)) {
        snake.direction = direction;
    }
}

function removeSnake(state, snake) {
    delete state.snakes[snake.id];
}

function growSnake(snake) {
    var head = snake.parts[snake.parts.length - 1];
    if (snake.direction === 'up') {
        snake.parts.push({x: head.x, y: head.y - 1});
    } else if (snake.direction === 'right') {
        snake.parts.push({x: head.x + 1, y: head.y});
    } else if (snake.direction === 'down') {
        snake.parts.push({x: head.x, y: head.y + 1});
    } else if (snake.direction === 'left') {
        snake.parts.push({x: head.x - 1, y: head.y});
    }
}

function moveSnake(snake) {
    if (snake.direction) {
        growSnake(snake);
        snake.parts.shift(1);
    }
}

var APPLE = 1;
var HEAD = 2;
var SNAKE = 3;

function checkCollisions(state) {
    var board = [];
    var part, snake, i, j, arr;
    var snakeId;

    for (i = 0; i < state.width + 2; ++i) {
        arr = [];
        for (j = 0; j < state.height + 2; ++j) {
            arr.push((i === 0 || i === state.width + 1 || j === 0 || j === state.height + 1) ? SNAKE : 0);
        }
        board.push(arr);
    }

    for (i = 0; i < state.apples.length; ++i) {
        var apple = state.apples[i];
        board[apple.x + 1][apple.y + 1] = APPLE;
    }

    for (snakeId in state.snakes) {
        if (state.snakes.hasOwnProperty(snakeId)) {
            snake = state.snakes[snakeId];
            for (i = 0; i < snake.parts.length; i++) {
                part = snake.parts[i];
                if (board[part.x + 1][part.y + 1] === APPLE) {
                    snake.ateApple = true;
                }
                if (board[part.x + 1][part.y + 1] < SNAKE) {
                    if (i === snake.parts.length - 1) {
                        board[part.x + 1][part.y + 1] = HEAD;
                    } else {
                        board[part.x + 1][part.y + 1] = SNAKE;
                    }
                }
            }
        }
    }

    for (snakeId in state.snakes) {
        if (state.snakes.hasOwnProperty(snakeId)) {
            snake = state.snakes[snakeId];
            var h = head(snake);
            if (board[h.x + 1][h.y + 1] === SNAKE) {
                snake.dead = true;
            }
        }
    }

    state.apples = [];
    for (i = 0; i < state.width; ++i) {
        for (j = 0; j < state.height; ++j) {
            if (board[i + 1][j + 1] === APPLE) {
                state.apples.push({x: i, y: j});
            }
        }
    }
}

function step(state) {
    var snake, snakeId;
    for (snakeId in state.snakes) {
        if (state.snakes.hasOwnProperty(snakeId)) {
            snake = state.snakes[snakeId];
            if (snake.dead) {
            } else if (snake.ateApple) {
                growSnake(snake);
                snake.ateApple = false;
            } else {
                moveSnake(snake);
            }
        }
    }
    if (state.turn % 30 === 0) {
        state.apples.push({x: Math.random() * state.width | 0,
                           y: Math.random() * state.height | 0});
    }
    state.turn += 1;
    checkCollisions(state);
}

if (typeof exports === 'undefined') {
    exports = {}
}

exports.step = step;
exports.newGame = newGame;
exports.addSnake = addSnake;
exports.removeSnake = removeSnake;
exports.changeDirection = changeDirection;

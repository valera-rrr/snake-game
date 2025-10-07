class GameField {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.init();
    }

    init() {
        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(null);
            }
            this.grid.push(row);
        }
    }

    render() {
        const field = document.getElementById('game-field');
        field.innerHTML = '';
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                if (this.grid[y][x]) {
                    cell.classList.add(this.grid[y][x]);
                }
                field.appendChild(cell);
            }
        }
    }
}

class Snake {
    constructor(gameField) {
        this.gameField = gameField;
        this.body = [{x: Math.floor(gameField.width / 2), y: Math.floor(gameField.height / 2)}];
        this.direction = 'right';
        this.growing = false;
    }

    move() {
        const head = { ...this.body[0] };
        
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        if (head.x < 0) head.x = this.gameField.width - 1;
        if (head.x >= this.gameField.width) head.x = 0;
        if (head.y < 0) head.y = this.gameField.height - 1;
        if (head.y >= this.gameField.height) head.y = 0;

        if (this.checkCollision(head)) {
            this.endGame();
            return;
        }

        this.body.unshift(head);
        if (this.growing) {
            this.growing = false;
        } else {
            this.body.pop();
        }
    }

    grow() {
        this.growing = true;
    }

    checkCollision(head) {
        return this.body.some(segment => segment.x === head.x && segment.y === head.y);
    }

    endGame() {
        alert('Игра окончена');
    }

    render() {
        this.gameField.grid.forEach(row => row.fill(null));
        this.body.forEach(segment => {
            this.gameField.grid[segment.y][segment.x] = 'snake';
        });
    }
}

class Apple {
    constructor(gameField) {
        this.gameField = gameField;
        this.position = this.spawn();
    }

    spawn() {
        let x, y;
        do {
            x = Math.floor(Math.random() * this.gameField.width);
            y = Math.floor(Math.random() * this.gameField.height);
        } while (this.gameField.grid[y][x] === 'snake');
        return { x, y };
    }

    render() {
        this.gameField.grid[this.position.y][this.position.x] = 'apple';
    }
}

class Game {
    constructor() {
        this.gameField = new GameField(10, 10);
        this.snake = new Snake(this.gameField);
        this.apple = new Apple(this.gameField);
        this.currentScore = 0;
        this.bestScore = localStorage.getItem('bestScore') || 0;
        this.isGameOver = false;

        this.updateScore();
        this.addEventListeners();
        this.gameLoop();
    }

    addEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.isGameOver) return;
            switch (e.key) {
                case 'ArrowUp': this.snake.direction = 'up'; break;
                case 'ArrowDown': this.snake.direction = 'down'; break;
                case 'ArrowLeft': this.snake.direction = 'left'; break;
                case 'ArrowRight': this.snake.direction = 'right'; break;
            }
        });

        document.getElementById('restart-button').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('game-field').addEventListener('click', () => {
            if (!this.isGameOver) return;
            this.isGameOver = false;
            this.restartGame();
        });
    }

    gameLoop() {
        if (this.isGameOver) return;

        setTimeout(() => {
            this.snake.move();
            this.snake.render();

            if (this.snake.body[0].x === this.apple.position.x && this.snake.body[0].y === this.apple.position.y) {
                this.snake.grow();
                this.apple = new Apple(this.gameField);
                this.currentScore++;
                this.updateScore();

                if (this.currentScore > this.bestScore) {
                    this.bestScore = this.currentScore;
                    localStorage.setItem('bestScore', this.bestScore);
                }
            }

            this.apple.render();
            this.gameField.render();
            this.gameLoop();
        }, 500);
    }

    updateScore() {
        document.getElementById('current-score').textContent = this.currentScore;
        if (this.bestScore > 0) {
            document.getElementById('best-score').style.display = 'inline';
            document.getElementById('best-score-value').textContent = this.bestScore;
        }
    }

    restartGame() {
        this.gameField.init();
        this.snake = new Snake(this.gameField);
        this.apple = new Apple(this.gameField);
        this.currentScore = 0;
        this.isGameOver = false;
        this.updateScore();
        this.gameLoop();
    }
}

new Game();

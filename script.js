class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.dx = 1;
        this.dy = 0;
        this.score = 0;
        this.gameSpeed = 100;
        this.isPaused = false;
        
        // 事件监听
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.gameLoop = setInterval(this.update.bind(this), this.gameSpeed);
    }

    // 生成食物位置
    generateFood() {
        return {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
    }

    // 游戏主循环
    update() {
        if (this.isPaused) return;
        
        // 移动蛇头
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // 碰撞检测
        if (this.checkCollision(head)) {
            clearInterval(this.gameLoop);
            alert('游戏结束！得分：' + this.score);
            location.reload();
            return;
        }

        this.snake.unshift(head);

        // 吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('score').textContent = '得分：' + this.score;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    // 绘制游戏元素
    draw() {
        // 清空画布
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制墙壁边框
        this.ctx.fillStyle = '#333';
        // 左右墙壁
        this.ctx.fillRect(0, 0, this.gridSize, this.canvas.height);
        this.ctx.fillRect(this.canvas.width - this.gridSize, 0, this.gridSize, this.canvas.height);
        // 上下墙壁
        this.ctx.fillRect(0, 0, this.canvas.width, this.gridSize);
        this.ctx.fillRect(0, this.canvas.height - this.gridSize, this.canvas.width, this.gridSize);

        // 绘制食物
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.food.x*this.gridSize, this.food.y*this.gridSize, 
                        this.gridSize-2, this.gridSize-2);

        // 绘制蛇
        this.ctx.fillStyle = 'lime';
        this.snake.forEach((segment, index) => {
            this.ctx.fillRect(segment.x*this.gridSize, segment.y*this.gridSize,
                            this.gridSize-2, this.gridSize-2);
        });
    }

    // 碰撞检测
    checkCollision(position) {
        return position.x < 1 || position.x >= this.tileCount - 1 ||
               position.y < 1 || position.y >= this.tileCount - 1 ||
               this.snake.some((segment, index) => 
                   index !== 0 && segment.x === position.x && segment.y === position.y
               );
    }

    // 处理键盘输入
    handleKeyPress(event) {
        switch(event.key) {
            case 'ArrowUp':
                if (this.dy === 0) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'ArrowDown':
                if (this.dy === 0) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'ArrowLeft':
                if (this.dx === 0) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'ArrowRight':
                if (this.dx === 0) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
            case ' ':
                this.isPaused = !this.isPaused;
                break;
        }
    }
}

// 初始化游戏
new SnakeGame();
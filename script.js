class SnakeGame {
    constructor(speed) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameSpeed = speed;
        // 根据速度设置对应的得分
        this.pointsPerFood = this.getPointsBySpeed(speed);
        this.comboTimeout = this.getComboTimeoutBySpeed(speed); // 根据速度设置连击持续时间
        this.isPaused = false;
        
        // 事件监听
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.addEventListener('keydown', this.startMovement.bind(this));
        this.gameLoop = setInterval(this.update.bind(this), this.gameSpeed);

        this.combo = 0;
        this.comboTimer = null;
        this.comboFadeInterval = null; // 用于渐变动画的计时器
    }

    // 根据速度返回对应的得分
    getPointsBySpeed(speed) {
        switch(speed) {
            case 150: return 5;  // 慢速 5分
            case 100:  return 10; // 中速 10分
            case 50:  return 20; // 快速 20分
            // default:  return 10;
        }
    }

    // 根据速度返回连击持续时间
    getComboTimeoutBySpeed(speed) {
        switch(speed) {
            case 150: return 3000; // 慢速 3秒
            case 100: return 2000; // 中速 2秒
            case 50:  return 1000; // 快速 1秒
            default: return 2000;
        }
    }

    // 生成食物位置
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * (this.tileCount - 2)) + 1,
                y: Math.floor(Math.random() * (this.tileCount - 2)) + 1
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        return food;
    }

    // 游戏主循环
    update() {
        if (this.isPaused) return;
        
        // 移动蛇头
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // 碰撞检测
        if (this.checkCollision(head)) {
            clearInterval(this.gameLoop);
            if (this.comboTimer) {
                clearTimeout(this.comboTimer);
            }
            alert('游戏结束！得分：' + this.score);
            location.reload();
            return;
        }

        this.snake.unshift(head);

        // 吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.handleFoodEaten();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    // 处理吃到食物的逻辑
    handleFoodEaten() {
        // 增加连击数
        this.combo++;
        // 更新显示
        this.updateComboDisplay();
        
        // 重置连击计时器和渐变动画
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }
        if (this.comboFadeInterval) {
            clearInterval(this.comboFadeInterval);
        }
        
        // 设置新的计时器
        this.comboTimer = setTimeout(() => {
            this.combo = 0;
            this.updateComboDisplay();
        }, this.comboTimeout);

        // 设置渐变动画
        this.startComboFade();

        // 更新分数和食物
        this.score += this.pointsPerFood;
        document.getElementById('score').textContent = '得分：' + this.score;
        this.food = this.generateFood();
    }

    // 开始连击渐变动画
    startComboFade() {
        const comboElement = document.getElementById('combo');
        if (this.combo >= 2) {
            // 重置opacity
            comboElement.style.opacity = '1';
            
            // 清除之前的动画
            if (this.comboFadeInterval) {
                clearInterval(this.comboFadeInterval);
            }
            
            // 计算每个间隔需要减少的透明度
            const steps = 50; // 动画更新次数
            const interval = this.comboTimeout / steps;
            const opacityStep = 0.7 / steps; // 最终透明度为0.3，所以减少0.7
            
            let currentStep = 0;
            this.comboFadeInterval = setInterval(() => {
                currentStep++;
                if (currentStep <= steps) {
                    comboElement.style.opacity = (1 - opacityStep * currentStep).toString();
                } else {
                    clearInterval(this.comboFadeInterval);
                }
            }, interval);
        }
    }

    // 更新连击显示
    updateComboDisplay() {
        const comboElement = document.getElementById('combo');
        const comboCountElement = document.getElementById('comboCount');
        
        if (this.combo >= 2) {
            comboElement.style.display = 'block';
            comboCountElement.textContent = this.combo;
            // 重置动画
            comboElement.style.animation = 'none';
            comboElement.offsetHeight; // 触发重排
            comboElement.style.animation = 'pulse 0.5s ease-in-out';
        } else {
            comboElement.style.display = 'none';
        }
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

    // 开始移动
    startMovement(event) {
        if (this.dx !== 0 || this.dy !== 0) return;
        switch(event.key) {
            case 'ArrowUp':
                this.dx = 0;
                this.dy = -1;
                break;
            case 'ArrowDown':
                this.dx = 0;
                this.dy = 1;
                break;
            case 'ArrowLeft':
                this.dx = -1;
                this.dy = 0;
                break;
            case 'ArrowRight':
                this.dx = 1;
                this.dy = 0;
                break;
        }
    }
}

// 初始化游戏
document.getElementById('startButton').addEventListener('click', function() {
    const speed = parseInt(document.getElementById('speed').value);
    document.querySelector('.start-container').style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';
    new SnakeGame(speed);
});
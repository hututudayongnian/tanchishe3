// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// 游戏常量
const GRID_SIZE = 20;
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// 游戏变量
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameInterval;
let gameSpeed = 150;
let isPaused = false;
let isGameOver = false;

// 初始化高分
highScoreElement.textContent = highScore;

// 初始化游戏
function initGame() {
    // 重置蛇的初始位置
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    // 重置方向
    direction = 'right';
    nextDirection = 'right';
    
    // 重置分数
    score = 0;
    scoreElement.textContent = score;
    
    // 生成食物
    generateFood();
    
    // 重置游戏状态
    isPaused = false;
    isGameOver = false;
    pauseBtn.textContent = '暂停';
    
    // 绘制初始状态
    draw();
}

// 生成食物
function generateFood() {
    // 确保食物不会出现在蛇身上
    let overlapping;
    do {
        overlapping = false;
        food.x = Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE));
        food.y = Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE));
        
        // 检查是否与蛇重叠
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === food.x && snake[i].y === food.y) {
                overlapping = true;
                break;
            }
        }
    } while (overlapping);
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制蛇头
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(snake[0].x * GRID_SIZE, snake[0].y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    
    // 绘制蛇身
    ctx.fillStyle = '#8BC34A';
    for (let i = 1; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * GRID_SIZE, snake[i].y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        // 添加蛇身花纹
        ctx.strokeStyle = '#689F38';
        ctx.strokeRect(snake[i].x * GRID_SIZE, snake[i].y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
    
    // 绘制食物
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 如果游戏暂停，显示暂停提示
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏暂停', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
    
    // 如果游戏结束，显示游戏结束提示
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
        ctx.font = '20px Arial';
        ctx.fillText(`最终分数: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.fillText('按重置按钮重新开始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    }
}

// 移动蛇
function moveSnake() {
    // 更新方向
    direction = nextDirection;
    
    // 创建新的蛇头
    const head = { x: snake[0].x, y: snake[0].y };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 生成新食物
        generateFood();
        
        // 加快游戏速度
        if (gameSpeed > 50) {
            gameSpeed -= 2;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    } else {
        // 如果没吃到食物，移除尾部
        snake.pop();
    }
    
    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // 添加新的头部
    snake.unshift(head);
    
    // 绘制游戏
    draw();
}

// 检查碰撞
function checkCollision(head) {
    // 检查边界碰撞
    if (head.x < 0 || head.x >= CANVAS_WIDTH / GRID_SIZE || 
        head.y < 0 || head.y >= CANVAS_HEIGHT / GRID_SIZE) {
        return true;
    }
    
    // 检查自身碰撞
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    draw();
}

// 游戏主循环
function gameLoop() {
    if (!isPaused && !isGameOver) {
        moveSnake();
    }
}

// 处理键盘输入
function handleKeyDown(e) {
    // 根据按键设置下一个方向，但不允许直接反向
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') {
                nextDirection = 'up';
            }
            break;
        case 'ArrowDown':
            if (direction !== 'up') {
                nextDirection = 'down';
            }
            break;
        case 'ArrowLeft':
            if (direction !== 'right') {
                nextDirection = 'left';
            }
            break;
        case 'ArrowRight':
            if (direction !== 'left') {
                nextDirection = 'right';
            }
            break;
        case ' ': // 空格键暂停/继续
            if (!isGameOver) {
                togglePause();
            }
            break;
    }
}

// 处理触摸滑动
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
    if (isGameOver) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // 确定滑动方向（水平还是垂直）
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (diffX > 50 && direction !== 'left') {
            nextDirection = 'right';
        } else if (diffX < -50 && direction !== 'right') {
            nextDirection = 'left';
        }
    } else {
        // 垂直滑动
        if (diffY > 50 && direction !== 'up') {
            nextDirection = 'down';
        } else if (diffY < -50 && direction !== 'down') {
            nextDirection = 'up';
        }
    }
}

// 处理触摸按钮点击
function setupTouchButtons() {
    // 方向按钮事件监听
    if (document.getElementById('upBtn')) {
        document.getElementById('upBtn').addEventListener('click', () => {
            if (direction !== 'down') {
                nextDirection = 'up';
            }
        });
    }
    
    if (document.getElementById('downBtn')) {
        document.getElementById('downBtn').addEventListener('click', () => {
            if (direction !== 'up') {
                nextDirection = 'down';
            }
        });
    }
    
    if (document.getElementById('leftBtn')) {
        document.getElementById('leftBtn').addEventListener('click', () => {
            if (direction !== 'right') {
                nextDirection = 'left';
            }
        });
    }
    
    if (document.getElementById('rightBtn')) {
        document.getElementById('rightBtn').addEventListener('click', () => {
            if (direction !== 'left') {
                nextDirection = 'right';
            }
        });
    }
    
    // 移动设备控制按钮事件监听
    if (document.getElementById('mobileStartBtn')) {
        document.getElementById('mobileStartBtn').addEventListener('click', startGame);
    }
    if (document.getElementById('mobilePauseBtn')) {
        document.getElementById('mobilePauseBtn').addEventListener('click', togglePause);
    }
    if (document.getElementById('mobileResetBtn')) {
        document.getElementById('mobileResetBtn').addEventListener('click', resetGame);
    }
}

// 暂停/继续游戏
function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
    draw();
}

// 开始游戏
function startGame() {
    if (isGameOver) {
        initGame();
    }
    
    if (!gameInterval || isPaused) {
        clearInterval(gameInterval);
        isPaused = false;
        pauseBtn.textContent = '暂停';
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

// 重置游戏
function resetGame() {
    clearInterval(gameInterval);
    initGame();
}

// 事件监听
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeyDown);

// 初始化游戏
initGame();

// 设置触摸控制
setupTouchButtons();

// 添加触摸滑动事件监听
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchend', handleTouchEnd, false);

// 阻止触摸事件的默认行为，避免页面滚动
document.addEventListener('touchmove', function(e) {
    if (e.target === canvas || canvas.contains(e.target)) {
        e.preventDefault();
    }
}, { passive: false });

// 自动开始游戏（延迟1秒，给用户一些准备时间）
setTimeout(startGame, 1000);

// 优化移动设备上的游戏速度
function optimizeForDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        gameSpeed = 180; // 移动设备上稍微减慢游戏速度，便于操作
    }
}

// 执行设备优化
optimizeForDevice();

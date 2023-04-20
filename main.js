class Vec {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    set length(value) {
        const fact = value / this.len;
        this.x *= fact;
        this.y *= fact;
    }
}

Vec.prototype.addTo = function (v) {
    this.x += v.x;
    this.y += v.y;
    return this;
};

Vec.prototype.add = function (v) {
    var result = this.copy();
    return result.addTo(v);
};

Vec.prototype.subtractFrom = function (v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
};

Vec.prototype.subtract = function (v) {
    var result = this.copy();
    return result.subtractFrom(v);
};

Vec.prototype.divideBy = (v) => {
    this.x /= v.x;
    this.y /= v.y;
    return this;
};

Vec.prototype.divide = function (v) {
    var result = this.copy();
    return result.divideBy(v);
};

Vec.prototype.dot = function (v) {
    var res = this.x * v.x + this.y * v.y;
    return res;
};

Vec.prototype.multBy = function (scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
};

Vec.prototype.mult = function (v) {
    var result = this.copy();
    return result.multBy(v);
};

Vec.prototype.multiplyWith = function (v) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
};

Vec.prototype.multiply = function (v) {
    var result = this.copy();
    return result.multiplyWith(v);
};

Vec.prototype.copy = function () {
    return new Vec(this.x, this.y);
};

class Rect {
    constructor(w, h) {
        this.pos = new Vec();
        this.size = new Vec(w, h);
    }
    get left() {
        return this.pos.x - this.size.x / 2;
    }
    get right() {
        return this.pos.x + this.size.x / 2;
    }
    get top() {
        return this.pos.y - this.size.y / 2;
    }
    get bottom() {
        return this.pos.y + this.size.y / 2;
    }
}

class Circle {
    constructor(r, s = 0) {
        this.pos = new Vec();
        this.size = r;
        this.circleStart = s;
    }
    get left() {
        return this.pos.x - this.size / 2;
    }
    get right() {
        return this.pos.x + this.size / 2;
    }
    get top() {
        return this.pos.y - this.size / 2;
    }
    get bottom() {
        return this.pos.y + this.size / 2;
    }
}

class Goal extends Rect {
    constructor() {
        super(5, 200);
    }
}

class CircleBall extends Circle {
    constructor(r, s = 0) {
        super(r, s);
        this.vel = new Vec();
        this.weight = 4;
    }
}

class CirclePlayer extends Circle {
    constructor(r) {
        super(r);
        this.score = 0;
        this.weight = 10;
        this.vel = new Vec();
        this.ballTouched = false;
        this.previousFramePosition = new Vec();
    }
}

class Game {
    constructor(canvas) {
        //canvas dimensions depend on screen size
        canvas.width = innerWidth <= 1200 ? innerWidth * 0.8 : 1000;
        canvas.height = (canvas.width * 5) / 8;
        //---------------------------------------

        //ensure that canvas height isn't bigger than screen
        if (canvas.height > innerHeight) {
            for (let i = 0; canvas.height > 0.8 * innerHeight; i++) {
                canvas.width = innerWidth * 0.8 - i;
                canvas.height = (canvas.width * 5) / 8;
            }
        }
        //---------------------------------------

        //touchpad position depends on canvas/screen size and orientation
        if (innerHeight < innerWidth * 1.2 && navigator.userAgentData.mobile) {
            touchpad.style.display = "none";
            canvas.style.position = "absolute";
            canvas.style.bottom = "20px";
            canvas.style.left = "calc(50% - canvas.width/2)";
            canvas.style.zIndex = "2";
            canvas.style.opacity = "0.9";
            if (canvas.width < innerWidth / 2) {
                const txt = document.querySelectorAll("header, #score");
                console.log(txt);
                txt.forEach((txt) => {
                    txt.style.alignSelf = "flex-end";
                    txt.style.marginRight = "10vw";
                });
                txt[0].style.marginRight = "13vw";
                touchpad.style.display = "flex";
                touchpad.style.position = "absolute";
                touchpad.style.width = "40vw";
                touchpad.style.height = "70vh";
                touchpad.style.right = "20px";
                canvas.style.left = "20px";
            }
        }
        if (canvas.height < innerHeight / 2 && navigator.userAgentData.mobile) {
            touchpad.style.display = "flex";
        }
        //---------------------------------------

        //creating objects
        this._canvas = canvas;
        this._context = canvas.getContext("2d");

        this.circleBall = new CircleBall(this._canvas.width / 40);

        this.circlePlayers = [
            new CirclePlayer(this._canvas.width / 15), // was 20
            new CirclePlayer(this._canvas.width / 15), // was 20
        ];
        //---------------------------------------

        //objects used by AI
        this.aiHitVecFlag = true;
        this.aiHitVecVel = new Vec();
        this.timer = 0;

        this.aIPlayerInitialPosX =
            this._canvas.width - this.circlePlayers[0].size * 1.5;
        //---------------------------------------

        //initial positions of players
        this.circlePlayers[0].pos.x = this.circlePlayers[0].size * 1.5;
        this.circlePlayers[1].pos.x = this.aIPlayerInitialPosX;
        this.circlePlayers.forEach((player) => {
            player.pos.y = this._canvas.height / 2;
        });
        //---------------------------------------

        this.gameTime = 180; //gametime in sec

        //animationframe - call the update and timer function with the constant time as an arg in every frame.
        let lastTime;
        const callback = (millis) => {
            if (lastTime) {
                this.timer += millis - lastTime; //const time between frames
                this.update((millis - lastTime) / 1000); //calling the update finction with const time in sec
                this.countDown(this.timer);
            }
            lastTime = millis;
            requestAnimationFrame(callback);
        };

        callback();
        //---------------------------------------

        this.newGame();
    }

    //objects dawing
    draw() {
        this._context.fillStyle = "#000";
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this._context.fillStyle = "#f0f";
        this._context.fillRect(
            0,
            this._canvas.height / 3,
            this._canvas.width / 80,
            this._canvas.height / 3
        );
        this._context.fillRect(
            this._canvas.width - this._canvas.width / 80,
            this._canvas.height / 3,
            this._canvas.width,
            this._canvas.height / 3
        );
        this.drawCircle(this.circleBall);
        this.circlePlayers.forEach((player) => this.drawCircle(player));

        document.getElementById(
            "getScore"
        ).innerHTML = `${this.circlePlayers[0].score} : ${this.circlePlayers[1].score}`;
    }

    drawRect(rect) {
        this._context.fillStyle = "#fff";
        this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
    }

    drawCircle(circle) {
        this._context.fillStyle = "#fff";
        this._context.beginPath();
        this._context.arc(
            circle.pos.x,
            circle.pos.y,
            circle.size,
            circle.circleStart,
            2 * Math.PI
        );
        this._context.fill();
    }
    //---------------------------------------

    reset(playerId) {
        if (playerId === 1) {
            this.circleBall.pos.x = this._canvas.width / 4;
            this.circleBall.pos.y = this._canvas.height / 2;
            // this.circlePlayers.forEach(player => {player.ballTouched = false})
        } else {
            this.circleBall.pos.x =
                this.circlePlayers[1].pos.x - 2 * this.circlePlayers[1].size;
            this.circleBall.pos.y =
                this._canvas.height / 2 +
                (Math.random() > 0.5
                    ? 50 * Math.random()
                    : -50 * Math.random());
            this.circlePlayers[1].pos.y =
                this._canvas.height / 2 +
                (Math.random() > 0.5
                    ? 50 * Math.random()
                    : -50 * Math.random());
            this.circlePlayers[1].pos.x = this.aIPlayerInitialPosX;
        }
        this.circleBall.vel.x = 0;
        this.circleBall.vel.y = 0;
        // this.circlePlayers[1].ballTouched = true;
        this.circlePlayers.forEach((player) => {
            player.ballTouched = false;
        });
        // setTimeout(() => {this.circlePlayers.forEach(player => {player.ballTouched = false})}, 1000);
    }

    //reset touch flag, ball velocity and positions of players and ball
    resetPositions() {
        this.circleBall.pos.x = this._canvas.width / 2;
        this.circleBall.pos.y = this._canvas.height / 2;
        this.circleBall.vel.x = 0;
        this.circleBall.vel.y = 0;

        this.circlePlayers[0].pos.x = this.circlePlayers[0].size * 1.5;
        this.circlePlayers[1].pos.x = this.aIPlayerInitialPosX;
        this.circlePlayers.forEach((player) => {
            player.pos.y = this._canvas.height / 2;
            player.ballTouched = false;
        });
    }
    //---------------------------------------

    newGame() {
        this.circleBall.pos.x = this._canvas.width / 2;
        this.circleBall.pos.y = this._canvas.height / 2;
        this.circleBall.vel.x = 0;
        this.circleBall.vel.y = 0;

        this.circlePlayers[0].pos.x = this.circlePlayers[0].size * 1.5;
        this.circlePlayers[1].pos.x = this.aIPlayerInitialPosX;
        this.circlePlayers.forEach((player) => {
            player.pos.y = this._canvas.height / 2;
            player.ballTouched = false;
            player.score = 0;
        });

        this.timer = 0;
    }

    //phisics of hits
    collideWith = (player) => {
        const n = this.circleBall.pos.subtract(player.pos); //finding normal Vector between ball and player in hitting moment
        const dist = n.length;

        player.vel = player.pos
            .subtract(player.previousFramePosition)
            .mult(100); //velocity vector of player found by subtracting positions from two animationframes
        player.previousFramePosition.x = player.pos.x; //previous position container
        player.previousFramePosition.y = player.pos.y; //previous position container

        if (dist > player.size + this.circleBall.size) return; //moment of colliding
        if (player.ballTouched) return; //this flag solve issue of double hit (sometimes animationframe delay cause that ball is inside of ball and instructions below was done second time )

        //the next lines are phisical calculations to find correct vectors of collision
        const un = n.mult(1 / n.length); // unit normal vector
        const ut = new Vec(-un.y, un.x); //unit tangent vector

        const v1n = un.dot(player.vel); //velocities un ut ----------- scalar
        const v1t = ut.dot(player.vel);
        const v2n = un.dot(this.circleBall.vel);
        const v2t = ut.dot(this.circleBall.vel);

        //velocities after cooliding - take into account the speed and mass of obcjects

        let v1tTag = v1t;
        let v2tTag = v2t;
        let v1nTag =
            (v1n * (player.weight - this.circleBall.weight) +
                2 * this.circleBall.weight * v2n) /
            (this.circleBall.weight + player.weight);
        let v2nTag =
            (v2n * (this.circleBall.weight - player.weight) +
                2 * player.weight * v1n) /
            (this.circleBall.weight + player.weight);

        v1nTag = un.mult(v1nTag);
        v1tTag = ut.mult(v1tTag);
        v2nTag = un.mult(v2nTag);
        v2tTag = ut.mult(v2tTag);

        this.circleBall.vel = v2nTag.add(v2tTag); //final result - velocity vector of ball after hiting
        //-----------------------------------------

        if (player !== this.circlePlayers[0])
            this.circlePlayers[0].ballTouched = false; //release hiting calculations for second player
        if (player !== this.circlePlayers[1])
            this.circlePlayers[1].ballTouched = false; //release hiting calculations for second player

        player.ballTouched = true; //block hiting calculations for current player
    };

    handleCollisions = () => {
        this.circlePlayers.forEach((player) => this.collideWith(player));
    };

    //AI PLAYER LOGIC
    playerAI = (dt) => {
        this.circlePlayers[1].vel.x = 200;
        this.circlePlayers[1].vel.y = 100;

        //follow the ball in Y direction
        if (
            this.circleBall.pos.y > this.circlePlayers[1].pos.y &&
            this.circlePlayers[1].pos.y <
                this._canvas.height -
                    this._canvas.height / 3 +
                    this.circlePlayers[1].size
        ) {
            this.circlePlayers[1].pos.y += this.circlePlayers[1].vel.y * dt;
        }
        if (
            this.circleBall.pos.y < this.circlePlayers[1].pos.y &&
            this.circlePlayers[1].pos.y >
                this._canvas.height / 3 - this.circlePlayers[1].size
        ) {
            this.circlePlayers[1].pos.y -= this.circlePlayers[1].vel.y * dt;
        }

        //taking into acount player move - you can try to cheat opponent
        if (
            this.circleBall.pos.x < this._canvas.width / 2 &&
            !this.circlePlayers[0].ballTouched
        ) {
            this.circlePlayers[1].pos.y +=
                (this.circlePlayers[0].vel.y / 2) * dt;
        }

        //checking distance between center of AI and ball - this is also fixed vector of hiting when the distance between ball and player will be matching to first condition in next "if"
        let aiHitVec = this.circleBall.pos.subtract(this.circlePlayers[1].pos);

        //hiting contitions
        if (
            aiHitVec.length < 3 * this.circlePlayers[1].size &&
            !this.circlePlayers[1].ballTouched &&
            this.circlePlayers[1].pos.x > canvas.width / 2 &&
            this.circleBall.pos.x < this.circlePlayers[1].pos.x
        ) {
            if (this.aiHitVecFlag) {
                this.aiHitVecVel.x = aiHitVec.x;
                this.aiHitVecVel.y = aiHitVec.y;
                this.aiHitVecFlag = false;
            } //cathing the hiting vector in moment of fulfilling conditions and not change until hit. Otherwise the vector was updated in each dt interval)
            this.circlePlayers[1].pos.x += this.aiHitVecVel.x * dt * 5; // x velocity of hiting
            this.circlePlayers[1].pos.y += this.aiHitVecVel.y * dt * 3; //y velocity of hiting (if decided upwards or downwards)
        } else {
            //back to initial position on X
            this.circlePlayers[1].pos.x < this.aIPlayerInitialPosX
                ? (this.circlePlayers[1].pos.x +=
                      this.circlePlayers[1].vel.x * dt)
                : this.aIPlayerInitialPosX;
            this.aiHitVecFlag = true;
        }

        //solving issue when the ball is behind/inside the AI
        if (
            this.circleBall.vel.length < 50 &&
            this.circleBall.pos.x >=
                this.aIPlayerInitialPosX - this.circlePlayers[1].size
        ) {
            this.circleBall.vel.x = -200;
        }
        if (aiHitVec.length < this.circlePlayers[1].size)
            this.circleBall.vel.x = -200;
    };

    //timer
    countDown = (time) => {
        let lastTime = this.gameTime - time / 1000;
        let min = Math.floor((lastTime % (60 * 60)) / 60);
        let sec = Math.floor(lastTime % 60);
        let timer = document.getElementById("timer");

        if (min + sec >= 0) {
            timer.innerHTML = `TIME: ${min}min ${sec}sec`;
        } else {
            timer.innerHTML = `TIME'S UP !!!`;
            this.circleBall.vel.multBy(960 / 1000); //increasing the table friction when times up
        }
    };

    //move the objects in canvas in animationframe interval
    update(dt) {
        this.circleBall.pos.x += (this.circleBall.vel.x * dt) / 3; //ball moving
        this.circleBall.pos.y += (this.circleBall.vel.y * dt) / 3;
        this.circleBall.vel.multBy(998 / 1000); //table friction

        //goal or hit the vertical wall and change dierction of ball
        if (
            this.circleBall.pos.x < 0 ||
            this.circleBall.pos.x > this._canvas.width
        ) {
            if (
                (this.circleBall.pos.y > this._canvas.height / 3 &&
                    this.circleBall.pos.y <
                        this._canvas.height - this._canvas.height / 3) ||
                (this.circleBall.pos.y > this._canvas.height / 3 &&
                    this.circleBall.pos.y <
                        this._canvas.height - this._canvas.height / 3)
            ) {
                const playerId = (this.circleBall.vel.x < 0) | 0; // "| 0" convert boolean true or false to number 1 or 0. If ball goes left (vel<0) then playerID = 1 / if ball goes right playerID=0
                this.circlePlayers[playerId].score++;
                this.reset(playerId);
            } else {
                this.circleBall.vel.x = -this.circleBall.vel.x;
                this.circlePlayers.forEach((player) => {
                    player.ballTouched = false;
                });
            }
        }
        //------------------------------------------------------

        //hiting top or bootom
        if (
            this.circleBall.top < 0 ||
            this.circleBall.bottom > this._canvas.height
        ) {
            this.circleBall.vel.y = -this.circleBall.vel.y;
            this.circlePlayers.forEach((player) => {
                player.ballTouched = false;
            });
        }

        //second touch by the same player can be done when the distance between center of player ande ball will be bigger than 3x player radious.
        // this.circlePlayers.forEach(player => {if(player.ballTouched === true && this.circleBall.pos.subtract(player.pos).length > 2 * player.size) player.ballTouched = false})
        if (
            this.circlePlayers[0].ballTouched === true &&
            this.circleBall.pos.subtract(this.circlePlayers[0].pos).length >
                2 * this.circlePlayers[0].size
        )
            this.circlePlayers[0].ballTouched = false;

        //reset when ball is out of canvas
        if (
            this.circleBall.pos.x > canvas.width + 20 ||
            this.circleBall.pos.x < -20 ||
            this.circleBall.pos.y > canvas.height + 20 ||
            this.circleBall.pos.y < -20
        ) {
            this.reset();
        }

        this.draw();

        this.playerAI(dt);

        this.handleCollisions();
    }
}

const canvas = document.getElementById("game");
const touchpad = document.getElementById("touchpad");
const newGamebtn = document.getElementById("newGameBtn");
const resetPositionsBtn = document.getElementById("resetPositionsBtn");
const game = new Game(canvas);

let touchpadInitX;
let touchpadInitY;
let circlePlayerCurrentPositionX;
let circlePlayerCurrentPositionY;

canvas.addEventListener("mousemove", (e) => {
    game.circlePlayers[0].pos.x = e.offsetX;
    game.circlePlayers[0].pos.y = e.offsetY;
});

canvas.addEventListener("touchmove", (e) => {
    game.circlePlayers[0].pos.x = e.touches[0].clientX - e.target.offsetLeft;
    if (game.circlePlayers[0].pos.x <= 0) game.circlePlayers[0].pos.x = 0;
    if (game.circlePlayers[0].pos.x >= game._canvas.width)
        game.circlePlayers[0].pos.x = game._canvas.width;

    game.circlePlayers[0].pos.y = e.touches[0].clientY - e.target.offsetTop;
    if (game.circlePlayers[0].pos.y <= 0) game.circlePlayers[0].pos.y = 0;
    if (game.circlePlayers[0].pos.y >= game._canvas.height)
        game.circlePlayers[0].pos.y = game._canvas.height;
});

touchpad.addEventListener("touchstart", (e) => {
    touchpadInitX = e.touches[0].clientX;
    touchpadInitY = e.touches[0].clientY;
    circlePlayerCurrentPositionX = game.circlePlayers[0].pos.x;
    circlePlayerCurrentPositionY = game.circlePlayers[0].pos.y;
});

touchpad.addEventListener("touchmove", (e) => {
    game.circlePlayers[0].pos.x =
        (e.touches[0].clientX - touchpadInitX) * 2 +
        circlePlayerCurrentPositionX;
    if (game.circlePlayers[0].pos.x <= 0) game.circlePlayers[0].pos.x = 0;
    if (game.circlePlayers[0].pos.x >= game._canvas.width)
        game.circlePlayers[0].pos.x = game._canvas.width;

    game.circlePlayers[0].pos.y =
        (e.touches[0].clientY - touchpadInitY) * 2 +
        circlePlayerCurrentPositionY;
    if (game.circlePlayers[0].pos.y <= 0) game.circlePlayers[0].pos.y = 0;
    if (game.circlePlayers[0].pos.y >= game._canvas.height)
        game.circlePlayers[0].pos.y = game._canvas.height;
});

newGamebtn.addEventListener("click", (e) => game.newGame());
resetPositionsBtn.addEventListener("click", (e) => game.reset());

//reload the app during change screen size or orientation in order to generate new canvas
window.addEventListener("orientationchange", () => {
    location.reload();
});

window.addEventListener("resize", () => {
    location.reload();
});

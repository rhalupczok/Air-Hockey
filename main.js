class Vec{
	constructor(x=0, y=0)
	{
		this.x = x;
		this.y = y;
	}
	get length(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	};
	set length(value){
		const fact = value / this.len;
		this.x *= fact;
		this.y *= fact;
	};
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
}

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
	constructor(w, h)
	{
		this.pos = new Vec
		this.size = new Vec(w,h)
	}
	get left() {
		return this.pos.x - this.size.x / 2
	}
	get right() {
		return this.pos.x + this.size.x / 2
	}
	get top() {
		return this.pos.y - this.size.y / 2
	}
	get bottom() {
		return this.pos.y + this.size.y / 2
	}	 
}

class Circle {
	constructor (r, s=0) {
		this.pos = new Vec;
		this.size = r;
		this.circleStart = s;
	}
	get left() {
		return this.pos.x - this.size / 2
	}
	get right() {
		return this.pos.x + this.size / 2
	}
	get top() {
		return this.pos.y - this.size / 2
	}
	get bottom() {
		return this.pos.y + this.size / 2
	}	 
}

class Goal extends Rect {
	constructor(){
		super(5, 200)
	}
}

class CircleBall extends Circle {
	constructor(r, s=0){
		super(r, s);
		this.vel = new Vec;
		this.weight = 4;
	}
}

class CirclePlayer extends Circle {
	constructor(r){
		super(r);
		this.score = 0;
		this.weight = 10;
		this.vel = new Vec;
		this.ballTouched = false;
		this.previousFramePosition = new Vec;
	}
}

class Pong {
	constructor(canvas){
		// this.canvasHTML = document.getElementById(game);
		canvas.width  = innerWidth <= 1000 ? innerWidth * 0.8 : 800;
		canvas.height = canvas.width * 5/8;


		this._canvas = canvas;
		this._context = canvas.getContext("2d");

		this.circleBall = new CircleBall(this._canvas.width/40)

		this.circlePlayers = [
			new CirclePlayer(this._canvas.width/20),
			new CirclePlayer(this._canvas.width/20)
		]

		this.aiHitVecFlag = true;
		this.aiHitVecVel = new Vec;

		this.aIPlayerInitialPosX = this._canvas.width - this.circlePlayers[0].size * 1.5

		this.circlePlayers[0].pos.x = this.circlePlayers[0].size * 1.5;
		this.circlePlayers[1].pos.x = this.aIPlayerInitialPosX;
		this.circlePlayers.forEach(player => {player.pos.y = this._canvas.height / 2});
			
		let lastTime;
		const callback = (millis) => {
			if(lastTime) {
				this.update((millis - lastTime) / 1000);
			}
			lastTime = millis;
			requestAnimationFrame(callback);	
		}

		callback();
		
		this.reset();
	}

	draw(){
		this._context.fillStyle = "#000";
		this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
		this._context.fillStyle = "#f0f";
		this._context.fillRect(0, this._canvas.height/3, this._canvas.width/80, this._canvas.height/3);
		this._context.fillRect(this._canvas.width-this._canvas.width/80, this._canvas.height/3, this._canvas.width, this._canvas.height/3);
		this.drawCircle(this.circleBall);
		this.circlePlayers.forEach(player => this.drawCircle(player));
		}

	drawRect(rect){
		this._context.fillStyle = "#fff";
		this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
		}

	drawCircle(circle){
		this._context.fillStyle = "#fff";
		this._context.beginPath();
		this._context.arc(circle.pos.x, circle.pos.y, circle.size, circle.circleStart, 2 * Math.PI);
		this._context.fill();
	}

	reset(){
		this.circleBall.pos.x = this._canvas.width/2;
		this.circleBall.pos.y = this._canvas.height/2;

		this.circleBall.vel.x = 0;
		this.circleBall.vel.y = 0;
		this.circlePlayers.forEach(player => {player.ballTouched = false})
	}

	collideWith = (player) => {
		
		const n = this.circleBall.pos.subtract(player.pos);  //finding normal Vector
		const dist = n.length;

		player.vel = player.pos.subtract(player.previousFramePosition).mult(100);
		player.previousFramePosition.x = player.pos.x;
		player.previousFramePosition.y = player.pos.y;
		
		if (dist > (player.size + this.circleBall.size)) return;
		if (player.ballTouched) return;

		// this.circleBall.frameCounter = 0;

		const un = n.mult(1/n.length);  // unit normal vector
		const ut = new Vec(-un.y, un.x); //unit tangent vector
			
		const v1n = un.dot(player.vel);  //velocities un ut ----------- scalar
		const v1t = ut.dot(player.vel);
		const v2n = un.dot(this.circleBall.vel);
		const v2t = ut.dot(this.circleBall.vel);

		//velocities after cooliding

		let v1tTag = v1t;
		let v2tTag = v2t;
		let v1nTag = (v1n * (player.weight - this.circleBall.weight) + (2 * this.circleBall.weight * v2n)) / (this.circleBall.weight + player.weight);
		let v2nTag = (v2n * (this.circleBall.weight - player.weight) + (2 * player.weight * v1n)) / (this.circleBall.weight + player.weight);

		v1nTag = un.mult(v1nTag);
		v1tTag = ut.mult(v1tTag);
		v2nTag = un.mult(v2nTag);
		v2tTag = ut.mult(v2tTag);

		this.circleBall.vel = v2nTag.add(v2tTag);

		if (player !== this.circlePlayers[0]) this.circlePlayers[0].ballTouched = false;
		if (player !== this.circlePlayers[1]) this.circlePlayers[1].ballTouched = false;

		player.ballTouched = true;
	};

	handleCollisions = () => {
		this.circlePlayers.forEach(player => this.collideWith(player))
	}

	playerAI = (dt) => {
		this.circlePlayers[1].vel.x = 200;
		this.circlePlayers[1].vel.y = 200;

		if (this.circleBall.pos.y > this.circlePlayers[1].pos.y && this.circlePlayers[1].pos.y < this._canvas.height - this._canvas.height/3 + this.circlePlayers[1].size) {
			this.circlePlayers[1].pos.y += (this.circlePlayers[1].vel.y * dt);
		}
		if (this.circleBall.pos.y < this.circlePlayers[1].pos.y && this.circlePlayers[1].pos.y > this._canvas.height / 3 - this.circlePlayers[1].size) {
			this.circlePlayers[1].pos.y -= (this.circlePlayers[1].vel.y * dt);
		}
		let aiHitVec = this.circleBall.pos.subtract(this.circlePlayers[1].pos)
		
		if (aiHitVec.length < 3 * this.circlePlayers[1].size && !this.circlePlayers[1].ballTouched && this.circlePlayers[1].pos.x > canvas.width/2 && this.circleBall.pos.x < this.circlePlayers[1].pos.x){
			if (this.aiHitVecFlag) {this.aiHitVecVel.x = aiHitVec.x; this.aiHitVecVel.y = aiHitVec.y; this.aiHitVecFlag = false}
			this.circlePlayers[1].pos.x += this.aiHitVecVel.x * dt * 5;
			aiHitVec.y ? this.circlePlayers[1].pos.y += this.aiHitVecVel.y * dt * 5: this.circlePlayers[1].pos.y -= this.aiHitVecVel.y * dt * 5;
		} else {
			this.circlePlayers[1].pos.x < this.aIPlayerInitialPosX ? this.circlePlayers[1].pos.x += this.circlePlayers[1].vel.x*dt : this.aIPlayerInitialPosX;
			this.aiHitVecFlag = true;
		}

		if (this.circleBall.vel.length < 50 && this.circleBall.pos.x >= this.aIPlayerInitialPosX) this.circleBall.vel.x += -100;
	}
	
	update(dt) {
		this.circleBall.pos.x += (this.circleBall.vel.x * dt/2);
		this.circleBall.pos.y += (this.circleBall.vel.y * dt/2);
		this.circleBall.vel.multBy(998/1000); //table friction
	
		if (this.circleBall.left < 0 || this.circleBall.right > this._canvas.width ){
			if ((this.circleBall.pos.y > this._canvas.height/3 && this.circleBall.pos.y < this._canvas.height - this._canvas.height/3) || (this.circleBall.pos.y > this._canvas.height/3 && this.circleBall.pos.y < this._canvas.height - this._canvas.height/3)){
				const playerId = this.circleBall.vel.x < 0 | 0; // "| 0" convert boolean true or false to number 1 or 0.
				this.circlePlayers[playerId].score++;
				this.reset();
			} else {
			this.circleBall.vel.x = -this.circleBall.vel.x
			this.circlePlayers.forEach(player => {player.ballTouched = false})
			}
		}

		if (this.circleBall.top < 0 || this.circleBall.bottom > this._canvas.height){
			this.circleBall.vel.y = -this.circleBall.vel.y;
			this.circlePlayers.forEach(player => {player.ballTouched = false})
			}
			
		if (this.circleBall.vel.length <= 50) this.circlePlayers.forEach(player => {player.ballTouched = false})

		this.draw();

		this.playerAI(dt);
			
		this.handleCollisions();
	}
}

const canvas = document.getElementById('game');
const touchpad = document.getElementById('touchpad');
const pong = new Pong(canvas);
let touchpadInitX;
let touchpadInitY;
let circlePlayerCurrentPositionX;
let circlePlayerCurrentPositionY;


canvas.addEventListener("mousemove", (e) => {
	pong.circlePlayers[0].pos.x = e.offsetX;
	pong.circlePlayers[0].pos.y = e.offsetY;
});

touchpad.addEventListener("touchstart", (e) => {
	touchpadInitX = e.touches[0].clientX
	touchpadInitY = e.touches[0].clientY
	circlePlayerCurrentPositionX = pong.circlePlayers[0].pos.x;
	circlePlayerCurrentPositionY = pong.circlePlayers[0].pos.y;
})

touchpad.addEventListener("touchmove", (e) => {
	// pong.circlePlayers[0].pos.x = e.touches[0].clientX - e.target.offsetLeft;
	pong.circlePlayers[0].pos.x =  e.touches[0].clientX - touchpadInitX + circlePlayerCurrentPositionX;
	if (pong.circlePlayers[0].pos.x <= 0) pong.circlePlayers[0].pos.x = 0;
	if (pong.circlePlayers[0].pos.x >= pong._canvas.width) pong.circlePlayers[0].pos.x = pong._canvas.width;

	// pong.circlePlayers[0].pos.y = e.touches[0].clientY - e.target.offsetTop;
	pong.circlePlayers[0].pos.y = e.touches[0].clientY - touchpadInitY + circlePlayerCurrentPositionY;
	if (pong.circlePlayers[0].pos.y <= 0) pong.circlePlayers[0].pos.y = 0;
	if (pong.circlePlayers[0].pos.y >= pong._canvas.height) pong.circlePlayers[0].pos.y = pong._canvas.height;
});
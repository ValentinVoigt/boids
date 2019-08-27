const boidRange = 200;
const boidSpacing = 25;
const obstacleSpacing = 50;

var boids = [];
var obstacles = [];
var displayMessage = true;

class BoxObstacle {

	constructor(x1, y1, x2, y2) {
		this.pos1 = createVector(x1, y1);
		this.pos2 = createVector(x2, y2);
	}

	collide(pos, dir) {
		let force = createVector(0, 0);

		if (pos.x < this.pos1.x + obstacleSpacing)
			force.add(createVector(1, 0));
		if (pos.y < this.pos1.y + obstacleSpacing)
			force.add(createVector(0, 1));
		if (pos.x > this.pos2.x - obstacleSpacing)
			force.add(createVector(-1, 0));
		if (pos.y > this.pos2.y - obstacleSpacing)
			force.add(createVector(0, -1));

		force.normalize();
		return force;
	}

}

class CircleObstacle {

	constructor(x, y, radius) {
		this.pos = createVector(x, y);
		this.radius = radius;
	}

	collide(pos, dir) {
		if (this.pos.dist(pos) < this.radius + obstacleSpacing) {
			let force = p5.Vector.sub(pos, this.pos);
			force.div(this.pos.dist(pos));
			return force;
		} else {
			return createVector(0, 0);
		}
	}

}

class Boid {

	constructor(x, y, angle) {
		this.pos = createVector(x, y);
		this.dir = p5.Vector.fromAngle(angle);
		this.speed = 0.1;
	}

	getNeighbours() {
		let neighbours = [];

		for (let boid of boids) {
			if (boid === this)
				continue;

			if (boid.pos.dist(this.pos) < boidRange) {
				neighbours.push(boid);
			}
		}

		return neighbours;
	}

	getObstaclesForce() {
		let force = createVector(0, 0);

		if (obstacles.length > 0) {
			for (let obstacle of obstacles) {
				force.add(obstacle.collide(this.pos, this.dir));
			}
			force.normalize();
		}

		return force;
	}

	getAvgDirForce(neighbours) {
		if (neighbours.length > 0) {
			let avgDir = neighbours
				.map((b) => b.dir)
				.reduce((a, b) => p5.Vector.add(a, b), createVector(0, 0));

			avgDir.normalize();

			return avgDir;
		} else {
			return createVector(0, 0);
		}
	}

	getAvgPosForce(neighbours) {
		if (neighbours.length > 0) {
			let avgPos = neighbours
				.map((b) => b.pos)
				.reduce((a, b) => p5.Vector.add(a, b), createVector(0, 0));

			avgPos.div(neighbours.length);
			avgPos.sub(this.pos);
			avgPos.normalize();

			return avgPos;
		} else {
			return createVector(0, 0);
		}
	}

	getSeparationForce(neighbours) {
		let nearNeighbours = neighbours.filter((b) => this.pos.dist(b.pos) < boidSpacing);

		if (nearNeighbours) {
			let separation = createVector(0, 0);

			for (let boid of nearNeighbours) {
				let d = p5.Vector.sub(this.pos, boid.pos);
				d.normalize();
				d.div(this.pos.dist(boid.pos));
				separation.add(d);
			}

			separation.normalize();
			return separation;
		} else {
			return createVector(0, 0);
		}
	}

	move() {
		const neighbours = this.getNeighbours();

		this.dir.add(p5.Vector.mult(this.getAvgDirForce(neighbours), 0.02));
		this.dir.add(p5.Vector.mult(this.getAvgPosForce(neighbours), 0.02));
		this.dir.add(p5.Vector.mult(this.getSeparationForce(neighbours), 0.1));
		this.dir.limit(2);
		this.dir.add(p5.Vector.mult(this.getObstaclesForce(), 0.05));
		this.pos.add(p5.Vector.mult(this.dir, this.speed * deltaTime));
	}

	draw() {
		push();

		translate(this.pos.x, this.pos.y);
		rotate(this.dir.heading() + HALF_PI);
		stroke(80, 80, 255);
		fill(80, 80, 255);
		triangle(0, 0, 5, 15, -5, 15);

		pop();
	}

}

function setup() {
	createCanvas(windowWidth, windowHeight);
	setTimeout(() => displayMessage = false, 3000);

	obstacles.push(new CircleObstacle(width/2, height/2, 200));
	obstacles.push(new BoxObstacle(0, 0, width, height));

	for (let i = 0; i < 100; i++) {
		boids.push(new Boid(random(width), random(height), random(TWO_PI)));
	}
}

function draw() {
	obstacles[0].pos = createVector(mouseX, mouseY);
	background(42);

	if (displayMessage) {
		fill(255, 255, 255);
		textSize(40);
		textAlign(CENTER, CENTER);
		text("Use the mouse to scare the birds!", width/2, height/2);
	}

	if (focused) {
		for (let boid of boids)
			boid.move();
	}

	for (let boid of boids)
		boid.draw();
}

const boidRange = 200;
const boidSpacing = 25;
const obstacleSpacing = 50;

var boids = [];
var obstacles = [];

class CircleObstacle {

	constructor(x, y, radius) {
		this.pos = createVector(x, y);
		this.radius = radius;
	}

	draw() {
		push();

		translate(this.pos.x, this.pos.y);
		stroke(255, 255, 255);
		noFill();
		circle(0, 0, this.radius);

		pop();
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

	getBoundsForce() {
		let antiBounds = createVector(0, 0);

		if (this.pos.x < boidRange)
			antiBounds.add(createVector(1, 0));
		if (this.pos.y < boidRange)
			antiBounds.add(createVector(0, 1));
		if (this.pos.x > width-boidRange)
			antiBounds.add(createVector(-1, 0));
		if (this.pos.y > height-boidRange)
			antiBounds.add(createVector(0, -1));

		return antiBounds;
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
		this.dir.add(p5.Vector.mult(this.getBoundsForce(), 0.05));
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

	obstacles.push(new CircleObstacle(width/2, height/2, 200));

	for (let i = 0; i < 100; i++) {
		boids.push(new Boid(random(width), random(height), random(TWO_PI)));
	}
}

function draw() {
	background(42);

	for (let boid of boids)
		boid.move();

	for (let obstacle of obstacles)
		obstacle.draw();
	for (let boid of boids)
		boid.draw();
}

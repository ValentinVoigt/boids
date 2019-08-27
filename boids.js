const range = 200;
var boids = [];

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

			if (p5.Vector.dist(boid.pos, this.pos) < range) {
				neighbours.push(boid);
			}
		}

		return neighbours;
	}

	getBoundsForce() {
		let antiBounds = createVector(0, 0);

		if (this.pos.x < range)
			antiBounds.add(createVector(range-this.pos.x, 0));
		if (this.pos.y < range)
			antiBounds.add(createVector(0, range-this.pos.y));
		if (this.pos.x > width-range)
			antiBounds.add(createVector(-range-this.pos.x+width, 0));
		if (this.pos.y > height-range)
			antiBounds.add(createVector(0, -range-this.pos.y+height));

		antiBounds.limit(2);

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

			return avgPos;
		} else {
			return createVector(0, 0);
		}
	}

	getSeparationForce(neighbours) {
		let nearest = null;
		let nearestDist = Infinity;

		for (let boid of neighbours) {
			let dist = this.pos.dist(boid.pos);
			if (dist < nearestDist) {
				nearest = boid;
				nearestDist = dist;
			}
		}

		if (nearest) {
			let antiNearest = p5.Vector.sub(nearest.pos, this.pos);
			antiNearest.normalize();
			return antiNearest;
		} else {
			return createVector(0, 0);
		}
	}

	move() {
		const neighbours = this.getNeighbours();

		this.dir.add(p5.Vector.mult(this.getAvgDirForce(neighbours), 0.02));
		this.dir.add(p5.Vector.mult(this.getAvgPosForce(neighbours), 0.000002));
		this.dir.add(p5.Vector.mult(this.getSeparationForce(neighbours), 0.05));
		this.dir.limit(2);
		this.dir.add(p5.Vector.mult(this.getBoundsForce(), 0.03));
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

	for (let i = 0; i < 100; i++) {
		boids.push(new Boid(random(width), random(height), random(TWO_PI)));
	}
}

function draw() {
	background(42);

	for (let boid of boids) {
		boid.move();
	}

	for (let boid of boids) {
		boid.draw();
	}
}

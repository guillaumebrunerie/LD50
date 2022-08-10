import * as React from "react";
import { Textures, Animations, Sounds } from "./Loader";
import AnimatedSprite from "./components/AnimatedSprite";
import Circle from "./components/Circle";
import useTicker from "./hooks/useTicker";
import useSetInterval from "./hooks/useSetInterval";

import move from "./move";
import { findPosition } from "./Branches";

const birdSpeed = 15;

const birdProbabilities = [
	{"in": 1, "out": 0}, // Probabilities of birds arriving/leaving when there is 0
	{"in": 1, "out": 0}, // 1
	{"in": 1, "out": 0}, // 2
	{"in": 1, "out": 0.2}, // 3
	{"in": 0.7, "out": 0.3}, // 4
	{"in": 0.5, "out": 0.5}, // 5
	{"in": 0.3, "out": 0.7}, // 6
	{"in": 0.2, "out": 1}, // 7
]
export const useBirds = ({branches, isGameOver, angle, currentWeight}) => {
	const [birds, setBirds] = React.useState([]);

	// Main loop for flying birds
	useTicker(delta => setBirds(birds => birds.flatMap(bird => {
		if (bird.state === "flying") {
			const result = flyBird(bird, delta);
			return [result];
		} else if (bird.state === "leaving") {
			const result = flyBird(bird, delta);
			if (result.state == "standing") {
				return []
			}
			return [result];
		} else {
			return [bird];
		}
	})));

	useSetInterval(() => {
		if (isGameOver) {
			return;
		}
		const data = birdProbabilities[birds.length]
		const newBird = Math.random() < (data ? data["in"] : 0.1);
		const birdLeaves = Math.random() < (data ? data["out"] : 1);
		if (birdLeaves) {
			removeRandomBird();
		}
		if (newBird) {
			addBird();
		}
	}, 1000);

	const flyBird = (bird, delta) => {
		const {arrived, x, y} = move(bird, bird.dest, delta, birdSpeed);
		if (arrived) {
			if (bird.dest.branch && !branches.some(b => b.id === bird.dest.branch.id && b.state == 0)) {
				removeBird(bird);
				return bird;
			} else {
				return {...bird, x, y, branch: bird.dest.branch, state: "standing"};
			}
		} else {
			return {...bird, x, y};
		}
	}

	const randomDestination = (dir) => {
		const a = angle * Math.PI/180;
		const x = dir * (500 + Math.random() * 100);
		const y = -800 - 400 * Math.random();
		return {x: x * Math.cos(a) + y * Math.sin(a), y: - x * Math.sin(a) + y * Math.cos(a) }
	};

	const scareAllBirds = () => {
		birds.forEach(bird => removeBird(bird));
	}

	const removeRandomBird = () => {
		const standingBirds = birds.filter(bird => bird.state == "standing");
		if (standingBirds.length == 0) {
			return;
		}
		const index = Math.floor(Math.random() * standingBirds.length);
		removeBird(standingBirds[index]);
	}

	const removeBird = (bird, dirFactor = 1) => {
		Sounds["Chirp" + bird.size].play();
		setBirds(birds => (
			birds.map(b => b === bird ? {...b, state: "leaving", dest: randomDestination(b.x / Math.abs(b.x) * dirFactor)} : b)
		));
	}

	const scareBirds = (branchId) => {
		birds.forEach(bird => {
			if (bird.branch && bird.branch.id === branchId) {
				removeBird(bird);
			}
		});
	}

	const addBird = (side, pickBestSide = false) => {
		setBirds(birds => {
			if (pickBestSide) {
				const weight = currentWeight();
				if (weight < 0) {
					side = 1;
				} else if (weight > 0) {
					side = -1;
				} else {
					side = undefined;
				}
			}

			const size = ["Small", "Medium", "Big"][Math.floor(Math.random() * 3)];
			const id = Math.random();

			const dest = findPosition(branches, birds, side)
			if (!dest) {
				side = Math.random() < 0.5 ? -1 : 1;
				const newBird = {
					id,
					size,
					...randomDestination(side),
					dest: randomDestination(-side),
					state: "leaving",
				}
				return [...birds, newBird];
			}
			Sounds["Chirp" + size].play();
			const newBird = {
				id,
				size,
				...randomDestination(dest.x / Math.abs(dest.x)),
				dest,
				state: "flying",
			}
			return [...birds, newBird];
		});
	};

	const addInitialBirds = () => {
		setTimeout(() => {
			addBird(1);
			addBird(-1);
		}, 1000);
		setTimeout(() => {
			addBird(1);
			addBird(-1);
		}, 1500);
	};

	const flipBird = (bird) => () => {
		Sounds.BirdFly.play();
		const newPosition = findPosition(branches, birds, -bird.x);
		if (!newPosition) {
			removeBird(bird, -1);
			return;
		}
		setBirds(birds.map(b => b === bird ? {...b, dest: newPosition, state: "flying"} : b));
	};

	return {birds, flipBird, addInitialBirds, scareAllBirds, scareBirds};
}

const anchorY = 0.75;

const Bird = ({bird: {state, x, y, size}, onClick, ...props}) => {
	const hitboxSize = {
		"Small": 50,
		"Medium": 60,
		"Big": 65,
	}[size];
	const hitboxOffsetY = {
		"Small": 40,
		"Medium": 55,
		"Big": 45,
	}[size];

	if (state === "flying" || state === "leaving") {
		return (
			<AnimatedSprite loop={Animations[`Bird_${size}_FlyingLoop`]} anchor={[0.5, anchorY]} x={x} y={y} {...props}/>
		);
	} else {
		const loop = {at: () => Textures[`Bird_${size}_Land`].get(`Bird_${size}_Land_025`)};
		return (
			<>
				<AnimatedSprite start={Animations[`Bird_${size}_Land`]} loop={loop} anchor={[0.5, anchorY]} x={x} y={y} {...props}/>
				<Circle x={x} y={y - hitboxOffsetY} alpha={0.001} radius={hitboxSize} interactive buttonMode pointerdown={onClick}/>
			</>
		);
	}
};

export const Birds = ({birds, flipBird, angle}) => {
	return birds.map(bird => (
		<Bird
			key={bird.id}
			bird={bird}
			onClick={flipBird(bird)}
			angle={-angle}
		/>
	))
};

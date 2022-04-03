import * as React from "react";
import { Container, Sprite, Text, usePixiTicker } from "react-pixi-fiber/index.js";
import { findPosition, Branch } from "./Branch";
import Circle from "./components/Circle";
import getSpeed from "./getSpeed";
import { Textures } from "./Loader";
import { useInterval } from "./useInterval";
import { useWindowEventListener } from "./useWindowEventListener";
import { sound } from '@pixi/sound';

// state = "flying", "standing"

const Bird = ({bird: {x, y, size, color}, onClick}) => {
	return (
		<Sprite texture={Textures.Birds.get(`Bird_${size}_0${color}`)} anchor={[0.5, 1]} x={x} y={-y} interactive buttonMode pointerdown={onClick}/>
	)
}

const aFactor = 1e-5;  // Influence of one degree
const bFactor = 4e-5; // Influence of one bird
const landingSpeed = 0.05; // Influence of one bird landing
const takeOffSpeed = -0.02; // Influence of one bird leaving
const limitAngle = 20; // Max angle before the game is lost
const endAcceleration = 0.015; // Acceleration when we reach the limit angle
const movingStrength = 0.02; // By how much the tree moves when we drag it
const inertiaStrength = movingStrength * 10; // By how much the tree moves when we release it
const releaseTimeout = 500; // How long we can hold a branch
const birdSpeed = 40;
const birdProbabilities = [
	{"in": 1, "out": 0}, // Probabilities of birds arriving/leaving when there is 0
	{"in": 1, "out": 0}, // 1
	{"in": 1, "out": 0}, // 2
	{"in": 0.5, "out": 0.1}, // 3
	{"in": 0.5, "out": 0.5}, // 4
	{"in": 0.1, "out": 0.5}, // 5
	{"in": 0, "out": 1}, // 6
]

const useOnMount = (callback) => {
	const [alreadyCalled, setAlreadyCalled] = React.useState(false);
	React.useEffect(() => {
		if (!alreadyCalled) {
			callback();
			setAlreadyCalled(true);
		}
	});
};

const trunkY = 35;
const treeY = -35;
const backgroundY = -830;
const owlY = -820;
const endY = -50;

const TrunkFloor = ({state: {level, broken}}) => {
	const endTexture = Textures.Tree.get("TreeEnd_0" + level + (broken ? "_Broken" : ""));
	return (
		<>
			<Sprite texture={Textures.Tree.get("Trunk")} anchor={[0.5, 0]} y={trunkY} />
			<Sprite texture={endTexture} anchor={[0.5, 0]} y={0} scale={[1, -1]} y={-endY} />
		</>
	);
};

const Trunk = ({state: {level, broken}}) => {
	const endTexture = Textures.Tree.get("TreeEnd_0" + level + (broken ? "_Broken" : ""));

	return (
		<>
			<Circle x={0} y={-900} radius={700} fill={0x00AA00} />
			<Sprite texture={Textures.Tree.get("TreeBack")} anchor={0.5} y={backgroundY} />
			<Sprite texture={Textures.Owl} anchor={0.5} y={owlY} />
			<Sprite texture={Textures.Tree.get("Tree")} anchor={[0.5, 1]} y={treeY} />
			<Sprite texture={endTexture} anchor={[0.5, 0]} y={0} y={endY} />
		</>
	);
};

const hiveX = 150;
const hiveY = -300;

const BeeHive = props => {
	return <Sprite texture={Textures.BeeHive} anchor={[0.5, 0]} {...props}/>
}

const Tree = ({x, y, gameOver}) => {
	const [angle, setAngle] = React.useState(0);
	const [speed, setSpeedRaw] = React.useState(0);
	const setSpeed = setter => {
		if (Math.abs(angle) >= limitAngle) {
			return;
		}
		setSpeedRaw(setter);
	};
	const [branches, setBranches] = React.useState([
		{id: 1, y: 300,  flipX: false, state: 0, type: "A"},
		{id: 2, y: 450,  flipX: true,  state: 0, type: "B"},
		{id: 3, y: 600,  flipX: false, state: 0, type: "C"},
		{id: 4, y: 750,  flipX: true,  state: 0, type: "A"},
		{id: 5, y: 900,  flipX: false, state: 0, type: "B"},
		{id: 6, y: 1050, flipX: true,  state: 0, type: "C"},
	]);

	const [birds, setBirds] = React.useState([]);
	const isHoldingBranch = React.useRef();
	const [treeState, setTreeState] = React.useState({level: 1, broken: false});

	useOnMount(() => {
		setTimeout(() => {
			addBird(findPosition(branches, [], 1), false);
			addBird(findPosition(branches, [], -1), false);
		}, 0);
		setTimeout(() => {
			addBird(findPosition(branches, [], 1), false);
			addBird(findPosition(branches, [], -1), false);
		}, 500);
	});

	// Main loop
	usePixiTicker(delta => {
		if (Math.abs(angle) > 90) {
			setAngle(90 * angle / Math.abs(angle));
			setSpeedRaw(0);
			setTreeState(state => ({...state, broken: true}));
			gameOver();
			return;
		}

		setBirds(birds => birds.flatMap(bird => {
			if (bird.state === "flying") {
				const result = flyBird(bird, delta);
				if (result.state == "standing") {
					setSpeed(speed => result.x < 0 ? speed - landingSpeed : speed + landingSpeed);
				}
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
		}))

		if (isHoldingBranch.current) {
			return;
		}

		let a = angle * aFactor;
		birds.filter(b => b.state === "standing").forEach(b => {
			if (b.x > 0) {
				a += bFactor;
			} else {
				a -= bFactor;
			}
		});
		if (Math.abs(angle) > limitAngle) {
			a += angle > 0 ? endAcceleration : -endAcceleration;
		}
		setSpeedRaw(speed => speed + a);
		setAngle(angle => isHoldingBranch.current ? angle : angle + delta * speed);
	});

	const flyBird = (bird, delta) => {
		if (bird.x == bird.dest.x && bird.y == bird.dest.y) {
			return {...bird, state: "standing"};
		}
		const deltaX = bird.dest.x - bird.x;
		const deltaY = bird.dest.y - bird.y;
		const dist = delta * birdSpeed;
		const totalDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		if (dist >= totalDist) {
			return {...bird, x: bird.dest.x, y: bird.dest.y, state: "standing"};
		}
		return {...bird, x: bird.x + dist / totalDist * deltaX, y: bird.y + dist / totalDist * deltaY};
	}

	useInterval(() => {
		const newBird = Math.random() < birdProbabilities[birds.length]["in"];
		const birdLeaves = Math.random() < birdProbabilities[birds.length]["out"];
		if (birdLeaves) {
			removeBird();
		}
		if (newBird) {
			addBird(findPosition(branches, birds));
		}
	}, 1000);

	const randomDestination = () => ({
		x: Math.random() > 0.5 ? -1000 : 1000,
		y: Math.random() * 1000,
	});

	const removeBird = () => {
		setBirds(birds => {
			const index = Math.floor(Math.random() * birds.length);
			setSpeed(speed => birds[index].x < 0 ? speed - takeOffSpeed : speed + takeOffSpeed);
			return birds.map(b => b === birds[index] ? {...b, state: "leaving", dest: randomDestination()} : b);
		});
	}

	const addBird = (bird, changeSpeed = true) => {
		const randomColor = () => Math.floor(Math.random() * 3) + 1;
		const randomSize = () => ["Small", "Medium", "Big"][Math.floor(Math.random() * 3)];
		const newBird = {
			id: Math.random(),
			color: randomColor(),
			size: randomSize(),
			...randomDestination(),
			dest: bird,
			state: "flying",
		}
		setBirds(birds => [...birds, newBird])
		// if (changeSpeed) {
		// 	setSpeed(speed => bird.x < 0 ? speed - landingSpeed : speed + landingSpeed);
		// }
	};

	const flipBird = id => () => {
		const bird = birds.find(b => b.id === id);
		const newPosition = findPosition(branches, birds, -bird.x);
		setBirds(birds.map(b => b === bird ? {...b, dest: newPosition, state: "flying"} : b));

		sound.play("Chirp");
	};

	const timeoutRef = React.useRef();
	const holdBranch = id => () => {
		isHoldingBranch.current = {id};
		setSpeedRaw(0);
		timeoutRef.current = setTimeout(() => releaseBranch(id), releaseTimeout);
	};

	const moveBranch = (id, dx) => {
		setAngle(angle => angle + dx * movingStrength);
	};

	const releaseBranch = (id) => {
		clearTimeout(timeoutRef.current);
		isHoldingBranch.current = null;
		setBranches(branches => branches.map(branch => branch.id === id ? {...branch, state: Math.min(branch.state + 1, 4)} : branch))
		const speed = getSpeed().vx * inertiaStrength;
		setSpeedRaw(speed);
	}

	useWindowEventListener("pointermove", event => {
		if (isHoldingBranch.current) {
			moveBranch(isHoldingBranch.current.id, event.movementX);
		}
	});
	useWindowEventListener("pointerup", () => {
		if (isHoldingBranch.current) {
			releaseBranch(isHoldingBranch.current.id);
		}
	});

	return (
		<>
			<Container x={x} y={y}>
				<TrunkFloor state={treeState}/>
			</Container>
			<Container angle={angle} x={x} y={y}>
				<Trunk state={treeState}/>
				{branches.map(({id, ...branch}) => (
					<Branch
						key={id}
						branch={branch}
						onClick={holdBranch(id)}
					/>
				))}
				<BeeHive x={hiveX} y={hiveY} angle={-angle}/>
				{birds.map(({id, ...bird}) => <Bird key={id} bird={bird} onClick={flipBird(id)}/>)}
			</Container>
		</>
	);
};

export default Tree;

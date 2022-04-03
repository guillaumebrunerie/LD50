import * as React from "react";
import * as PIXI from "pixi.js"
import { Container, Sprite, Text, usePixiTicker } from "react-pixi-fiber/index.js";
import { findPosition, Branch } from "./Branch";
import Circle from "./components/Circle";
import Rectangle from "./components/Rectangle";
import getSpeed from "./getSpeed";
import { Textures, Animations } from "./Loader";
import { useInterval } from "./useInterval";
import { useWindowEventListener } from "./useWindowEventListener";
import useLocalTime from "./hooks/useLocalTime";
import { sound } from '@pixi/sound';
import Bird from "./Bird";
import Beaver from "./Beaver";
import AnimatedSprite from "./components/AnimatedSprite";

const treeFactor = [0.2, 1, 5];
const aFactor = 1e-5;  // Influence of one degree
const bFactor = 4e-5; // Influence of one bird
const landingSpeed = 0.05; // Influence of one bird landing
const takeOffSpeed = -0.02; // Influence of one bird leaving
const limitAngle = 20; // Max angle before the game is lost
const endAcceleration = 0.015; // Acceleration when we reach the limit angle
const movingStrength = 0.02; // By how much the tree moves when we drag it
const inertiaStrength = movingStrength * 10; // By how much the tree moves when we release it
const releaseTimeout = 500; // How long we can hold a branch
const birdSpeed = 10;
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

const stumpY = 37;
const treeY = -37;
const backgroundY = -830;
const owlY = -820;
const endY = -52;

const Stump = ({state: {level, broken}}) => {
	const endTexture = Textures.Tree.get("TreeEnd_0" + level + (broken ? "_Broken" : ""));
	return (
		<>
			<Sprite texture={Textures.Tree.get("Trunk")} anchor={[0.5, 0]} y={stumpY} />
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

const BeeHive = ({onClick, ...props}) => {
	return <Sprite texture={Textures.BeeHive} anchor={[0.5, 0]} buttonMode interactive pointerdown={onClick} {...props}/>
}

const useTicker = (callback) => {
	const tickerRef = React.useRef(() => {});

	React.useLayoutEffect(() => {
		tickerRef.current = callback;
	}, [callback]);

	usePixiTicker(React.useCallback((...args) => {
		tickerRef.current(...args);
	}, []));
};

const Bear = (props) => {
	const {t} = useLocalTime();
	const mask = React.useRef();
	const angle = Math.max(35 - t * 0.1, 0);

	return (
		<>
			<Sprite texture={Textures.Bear} anchor={[1, 1]} angle={angle} mask={mask.current} 
					{...props}/>
			<Rectangle ref={mask} x={props.x - 300} y={props.y - 700} width={300} height={700}/>
		</>
	)
}

const Tree = ({x, y, isGameOver, gameOver}) => {
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
	useTicker(delta => {
		if (isGameOver) {
			return;
		}

		if (Math.abs(angle) >= 90) {
			setAngle(90 * angle / Math.abs(angle));
			setSpeedRaw(0);
			setTreeState(state => ({...state, broken: true}));
			gameOver();
			return;
		}

		if (isHoldingBranch.current) {
			return;
		}

		let a = angle * aFactor * treeFactor[treeState.level - 1];
		birds.filter(b => b.state === "standing").forEach(b => {
			if (b.x > 0) {
				a += bFactor * treeFactor[treeState.level - 1];
			} else {
				a -= bFactor * treeFactor[treeState.level - 1];
			}
		});
		if (Math.abs(angle) > limitAngle) {
			a += angle > 0 ? endAcceleration : -endAcceleration;
		}
		setSpeedRaw(speed => speed + a);
		setAngle(angle => isHoldingBranch.current ? angle : angle + delta * speed);
	});

	// Main loop for flying birds
	useTicker(delta => {
		if (isGameOver) {
			return;
		}

		setBirds(birds => birds.flatMap(bird => {
			if (bird.state === "flying") {
				const result = flyBird(bird, delta);
				if (result.state == "standing") {
					const deltaSpeed = landingSpeed * treeFactor[treeState.level - 1];
					setSpeed(speed => result.x < 0 ? speed - deltaSpeed : speed + deltaSpeed);
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
		}));
	});

	// Returns {arrived: boolean, x: number, y: number}
	const move = (from, to, delta, speed) => {
		if (from.x === to.x && from.y === to.y) {
			return {arrived: true, x: from.x, y: from.y};
		}
		const deltaX = to.x - from.x;
		const deltaY = to.y - from.y;
		const dist = delta * speed;
		const totalDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		if (dist >= totalDist) {
			return {arrived: true, x: to.x, y: to.y};
		}
		return {arrived: false, x: from.x + dist / totalDist * deltaX, y: from.y + dist / totalDist * deltaY};
	}

	const flyBird = (bird, delta) => {
		const {arrived, x, y} = move(bird, bird.dest, delta, birdSpeed);
		if (arrived) {
			return {...bird, x, y, branch: bird.dest.branch, state: "standing"};
		} else {
			return {...bird, x, y};
		}
	}

	useInterval(() => {
		if (isGameOver) {
			return;
		}
		const newBird = Math.random() < birdProbabilities[birds.length]["in"];
		const birdLeaves = Math.random() < birdProbabilities[birds.length]["out"];
		if (birdLeaves) {
			removeRandomBird();
		}
		if (newBird) {
			addBird(findPosition(branches, birds));
		}
	}, 1000);

	const randomDestination = () => ({
		x: Math.random() > 0.5 ? -1000 : 1000,
		y: Math.random() * 1000,
	});

	const removeRandomBird = () => {
		const standingBirds = birds.filter(bird => bird.state == "standing");
		if (standingBirds.length == 0) {
			return;
		}
		const index = Math.floor(Math.random() * standingBirds.length);
		removeBird(standingBirds[index]);
	}

	const removeBird = (bird) => {
		setBirds(birds => {
			const deltaSpeed = takeOffSpeed * treeFactor[treeState.level - 1];
			setSpeed(speed => bird.x < 0 ? speed - deltaSpeed : speed + deltaSpeed);
			return birds.map(b => b === bird ? {...b, state: "leaving", dest: randomDestination()} : b);
		});
	}

	const scareBirds = (branchId) => {
		birds.forEach(bird => {
			if (bird.branch && bird.branch.id === branchId) {
				removeBird(bird);
			}
		});
	}

	const addBird = (dest, changeSpeed = true) => {
		const randomColor = () => Math.floor(Math.random() * 3) + 1;
		const randomSize = () => ["Small", "Medium", "Big"][Math.floor(Math.random() * 3)];
		const newBird = {
			id: Math.random(),
			color: randomColor(),
			size: randomSize(),
			...randomDestination(),
			dest,
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
		scareBirds(id);
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

	const beaverSpeed = 0.5;
	const choppingTime = 3000;
	const waitingTime = 10000;
	// state: "hidden", "arriving", "chopping", "leaving"
	const [beaverStatus, setBeaverStatus] = React.useState({state: "hidden", x: 500, y: 60, timeout: waitingTime})

	useTicker(() => {
		const deltaMS = PIXI.Ticker.shared.deltaMS;
		if (!isGameOver && beaverStatus.timeout > deltaMS) {
			setBeaverStatus({...beaverStatus, timeout: beaverStatus.timeout - deltaMS});
		} else {
			switch (beaverStatus.state) {
			case "hidden": {
				if (!isGameOver) {
					setBeaverStatus({...beaverStatus, state: "arriving", x: 500, y: 60, dest: {x: 120, y: 60}, timeout: 0});
				}
				break;
			}
			case "chopping": {
				if (!isGameOver && treeState.level < 3) {
					setTreeState({...treeState, level: treeState.level + 1});
				}
				setBeaverStatus({...beaverStatus, state: "leaving", dest: {x: -500, y: 60}, timeout: 0});
				break;
			}
			case "leaving":
			case "arriving": {
				const {arrived, x, y} = move(beaverStatus, beaverStatus.dest, deltaMS, beaverSpeed);
				if (arrived) {
					const state = beaverStatus.state == "arriving" ? "chopping" : "hidden";
					const timeout = beaverStatus.state == "arriving" ? choppingTime : waitingTime;
					setBeaverStatus({state, x, y, timeout});
				} else {
					setBeaverStatus({...beaverStatus, x, y});
				}
				break;
			}
			}
		}
	});

	const beeHiveAcceleration = 0.3;
	const [beeHive, setBeeHive] = React.useState({state: "attached", x: 150, y: -300, speed: 0});

	const dropBeeHive = () => {
		setBeeHive({...beeHive, state: "falling"});
	}

	useTicker(delta => {
		if (beeHive.state === "falling" && beeHive.y >= 0) {
			setBeeHive({...beeHive, state: "fallen", y: 0, timeout: 2000})
		} else if (beeHive.state == "falling") {
			setBeeHive({...beeHive, speed: beeHive.speed + beeHiveAcceleration, y: beeHive.y + beeHive.speed * delta});
		} else if (beeHive.state == "fallen") {
			const timeout = beeHive.timeout - PIXI.Ticker.shared.deltaMS;
			if (timeout > 0) {
				setBeeHive({...beeHive, timeout});
			} else {
				setBeeHive({...beeHive, state: "gone"});
			}
		}
	})

	return (
		<Container x={x} y={y}>
			<Stump state={treeState}/>
			<Container angle={angle}>
				<Trunk state={treeState}/>
				{beeHive.state === "fallen" && <Bear x={-44} y={-100}/>}
				{branches.map(({id, ...branch}) => (
					<Branch
						key={id}
						branch={branch}
						onClick={holdBranch(id)}
					/>
				))}
				{beeHive.state === "attached" && <BeeHive x={beeHive.x} y={beeHive.y} angle={-angle} onClick={dropBeeHive}/>}
				{birds.map(({id, ...bird}) => (
					<Bird
						key={id}
						bird={bird}
						onClick={flipBird(id)}
					/>
				))}
			</Container>
			{beeHive.state !== "attached" && <BeeHive x={beeHive.x} y={beeHive.y} onClick={dropBeeHive}/>}
			{beaverStatus.state == "chopping" && <AnimatedSprite loop={Animations.WoodShavingsLoop} anchor={0.5}/>}
			<Beaver beaver={beaverStatus}/>
		</Container>
	);
};

export default Tree;

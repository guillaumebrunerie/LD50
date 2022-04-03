import * as React from "react";
import * as PIXI from "pixi.js"
import { Container, Sprite, Text, usePixiTicker } from "react-pixi-fiber/index.js";
import { findPosition, Branch } from "./Branch";
import Circle from "./components/Circle";
import Rectangle from "./components/Rectangle";
import { Textures, Animations } from "./Loader";
import { useInterval } from "./useInterval";
import useLocalTime from "./hooks/useLocalTime";
import { sound } from '@pixi/sound';
import Bird from "./Bird";
import Beaver from "./Beaver";
import AnimatedSprite from "./components/AnimatedSprite";

const treeFactor = [0.3, 1, 3];
const birdFactor = {"Small": 0.3, "Medium": 1, "Big": 3};
const aFactor = 2e-5;  // Influence of one degree
const bFactor = 4e-5; // Influence of one bird
const landingSpeed = 0.05; // Influence of one bird landing
const takeOffSpeed = -0.02; // Influence of one bird leaving
const limitAngle = 20; // Max angle before the game is lost
const endAcceleration = 0; //0.015; // Acceleration when we reach the limit angle
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
	React.useLayoutEffect(() => {
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

const TrunkBack = () => {
	return (
		<>
			<Circle x={0} y={-900} radius={700} fill={0x00AA00} />
			<Sprite texture={Textures.Tree.get("TreeBack")} anchor={0.5} y={backgroundY} />
		</>
	)
}

const Owl = ({owl, onClick}) => {
	if (owl.state === "hidden") {
		return null;
	}

	return (
		<Sprite texture={Textures.Owl} anchor={0.5} y={owlY} interactive buttonMode pointerdown={onClick}/>
	)
}

const Trunk = ({state: {level, broken}}) => {
	const endTexture = Textures.Tree.get("TreeEnd_0" + level + (broken ? "_Broken" : ""));

	return (
		<>
			<Sprite texture={Textures.Tree.get("Tree")} anchor={[0.5, 1]} y={treeY} />
			<Sprite texture={endTexture} anchor={[0.5, 0]} y={0} y={endY} />
		</>
	);
};

const BeeHive = ({onClick, ...props}) => {
	return <Sprite texture={Textures.BeeHive} anchor={[0.5, 0]} buttonMode={!!onClick} interactive={!!onClick} pointerdown={onClick} {...props}/>
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

const bearAppearDuration = 300;
const bearStraightenDuration = 700;
const bearDisappearDuration = 300;

const Bear = ({x, y, flipped, state, ...props}) => {
	const {t} = useLocalTime();
	const mask = React.useRef();
	const angle = {
		"fallen": 35 * Math.max(1 - t / bearAppearDuration, 0),
		"grabbing": 0,
		"disappearing": 35 * Math.max((t - bearAppearDuration - bearStraightenDuration) / bearDisappearDuration, 0),
	}[state];

	return (
		<Container scale={[flipped ? -1 : 1, 1]}>
			<Sprite texture={Textures.Bear} anchor={[1, 1]} angle={angle} mask={mask.current}
					x={x} y={y}
					{...props}/>
			<Rectangle ref={mask} x={x - 300} y={y - 700} width={300} height={700}/>
		</Container>
	)
}

const getAngle = () => (Math.random() - 0.5) * 20

const Tree = ({x, y, isFirstScreen, isGameOver, gameOver}) => {
	const [angle, setAngle] = React.useState(0);
	const [speed, setSpeedRaw] = React.useState(0);
	const setSpeed = setter => {
		if (Math.abs(angle) >= limitAngle) {
			return;
		}
		setSpeedRaw(setter);
	};
	const [branches, setBranches] = React.useState([
		{id: 1, x: 36, y: -300,  flipX: false, state: 0, angle1: getAngle(), angle2: getAngle(), type: "A"},
		{id: 2, x: 36, y: -450,  flipX: true,  state: 0, angle1: getAngle(), angle2: getAngle(), type: "B"},
		{id: 3, x: 36, y: -600,  flipX: false, state: 0, angle1: getAngle(), angle2: getAngle(), type: "C"},
		{id: 4, x: 36, y: -750,  flipX: true,  state: 0, angle1: getAngle(), angle2: getAngle(), type: "A"},
		{id: 5, x: 36, y: -900,  flipX: false, state: 0, angle1: getAngle(), angle2: getAngle(), type: "B"},
		{id: 6, x: 36, y: -1050, flipX: true,  state: 0, angle1: getAngle(), angle2: getAngle(), type: "C"},
	]);

	const [birds, setBirds] = React.useState([]);
	const [treeState, setTreeState] = React.useState({level: 1, broken: false});

	useOnMount(() => {
		if (isFirstScreen) {
			setAngle(-90);
			setBeeHive({state: "gone", y: -2000});
		} else {
			setTimeout(() => {
				addBird(findPosition(branches, [], 1));
				addBird(findPosition(branches, [], -1));
			}, 1000);
			setTimeout(() => {
				addBird(findPosition(branches, [], 1));
				addBird(findPosition(branches, [], -1));
			}, 1500);
		}
	});

	let baseAcceleration = Math.sin(angle * Math.PI/180) * 90 * aFactor * treeFactor[treeState.level - 1];
	let acceleration = baseAcceleration;
	birds.filter(b => b.state === "standing").forEach(b => {
		if (b.x > 0) {
			acceleration += bFactor * treeFactor[treeState.level - 1] * birdFactor[b.size];
		} else {
			acceleration -= bFactor * treeFactor[treeState.level - 1] * birdFactor[b.size];
		}
	});
	if (Math.abs(angle) > limitAngle) {
		acceleration += angle > 0 ? endAcceleration : -endAcceleration;
	}

	// "Main loop"
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

		setSpeedRaw(speed + acceleration);
		setAngle(angle + delta * speed);
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
					const deltaSpeed = landingSpeed * treeFactor[treeState.level - 1] * birdFactor[bird.size];
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
		const data = birdProbabilities[birds.length]
		const newBird = data ? Math.random() < data["in"] : 0;
		const birdLeaves = data ? Math.random() < data["out"] : 0;
		if (birdLeaves) {
			removeRandomBird();
		}
		if (newBird) {
			addBird(findPosition(branches, birds));
		}
	}, 1000);

	const randomDestination = () => ({
		x: Math.random() > 0.5 ? -400 : 400,
		y: -Math.random() * 1000,
	});

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

	const removeBird = (bird) => {
		setBirds(birds => {
			const deltaSpeed = takeOffSpeed * treeFactor[treeState.level - 1] * birdFactor[bird.size];
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

	const addBird = (dest) => {
		if (!dest) {
			return;
		}
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
	};

	const flipBird = bird => () => {
		sound.play("Chirp");
		const newPosition = findPosition(branches, birds, -bird.x);
		if (!newPosition) {
			removeBird(bird);
			return;
		}
		setBirds(birds.map(b => b === bird ? {...b, dest: newPosition, state: "flying"} : b));
	};

	const getBranchAngle = () => {
		return (Math.random() > 0.5 ? -1 : 1) * (30 + Math.random() * 40);
	}

	const breakBranch = branch => {
		const angle1 = getBranchAngle();
		const deltaAngle = Math.abs(getBranchAngle());
		const angle2 = angle1 > 0 ? angle1 - deltaAngle : angle1 + deltaAngle;

		switch (branch.state) {
		case 0:
			return [{...branch, state: 1, angle2: angle1}];
		case 1:
			return [{...branch, state: 2, angle1, angle2}];
		case 2: {
			const a = angle * Math.PI/180;
			const origX = branch.x * (branch.flipX ? -1 : 1);
			const origY = branch.y;
			const x = (origX * Math.cos(a) - origY * Math.sin(a)) * (branch.flipX ? -1 : 1);
			const y = origY * Math.cos(a) + origX * Math.sin(a);
			const angle1 = branch.angle1 + (branch.flipX ? -1 : 1) * angle;
			const angle2 = branch.angle2 + (branch.flipX ? -1 : 1) * angle;
			return [
				{...branch, state: 3},
				{...branch, id: branch.id + 100, x, y, dropping: true, state: 3, angle1, angle2, speed: 3}
			];
		}
		}
	}

	const branchAcceleration = 0.5;

	useTicker(delta => {
		setBranches(branches.map(branch => {
			if (!branch.dropping || branch.dropped) {
				return branch;
			}
			const dropped = branch.y > 100;
			if (dropped) {
				scareBeaver();
			}
			return {...branch, dropped, y: branch.y + branch.speed, speed: branch.speed + branchAcceleration * delta}
		}));
	});

	const branchSpeed = 0.2;
	const holdBranch = branch => () => {
		const deltaSpeed = (0.5 + Math.random() / 2) * branchSpeed;
		setSpeedRaw(branch.flipX ? speed - deltaSpeed : speed + deltaSpeed);
		const brokenBranches = breakBranch(branch);
		setBranches(branches.flatMap(b => b === branch ? brokenBranches : [b]))
		scareBirds(branch.id);

		// Reposition bee hive
		if (branch.id === 1 && beeHive.state === "attached") {
			if (brokenBranches.length == 1) {
				reAttachBeeHive(brokenBranches[0]);
			} else {
				dropBeeHive();
			}
		}
	};

	const beaverSpeed = 0.5;
	const choppingTime = 3000;
	const waitingTime = 10000;
	const beaverY = 180;
	const beaverX = 110;
	// state: "hidden", "arriving", "chopping", "leaving"
	const [beaverStatus, setBeaverStatus] = React.useState({state: "hidden", x: 500, y: beaverY, timeout: waitingTime})

	useTicker(delta => {
		const deltaMS = delta * 16.67;
		if (!isGameOver && beaverStatus.timeout > deltaMS) {
			setBeaverStatus({...beaverStatus, timeout: beaverStatus.timeout - deltaMS});
		} else {
			switch (beaverStatus.state) {
			case "hidden": {
				if (!isGameOver) {
					setBeaverStatus({...beaverStatus, state: "arriving", x: 500, y: beaverY, dest: {x: beaverX, y: beaverY}, timeout: 0});
				}
				break;
			}
			case "chopping": {
				if (!isGameOver && treeState.level < 3) {
					setTreeState({...treeState, level: treeState.level + 1});
				}
				setBeaverStatus({...beaverStatus, state: "leaving", dest: {x: -500, y: beaverY}, timeout: 0});
				break;
			}
			case "scared":
			case "leaving":
			case "arriving": {
				const {arrived, x, y} = move(beaverStatus, beaverStatus.dest, deltaMS, beaverStatus.state == "scared" ? 3 * beaverSpeed : beaverSpeed);
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

	const scareBeaver = () => {
		switch (beaverStatus.state) {
		case "hidden":
			setBeaverStatus({...beaverStatus, timeout: waitingTime});
			break;
		case "chopping":
		case "leaving":
		case "arriving":
			setBeaverStatus({...beaverStatus, state: "scared", dest: {x: -500, y: beaverY}, timeout: 0});
			break;
		}
	}

	const beeHiveAcceleration = 0.5;
	const [beeHive, setBeeHive] = React.useState({state: "attached", x: 150, y: -300, speed: 0, timeout: 0, angle: 0});

	const reAttachBeeHive = branch => {
		const a = branch.angle1 * Math.PI/180;
		const distance = 100;
		setBeeHive({...beeHive, x: branch.x + Math.cos(a) * distance, y: branch.y + Math.sin(a) * distance})
	}

	const dropBeeHive = () => {
		if (beeHive.state !== "attached") {
			return;
		}

		const a = angle * Math.PI/180;
		const x = beeHive.x * Math.cos(a) - beeHive.y * Math.sin(a);
		const y = beeHive.y * Math.cos(a) + beeHive.x * Math.sin(a);

		setBeeHive({...beeHive, state: "falling", x, y, speed: 4});
	}

	useTicker(delta => {
		const deltaMS = delta * 16.67;
		if (beeHive.state === "falling" && beeHive.y >= 0) {
			setBeeHive({...beeHive, state: "fallen", y: 0, timeout: bearAppearDuration, flipped: angle < 0})
			scareAllBirds();
			scareBeaver();
		} else if (beeHive.state == "falling") {
			setBeeHive({...beeHive, speed: beeHive.speed + beeHiveAcceleration, y: beeHive.y + beeHive.speed * delta});
		} else if (beeHive.state == "fallen") {
			const timeout = beeHive.timeout - deltaMS;
			if (timeout > 0) {
				setBeeHive({...beeHive, timeout});
			} else {
				setBeeHive({...beeHive, state: "grabbing", angle, timeout: bearStraightenDuration});
			}
		} else if (beeHive.state == "grabbing") {
			const timeout = beeHive.timeout - deltaMS;
			if (timeout > 0) {
				setSpeedRaw(0);
				setAngle(timeout / bearStraightenDuration * beeHive.angle);
				setBeeHive({...beeHive, timeout});
			} else {
				setBeeHive({...beeHive, state: "disappearing", timeout: bearDisappearDuration});
			}
		} else if (beeHive.state == "disappearing") {
			const timeout = beeHive.timeout - deltaMS;
			if (timeout > 0) {
				setBeeHive({...beeHive, timeout});
			} else {
				setBeeHive({...beeHive, state: "gone"});
			}
		}
	})

	const [owl, setOwl] = React.useState({state: "watching"});
	const owlTrigger = () => {
		setOwl({state: "hidden"});

		const leftBirds = birds.filter(bird => bird.x < 0).length;
		const rightBirds = birds.filter(bird => bird.x > 0).length;
		// This is the desired left - right
		const goal = angle > 20 ? 2 : angle > 10 ? 1 : angle > -10 ? 0 : angle > -20 ? -1 : -2;
		const currentValue = leftBirds - rightBirds;
		const signedBirdsToAddLeft = goal - currentValue;
		const birdsToAddLeft = Math.ceil(Math.min(Math.max((4 + signedBirdsToAddLeft) / 2, 0), 4));
		const birdsToAddRight = Math.ceil(Math.min(Math.max((4 - signedBirdsToAddLeft) / 2, 0), 4));
		// Add 4 or 5 birds to try to reach an equilibrium
		[...new Array(birdsToAddLeft).keys()].forEach(() => addBird(findPosition(branches, birds, -1)));
		[...new Array(birdsToAddRight).keys()].forEach(() => addBird(findPosition(branches, birds, 1)));
	}

	const debugThings = [...new Array(0).keys()].map(() => findPosition(branches, []));

	return (
		<Container x={x} y={y}>
			<Stump state={treeState}/>
			<Container angle={angle}>
				<TrunkBack/>
				<Owl owl={owl} onClick={owlTrigger}/>
				<Trunk state={treeState}/>
				{["fallen", "grabbing", "disappearing"].includes(beeHive.state) && <Bear x={-44} y={-90} flipped={beeHive.flipped} state={beeHive.state}/>}
				{branches.filter(b => !b.dropping).map(branch => (
					<Branch
						key={branch.id}
						branch={{...branch, dropping: false}}
						onClick={holdBranch(branch)}
					/>
				))}
				{beeHive.state === "attached" && <BeeHive x={beeHive.x} y={beeHive.y} angle={-angle} onClick={dropBeeHive}/>}
				{birds.map(bird => (
					<Bird
						key={bird.id}
						bird={bird}
						onClick={flipBird(bird)}
					/>
				))}
				{debugThings.map(({x, y}, i) => <Circle key={i} x={x} y={y}/>)}
			</Container>
			{beeHive.state !== "attached" && <BeeHive x={beeHive.x} y={beeHive.y}/>}
			{branches.filter(b => b.dropping).map(branch => (
				<Branch key={branch.id} branch={branch}/>
			))}
			{beaverStatus.state == "chopping" && <AnimatedSprite loop={Animations.WoodShavingsLoop} anchor={0.5}/>}
			<Beaver beaver={beaverStatus}/>
		</Container>
	);
};

			// <Text text={"Speed:" + Math.round(speed * 100)} x={0} y={0}/>
			// <Text text={"Acceleration:" + Math.round(baseAcceleration * 10000) + " + " + Math.round((acceleration - baseAcceleration) * 10000)} x={0} y={-30}/>
export default Tree;

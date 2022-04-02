import * as React from "react";
import Rectangle from "./components/Rectangle";
import Circle from "./components/Circle";
import {Sprite, Container, Text} from "react-pixi-fiber/index.js";
import {usePixiTicker} from "react-pixi-fiber/index.js";
import getSpeed from "./getSpeed";
import {Textures} from "./Loader";

const treeEndState = 1;

const trunkY = 35;
const treeY = -35;
const backgroundY = -830;
const endY = [null, 12, 6, 2];

const TrunkFloor = () => {
	const endTexture = Textures.Tree.get("TreeEnd_0" + treeEndState);
	return (
		<>
			<Sprite texture={Textures.Tree.get("Trunk")} anchor={[0.5, 0]} y={trunkY}/>
			<Sprite texture={endTexture} anchor={[0.5, 1]} y={0} scale={[1, -1]} y={-endY[treeEndState]}/>
		</>
	);
}

const Trunk = () => {
	const endTexture = Textures.Tree.get("TreeEnd_0" + treeEndState);

	return (
		<>
			<Circle x={0} y={-900} radius={700} fill={0x00AA00}/>
			<Sprite texture={Textures.Tree.get("TreeBack")} anchor={0.5} y={backgroundY}/>
			<Sprite texture={Textures.Tree.get("Tree")} anchor={[0.5, 1]} y={treeY}/>
			<Sprite texture={endTexture} anchor={[0.5, 1]} y={0} y={endY[treeEndState]}/>
		</>
	)
}

const Bird = ({bird: {x, y, size, color}, onClick, ...props}) => {
	return (
		<Sprite texture={Textures.Birds.get(`Bird_${size}_0${color}`)} anchor={0.5} x={x} y={-y} interactive buttonMode pointerdown={onClick}/>
	)
}

const useInterval = (callback, interval) => {
	const cbRef = React.useRef();
	React.useEffect(() => {
		cbRef.current = callback;
	}, [callback]);
	React.useEffect(() => {
		const id = setInterval(() => {cbRef.current();}, interval);
		return () => clearInterval(id)
	}, [interval]);
};

const useWindowEventListener = (event, listener) => {
	React.useEffect(() => {
		window.addEventListener(event, listener);
		return () => window.removeEventListener(event, listener);
	}, [event, listener]);
};

const branchDeltaX = 36;
const branchDeltaX2 = {
	"A": 180,
	"B": 170,
	"C": 160,
}
const branchDeltaY2 = {
	"A": -11,
	"B": 3,
	"C": -6,
};

const Branch = ({branch: {y, flipX, state, type}, onClick}) => {
	const width = [350, 250, 150, 50][state];
	const texture1 = Textures.Tree.get(`Branch_${type}_01`);
	const texture2 = Textures.Tree.get(`Branch_${type}_02`);

	return (
		<Container scale={[flipX ? -1 : 1, 1]}>
			<Rectangle
				x={branchDeltaX}
				y={-y - 30}
				width={width}
				height={60}
				alpha={0.001}
				interactive
				buttonMode
				pointerdown={onClick}
			/>
			<Sprite texture={texture1} anchor={[0, 0.5]} y={-y} x={branchDeltaX}/>
			<Sprite texture={texture2} anchor={[0, 0.5]} y={-y + branchDeltaY2[type]} x={branchDeltaX2[type]}/>
		</Container>
	)
};

const findPosition = (branches, sign = 0) => {
	if (sign > 0) {
		branches = branches.filter(branch => !branch.flipX);
	} else if (sign < 0) {
		branches = branches.filter(branch => branch.flipX);
	}
	const branch = branches[Math.floor(Math.random() * branches.length)];
	const y = branch.y + 30;
	const x = (50 + Math.random() * 300) * (branch.flipX ? -1 : 1);
	return {x, y};
};

const aFactor = 1e-5;  // Influence of one degree
const bFactor = 4e-5; // Influence of one bird
const landingSpeed = 0.05; // Influence of one bird landing
const takeOffSpeed = -0.02; // Influence of one bird leaving
const limitAngle = 20; // Max angle before the game is lost
const endAcceleration = 0.015; // Acceleration when we reach the limit angle
const movingStrength = 0.02; // By how much the tree moves when we drag it
const inertiaStrength = movingStrength * 10; // By how much the tree moves when we release it
const releaseTimeout = 500; // How long we can hold a branch

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
		{id: 1, y: 300, flipX: false, state: 0, type: "A"},
		{id: 2, y: 450, flipX: true, state: 0, type: "B"},
		{id: 3, y: 600, flipX: false, state: 0, type: "C"},
		{id: 4, y: 750, flipX: true, state: 0, type: "A"},
		{id: 5, y: 900, flipX: false, state: 0, type: "B"},
		{id: 6, y: 1050, flipX: true, state: 0, type: "C"},
	]);

	const [birds, setBirds] = React.useState([]);
	const isHoldingBranch = React.useRef();

	React.useEffect(() => {
		addBird(findPosition(branches), false);
		addBird(findPosition(branches), false);
		addBird(findPosition(branches), false);
		addBird(findPosition(branches), false);
		addBird(findPosition(branches), false);
	}, []);

	// Main loop
	usePixiTicker(delta => {
		if (angle > 90) {
			setAngle(90);
			setSpeedRaw(0);
			gameOver();
			return;
		}
		if (angle < -90) {
			setAngle(-90);
			setSpeedRaw(0);
			gameOver();
			return;
		}
		if (isHoldingBranch.current) {
			return;
		}

		let a = angle * aFactor;
		birds.forEach(b => {
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

	// Birds arriving
	useInterval(() => {
		addBird(findPosition(branches));
	}, 3000);

	// Birds leaving
	useInterval(() => {
		setBirds(birds => {
			const index = Math.floor(Math.random() * birds.length);
			setSpeed(speed => birds[index].x < 0 ? speed - takeOffSpeed : speed + takeOffSpeed);
			return birds.filter(b => b !== birds[index]);
		});
	}, 4000);

	const addBird = (bird, changeSpeed = true) => {
		const randomColor = () => Math.floor(Math.random() * 3) + 1;
		const randomSize = () => ["Small", "Medium", "Big"][Math.floor(Math.random() * 3)];
		setBirds(birds => [...birds, {id: Math.random(), color: randomColor(), size: randomSize(), ...bird}])
		if (changeSpeed) {
			setSpeed(speed => bird.x < 0 ? speed - landingSpeed : speed + landingSpeed);
		}
	};

	const flipBird = id => () => {
		const bird = birds.find(b => b.id === id);
		const newPosition = findPosition(branches, -bird.x);
		setBirds(birds.map(b => b === bird ? {...b, ...newPosition} : b));
		const previousX = birds.find(b => b.id === id).x;
		setSpeed(speed => previousX > 0 ? speed - landingSpeed : speed + landingSpeed);
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
		setBranches(branches => branches.map(branch => branch.id === id ? {...branch, state: Math.min(branch.state + 1, 3)} : branch))
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
				<TrunkFloor/>
			</Container>
			<Container angle={angle} x={x} y={y}>
				<Trunk/>
				{branches.map(({id, ...branch}) => (
					<Branch
						key={id}
						branch={branch}
						onClick={holdBranch(id)}
					/>
				))}
				{birds.map(({id, ...bird}) => <Bird key={id} bird={bird} onClick={flipBird(id)}/>)}
			</Container>
		</>
	);
};

const StartButton = ({onClick}) => {
	return (
		<Rectangle
			x={150}
			y={800}
			width={400}
			height={150}
			fill={0x880088}
			interactive
			buttonMode
			pointerdown={onClick}
		>
			<Text x={350} y={875} anchor={0.5} text="START"/>
		</Rectangle>
	);
};

const MainScreen = () => {
	const [isGameOver, setIsGameOver] = React.useState(false);
	const [attempt, setAttempt] = React.useState(0);
	const [startTime, setStartTime] = React.useState(() => Date.now());
	const [lastScore, setLastScore] = React.useState(0);
	const [highScore, setHighScore] = React.useState(0);

	const gameOver = () => {
		if (!isGameOver) {
			setIsGameOver(true);
			const deltaTime = Date.now() - startTime;
			const score = Math.round(deltaTime / 100) / 10;
			setLastScore(score);
			setHighScore(highScore => Math.max(highScore, score));
		}
	};

	const newGame = () => {
		setAttempt(attempt => attempt + 1);
		setTimeout(() => {
			setIsGameOver(false);
		});
		setStartTime(Date.now());
	}

	return (
		<Container>
			<Tree key={attempt} gameOver={gameOver} x={360} y={1280 - 115}/>
			{isGameOver && <Text x={10} y={10} text={"Game over"}/>}
			{isGameOver && lastScore > 0 && <Text x={10} y={40} text={`You lasted ${lastScore} seconds\nHigh score: ${highScore} seconds`}/>}
			{isGameOver && <StartButton onClick={newGame}/>}
		</Container>
	);
};

export default MainScreen;

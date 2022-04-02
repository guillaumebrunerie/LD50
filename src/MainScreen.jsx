import * as React from "react";
import Rectangle from "./components/Rectangle";
import Circle from "./components/Circle";
import {Container, Text} from "react-pixi-fiber/index.js";
import {usePixiTicker} from "react-pixi-fiber/index.js";

const Trunk = () => {
	return (
		<>
			<Circle x={0} y={-900} radius={700} fill={0x00AA00}/>
			<Rectangle x={-30} y={-1500} width={60} height={1500} fill={0x005500}/>
		</>
	)
}

const Bird = ({bird: {x, y}, onClick, ...props}) => {
	return (
		<Circle x={x} y={-y} radius={30} fill={0xFF0000} interactive buttonMode pointerdown={onClick} {...props}/>
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

const Branch = ({branch: {y, flipX, state}, onClickStart, onClickMove, onClickRelease}) => {
	const width = [350, 250, 150, 50][state];
	const [isPointerDown, setIsPointerDown] = React.useState(false)
	const [position, setPosition] = React.useState();
	const pointerdown = event => {
		setIsPointerDown(true);
		let originalEvent = event.data.originalEvent;
		if (originalEvent instanceof TouchEvent) {
			originalEvent = originalEvent.changedTouches[0];
		}
		setPosition({x: originalEvent.clientX, y: originalEvent.clientY})
		onClickStart();
	};
	useWindowEventListener("pointermove", event => {
		if (isPointerDown) {
			if (position) {
				onClickMove({dx: event.clientX - position.x, dy: event.clientY - position.y});
			}
			setPosition({x: event.clientX, y: event.clientY})
		}
	});
	useWindowEventListener("pointerup", () => {
		if (isPointerDown) {
			setIsPointerDown(false);
			setPosition()
			onClickRelease();
		}
	});

	return (
		<Rectangle
			x={flipX ? -width : 0}
			y={-y}
			width={width}
			height={60}
			fill={0x005500}
			interactive
			buttonMode
			pointerdown={pointerdown}
		/>
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

const Tree = ({gameOver}) => {
	const [angle, setAngle] = React.useState(0);
	const [speed, setSpeedRaw] = React.useState(0);
	const setSpeed = setter => {
		if (Math.abs(angle) >= limitAngle) {
			return;
		}
		setSpeedRaw(setter);
	};
	const [branches, setBranches] = React.useState([
		{id: 1, y: 400, flipX: false, state: 0},
		{id: 2, y: 550, flipX: true, state: 0},
		{id: 3, y: 700, flipX: false, state: 0},
		{id: 4, y: 850, flipX: true, state: 0},
		{id: 5, y: 1000, flipX: false, state: 0},
		{id: 6, y: 1150, flipX: true, state: 0},
	]);

	const [birds, setBirds] = React.useState([
		// {id: 1, x: -100, y: -1100},
		// {id: 2, x: -100, y: -1200},
		// {id: 3, x: -100, y: -800},
		// {id: 4, x: -100, y: -1000},
		// {id: 5, x: -100, y: -900},
	]);
	const [isHoldingBranch, setIsHoldingBranch] = React.useState(false);

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
		if (isHoldingBranch) {
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
		setAngle(angle => isHoldingBranch ? angle : angle + delta * speed);
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
		setBirds(birds => [...birds, {id: Math.random(), ...bird}])
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

	const holdBranch = id => () => {
		setIsHoldingBranch(true);
		setSpeedRaw(0);
		setTimeout(releaseBranch(id), 500);
	};

	const moveBranch = id => ({dx}) => {
		if (isHoldingBranch) {
			setAngle(angle => angle + dx * movingStrength);
		}
	};

	const releaseBranch = (id) => () => {
		setIsHoldingBranch(isHoldingBranch => {
			if (isHoldingBranch) {
				setTimeout(() => {
					setBranches(branches => branches.map(branch => branch.id === id ? {...branch, state: branch.state + 1} : branch))
				});
			}
			return false;
		});
	}

	return (
		<Container angle={angle} x={360} y={1280}>
			<Trunk/>
			{branches.map(({id, ...branch}) => (
				<Branch
					key={id}
					branch={branch}
					onClickStart={holdBranch(id)}
					onClickMove={moveBranch(id)}
					onClickRelease={releaseBranch(id)}
				/>
			))}
			{birds.map(({id, ...bird}) => <Bird key={id} bird={bird} onClick={flipBird(id)}/>)}
		</Container>
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
}

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
			<Tree key={attempt} gameOver={gameOver}/>
			{isGameOver && <Text x={10} y={10} text={"Game over"}/>}
			{isGameOver && lastScore > 0 && <Text x={10} y={40} text={`You lasted ${lastScore} seconds\nHigh score: ${highScore} seconds`}/>}
			{isGameOver && <StartButton onClick={newGame}/>}
		</Container>
	);
}

export default MainScreen;

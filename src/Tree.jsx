import * as React from "react";
import { Container, Sprite } from "react-pixi-fiber/index.js";
import { findPosition, Branch } from "./Branch";
import Circle from "./components/Circle";
import Rectangle from "./components/Rectangle";
import { Textures, Animations } from "./Loader";
import { useInterval } from "./useInterval";
import useLocalTime from "./hooks/useLocalTime";
import useTicker from "./hooks/useTicker";
import { sound } from '@pixi/sound';
import Bird from "./Bird";
import Beaver from "./Beaver";
import AnimatedSprite from "./components/AnimatedSprite";

const branchWeight = 2;
const beeHiveWeight = 2;
const birdWeight = {"Small": 1, "Medium": 2, "Big": 3};
const birdSpeedFactor = [0.01, 0.04, 0.07];
const limitAngle = 25; // Max angle before the game is lost
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
const treeCoronaY = -775;

const Stump = ({state: {level, broken}}) => {
	const endTexture = Textures.Tree.get("TreeEnd_0" + level + ((broken && level <= 2) ? "_Broken" : ""));
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
			<Sprite texture={Textures.TreeCoronaBack} anchor={0.5} x={0} y={treeCoronaY}/>
			<Sprite texture={Textures.Tree.get("TreeBack")} anchor={0.5} y={backgroundY} />
		</>
	)
}

const TreeFront = () => {
	return (
		<>
			<Sprite texture={Textures.TreeCoronaFront} anchor={0.5} x={0} y={treeCoronaY}/>
		</>
	)
}

const owlIdleDelay = 6000;

const Owl = ({owl, onClick}) => {
	if (owl.state === "hidden") {
		return <AnimatedSprite key={1} start={Animations["Owl_Howl"]} anchor={0.5} y={owlY}/>
	}

	const {t} = useLocalTime();
	const tMod = t % owlIdleDelay;
	const anim = Animations["Owl_Idle"];
	const texture = (tMod < anim.duration) ? anim.at(tMod) : Textures["OwlIdle"].get("Owl_Idle_000");

	return (
		<Sprite key={0} texture={texture} anchor={0.5} y={owlY} interactive buttonMode pointerdown={onClick}/>
	)
}

const Trunk = ({state: {level, broken}}) => {
	const endTexture = Textures.Tree.get("TreeEnd_0" + level + ((broken && level <= 2) ? "_Broken" : ""));

	return (
		<>
			<Sprite texture={Textures.Tree.get("Tree")} anchor={[0.5, 1]} y={treeY} />
			<Sprite texture={endTexture} anchor={[0.5, 0]} y={0} y={endY} />
		</>
	);
};

const BeeHive = ({beeHive: {state, x, y}, active, onClick, ...props}) => {
	onClick = active && onClick;

	if (state === "attached") {
		return <Sprite texture={Textures.BeeHive} anchor={[0.5, 0]} buttonMode={!!onClick} interactive={!!onClick} pointerdown={onClick} x={x} y={y} {...props}/>;
	} else if (state === "falling") {
		return (
			<AnimatedSprite key={1} start={Animations["BeeHive_Start"]} anchor={[0.5, 0]} loop={Textures.BeeHiveLoop} x={x} y={y} {...props}/>
		)
	} else {
		return (
			<AnimatedSprite key={2} start={Animations["BeeHive_End"]} anchor={[0.5, 0]} x={x} y={y} {...props}/>
		)
	}
}

const bearGrabFrame = 9;
const bearReleaseFrame = 18;
const bearFps = 15;

const bearAppearDuration = bearGrabFrame * 1000 / bearFps; //300;
const bearStraightenDuration = (bearReleaseFrame - bearGrabFrame) * 1000 / bearFps; //700);
const bearDisappearDuration = (25 - bearReleaseFrame) * 1000 / bearFps; //300);

const BearBack = ({flipped, state, ...props}) => {
	return (
		<AnimatedSprite
			start={Animations["TheBear_Back"]}
			anchor={[0.5, 0.5]}
			scale={[flipped ? -1 : 1, 1]}
			{...props}
		/>
	)
}

const BearFront = ({flipped, state, ...props}) => {
	return (
		<AnimatedSprite
			start={Animations["TheBear_Front"]}
			anchor={[0.5, 0.5]}
			scale={[flipped ? -1 : 1, 1]}
			{...props}
		/>
	)
}

// const Bear = ({x, y, flipped, state, ...props}) => {
// 	const {t} = useLocalTime();
// 	const mask = React.useRef();
// 	const angle = {
// 		"fallen": 35 * Math.max(1 - t / bearAppearDuration, 0),
// 		"grabbing": 0,
// 		"disappearing": 35 * Math.max((t - bearAppearDuration - bearStraightenDuration) / bearDisappearDuration, 0),
// 	}[state];

// 	return (
// 		<Container scale={[flipped ? -1 : 1, 1]}>
// 			<AnimatedSprite start={Animations["TheBear_Back"]} anchor={[1, 1]} angle={angle} mask={mask.current}
// 					x={x} y={y}
// 					{...props}/>
// 			<Rectangle ref={mask} x={x - 300} y={y - 700} width={300} height={700}/>
// 		</Container>
// 	)
// }

const getBranchAngles = () => {
	const getAngle = () => (Math.random() > 0.5 ? -1 : 1) * (20 + Math.random() * 30);
	const angle1 = getAngle();
	const deltaAngle = Math.abs(getAngle());
	const angle2 = angle1 > 0 ? angle1 - deltaAngle : angle1 + deltaAngle;
	return {angle1, angle2};
}

const Tree = ({x, y, isFirstScreen, isGameOver, gameOver}) => {
	const [angle, setAngle] = React.useState(0);
	const [speed, setSpeed] = React.useState(0);
	const [branches, setBranches] = React.useState([
		{id: 1, x: 36, y: -300,  flipX: false, state: 0, ...getBranchAngles(), type: "A"},
		{id: 2, x: 36, y: -450,  flipX: true,  state: 0, ...getBranchAngles(), type: "B"},
		{id: 3, x: 36, y: -600,  flipX: false, state: 0, ...getBranchAngles(), type: "C"},
		{id: 4, x: 36, y: -750,  flipX: true,  state: 0, ...getBranchAngles(), type: "A"},
		{id: 5, x: 36, y: -900,  flipX: false, state: 0, ...getBranchAngles(), type: "B"},
		{id: 6, x: 36, y: -1050, flipX: true,  state: 0, ...getBranchAngles(), type: "C"},
	]);

	const [birds, setBirds] = React.useState([]);
	const [treeState, setTreeState] = React.useState({level: 1, broken: false});

	useOnMount(() => {
		if (isFirstScreen) {
			setAngle(-90);
			setBeeHive({state: "gone", y: -2000});
		} else {
			setTimeout(() => {
				addBird(1);
				addBird(-1);
			}, 1000);
			setTimeout(() => {
				addBird(1);
				addBird(-1);
			}, 1500);
		}
	});

	const currentWeight = () => {
		let weight = 0;
		// Birds weight
		birds.filter(b => b.state === "standing").forEach(b => {
			if (b.x > 0) {
				weight += birdWeight[b.size];
			} else {
				weight -= birdWeight[b.size];
			}
		});
		// Branch weight
		branches.filter(b => b.state === 0).forEach(branch => {
			if (branch.flipX) {
				weight -= branchWeight;
			} else {
				weight += branchWeight;
			}
		})
		// Hive weight
		if (beeHive.state === "attached") {
			weight -= beeHiveWeight;
		}
		return weight;
	}

	// "Main loop"
	useTicker(delta => {
		if (isGameOver) {
			return;
		}

		if (Math.abs(angle) >= 90) {
			setAngle(90 * angle / Math.abs(angle));
			setSpeed(0);
			setTreeState(state => ({...state, broken: true}));
			scareAllBirds();
			gameOver();
			return;
		}

		let newSpeed = currentWeight();
		// Make sure the tree is always moving
		if (newSpeed == 0 && angle !== 0) {
			newSpeed = angle / Math.abs(angle);
		}
		const initialFallSpeed = 0.4;
		const finalFallSpeed = 4;
		if (angle > limitAngle) {
			newSpeed = ((angle - limitAngle) / (90 - limitAngle) * (finalFallSpeed - initialFallSpeed) + initialFallSpeed) / birdSpeedFactor[treeState.level - 1];
			// newSpeed = Math.max(newSpeed, fallingSpeed);
		}
		if (angle < -limitAngle) {
			newSpeed = ((angle + limitAngle) / (limitAngle - 90) * (initialFallSpeed - finalFallSpeed) - initialFallSpeed) / birdSpeedFactor[treeState.level - 1];
			// newSpeed *= Math.abs(angl)
			// newSpeed = Math.min(newSpeed, -fallingSpeed);
		}

		setSpeed(newSpeed * birdSpeedFactor[treeState.level - 1]);
		setAngle(angle + delta * speed);
	});

	// Main loop for flying birds
	useTicker(delta => {
		setBirds(birds => birds.flatMap(bird => {
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

	useInterval(() => {
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

	const randomDestination = (dir) => {
		const a = angle * Math.PI/180;
		const x = dir * 500;
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

			const dest = findPosition(branches, birds, side)
			if (!dest) {
				return birds;
			}
			const randomColor = () => Math.floor(Math.random() * 3) + 1;
			const randomSize = () => ["Small", "Medium", "Big"][Math.floor(Math.random() * 3)];
			const newBird = {
				id: Math.random(),
				color: randomColor(),
				size: randomSize(),
				...randomDestination(dest.x / Math.abs(dest.x)),
				dest,
				state: "flying",
			}
			return [...birds, newBird];
		});
	};

	const flipBird = bird => () => {
		sound.play("Chirp");
		const newPosition = findPosition(branches, birds, -bird.x);
		if (!newPosition) {
			removeBird(bird, -1);
			return;
		}
		setBirds(birds.map(b => b === bird ? {...b, dest: newPosition, state: "flying"} : b));
	};

	// const getBranchAngle = () => {
	// 	return (Math.random() > 0.5 ? -1 : 1) * (30 + Math.random() * 40);
	// }

	// const breakBranch = branch => {
	// 	const angle1 = getBranchAngle();
	// 	const deltaAngle = Math.abs(getBranchAngle());
	// 	const angle2 = angle1 > 0 ? angle1 - deltaAngle : angle1 + deltaAngle;

	// 	switch (branch.state) {
	// 	case 0:
	// 		return [{...branch, state: 1, angle2: angle1}];
	// 	case 1:
	// 		return [{...branch, state: 2, angle1, angle2}];
	// 	case 2: {
	// 		const a = angle * Math.PI/180;
	// 		const origX = branch.x * (branch.flipX ? -1 : 1);
	// 		const origY = branch.y;
	// 		const x = (origX * Math.cos(a) - origY * Math.sin(a)) * (branch.flipX ? -1 : 1);
	// 		const y = origY * Math.cos(a) + origX * Math.sin(a);
	// 		const angle1 = branch.angle1 + (branch.flipX ? -1 : 1) * angle;
	// 		const angle2 = branch.angle2 + (branch.flipX ? -1 : 1) * angle;
	// 		return [
	// 			{...branch, state: 3},
	// 			{...branch, id: branch.id + 100, x, y, dropping: true, state: 3, angle1, angle2, speed: 3}
	// 		];
	// 	}
	// 	}
	// }

	const branchAcceleration = 0;

	useTicker(delta => {
		setBranches(branches.map(branch => {
			if (!branch.dropping || branch.dropped) {
				return branch;
			}
			const dropped = branch.y > 100;
			if (dropped) {
				sound.play("BranchDrops");
				scareBeaver();
			}
			return {...branch, dropped, y: branch.y + branch.speed, speed: branch.speed + branchAcceleration * delta}
		}));
	});

	const breakBranch = branch => () => {
		const a = angle * Math.PI/180;
		const origX = branch.x * (branch.flipX ? -1 : 1);
		const origY = branch.y;
		const x = (origX * Math.cos(a) - origY * Math.sin(a)) * (branch.flipX ? -1 : 1);
		const y = origY * Math.cos(a) + origX * Math.sin(a);
		const angle1 = branch.angle1 + (branch.flipX ? -1 : 1) * angle;
		const angle2 = branch.angle2 + (branch.flipX ? -1 : 1) * angle;

		const branch1 = {...branch, state: 3};
		const branch2 = {...branch, id: branch.id + 100, x, y, dropping: true, state: 3, angle1, angle2, speed: 40};

		setBranches(branches.flatMap(b => b === branch ? [branch1, branch2] : [b]))
		scareBirds(branch.id);
		sound.play("BranchBreaks");

		if (branch.id === 2 && beeHive.state === "attached") {
			dropBeeHive();
		}
	}

	// const branchSpeed = 0.2;
	// const holdBranch = branch => () => {
	// 	const deltaSpeed = (0.5 + Math.random() / 2) * branchSpeed;
	// 	// setAngle(branch.flipX ? angle - 5 : angle + 5);
	// 	// setSpeed(branch.flipX ? speed - deltaSpeed : speed + deltaSpeed);
	// 	const brokenBranches = breakBranch(branch);
	// 	setBranches(branches.flatMap(b => b === branch ? brokenBranches : [b]))
	// 	scareBirds(branch.id);

	// 	// Reposition bee hive
	// 	if (branch.id === 1 && beeHive.state === "attached") {
	// 		if (brokenBranches.length == 1) {
	// 			reAttachBeeHive(brokenBranches[0]);
	// 		} else {
	// 			dropBeeHive();
	// 		}
	// 	}
	// };

	const beaverSpeed = 0.5;
	const choppingTime = 3000;
	const waitingTime = 10000;
	const beaverY = 180;
	const beaverX = 110;
	// state: "hidden", "arriving", "chopping", "leaving"
	const [beaverStatus, setBeaverStatus] = React.useState({state: "hidden", direction: -1, x: 500, y: beaverY, timeout: waitingTime})

	useTicker(delta => {
		const deltaMS = delta * 16.67;
		if (!isGameOver && beaverStatus.timeout > deltaMS) {
			setBeaverStatus({...beaverStatus, timeout: beaverStatus.timeout - deltaMS});
		} else {
			switch (beaverStatus.state) {
			case "hidden": {
				if (!isGameOver) {
					const direction = Math.random() > 0.5 ? -1 : 1;
					sound.play("BeaverEnters");
					setBeaverStatus({...beaverStatus, state: "arriving", direction, x: 500, y: beaverY, dest: {x: beaverX, y: beaverY}, timeout: 0});
				}
				break;
			}
			case "chopping": {
				if (!isGameOver && treeState.level < 3) {
					setTreeState({...treeState, level: treeState.level + 1});
				}
				sound.play("BeaverAteTree");
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
					setBeaverStatus({...beaverStatus, state, x, y, timeout});
					if (state === "chopping") {
						sound.play("BeaverEatsTree");
					}
				} else {
					setBeaverStatus({...beaverStatus, x, y});
				}
				break;
			}
			}
		}
	});

	const minTimeoutScaredBeaver = 1000;
	const scareBeaver = () => {
		switch (beaverStatus.state) {
		case "hidden":
			setBeaverStatus({...beaverStatus, timeout: Math.max(beaverStatus.timeout, minTimeoutScaredBeaver)});
			break;
		case "chopping":
		case "leaving":
		case "arriving":
			sound.play("BeaverScared");
			setBeaverStatus({...beaverStatus, state: "scared", dest: {x: -500, y: beaverY}, timeout: 0});
			break;
		}
	}

	const beeHiveAcceleration = 0;
	const [beeHive, setBeeHive] = React.useState(() => {
		const branch = branches.find(b => b.id == 2);
		const a = branch.angle1 * Math.PI/180;
		const distance = 100;
		const x = - (branch.x + Math.cos(a) * distance);
		const y = branch.y + Math.sin(a) * distance;
		return {state: "attached", x, y, speed: 0, timeout: 0, angle: 0}
	});

	const dropBeeHive = () => {
		if (beeHive.state !== "attached") {
			return;
		}

		const a = angle * Math.PI/180;
		const x = beeHive.x * Math.cos(a) - beeHive.y * Math.sin(a);
		const y = beeHive.y * Math.cos(a) + beeHive.x * Math.sin(a);

		sound.play("BeeHiveReleased");
		setBeeHive({...beeHive, state: "falling", x, y, speed: 30});
	}

	const beeHiveLimitY = -140;
	const beeHiveFallenY = -50;

	useTicker(delta => {
		const deltaMS = delta * 16.67;
		if (beeHive.state === "falling" && beeHive.y >= beeHiveLimitY) {
			sound.play("BeeHiveDrops");
			sound.play("Bear");
			setBeeHive({...beeHive, state: "fallen", y: beeHiveFallenY, timeout: bearAppearDuration, flipped: angle < 0})
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
				setSpeed(0);
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
		sound.play("Owl");
		setOwl({state: "hidden"});

		[...new Array(5).keys()].forEach(() => addBird(undefined, true));
	}

	// const debugThings = [...new Array(0).keys()].map(() => findPosition(branches, []));
	// const debugThings2 = [...new Array(10).keys()].map(() => randomDestination2(1));
	// const debugThings3 = [...new Array(10).keys()].map(() => randomDestination2(-1));

//
	const showBear = ["fallen", "grabbing", "disappearing"].includes(beeHive.state);

	return (
		<Container x={x} y={y} scale={0.9}>
			<Stump state={treeState}/>
			<Container angle={angle}>
				<TrunkBack/>
				<Owl owl={owl} onClick={owlTrigger}/>
				{showBear && <BearBack x={0} y={-350} flipped={beeHive.flipped} state={beeHive.state}/>}
				<Trunk state={treeState}/>
				{showBear && <BearFront x={0} y={-350} flipped={beeHive.flipped} state={beeHive.state}/>}
				{owl.state === "hidden" && <Owl owl={owl} onClick={owlTrigger}/>}
				{branches.filter(b => !b.dropping).map(branch => (
					<Branch
						key={branch.id}
						branch={{...branch, dropping: false}}
						onClick={breakBranch(branch)}
					/>
				))}
				{beeHive.state === "attached" && <BeeHive beeHive={beeHive} angle={-angle} active={Math.abs(angle) <= limitAngle} onClick={dropBeeHive}/>}
				{birds.map(bird => (
					<Bird
						key={bird.id}
						bird={bird}
						onClick={flipBird(bird)}
						angle={-angle}
					/>
				))}
				<TreeFront/>
				{/*debugThings.map(({x, y}, i) => <Circle key={i} x={x} y={y}/>)*/}
				{/*debugThings2.map(({x, y}, i) => <Circle key={i} x={x} y={y}/>)*/}
				{/*debugThings3.map(({x, y}, i) => <Circle key={i} x={x} y={y}/>)*/}
			</Container>
			{beeHive.state !== "attached" && <BeeHive beeHive={beeHive} active={false}/>}
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

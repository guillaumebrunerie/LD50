import * as React from "react";
import {Textures} from "./Loader";
import {Sprite} from "react-pixi-fiber/index.js";
import useTicker from "./hooks/useTicker";

const stumpY = 38;
const treeY = -37;
const backgroundY = -830;
const endY = -52;
const treeCoronaY = -775;

export const Stump = ({tree: {level, broken}}) => {
	const endTexture = Textures.Tree.get("TreeEnd_0" + level + (broken ? "_Broken" : ""));
	return (
		<>
			<Sprite texture={Textures.Tree.get("Trunk")} anchor={[0.5, 0]} y={stumpY} />
			<Sprite texture={endTexture} anchor={[0.5, 0]} scale={[1, -1]} y={-endY} />
		</>
	);
};

export const TrunkBack = () => {
	return (
		<>
			<Sprite texture={Textures.TreeCoronaBack} anchor={0.5} x={0} y={treeCoronaY}/>
			<Sprite texture={Textures.Tree.get("TreeBack")} anchor={0.5} y={backgroundY} />
		</>
	)
}

export const Trunk = ({tree: {level, broken}}) => {
	const endTexture = Textures.Tree.get("TreeEnd_0" + level + (broken ? "_Broken" : ""));

	return (
		<>
			<Sprite texture={Textures.Tree.get("Tree")} anchor={[0.5, 1]} y={treeY} />
			<Sprite texture={endTexture} anchor={[0.5, 0]} y={endY} />
		</>
	);
};

export const TreeFront = () => {
	return (
		<>
			<Sprite texture={Textures.TreeCoronaFront} anchor={0.5} x={0} y={treeCoronaY}/>
		</>
	)
}

const birdSpeedFactor = [0.01, 0.025, 0.04, 0.055, 0.07];
const limitAngle = 25; // Max angle before the game is lost

export const useTree = ({isGameOver, gameOver, scareAllBirds, currentWeight}) => {
	const [angle, setAngle] = React.useState(0);
	const [speed, setSpeed] = React.useState(0);
	const [tree, setTree] = React.useState({level: 1, broken: isGameOver});

	// "Main loop"
	useTicker(delta => {
		if (isGameOver) {
			return;
		}

		if (Math.abs(angle) >= 90) {
			setAngle(90 * angle / Math.abs(angle));
			setSpeed(0);
			setTree(state => ({...state, broken: true}));
			scareAllBirds();
			gameOver();
			return;
		}

		let newSpeed = currentWeight();
		// Make sure the tree is always moving
		if (newSpeed == 0 && angle !== 0) {
			newSpeed = angle / Math.abs(angle);
		}
		if (Math.abs(newSpeed) <= Math.abs(angle) / 5) {
			newSpeed = newSpeed / Math.abs(newSpeed) * Math.abs(angle) / 5;
		}
		const initialFallSpeed = 0.4;
		const finalFallSpeed = 4;
		if (angle > limitAngle) {
			newSpeed = ((angle - limitAngle) / (90 - limitAngle) * (finalFallSpeed - initialFallSpeed) + initialFallSpeed) / birdSpeedFactor[tree.level - 1];
		}
		if (angle < -limitAngle) {
			newSpeed = ((angle + limitAngle) / (limitAngle - 90) * (initialFallSpeed - finalFallSpeed) - initialFallSpeed) / birdSpeedFactor[tree.level - 1];
		}

		setSpeed(newSpeed * birdSpeedFactor[tree.level - 1]);
		setAngle(angle + delta * speed);
	});

	const chopTree = () => setTree({...tree, level: tree.level + 1});

	return {tree, chopTree, angle, setAngle, speed, setSpeed, limitAngle};
}

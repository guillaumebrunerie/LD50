import * as React from "react";
import {Textures} from "./Loader";
import {Sprite} from "react-pixi-fiber/index.js";
import useTicker from "./hooks/useTicker";

const stumpY = 38;
const treeY = -37;
const lifeBarY = -70;
const lifeBarScale = 0.8;
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

const lifeBarsPos = {
	1: {x: 27, y: 8 - 21},
	2: {x: 14, y: 4 - 21},
	3: {x: 0, y: 3 - 21},
	4: {x: -14, y: 4 - 21},
	5: {x: -27, y: 8 - 21},
}

export const Trunk = ({tree: {level, broken}, health}) => {
	const endTexture = Textures.Tree.get("TreeEnd_0" + level + (broken ? "_Broken" : ""));
	const d = 1/5 * 1/3;

	return (
		<>
			<Sprite texture={Textures.Tree.get("Tree")} anchor={[0.5, 1]} y={treeY} />
			<Sprite texture={endTexture} anchor={[0.5, 0]} y={endY} />
			{health < 1 && (
				<Sprite texture={Textures.LifeBar.get("LifeBarBack")} anchor={[0.5, 1]} y={lifeBarY} scale={lifeBarScale}>
					{health > 4/5 + d && <Sprite texture={Textures.LifeBar.get("LifeBar_01")} anchor={0.5} x={lifeBarsPos[1].x} y={lifeBarsPos[1].y}/>}
					{health > 3/5 + d && <Sprite texture={Textures.LifeBar.get("LifeBar_02")} anchor={0.5} x={lifeBarsPos[2].x} y={lifeBarsPos[2].y}/>}
					{health > 2/5 + d && <Sprite texture={Textures.LifeBar.get("LifeBar_03")} anchor={0.5} x={lifeBarsPos[3].x} y={lifeBarsPos[3].y}/>}
					{health > 1/5 + d && <Sprite texture={Textures.LifeBar.get("LifeBar_04")} anchor={0.5} x={lifeBarsPos[4].x} y={lifeBarsPos[4].y}/>}
					{health > d && <Sprite texture={Textures.LifeBar.get("LifeBar_05")} anchor={0.5} x={lifeBarsPos[5].x} y={lifeBarsPos[5].y}/>}
				</Sprite>
			)}
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

const birdSpeedFactor = [0.015, 0.03, 0.045, 0.06, 0.075];
const limitAngle = 25; // Max angle before the game is lost

export const useTree = ({isGameOver, gameOver, scareAllBirds, currentWeight}) => {
	const [angle, setAngle] = React.useState(0);
	const [speed, setSpeed] = React.useState(0);
	const [tree, setTree] = React.useState({level: 1, broken: false});

	// "Main loop"
	useTicker(delta => {
		setTree(state => ({...state, broken: isGameOver}));
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

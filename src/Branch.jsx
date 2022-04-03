import * as React from "react";
import { Container, Sprite } from "react-pixi-fiber/index.js";
import Rectangle from "./components/Rectangle";
import { Textures } from "./Loader";

const branchDeltaX = 36;
const branchDeltaX2 = 45;
const branchDeltaX3 = {
	"A": 180,
	"B": 170,
	"C": 160,
};
const branchDeltaY3 = {
	"A": -11,
	"B": 3,
	"C": -6,
};
const branchLength2 = {
	"A": 160,
	"B": 150,
	"C": 140,
}
const branchLength3 = {
	"A": 170,
	"B": 150,
	"C": 150,
}
const branchAngle = 30;

const margin = 20;

export const Branch = ({ branch: { y, flipX, state, type }, onClick }) => {
	const texture1 = Textures.Tree.get(`Branch_${type}_01`);
	const texture2 = Textures.Tree.get(`Branch_${type}_02`);
	const texture3 = Textures.Tree.get(`Branch_${type}_03`);
	const angle3 = state == 1 ? branchAngle : 0;
	const angle2 = state == 3 ? branchAngle : 0;

	return (
		<Container scale={[flipX ? -1 : 1, 1]}>
			{state <= 3 && (
				<Container x={branchDeltaX2} y={-y} angle={angle2}>
					<Rectangle
						x={-margin}
						y={-30}
						width={branchLength2[type] + 2*margin}
						height={60}
						alpha={0.001}
						interactive
						buttonMode
						pointerdown={onClick} />
				</Container>
			)}
			{state <= 1 && (
				<Container x={branchDeltaX3[type]} y={-y + branchDeltaY3[type]} angle={angle3}>
					<Rectangle
						x={-margin}
						y={-30}
						width={branchLength3[type] + 2*margin}
						height={60}
						alpha={0.001}
						interactive
						buttonMode
						pointerdown={onClick} />
				</Container>
			)}
			<Sprite texture={texture1} anchor={[0, 0.5]} y={-y} x={branchDeltaX} />
			{state <= 3 && <Sprite texture={texture2} anchor={[0, 0.5]} y={-y} x={branchDeltaX2} angle={angle2} />}
			{state <= 1 && <Sprite texture={texture3} anchor={[0, 0.5]} y={-y + branchDeltaY3[type]} x={branchDeltaX3[type]} angle={angle3} />}
		</Container>
	);
};

const birdDistanceSquared = 50*50;

export const findPosition = (branches, birds, sign = 0) => {
	if (sign > 0) {
		branches = branches.filter(branch => !branch.flipX);
	} else if (sign < 0) {
		branches = branches.filter(branch => branch.flipX);
	}
	branches = branches.flatMap(branch => {
		if (branch.state <= 1) {
			return [{...branch, half: 0}, {...branch, half: 1}]
		} else if (branch.state <= 3) {
			return [{...branch, half: 0}]
		} else {
			return [];
		}
	})

	let tries = 0;
	do {
		const branch = branches[Math.floor(Math.random() * branches.length)];
		const startX = branch.half == 0 ? branchDeltaX2 : branchDeltaX3[branch.type];
		const startY = branch.y - branch.half * branchDeltaY3[branch.type];
		const angle = (branch.state == 3 - 2 * branch.half) ? -branchAngle * Math.PI/180 : 0;
		const d = Math.random() * [branchLength2[branch.type], branchLength3[branch.type]][branch.half];
		const x = (branch.flipX ? -1 : 1) * (startX + d * Math.cos(angle));
		const y = startY + d * Math.sin(angle);
		if (tries == 100 || birds.length == 0 || birds.every(bird => Math.pow(bird.x - x, 2) + Math.pow(bird.y - y, 2) >= birdDistanceSquared)) {
			return {x, y};
		}
		tries++;
	} while (tries <= 100);
	return {x: 0, y: 0};
};

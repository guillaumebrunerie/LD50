import * as React from "react";
import { Textures, Animations, Sounds } from "./Loader";
import { Container, Sprite } from "react-pixi-fiber/index.js";
import Rectangle from "./components/Rectangle";
import AnimatedSprite from "./components/AnimatedSprite";
import useTicker from "./hooks/useTicker";

const branchDeltaX2 = 9;
const branchDeltaY3 = {
	"A": -7,
	"B": 3,
	"C": -6,
};
const branchLength2 = {
	"A": 150,
	"B": 140,
	"C": 125,
}
const branchLength3 = {
	"A": 170,
	"B": 150,
	"C": 150,
}
const anchors3 = {
	"A": [0.07, 0.8],
	"B": [0.06, 0.5],
	"C": [0.08, 0.5],
}

const margin = 20;

const Branch = ({ branch: { x, y, flipX, dropping, state, angle1, angle2, type, dropped }, onClick }) => {
	if (dropped) {
		return (
			<Container scale={[flipX ? -1 : 1, 1]}>
				<AnimatedSprite start={Animations.BranchFall} scale={1.5} anchor={[0.25, 0.5]} x={x} y={y}/>
			</Container>
		)
	}

	const texture1 = Textures.Tree.get(`Branch_${type}_01`);
	const texture2 = Textures.Tree.get(`Branch_${type}_02`);
	const texture3 = Textures.Tree.get(`Branch_${type}_03`);

	const leftX = x;
	const leftY = y;

	const middleX = leftX + branchLength2[type] * Math.cos(angle1 * Math.PI/180) - branchDeltaY3[type] * Math.sin(angle1 * Math.PI/180);
	const middleY = leftY + branchLength2[type] * Math.sin(angle1 * Math.PI/180) + branchDeltaY3[type] * Math.cos(angle1 * Math.PI/180);

	return (
		<Container scale={[flipX ? -1 : 1, 1]}>
			{dropping || <Sprite texture={texture1} anchor={[0, 0.5]} y={y} x={x} />}
			{(state <= 2 || dropping) && <Sprite texture={texture2} anchor={[0, 0.5]} y={y} x={x + branchDeltaX2} angle={angle1} />}
			{(state <= 2 || dropping) && <Sprite texture={texture3} anchor={anchors3[type]} y={middleY} x={middleX} angle={angle2} />}
			{state <= 2 && (
				<Container x={x + branchDeltaX2} y={y} angle={angle1}>
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
			{state <= 2 && (
				<Container x={middleX} y={middleY} angle={angle2}>
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
		</Container>
	);
};

export const BranchesAttached = ({branches, breakBranch}) => {
	return branches.filter(b => !b.dropping).map(branch => (
		<Branch
			key={branch.id}
			branch={branch}
			onClick={breakBranch(branch)}
		/>
	));
}

export const BranchesDetached = ({branches}) => {
	return branches.filter(b => b.dropping).map(branch => (
		<Branch key={branch.id} branch={branch}/>
	));
}


const birdDistanceSquared = 50*50;

export const findPosition = (branches, birds, sign = 0) => {
	if (sign > 0) {
		branches = branches.filter(branch => !branch.flipX);
	} else if (sign < 0) {
		branches = branches.filter(branch => branch.flipX);
	}
	branches = branches.filter(branch => branch.state <= 2);

	if (branches.length == 0) {
		return null;
	}

	let tries = 0;
	do {
		const branch = branches[Math.floor(Math.random() * branches.length)];
		const {type, x:bx, y:by, angle1, angle2, flipX} = branch;

		const leftX = bx;
		const leftY = by;

		const middleX = leftX + branchLength2[type] * Math.cos(angle1 * Math.PI/180) - branchDeltaY3[type] * Math.sin(angle1 * Math.PI/180);
		const middleY = leftY + branchLength2[type] * Math.sin(angle1 * Math.PI/180) + branchDeltaY3[type] * Math.cos(angle1 * Math.PI/180);

		let x, y;
		const t = Math.random();
		if (t < 0.5) {
			x = (flipX ? -1 : 1) * (leftX + t * 2 * Math.cos(angle1 * Math.PI/180) * branchLength2[type]);
			y = leftY + t * 2 * Math.sin(angle1 * Math.PI/180) * branchLength2[type];
		} else {
			x = (flipX ? -1 : 1) * (middleX + (t - 0.5) * 2 * Math.cos(angle2 * Math.PI/180) * branchLength3[type]);
			y = middleY + (t - 0.5) * 2 * Math.sin(angle2 * Math.PI/180) * branchLength3[type];
		}

		const birdPositions = birds.flatMap(bird => (
			bird.state === "standing" ? [bird] :
				bird.state === "flying" ? [bird.dest] :
				bird.state === "leaving" ? [] : []
		));

		if (birdPositions.every(pos => Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2) >= birdDistanceSquared)) {
			return {x, y, branch};
		}
		tries++;
	} while (tries <= 100);
	return null;
};

const getBranchAngles = (up = false) => {
	const getAngle = () => (Math.random() > 0.5 ? -1 : 1) * (20 + Math.random() * 30);
	const angle1 = up ? -Math.abs(getAngle()) : getAngle();
	const deltaAngle = Math.abs(getAngle());
	const angle2 = angle1 > 0 ? angle1 - deltaAngle : angle1 + deltaAngle;
	return {angle1, angle2};
}

export const useBranches = ({angle, scareBirds, scareBeaver, dropBeeHive}) => {
	const [branches, setBranches] = React.useState([
		{id: 1, x: 36, y: -300,  flipX: false, state: 0, ...getBranchAngles(true), type: "A"},
		{id: 2, x: 36, y: -450,  flipX: true,  state: 0, ...getBranchAngles(), type: "B"},
		{id: 3, x: 36, y: -600,  flipX: false, state: 0, ...getBranchAngles(), type: "C"},
		{id: 4, x: 36, y: -750,  flipX: true,  state: 0, ...getBranchAngles(), type: "A"},
		{id: 5, x: 36, y: -900,  flipX: false, state: 0, ...getBranchAngles(), type: "B"},
		{id: 6, x: 36, y: -1050, flipX: true,  state: 0, ...getBranchAngles(), type: "C"},
	]);

	const branchAcceleration = 0;
	const branchDropY = 60;

	useTicker(delta => {
		setBranches(branches.map(branch => {
			if (!branch.dropping || branch.dropped) {
				return branch;
			}
			const dropped = branch.y > branchDropY;
			if (dropped) {
				Sounds.BranchDrops.play();
				scareBeaver();
			}
			const y = dropped ? branchDropY : branch.y + branch.speed;
			return {...branch, dropped, y, speed: branch.speed + branchAcceleration * delta}
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
		Sounds.BranchBreaks.play();

		if (branch.id === 2) {
			dropBeeHive();
		}
	}

	return {branches, breakBranch};
}

import * as React from "react";
import { Animations, Sounds } from "./Loader";
import AnimatedSprite from "@components/AnimatedSprite";
import useTicker from "./hooks/useTicker";

import move from "./move";

export const Beaver = ({beaver: {x, y, direction, state}}) => {
	let loop, start;

	if (state == "arriving") {
		loop = Animations.BeaverRun;
	} else if (state === "leaving" || state === "scared") {
		// start = Animations.BeaverTransition;
		loop = Animations.BeaverRun;
	} else if (state === "chopping") {
		start = Animations.BeaverTransition;
		loop = Animations.BeaverAttack;
	} else if (state === "hidden") {
		return null;
	}

	return (
		<AnimatedSprite
			key={state}
			start={start}
			loop={loop}
			anchor={[0.5, 0]}
			scale={[direction, 1]}
			x={x * direction}
			y={-y}
		/>
	)
};

export const WoodShavings = ({beaver}) => {
	if (beaver.state !== "chopping") {
		return null;
	}
	return <AnimatedSprite loop={Animations.WoodShavingsLoop} anchor={0.5}/>
}

const beaverSpeed = 0.5;
const choppingTime = 4000;
const waitingTime = 12000;
const beaverY = 180;
const beaverX = 110;

export const useBeaver = ({isGameOver, tree, chopTree}) => {
	const [beaver, setBeaver] = React.useState({state: "hidden", direction: -1, x: 500, y: beaverY, timeout: waitingTime})

	useTicker(delta => {
		const deltaMS = delta * 16.67;
		if (!isGameOver && beaver.timeout > deltaMS) {
			setBeaver({...beaver, timeout: beaver.timeout - deltaMS});
		} else {
			switch (beaver.state) {
			case "hidden": {
				if (!isGameOver) {
					const direction = Math.random() > 0.5 ? -1 : 1;
					Sounds.BeaverEnters.play();
					setBeaver({...beaver, state: "arriving", direction, x: 500, y: beaverY, dest: {x: beaverX, y: beaverY}, timeout: 0});
				}
				break;
			}
			case "chopping": {
				if (!isGameOver && tree.level < 5) {
					chopTree();
				}
				Sounds.BeaverAteTree.play();
				setBeaver({...beaver, state: "leaving", dest: {x: -500, y: beaverY}, timeout: 0});
				break;
			}
			case "scared":
			case "leaving":
			case "arriving": {
				const {arrived, x, y} = move(beaver, beaver.dest, deltaMS, beaver.state == "scared" ? 3 * beaverSpeed : beaverSpeed);
				if (arrived) {
					const state = beaver.state == "arriving" ? "chopping" : "hidden";
					const timeout = beaver.state == "arriving" ? choppingTime : waitingTime;
					setBeaver({...beaver, state, x, y, timeout});
					if (state === "chopping") {
						Sounds.BeaverEatsTree.play();
					}
				} else {
					setBeaver({...beaver, x, y});
				}
				break;
			}
			}
		}
	});

	const minTimeoutScaredBeaver = 1000;
	const scareBeaver = () => {
		switch (beaver.state) {
		case "hidden":
			setBeaver({...beaver, timeout: Math.max(beaver.timeout, minTimeoutScaredBeaver)});
			break;
		case "chopping":
		case "leaving":
		case "arriving":
			Sounds.BeaverScared.play();
			setBeaver({...beaver, state: "scared", dest: {x: -500, y: beaverY}, timeout: 0});
			break;
		}
	}

	return {beaver, scareBeaver};
}

import * as React from "react";
import { Sprite } from "react-pixi-fiber/index.js";
import { Textures, Animations } from "./Loader";
import AnimatedSprite from "@components/AnimatedSprite";

const Beaver = ({ beaver: {x, y, direction, state}, onClick }) => {
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

export default Beaver;

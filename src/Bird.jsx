import * as React from "react";
import { Sprite, Text } from "react-pixi-fiber/index.js";
import { Textures, Animations } from "./Loader";
import AnimatedSprite from "./components/AnimatedSprite";
import Circle from "./components/Circle";

// state = "flying", "standing"
const anchorY = 0.75;

const Bird = ({ bird: { state, x, y, size, color, branch }, onClick }) => {
	if (state === "flying" || state === "leaving") {
		return (
			<AnimatedSprite loop={Animations[`Bird_${size}_FlyingLoop`]} anchor={[0.5, anchorY]} x={x} y={y} interactive buttonMode pointerdown={onClick} />
		);
	} else {
		const loop = {at: () => Textures[`Bird_${size}_Land`].get(`Bird_${size}_Land_025`)};
		return (
			<>
				<AnimatedSprite start={Animations[`Bird_${size}_Land`]} loop={loop} anchor={[0.5, anchorY]} x={x} y={y}/>
				<Circle x={x} y={y - 30} alpha={0.001} radius={50} interactive buttonMode pointerdown={onClick}/>
			</>
		);
		// <Text text={branch.id + " " + branch.half} x={x} y={-y}/>
	}
};

export default Bird;

import * as React from "react";
import { Sprite, Text } from "react-pixi-fiber/index.js";
import { Textures, Animations } from "./Loader";
import AnimatedSprite from "./components/AnimatedSprite";

// state = "flying", "standing"
const Bird = ({ bird: { state, x, y, size, color, branch }, onClick }) => {
	if (state === "flying" || state === "leaving") {
		return (
			<AnimatedSprite loop={Animations["Fly" + size]} anchor={[0.5, 1]} x={x} y={-y} interactive buttonMode pointerdown={onClick} />
		);
	} else {
		return (
			<>
				<Sprite texture={Textures.Birds.get(`Bird_${size}_0${color}`)} anchor={[0.5, 1]} x={x} y={-y} interactive buttonMode pointerdown={onClick} />
			</>
		);
				// <Text text={branch.id + " " + branch.half} x={x} y={-y}/>
	}
};

export default Bird;

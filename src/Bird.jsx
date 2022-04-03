import * as React from "react";
import { Sprite } from "react-pixi-fiber/index.js";
import { Textures } from "./Loader";

// state = "flying", "standing"
const Bird = ({ bird: { x, y, size, color }, onClick }) => {
	return (
		<Sprite texture={Textures.Birds.get(`Bird_${size}_0${color}`)} anchor={[0.5, 1]} x={x} y={-y} interactive buttonMode pointerdown={onClick} />
	);
};

export default Bird;

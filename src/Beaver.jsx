import * as React from "react";
import { Sprite } from "react-pixi-fiber/index.js";
import { Textures } from "./Loader";

const Beaver = ({ x, y, beaver: {x: bx, y: by, state}, onClick }) => {
	const spriteY = y - by + (state == "chopping" ? Math.random() * 20 : 0);
	return (
		<Sprite texture={Textures.Beaver} anchor={[0.5, 0]} x={x + bx} y={spriteY} interactive buttonMode pointerdown={onClick} />
	);
};

export default Beaver;

import * as React from "react";
import { Sprite } from "react-pixi-fiber/index.js";
import { Textures } from "./Loader";

const Beaver = ({ beaver: {x, y, state}, onClick }) => {
	const spriteY = -y + (state == "chopping" ? Math.random() * 20 : 0);
	return (
		<Sprite texture={Textures.Beaver} anchor={[0.5, 0]} x={x} y={spriteY}/>
	);
};

export default Beaver;

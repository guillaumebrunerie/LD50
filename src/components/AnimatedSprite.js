import React from "react";
import useLocalTime from "@hooks/useLocalTime";

import {Sprite} from "react-pixi-fiber/index.js";

const AnimatedSprite = (props) => {
	const {start, loop, ...rest} = props;
	const {t} = useLocalTime();

	const anim = (start && t <= start.duration) ? start : loop;

	return (
		<Sprite texture={anim.at(t)} {...rest}/>
	)
}

export default AnimatedSprite

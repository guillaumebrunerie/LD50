import * as React from "react";
import useLocalTime from "@hooks/useLocalTime";

import {Sprite} from "react-pixi-fiber/index.js";

const AnimatedSprite = (props) => {
	const {start, loop, ...rest} = props;
	const {t} = useLocalTime();

	const anim = (start && t <= start.duration) ? start : loop;
	if (!anim) {
		return null;
	}

	const texture = anim.at ? anim.at(t) : anim;

	return (
		<Sprite texture={texture} {...rest}/>
	)
}

export default AnimatedSprite

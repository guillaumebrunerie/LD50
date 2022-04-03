import * as React from "react";
import {Graphics} from "react-pixi-fiber/index.js";

const Circle = (props) => {
	const {x = 0, y = 0, radius = 3, fill = 0xFF0000, ...rest} = props;
	const ref = instance => {
		if (instance) {
			instance.clear();
			instance.beginFill(fill);
			instance.drawCircle(x, y, radius);
			instance.endFill();
		}
	};
	return <Graphics ref={ref} {...rest}/>
}

export default Circle;

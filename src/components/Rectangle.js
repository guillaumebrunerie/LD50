import * as React from "react";
import {Graphics} from "react-pixi-fiber/index.js";

const Rectangle = (props) => {
	const {x = 0, y = 0, width = 100, height = width, fill = 0xFF00FF, center = false, alpha = 1, ...rest} = props;
	const ref = instance => {
		if (instance) {
			instance.clear();
			instance.beginFill(fill, alpha);
			if (center) {
				instance.drawRect(x - width / 2, y - height / 2, width, height);
			} else {
				instance.drawRect(x, y, width, height);
			}
			instance.endFill();
		}
	};
	return <Graphics ref={ref} {...rest}/>
}

export default Rectangle;

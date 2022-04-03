import React from "react";
import useLocalTime from "@hooks/useLocalTime";

import {Sprite} from "react-pixi-fiber/index.js";

const AnimatedSprite = (props) => {
	const {start, loop, end, isFinishing, onFinish, ...rest} = props;
	const {t, reset} = useLocalTime();

	if (isFinishing && !end) {
		onFinish();
		return null;
	}

	const anim = isFinishing ? end : ((start && t <= start.duration) ? start : loop);

	const [hasReset, setHasReset] = React.useState(false);

	React.useEffect(() => {
		if (isFinishing) {
			reset();
			setHasReset(true);
		}
	}, [isFinishing]);

	const isFinished = isFinishing && hasReset && t > end.duration;

	React.useEffect(() => {
		isFinished && onFinish();
	}, [isFinished]);

	return (
		<Sprite texture={anim.at(t)} {...rest}/>
	)
}

export default AnimatedSprite

export const AnimationGroup = ({children}) => {
	const [currentChildren, setCurrentChildren] = React.useState([]);

	React.useEffect(() => {
		setCurrentChildren(oldChildren => {
			const newChildren = [...children]
			for (const child of oldChildren) {
				if (!children.some(c => c.key == child.key)) {
					const onFinish = () => {
						setCurrentChildren(children => children.filter(c => c.key !== child.key));
					}
					const newChild = React.cloneElement(child, {isFinishing: true, onFinish})
					newChildren.push(newChild);
				}
			}
			return newChildren;
		});
	}, [children]);

	return currentChildren;
}

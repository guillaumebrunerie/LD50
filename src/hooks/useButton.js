import React from "react";

export default function useButton({onClick}) {
	const [isPressed, setIsPressed] = React.useState(false);
	const [isHovered, setIsHovered] = React.useState(false);

	const mouseover = React.useCallback(() => setIsHovered(true), []);
	const mouseout = React.useCallback(() => setIsHovered(false), []);
	const pointerdown = React.useCallback(() => setIsPressed(true), []);
	const pointerup = React.useCallback(() => {onClick(), setIsPressed(false)}, [onClick]);
	const pointerupoutside = React.useCallback(() => setIsPressed(false), []);
	return {
		isHovered,
		isPressed,
		isPending: isHovered || isPressed,
		isActive: isHovered && isPressed,
		props: {
			interactive: true,
			buttonMode: true,
			mouseover,
			mouseout,
			pointerdown,
			pointerup,
			pointerupoutside,
		}
	};
}

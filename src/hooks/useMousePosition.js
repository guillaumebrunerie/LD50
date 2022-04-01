import * as React from "react";

const useMousePosition = () => {
	const [x, setX] = React.useState(0);
	const [y, setY] = React.useState(0);
	const callback = React.useCallback(event => {
		const canvas = document.getElementsByTagName("canvas")[0];
		const canvasRect = canvas.getBoundingClientRect();
		setX(event.clientX - canvasRect.left);
		setY(event.clientY - canvasRect.top);
	}, []);

	React.useEffect(() => {
		window.addEventListener("mousemove", callback);
		return () => window.removeEventListener("mousemove", callback);
	}, []);

	return {x, y};
};

export default useMousePosition;

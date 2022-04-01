import React from "react";

const downKeys = {};

const useIsKeyDown = code => {
	const [isDown, setIsDown] = React.useState(false);

	React.useEffect(() => {
		const onDown = event => {
			if (event.code == code) {
				setIsDown(true)
				downKeys[code] = true;
			}
		};
		const onUp = event => {
			if (event.code == code) {
				setIsDown(false);
				delete downKeys[code];
			}
		};

		window.addEventListener("keydown", onDown);
		window.addEventListener("keyup", onUp);

		return () => {
			window.removeEventListener("keydown", onDown);
			window.removeEventListener("keyup", onUp);
		}
	}, [key]);

	return isDown;
}

export const isDown = code => !!downKeys[code];

export default useIsKeyDown;

import * as React from "react";
import * as PIXI from "pixi.js";
import {
	usePixiTicker,
} from "react-pixi-fiber/index.js";

const useLocalTime = ({factor = 1, callback}) => {
	const [t, setT] = React.useState(0);
	const [delta, setDelta] = React.useState(0);
	const tick = React.useCallback(() => {
		setT(t => t + PIXI.Ticker.shared.deltaMS * factor);
		setDelta(PIXI.Ticker.shared.deltaMS * factor);
		callback?.(PIXI.Ticker.shared.deltaMS);
	}, [callback, factor]);
	usePixiTicker(tick);

	const reset = React.useCallback(() => setT(0));

	return {t, delta, reset};
};

export default useLocalTime;

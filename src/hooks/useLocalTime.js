import * as React from "react";
import * as PIXI from "pixi.js";
import useTicker from "./useTicker";

const useLocalTime = ({factor = 1, callback} = {factor: 1}) => {
	const [t, setT] = React.useState(0);
	useTicker(() => {
		setT(t => t + PIXI.Ticker.shared.deltaMS * factor);
		callback?.(PIXI.Ticker.shared.deltaMS);
	});

	const reset = React.useCallback(() => setT(0), []);

	return {t, reset};
};

export default useLocalTime;

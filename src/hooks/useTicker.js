import * as React from "react";
import { usePixiTicker } from "react-pixi-fiber/index.js";

const useTicker = (callback) => {
	const tickerRef = React.useRef(() => {});

	React.useLayoutEffect(() => {
		tickerRef.current = callback;
	}, [callback]);

	usePixiTicker(React.useCallback((...args) => {
		tickerRef.current(...args);
	}, []));
};

export default useTicker;

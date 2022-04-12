import * as React from "react";
import { unstable_batchedUpdates } from "react-pixi-fiber/index.js";
import { app } from ".."

// Calls callback at every frame, but make sure to pass a constant reference
// to usePixiTicker in order for it not to be added and removed constantly.

const callbacks = {};
let hasRegisteredTicker = false;

const tick = (...args) => {
	unstable_batchedUpdates(() => {
		Object.values(callbacks).forEach(callback => {
			callback?.(...args);
		})
	});
};

const useTicker = (callback) => {
	const id = React.useRef(Math.random());
	const { ticker } = app;
	React.useEffect(() => {
		if (!hasRegisteredTicker) {
			hasRegisteredTicker = true;
			ticker.add(tick);
		}
		callbacks[id.current] = callback;

		return () => void delete callbacks[id.current];
	}, [callback]);
};

export default useTicker;

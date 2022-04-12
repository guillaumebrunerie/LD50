import * as React from "react";
import useTicker from "./useTicker";

const useSetInterval = (callback, interval) => {
	const timeoutRef = React.useRef(interval);

	useTicker(delta => {
		timeoutRef.current -= delta * 16.67;
		if (timeoutRef.current < 0) {
			callback();
			timeoutRef.current = interval;
		}
	});
};

export default useSetInterval;

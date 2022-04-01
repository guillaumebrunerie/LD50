import * as React from "react";

const useOnKeyDown = (...shortcuts) => {
	React.useEffect(() => {
		const listener = event => {
			const i = shortcuts.indexOf(event.code);
			if (i >= 0 && i < shortcuts.length - 1) {
				shortcuts[i + 1]();
			}
		};
		window.addEventListener("keydown", listener);
		return () => window.removeEventListener("keydown", listener);
	}, [shortcuts]);
};

export default useOnKeyDown;

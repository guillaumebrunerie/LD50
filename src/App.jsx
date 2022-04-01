import * as React from "react";

// import * as config from "./configuration";

import StartScreen from "./StartScreen";
// import LevelSelectScreen from "./LevelSelectScreen";
// import MainScreen from "./MainScreen";

const INITIAL_SCREEN = "initialScreen";
// const LEVELSELECT_SCREEN = "levelselectScreen";
// const MAIN_SCREEN = "mainScreen";

const App = () => {
	const [screen, setScreen] = React.useState(INITIAL_SCREEN);

	switch (screen) {
		case INITIAL_SCREEN:
			return <StartScreen/>
	}
}

export default App;

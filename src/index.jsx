import React from "react";
import ReactDOM from "react-dom";
import {Stage} from "react-pixi-fiber/index.js";

import {Loader} from "./Loader";
import App from "./App";

const width = 1280
const height = 720;

ReactDOM.render(
	<Stage options={{backgroundColor: 0x10bb99, height, width}}>
		<Loader>
			<App/>
		</Loader>
	</Stage>,
	document.getElementById("container")
);

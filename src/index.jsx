import * as React from "react";
import {render} from "react-pixi-fiber/index.js";
import * as PIXI from "pixi.js";

import {Loader} from "./Loader";
import App from "./App";

const width = 720;
const height = 1280;
const canvasElement = document.getElementById("canvas")
export const app = new PIXI.Application({
	backgroundColor: 0x10bb99,
	view: canvasElement,
	width,
	height,
});

render(
	<Loader>
		<App/>
	</Loader>,
	app.stage
);

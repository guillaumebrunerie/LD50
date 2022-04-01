import * as React from "react";
import useMousePosition from "./hooks/useMousePosition";
import useOnKeyDown from "./hooks/useOnKeyDown";
import Rectangle from "./components/Rectangle";
import Circle from "./components/Circle";
import {usePixiTicker} from "react-pixi-fiber/index.js";

const g = 0.05;

const StartScreen = () => {
	const {x, y} = useMousePosition();

	const [things, setThings] = React.useState([]);
	const addThing = () => {
		setThings(things => [...things, {id: Math.random(), x, y, speed: 0}])
	};

	usePixiTicker(React.useCallback(delta => {
		setThings(things => things.map(({id, x, y, speed}) => ({
			id,
			x,
			y: Math.min(y + speed * delta, 720),
			speed: speed + delta * g,
		})))
	}, []));

	useOnKeyDown(
		"ArrowDown", () => setThings(things => things.slice(1)),
		"ArrowUp", () => setThings([]),
		"ArrowRight", () => setThings(things => things.map(thing => ({...thing, speed: 0}))),
	);

	return (
		<Rectangle x={0} y={0} width={1280} height={720} fill={0x005500}>
			{things.map(({id, x, y}) => <Rectangle key={id} x={x} y={y} width={25} height={25} center fill={0x0000FF}/>)}
			<Circle x={x} y={y} radius={10} fill={0xFF0000} interactive pointerdown={addThing}/>
		</Rectangle>
	);
};

export default StartScreen;

import * as React from "react";
import Rectangle from "./components/Rectangle";
import Circle from "./components/Circle";
import {Container} from "react-pixi-fiber/index.js";
import {usePixiTicker} from "react-pixi-fiber/index.js";

const Tree = () => {

	return (
		<>
			<Circle x={0} y={-900} radius={700} fill={0x00AA00}/>
			<Rectangle x={-30} y={-1500} width={60} height={1500} fill={0x005500}/>
		</>
	)
}

const Bird = ({bird: {x, y}, onClick, ...props}) => {
	return (
		<Circle x={x} y={y} radius={30} fill={0xFF0000} interactive buttonMode pointerdown={onClick} {...props}/>
	)
}

const useInterval = (callback, interval) => {
	const cbRef = React.useRef();
	React.useEffect(() => {
		cbRef.current = callback;
	}, [callback]);
	React.useEffect(() => {
		const id = setInterval(() => {cbRef.current();}, interval);
		return () => clearInterval(id)
	}, [interval]);
};

const Branch = ({branch: {y, flipX, state}}) => {
	const width = [400, 300, 200, 100][state];
	return (
		<Rectangle x={flipX ? -width : 0} y={-y} width={width} height={60} fill={0x005500}/>
	)
};

const aFactor = 1e-5;  // Influence of one degree
const bFactor = 4e-5; // Influence of one bird
const landingSpeed = 0.05; // Influence of one bird landing
const takeOffSpeed = -0.05; // Influence of one bird leaving

const MainScreen = () => {
	const [angle, setAngle] = React.useState(0);
	const [speed, setSpeed] = React.useState(0);
	const [branches, setBranches] = React.useState([
		{id: 1, y: 400, flipX: false, state: 0},
		{id: 2, y: 550, flipX: true, state: 0},
		{id: 3, y: 700, flipX: false, state: 0},
		{id: 4, y: 850, flipX: true, state: 0},
		{id: 5, y: 1000, flipX: false, state: 0},
		{id: 6, y: 1150, flipX: true, state: 0},
	]);

	const [birds, setBirds] = React.useState([
		{id: 1, x: -100, y: -1100},
		{id: 2, x: -100, y: -1200},
		{id: 3, x: -100, y: -800},
		{id: 4, x: -100, y: -1000},
		{id: 5, x: -100, y: -900},
	]);

	// Main loop
	usePixiTicker(React.useCallback(delta => {
		let a = angle * aFactor;
		birds.forEach(b => {
			if (b.x > 0) {
				a += bFactor;
			} else {
				a -= bFactor;
			}
		})
		setSpeed(speed => speed + a);
		setAngle(angle => angle + delta * speed);
	}, [birds, speed]));

	useInterval(React.useCallback(() => {
		const x = (Math.random() > 0.5 ? -1 : 1) * (100 + Math.random() * 200);
		const y = Math.random() * 500 - 1200;
		addBird({x, y});
	}, []), 3000);

	useInterval(React.useCallback(() => {
		setBirds(birds => {
			const index = Math.floor(Math.random() * birds.length);
			setSpeed(speed => birds[index].x < 0 ? speed - takeOffSpeed : speed + takeOffSpeed);
			return birds.filter(b => b !== birds[index]);
		});
	}, []), 4000);

	const addBird = bird => {
		setBirds(birds => [...birds, {id: Math.random(), ...bird}])
		setSpeed(speed => bird.x < 0 ? speed - landingSpeed : speed + landingSpeed);
	};

	const flipBird = id => () => {
		setBirds(birds.map(b => b.id === id ? {...b, x: -b.x} : b));
		const previousX = birds.find(b => b.id === id).x;
		setSpeed(speed => previousX > 0 ? speed - landingSpeed : speed + landingSpeed);
	};

	return (
		<>
			<Container angle={angle} x={360} y={1280}>
				<Tree/>
				{branches.map(({id, ...branch}) => <Branch key={id} branch={branch}/>)}
				{birds.map(({id, ...bird}) => <Bird key={id} bird={bird} onClick={flipBird(id)}/>)}
			</Container>
		</>
	);
};

export default MainScreen;

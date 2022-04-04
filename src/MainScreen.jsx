import * as React from "react";
import { Container, Text, Sprite } from "react-pixi-fiber/index.js";
import {Textures} from "./Loader";
import Tree from "./Tree";
import { sound } from '@pixi/sound';
import useButton from "@hooks/useButton";
import useLocalTime from "@hooks/useLocalTime";
import * as PIXI from "pixi.js";

const StartButton = ({onClick}) => {
	const {isActive, props} = useButton({onClick});

	return (
		<Sprite
			texture={isActive ? Textures.StartBtnOn : Textures.StartBtnDefault}
			anchor={0.5}
			x={360}
			y={960}
			hitArea={new PIXI.Rectangle(-200, -100, 400, 200)}
			{...props}
		/>
	);
};

const CustomText = ({text, ...props}) => {
	const scale = 0.4;
	const kerning = 10;
	const space = 30;
	let x = props.x;
	let result = [];
	text.split("").forEach((char, i) => {
		if (char == ":") char = "collon";
		if (char == ".") char = "dot";
		if (char == "!") char = "ExMark";
		if (char == " ") {
			x += space * scale;
			return;
		}
		const texture = Textures.Font.get(char);
		if (!texture) {
			debugger;
		}
		result.push(<Sprite anchor={[0, 1]} key={i} texture={texture} {...props} scale={scale} x={x}/>);
		x += (texture.width + kerning) * scale;
	});
	return result;
};

const MainScreen = () => {
	const [isGameOver, setIsGameOver] = React.useState(true);
	const [attempt, setAttempt] = React.useState(0);
	const [startTime, setStartTime] = React.useState(() => Date.now());
	const [lastScore, setLastScore] = React.useState(0);
	const [highScore, setHighScore] = React.useState(0);

	const gameOver = () => {
		if (!isGameOver) {
			setIsGameOver(true);
			sound.play("TreeCrashes");
			const deltaTime = Date.now() - startTime;
			const score = Math.round(deltaTime / 100) / 10;
			setLastScore(score);
			setHighScore(highScore => Math.max(highScore, score));
		}
	};

	const newGame = () => {
		setAttempt(attempt => attempt + 1);
		setTimeout(() => {
			setIsGameOver(false);
		});
		setStartTime(Date.now());
		reset();
	}

	const {t, reset} = useLocalTime();
	const levelSwitchDuration = 1000;
	const levelDistance = 2500;
	const levelSpeed = (levelDistance - 360) / levelSwitchDuration;
	const previousTreeX = attempt == 0 ? -Infinity : 360 - t * levelSpeed;
	const treeX = attempt == 0 ? 360 : Math.max(levelDistance - t * levelSpeed, 360)

	const score = isGameOver ? `${lastScore}` : `${((Date.now() - startTime) / 1000).toFixed(1)}`

	return (
		<Container>
			<Sprite texture={Textures.Bg} x={0} y={0}/>
			<Sprite texture={Textures.BgGround} anchor={[0.5, 1]} x={previousTreeX} y={1280}/>
			<Sprite texture={Textures.BgGround} anchor={[0.5, 1]} x={treeX} y={1280}/>
			<Tree key={attempt - 1} isGameOver={true} gameOver={() => {}} x={previousTreeX} y={1280 - 115}/>
			<Tree key={attempt} isFirstScreen={attempt == 0} isGameOver={isGameOver} gameOver={gameOver} x={treeX} y={1280 - 115}/>
			<CustomText text={"SCORE: " + score} x={10} y={40}/>
			{isGameOver && <Sprite texture={Textures.Logo} x={360} y={450} anchor={0.5}/>}
			{isGameOver && lastScore > 0 && <CustomText x={10} y={90} text={`GAME OVER!`}/>}
			{isGameOver && lastScore > 0 && <CustomText x={10} y={140} text={`HIGHSCORE: ${highScore} SECONDS`}/>}
			{isGameOver && <StartButton onClick={newGame}/>}
		</Container>
	);
};

export default MainScreen;

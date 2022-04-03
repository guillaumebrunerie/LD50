import * as React from "react";
import { Container, Text, Sprite } from "react-pixi-fiber/index.js";
import {Textures} from "./Loader";
import Tree from "./Tree";
import { sound } from '@pixi/sound';
import useButton from "@hooks/useButton";
import * as PIXI from "pixi.js";

const StartButton = ({onClick}) => {
	const {isActive, props} = useButton({onClick});

	return (
		<Sprite
			texture={isActive ? Textures.StartBtnOn : Textures.StartBtnDefault}
			anchor={0.5}
			x={360}
			y={875}
			hitArea={new PIXI.Rectangle(-200, -100, 400, 200)}
			{...props}
		/>
	);
};

const MainScreen = () => {
	const [isGameOver, setIsGameOver] = React.useState(false);
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
	}

	return (
		<Container>
			<Tree key={attempt} isGameOver={isGameOver} gameOver={gameOver} x={360} y={1280 - 115}/>
			{isGameOver && <Text x={10} y={10} text={"Game over"}/>}
			{isGameOver && lastScore > 0 && <Text x={10} y={40} text={`You lasted ${lastScore} seconds\nHigh score: ${highScore} seconds`}/>}
			{isGameOver && <StartButton onClick={newGame}/>}
		</Container>
	);
};

export default MainScreen;

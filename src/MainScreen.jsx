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
			y={875}
			hitArea={new PIXI.Rectangle(-200, -100, 400, 200)}
			{...props}
		/>
	);
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

	return (
		<Container>
			<Sprite texture={Textures.Bg} x={0} y={0}/>
			<Sprite texture={Textures.BgGround} anchor={[0, 1]} x={0} y={1280}/>
			<Tree key={attempt - 1} isGameOver={true} gameOver={() => {}} x={previousTreeX} y={1280 - 115}/>
			<Tree key={attempt} isFirstScreen={attempt == 0} isGameOver={isGameOver} gameOver={gameOver} x={treeX} y={1280 - 115}/>
			{!isGameOver && <Text x={10} y={10} text={`Score: ${((Date.now() - startTime) / 1000).toFixed(1)} seconds`}/>}
			{isGameOver && lastScore > 0 && <Text x={10} y={10} text={`Score: ${lastScore} seconds`}/>}
			{isGameOver && <Sprite texture={Textures.Logo} x={360} y={350} anchor={0.5}/>}
			{isGameOver && lastScore > 0 && <Text x={10} y={40} text={`Game over!`}/>}
			{isGameOver && lastScore > 0 && <Text x={10} y={70} text={`High score: ${highScore} seconds`}/>}
			{isGameOver && <StartButton onClick={newGame}/>}
		</Container>
	);
};

export default MainScreen;

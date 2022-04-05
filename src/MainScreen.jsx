import * as React from "react";
import { Container, Sprite } from "react-pixi-fiber/index.js";
import {Textures, Sounds} from "./Loader";
import Tree from "./Tree";
import useButton from "@hooks/useButton";
import useLocalTime from "@hooks/useLocalTime";
import useTicker from "@hooks/useTicker";
import * as PIXI from "pixi.js";
import {sound} from "@pixi/sound";

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

const useOnMount = (callback) => {
	const [alreadyCalled, setAlreadyCalled] = React.useState(false);
	React.useLayoutEffect(() => {
		if (!alreadyCalled) {
			callback();
			setAlreadyCalled(true);
		}
	});
};

const MainScreen = () => {
	const [isGameOver, setIsGameOver] = React.useState(true);
	const [attempt, setAttempt] = React.useState(0);
	const [highScore, setHighScore] = React.useState(0);

	useOnMount(() => {
		Sounds.Music.play();
	})

	const [score, setScore] = React.useState(0);
	useTicker(delta => {
		if (!isGameOver) {
			setScore(score => score + (delta * 16.67) / 1000);
		}
	})

	const gameOver = () => {
		if (!isGameOver) {
			Sounds.Music.volume = 0.6;
			setIsGameOver(true);
			Sounds.TreeCrashes.play();
			setHighScore(highScore => Math.max(highScore, score));
		}
	};

	const newGame = () => {
		Sounds.Music.volume = 0.2;
		Sounds.StartButton.play();
		setAttempt(attempt => attempt + 1);
		setTimeout(() => {
			setIsGameOver(false);
			setScore(0);
		});
		reset();
	}

	const {t, reset} = useLocalTime();
	const levelSwitchDuration = 1000;
	const levelDistance = 2500;
	const ease = t => (1 - Math.cos(t * Math.PI)) / 2;
	const movingTreeX = levelDistance * (1 - ease(t / levelSwitchDuration));
	const treeX = 360 + ((t <= levelSwitchDuration && attempt > 0) ? movingTreeX : 0);
	const previousTreeX = treeX - levelDistance;

	const toTxt = score => score.toFixed(1);
	// const scoreTxT = isGameOver ? `${lastScore}` : `${((Date.now() - startTime) / 1000).toFixed(1)}`

	return (
		<Container>
			<Sprite texture={Textures.Bg} x={0} y={0}/>
			<Sprite texture={Textures.BgGround} anchor={[0.5, 1]} x={previousTreeX - 400} y={1280}/>
			<Sprite texture={Textures.BgGround} anchor={[0.5, 1]} x={treeX - 400} y={1280}/>
			<Sprite texture={Textures.BgGround} anchor={[0.5, 1]} x={treeX - 1100} y={1280}/>
			<Sprite texture={Textures.BgGround} anchor={[0.5, 1]} x={treeX - 1800} y={1280}/>
			<Sprite texture={Textures.BgGround} anchor={[0.5, 1]} x={previousTreeX} y={1280}/>
			<Sprite texture={Textures.BgGround} anchor={[0.5, 1]} x={treeX} y={1280}/>
			<Tree key={attempt - 1} isGameOver={true} gameOver={() => {}} x={previousTreeX} y={1280 - 115}/>
			<Tree key={attempt} isFirstScreen={attempt == 0} isGameOver={isGameOver} gameOver={gameOver} x={treeX} y={1280 - 115}/>
			<CustomText text={"SCORE: " + toTxt(score)} x={10} y={40}/>
			{isGameOver && <Sprite texture={Textures.Logo} x={360} y={450} anchor={0.5}/>}
			{isGameOver && score > 0 && <CustomText x={10} y={90} text={`HIGHSCORE: ${toTxt(highScore)}`}/>}
			{isGameOver && <StartButton onClick={newGame}/>}
		</Container>
	);
};

export default MainScreen;

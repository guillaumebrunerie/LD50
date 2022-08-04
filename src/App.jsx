import * as React from "react";
import * as PIXI from "pixi.js";
import {sound} from "@pixi/sound";
import {Textures, Sounds} from "./Loader";
import {Container, Sprite} from "react-pixi-fiber/index.js";
import useButton from "@hooks/useButton";
import useLocalTime from "@hooks/useLocalTime";
import useTicker from "@hooks/useTicker";
import useOnMount from "@hooks/useOnMount";

import Game from "./Game";

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

const SoundButton = () => {
	const toggleSound = () => {
		sound.volumeAll = 1 - sound.volumeAll;
	}

	return (
		<Sprite
			texture={sound.volumeAll === 1 ? Textures.SoundOn : Textures.SoundOff}
			anchor={[1,0]}
			x={700}
			y={20}
			buttonMode
			interactive
			pointerdown={toggleSound}
		/>
	)
}

const fadeVolume = (sound, from, to, duration) => {
	const steps = 10;
	let step = 0;
	const interval = setInterval(() => {
		if (step > steps) {
			clearInterval(interval);
		}
		sound.volume = from + (to - from) * step/steps;
		step++
	}, duration / steps);
}

const App = () => {
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
			fadeVolume(Sounds.Music, Sounds.Music.lowVolume, Sounds.Music.highVolume, 500);
			setIsGameOver(true);
			Sounds.TreeCrashes.play();
			setHighScore(highScore => Math.max(highScore, score));
		}
	};

	const newGame = () => {
		fadeVolume(Sounds.Music, Sounds.Music.highVolume, Sounds.Music.lowVolume, 500);
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
	const groundY = 1350;

	return (
		<Container>
			<Sprite texture={Textures.Bg} x={0} y={0}/>
			<Sprite texture={Textures.BgGround} anchor={[0.5, 1]} x={treeX - levelDistance / 2} y={groundY}/>
			<Sprite texture={Textures.BgGround} anchor={[0.5, 1]} x={previousTreeX} y={groundY}/>
			<Sprite texture={Textures.BgGround} anchor={[0.5, 1]} x={treeX} y={groundY}/>
			<Game key={attempt - 1} isGameOver={true} gameOver={() => {}} x={previousTreeX} y={1280 - 115}/>
			<Game key={attempt} isFirstScreen={attempt == 0} isGameOver={isGameOver} gameOver={gameOver} x={treeX} y={1280 - 115}/>
			<CustomText text={"SCORE: " + toTxt(score)} x={10} y={40}/>
			{isGameOver && <Sprite texture={Textures.Logo} x={360} y={450} anchor={0.5}/>}
			{isGameOver && score > 0 && <CustomText x={10} y={90} text={`HIGHSCORE: ${toTxt(highScore)}`}/>}
			{isGameOver && <StartButton onClick={newGame}/>}
			<SoundButton/>
		</Container>
	);
};

export default App;

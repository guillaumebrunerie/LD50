import * as React from "react";
import {Textures, Animations, Sounds} from "./Loader";
import {Sprite} from "react-pixi-fiber/index.js";
import AnimatedSprite from "./components/AnimatedSprite";
import useLocalTime from "./hooks/useLocalTime";

const owlY = -820;
const owlIdleDelay = 6000;

export const OwlBack = ({owl, onClick}) => {
	if (owl.state === "hidden") {
		return null;
	}

	const {t} = useLocalTime();
	const tMod = t % owlIdleDelay;
	const anim = Animations["Owl_Idle"];
	const texture = (tMod < anim.duration) ? anim.at(tMod) : Textures["OwlIdle"].get("Owl_Idle_000");

	return (
		<Sprite key={0} texture={texture} anchor={0.5} y={owlY} interactive buttonMode pointerdown={onClick}/>
	)
}

export const OwlFront = ({owl}) => {
	if (owl.state !== "hidden") {
		return null;
	}

	return <AnimatedSprite key={1} start={Animations["Owl_Howl"]} anchor={0.5} y={owlY}/>
}

export const useOwl = ({callWoodpecker}) => {
	const [owl, setOwl] = React.useState({state: "watching"});

	const owlTrigger = () => {
		Sounds.Owl.play();
		setOwl({state: "hidden"});

		callWoodpecker();
	}

	return {owl, owlTrigger};
}

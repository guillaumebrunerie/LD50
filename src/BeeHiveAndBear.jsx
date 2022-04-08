import * as React from "react";
import {Textures, Animations, Sounds} from "./Loader";
import {Sprite} from "react-pixi-fiber/index.js";
import AnimatedSprite from "./components/AnimatedSprite";
import useTicker from "./hooks/useTicker";

export const BeeHiveAttached = ({beeHive: {state, x, y}, onClick, ...props}) => {
	if (state !== "attached") {
		return null;
	}
	return <Sprite texture={Textures.BeeHive} anchor={[0.5, 0]} buttonMode={!!onClick} interactive={!!onClick} pointerdown={onClick} x={x} y={y} {...props}/>;
}

export const BeeHiveDetached = ({beeHive: {state, x, y}, ...props}) => {
	if (state === "attached" || state == "gone") {
		return null;
	} else if (state === "falling") {
		return (
			<AnimatedSprite key={1} start={Animations["BeeHive_Start"]} anchor={[0.5, 0]} loop={Textures.BeeHiveLoop} x={x} y={y} {...props}/>
		)
	} else {
		return (
			<AnimatedSprite key={2} start={Animations["BeeHive_End"]} anchor={[0.5, 0]} x={x} y={y} {...props}/>
		)
	}
}

const bearGrabFrame = 9;
const bearReleaseFrame = 18;
const bearFps = 15;

const bearAppearDuration = bearGrabFrame * 1000 / bearFps; //300;
const bearStraightenDuration = (bearReleaseFrame - bearGrabFrame) * 1000 / bearFps; //700);
const bearDisappearDuration = (25 - bearReleaseFrame) * 1000 / bearFps; //300);

const bearY = -350;

const Bear = ({anim, beeHive: {flipped, state}}) => {
	if (!["fallen", "grabbing", "disappearing"].includes(state)) {
		return null;
	}

	return (
		<AnimatedSprite
			start={Animations[anim]}
			anchor={[0.5, 0.5]}
			scale={[flipped ? -1 : 1, 1]}
			x={0}
			y={bearY}
		/>
	)
}

export const BearBack = (props) => <Bear anim={"TheBear_Back"} {...props}/>;
export const BearFront = (props) => <Bear anim={"TheBear_Front"} {...props}/>;

export const useBeeHiveAndBear = ({branches, scareAllBirds, scareBeaver, setSpeed, angle, setAngle}) => {
	const beeHiveAcceleration = 0;
	const [beeHive, setBeeHive] = React.useState(() => {
		const branch = branches.find(b => b.id == 2);
		const a = branch.angle1 * Math.PI/180;
		const distance = 100;
		const x = - (branch.x + Math.cos(a) * distance);
		const y = branch.y + Math.sin(a) * distance;
		return {state: "attached", x, y, speed: 0, timeout: 0, angle: 0}
	});

	const dropBeeHive = () => {
		if (beeHive.state !== "attached") {
			return;
		}

		const a = angle * Math.PI/180;
		const x = beeHive.x * Math.cos(a) - beeHive.y * Math.sin(a);
		const y = beeHive.y * Math.cos(a) + beeHive.x * Math.sin(a);

		Sounds.BeeHiveReleased.play();
		setBeeHive({...beeHive, state: "falling", x, y, speed: 30});
	}

	const beeHiveLimitY = -140;
	const beeHiveFallenY = -50;

	useTicker(delta => {
		const deltaMS = delta * 16.67;
		if (beeHive.state === "falling" && beeHive.y >= beeHiveLimitY) {
			Sounds.BeeHiveDrops.play();
			Sounds.Bear.play();
			setBeeHive({...beeHive, state: "fallen", y: beeHiveFallenY, timeout: bearAppearDuration, flipped: angle < 0})
			scareAllBirds();
			scareBeaver();
		} else if (beeHive.state == "falling") {
			setBeeHive({...beeHive, speed: beeHive.speed + beeHiveAcceleration, y: beeHive.y + beeHive.speed * delta});
		} else if (beeHive.state == "fallen") {
			const timeout = beeHive.timeout - deltaMS;
			if (timeout > 0) {
				setBeeHive({...beeHive, timeout});
			} else {
				setBeeHive({...beeHive, state: "grabbing", angle, timeout: bearStraightenDuration});
			}
		} else if (beeHive.state == "grabbing") {
			const timeout = beeHive.timeout - deltaMS;
			if (timeout > 0) {
				setSpeed(0);
				setAngle(timeout / bearStraightenDuration * beeHive.angle);
				setBeeHive({...beeHive, timeout});
			} else {
				setBeeHive({...beeHive, state: "disappearing", timeout: bearDisappearDuration});
			}
		} else if (beeHive.state == "disappearing") {
			const timeout = beeHive.timeout - deltaMS;
			if (timeout > 0) {
				setBeeHive({...beeHive, timeout});
			} else {
				setBeeHive({...beeHive, state: "gone"});
			}
		}
	})

	const setHiddenBeeHive = () => setBeeHive({state: "gone", y: -2000});

	return {beeHive, setHiddenBeeHive, dropBeeHive}
}

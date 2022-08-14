import * as React from "react";
import {Animations, Sounds} from "./Loader";
import AnimatedSprite from "./components/AnimatedSprite";
import useTicker from "./hooks/useTicker";

// state: "hidden", "arriving", "knocking", "leaving"
export const Woodpecker = ({woodpecker: {state, x, y, angle, flipped}, onClick}) => {
	let startAnim, loopAnim;
	switch (state) {
		case "hidden":
			return null;
		case "arriving":
			startAnim = null;
			loopAnim = "WoodpeckerFlyingLoop";
			break;
		case "knocking":
			startAnim = "WoodpeckerLand";
			loopAnim = "WoodpeckerKnockingLoop";
			break;
		case "leaving":
			startAnim = "WoodpeckerKnockingToFlying";
			loopAnim = "WoodpeckerFlyingLoop";
			break;
	}

	return (
		<AnimatedSprite
			key={state}
			start={Animations[startAnim]}
			anchor={[0, 0.5]}
			loop={Animations[loopAnim]}
			x={x}
			y={y}
			angle={angle}
			scale={[flipped, 1]}
			interactive buttonMode pointerdown={onClick}
		/>
	)
}

const arrivingDuration = 700;
const knockingDuration = 4000;
const leavingDuration = 1000;

const strength = 15; // Degrees per second

export const useWoodpecker = ({setSpeed, angle, setAngle}) => {
	const [x, setX] = React.useState(-1000);
	const [y, setY] = React.useState(-1000);
	const [flipped, setFlipped] = React.useState(1);
	const [wpAngle, setWpAngle] = React.useState(0);
	const [state, setState] = React.useState("hidden");
	const [timeout, setTimeout] = React.useState(0);
	const [beforePos, setBeforePos] = React.useState();
	const [afterPos, setAfterPos] = React.useState();

	const callWoodpecker = () => {
		if (state == "hidden") {
			window.setTimeout(() => {
				Sounds.WoodpeckerFlappingWings.play();
			}, 200);
			setTimeout(arrivingDuration);
			setState("arriving");
			const flipped = angle < 0 ? -1 : 1;
			setFlipped(flipped);
			setBeforePos({
				x: flipped * 1000,
				y: -500 - 1000 * Math.random(),
			})
			setAfterPos({
				x: - flipped * 1500,
				y: -500 - 1000 * Math.random(),
			})
		}
	}

	const scareWoodpecker = () => {
		if (state == "knocking") {
			Sounds.WoodpeckerKnocking.stop();
			Sounds.WoodpeckerFlappingWings.play();
			setTimeout(leavingDuration);
			setState("leaving");
		}
	}

	// const a = angle * Math.PI/180;
	// const onTreePos = {
	// 	x: flipped * duringPos.x * Math.cos(a) - duringPos.y * Math.sin(a),
	// 	y: duringPos.y * Math.cos(a) + flipped * duringPos.x * Math.sin(a),
	// }
	// const [state, setState] = useStateMachine("hidden", {
	// 	"arriving": {
	// 		duration: arrivingDuration,
	// 		next: "knocking",
	// 		tick: t => {
	// 			setX(onTreePos.x + t * (beforePos.x - onTreePos.x));
	// 			setY(onTreePos.y + t * (beforePos.y - onTreePos.y));
	// 			setWpAngle((1 - t) * angle);
	// 		}
	// 	},
	// 	"knocking": {
	// 		duration: knockingDuration,
	// 		next: "leaving",
	// 	},
	// 	"leaving": {
	// 		duration: leavingDuration,
	// 		next: "hidden",
	// 	},
	// })

	useTicker(delta => {
		const a = angle * Math.PI/180;
		const relativePos = {x: -60, y: flipped == 1 ? -450 : -600};

		const onTreePos = {
			x: flipped * relativePos.x * Math.cos(a) - relativePos.y * Math.sin(a),
			y: relativePos.y * Math.cos(a) + flipped * relativePos.x * Math.sin(a),
		}

		const deltaMS = delta * 16.67;
		if (timeout > 0) {
			setTimeout(Math.max(0, timeout - deltaMS));
		}
		switch (state) {
			case "arriving": {
				const t = timeout / arrivingDuration;
				setX(onTreePos.x + t * (beforePos.x - onTreePos.x));
				setY(onTreePos.y + t * (beforePos.y - onTreePos.y));
				setWpAngle((1 - t) * angle);
				if (timeout === 0) {
					window.setTimeout(() => {
						Sounds.WoodpeckerKnocking.play();
					}, 200);
					setState("knocking");
					setTimeout(knockingDuration);
				}
				break;
			}
			case "knocking": {
				setX(onTreePos.x);
				setY(onTreePos.y);
				setWpAngle(angle);
				if (timeout == 0) {
					Sounds.WoodpeckerKnocking.stop();
					Sounds.WoodpeckerFlappingWings.play();
					setState("leaving");
					setTimeout(leavingDuration);
				}
				if (timeout < knockingDuration - Animations["WoodpeckerLand"].duration) {
					setAngle(angle => angle - flipped * deltaMS * strength / 1000);
				}
				break;
			}
			case "leaving": {
				const t = Math.min(1, (timeout + Animations["WoodpeckerKnockingToFlying"].duration) / leavingDuration);
				setX(afterPos.x + t * (onTreePos.x - afterPos.x));
				setY(afterPos.y + t * (onTreePos.y - afterPos.y));
				setWpAngle(t * angle);
				if (timeout === 0) {
					setState("hidden");
				}
			}
		}
	});

	return {
		woodpecker: {state, x, y, flipped, angle: wpAngle},
		callWoodpecker,
		scareWoodpecker,
	}
}

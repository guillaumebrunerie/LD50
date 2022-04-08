import * as React from "react";
import {Container} from "react-pixi-fiber/index.js";
import useOnMount from "./hooks/useOnMount";

import {BranchesDetached, BranchesAttached, useBranches} from "./Branches";
import {Birds, useBirds} from "./Birds";
import {Beaver, WoodShavings, useBeaver} from "./Beaver";
import {BeeHiveAttached, BeeHiveDetached, BearBack, BearFront, useBeeHiveAndBear} from "./BeeHiveAndBear";
import {OwlBack, OwlFront, useOwl} from "./Owl";
import {Stump, TrunkBack, Trunk, TreeFront, useTree} from "./Trunk";

const branchWeight = 2;
const beeHiveWeight = 1;
const birdWeight = {"Small": 1, "Medium": 2, "Big": 3};

const Tree = ({x, y, isFirstScreen, isGameOver, gameOver}) => {
	const currentWeight = () => {
		let weight = 0;
		// Birds weight
		birds.filter(b => b.state === "standing").forEach(b => {
			if (b.x > 0) {
				weight += birdWeight[b.size];
			} else {
				weight -= birdWeight[b.size];
			}
		});
		// Branch weight
		const leftBranches = branches.filter(b => b.state === 0 && b.flipX).length;
		const rightBranches = branches.filter(b => b.state === 0 && !b.flipX).length;
		weight += branchWeight * (rightBranches - leftBranches);
		if (leftBranches == 0) weight += 7;
		if (rightBranches == 0) weight -= 7;
		if (leftBranches == 0 && rightBranches == 0) weight += angle / Math.abs(angle) * 15;
		// Hive weight
		if (beeHive.state === "attached") {
			weight -= beeHiveWeight;
		}
		return weight;
	}

	const {tree, chopTree, angle, setAngle, setSpeed, limitAngle} = useTree({
		isGameOver,
		gameOver,
		scareAllBirds: (...args) => scareAllBirds(...args),
		currentWeight,
	});
	const {beaver, scareBeaver} = useBeaver({isGameOver, tree, chopTree});
	const {branches, breakBranch} = useBranches({
		angle,
		scareBirds: (...args) => scareBirds(...args),
		scareBeaver,
		dropBeeHive: (...args) => dropBeeHive(...args),
	});
	const {
		birds,
		flipBird,
		addInitialBirds,
		addOwlBirds,
		scareAllBirds,
		scareBirds,
	} = useBirds({branches, isGameOver, angle, currentWeight});
	const {owl, owlTrigger} = useOwl({addOwlBirds});
	const {beeHive, setHiddenBeeHive, dropBeeHive} = useBeeHiveAndBear({branches, scareAllBirds, scareBeaver, setSpeed, angle, setAngle});

	useOnMount(() => {
		if (isFirstScreen) {
			setAngle(-90);
			setHiddenBeeHive();
		} else {
			addInitialBirds();
		}
	});

	return (
		<Container x={x} y={y} scale={0.9}>
			<Stump tree={tree}/>
			<Container angle={angle}>
				<TrunkBack/>
				<OwlBack owl={owl} onClick={owlTrigger}/>
				<BearBack beeHive={beeHive}/>
				<Trunk tree={tree}/>
				<OwlFront owl={owl}/>
				<BearFront beeHive={beeHive}/>
				<BranchesAttached branches={branches} breakBranch={breakBranch}/>
				<BeeHiveAttached beeHive={beeHive} angle={-angle} onClick={(Math.abs(angle) <= limitAngle) && dropBeeHive}/>
				<Birds birds={birds} flipBird={flipBird} angle={angle}/>
				<TreeFront/>
			</Container>
			<BeeHiveDetached beeHive={beeHive}/>
			<BranchesDetached branches={branches}/>
			<WoodShavings beaver={beaver}/>
			<Beaver beaver={beaver}/>
		</Container>
	);
};

export default Tree;

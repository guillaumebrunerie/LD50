import * as React from "react";
import { Sprite } from "react-pixi-fiber/index.js";
import Circle from "./components/Circle";
import { Textures } from "./Loader";

const trunkY = 35;
const treeY = -35;
const backgroundY = -830;
const owlY = -820;
const endY = -50;

export const TrunkFloor = ({state: {level, broken}}) => {
    const endTexture = Textures.Tree.get("TreeEnd_0" + level + (broken ? "_Broken" : ""));
    return (
        <>
            <Sprite texture={Textures.Tree.get("Trunk")} anchor={[0.5, 0]} y={trunkY} />
            <Sprite texture={endTexture} anchor={[0.5, 0]} y={0} scale={[1, -1]} y={-endY} />
        </>
    );
};
export const Trunk = ({state: {level, broken}}) => {
    const endTexture = Textures.Tree.get("TreeEnd_0" + level + (broken ? "_Broken" : ""));

    return (
        <>
            <Circle x={0} y={-900} radius={700} fill={0x00AA00} />
            <Sprite texture={Textures.Tree.get("TreeBack")} anchor={0.5} y={backgroundY} />
            <Sprite texture={Textures.Owl} anchor={0.5} y={owlY} />
            <Sprite texture={Textures.Tree.get("Tree")} anchor={[0.5, 1]} y={treeY} />
            <Sprite texture={endTexture} anchor={[0.5, 0]} y={0} y={endY} />
        </>
    );
};

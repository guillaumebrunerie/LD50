import * as React from "react";
import { Container, Sprite } from "react-pixi-fiber/index.js";
import Rectangle from "./components/Rectangle";
import { Textures } from "./Loader";

export const Branch = ({ branch: { y, flipX, state, type }, onClick }) => {
    const texture1 = Textures.Tree.get(`Branch_${type}_01`);
    const texture2 = Textures.Tree.get(`Branch_${type}_02`);
    const texture3 = Textures.Tree.get(`Branch_${type}_03`);
    const angle3 = state == 1 ? 30 : 0;
    const angle2 = state == 3 ? 30 : 0;

    return (
        <Container scale={[flipX ? -1 : 1, 1]}>
            {state <= 3 && (
                <Container x={branchDeltaX} y={-y} angle={angle2}>
                    <Rectangle
                        y={-30}
                        width={170}
                        height={60}
                        alpha={0.001}
                        interactive
                        buttonMode
                        pointerdown={onClick} />
                </Container>
            )}
            {state <= 1 && (
                <Container x={branchDeltaX + 160} y={-y} angle={angle3}>
                    <Rectangle
                        y={-30}
                        width={170}
                        height={60}
                        alpha={0.001}
                        interactive
                        buttonMode
                        pointerdown={onClick} />
                </Container>
            )}
            <Sprite texture={texture1} anchor={[0, 0.5]} y={-y} x={branchDeltaX} />
            {state <= 3 && <Sprite texture={texture2} anchor={[0, 0.5]} y={-y} x={branchDeltaX2} angle={angle2} />}
            {state <= 1 && <Sprite texture={texture3} anchor={[0, 0.5]} y={-y + branchDeltaY3[type]} x={branchDeltaX3[type]} angle={angle3} />}
        </Container>
    );
};
const branchDeltaX = 36;
const branchDeltaX2 = 45;
const branchDeltaX3 = {
    "A": 180,
    "B": 170,
    "C": 160,
};
const branchDeltaY3 = {
    "A": -11,
    "B": 3,
    "C": -6,
};
export const findPosition = (branches, sign = 0) => {
    if (sign > 0) {
        branches = branches.filter(branch => !branch.flipX);
    } else if (sign < 0) {
        branches = branches.filter(branch => branch.flipX);
    }
    const branch = branches[Math.floor(Math.random() * branches.length)];
    const y = branch.y + 30;
    const x = (50 + Math.random() * 300) * (branch.flipX ? -1 : 1);
    return { x, y };
};

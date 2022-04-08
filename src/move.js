// Returns {arrived: boolean, x: number, y: number}
const move = (from, to, delta, speed) => {
	if (from.x === to.x && from.y === to.y) {
		return {arrived: true, x: from.x, y: from.y};
	}
	const deltaX = to.x - from.x;
	const deltaY = to.y - from.y;
	const dist = delta * speed;
	const totalDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	if (dist >= totalDist) {
		return {arrived: true, x: to.x, y: to.y};
	}
	return {arrived: false, x: from.x + dist / totalDist * deltaX, y: from.y + dist / totalDist * deltaY};
}

export default move;

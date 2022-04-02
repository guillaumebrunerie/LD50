let lastPositions = [];
const size = 5;

window.addEventListener("mousemove", event => {
	lastPositions.push({x: event.clientX, y: event.clientY, t: Date.now()});
	lastPositions = lastPositions.slice(-size);
});

window.addEventListener("touchmove", event => {
	lastPositions.push({x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY, t: Date.now()});
	lastPositions = lastPositions.slice(-size);
});

const getSpeed = () => {
	const first = lastPositions[0];
	const last = lastPositions[lastPositions.length - 1];
	const dx = last.x - first.x;
	const dy = last.y - first.y;
	const dt = last.t - first.t;
	return {vx: dx / dt, vy: dy / dt}
}

export default getSpeed;

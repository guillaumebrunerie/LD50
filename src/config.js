export const TextureData = {
	"StartBtnDefault": "StartBtnDefault.png",
	"StartBtnOn": "StartBtnOn.png",

	"Tree": "tree.json",
	"Owl": "Owl.png",
	"BeeHive": "BeeHive.png",
	"Beaver": "Beaver.png",
	"Bear": "Bear.png",
	"Birds": {
		file: "birds.json",
		fps: 10,
		animations: {
			"FlySmall": {prefix: "Bird_Small_", start: 1, end: 3},
			"FlyMedium": {prefix: "Bird_Medium_", start: 1, end: 3},
			"FlyBig": {prefix: "Bird_Big_", start: 1, end: 3},
		}
	},
	"WoodShavingsLoop": {
		file: "WoodShavingsLoop.json",
		fps: 10,
		animations: {
			"WoodShavingsLoop": {prefix: "WoodShavingsLoop_0", start: 0, end: 4}
		}
	},
	"BeaverRun": {
		file: "BeaverRunCycle.json",
		fps: 20,
		animations: {
			"BeaverRun": {prefix: "BeaverRunCycle0", start: 0, end: 11},
		}
	},
	"BeaverAttack": {
		file: "BeaverAttack.json",
		fps: 15,
		animations: {
			"BeaverAttack": {prefix: "BeaverAttack0", start: 21, end: 26},
		}
	},
	"BeaverTransition": {
		file: "BeaverTransition.json",
		fps: 25,
		animations: {
			"BeaverTransition": {prefix: "BeaverTransition0", start: 12, end: 20},
		}
	},
};

export const SoundData = ["Chirp", "TreeCrashes"];

export const TextureData = {
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
	}
};

export const SoundData = ["Chirp", "TreeCrashes"];

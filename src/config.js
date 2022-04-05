export const TextureData = {
	"StartBtnDefault": "StartBtnDefault.png",
	"StartBtnOn": "StartBtnOn.png",
	"Logo": "Logo.png",
	"TreeCoronaBack": "TreeCorona_Back.png",
	"TreeCoronaFront": "TreeCorona_Front.png",
	"Bg": "Bg.png",
	"BgGround": "BgGround.png",

	"Font": "font.json",
	"Tree": "tree.json",
	"OwlIdle": "Owl_Idle.json",
	"BeeHive": "BeeHive.png",
	"BeeHiveLoop": "BeeHive_Loop.png",
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

export const AnimationData = {
	"BranchFall": {
		infix: "_0",
		fps: 15,
		start: 0,
		end: 7,
	},
	"Bird_Big_FlyingLoop": {
		infix: "_0",
		fps: 25,
		start: 0,
		end: 11,
	},
	"Bird_Medium_FlyingLoop": {
		infix: "_0",
		fps: 25,
		start: 0,
		end: 11,
	},
	"Bird_Small_FlyingLoop": {
		infix: "_0",
		fps: 25,
		start: 0,
		end: 11,
	},
	"Bird_Big_Land": {
		infix: "_0",
		fps: 25,
		start: 12,
		end: 25,
	},
	"Bird_Medium_Land": {
		infix: "_0",
		fps: 25,
		start: 12,
		end: 25,
	},
	"Bird_Small_Land": {
		infix: "_0",
		fps: 25,
		start: 12,
		end: 25,
	},
	"BeeHive_Start": {
		infix: "_0",
		fps: 20,
		start: 0,
		end: 3,
	},
	"BeeHive_End": {
		infix: "_0",
		fps: 10,
		start: 0,
		end: 12,
	},
	"Owl_Idle": {
		infix: "_0",
		fps: 25,
		start: 0,
		end: 6,
	},
	"Owl_Howl": {
		infix: "_0",
		fps: 15,
		start: 0,
		end: 25,
	},
	"TheBear_Back": {
		infix: "_0",
		fps: 15,
		start: 0,
		end: 24,
	},
	"TheBear_Front": {
		infix: "_0",
		fps: 15,
		start: 0,
		end: 24,
	},
}

export const SoundData = {
	"Bear": {},
	"BeaverEatsTree": {
		volume: 5,
	},
	"BeaverEnters": {},
	"BeaverAteTree": {},
	"BeaverScared": {},
	"BeeHiveDrops": {},
	"BeeHiveReleased": {},
	"BranchBreaks": {},
	"BranchDrops": {},
	"BirdFly": {
		volume: 0.4,
		singleInstance: true,
	},
	"ChirpSmall": {
		file: "Bird tweets _1",
		singleInstance: true,
	},
	"ChirpMedium": {
		file: "Bird tweets _2",
		singleInstance: true,
	},
	"ChirpBig": {
		file: "Bird tweets _3",
		singleInstance: true,
	},
	"Owl": {},
	"StartButton": {},
	"TreeCrashes": {},
	"Music": {
		loop: true,
		// volume: 0.3,
	},
}

import * as React from "react";
import * as PIXI from "pixi.js";

import {TextureData, AnimationData, SoundData} from "./config";

if (import.meta.webpackHot) {
	import.meta.webpackHot.accept("./config", () => {
		PIXI.Loader.shared.reset();
		loadTextures(() => {
			loadAnimations();
		});
	})
}


export const Textures = {};
export const Animations = {}
export const Sounds = {};

const getSpriteSheet = resource => ({
	get: (name) => {
		const sheet = resource.spritesheet;
		const index = sheet.data.frames.findIndex(d => d.filename === name);
		return sheet.textures[index];
	}
});

const loadTextures = (callback) => {
	const loader = PIXI.Loader.shared;

	Object.entries(TextureData).forEach(([key, value]) => {
		loader.add(key, "./dist/" + (typeof value === "string" ? value : value.file));
	});

	Object.entries(AnimationData).forEach(([key, value]) => {
		loader.add(key, "./dist/" + (value.file || (key + ".json")));
	});

	const soundLoader = new PIXI.Loader();
	Object.entries(SoundData).forEach(([key, value]) => {
		const file = value.file || key;
		soundLoader.add(key, `./dist/${file}.mp3`);
	});

	loader.load((_, resources) => {
		Object.entries(TextureData).forEach(([key, value]) => {
			if (typeof value === "string") {
				value = {file: value};
			}
			const {file} = value;
			if (file.endsWith(".json")) {
				Textures[key] = getSpriteSheet(resources[key]);
			} else {
				Textures[key] = resources[key].texture;
			}
		});
		Object.entries(AnimationData).forEach(([key, value]) => {
			Textures[key] = getSpriteSheet(resources[key]);
		});

		soundLoader.load((_, resources) => {
			Object.entries(SoundData).forEach(([key, value]) => {
				Sounds[key] = resources[key].sound;
				for (const k in value) {
					if (k !== "file") {
						Sounds[key][k] = value[k];
					}
				}
			});
			callback();
		});
	});
}

const getAnimation = (value) => {
	const {key, prefix, start, end, fps, loops = 1} = value;
	const textures = [];
	const spriteSheet = Textures[key];
	for (let frame = start; frame <= end; frame++) {
		textures.push(spriteSheet.get(prefix + `${frame}`.padStart(2, '0')));
	}
	const at = (t) => textures[Math.floor(t * fps / 1000) % textures.length];
	const duration = 1000/fps * textures.length * loops;

	return {at, duration};
}

const loadAnimations = () => {
	Object.entries(TextureData).forEach(([key, value]) => {
		Object.entries(value.animations || {}).forEach(([animKey, animation]) => {
			Animations[animKey] = getAnimation({key, ...value, ...animation});
		})
	})
	Object.entries(AnimationData).forEach(([key, value]) => {
		Animations[key] = getAnimation({key, file: value.file || (key + ".json"), prefix: value.prefix || (key + value.infix), ...value})
	})
};


export const Loader = ({children}) => {
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => loadTextures(() => {
		loadAnimations();
		setIsLoading(false);
	}), []);

	return isLoading ? null : children;
}

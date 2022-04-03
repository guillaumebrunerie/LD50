import React from "react";
import * as PIXI from "pixi.js";
import { sound } from '@pixi/sound';

import {TextureData, SoundData} from "./config";

export const Textures = {};

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

	SoundData.forEach(key => {
		sound.add(key, `./dist/${key}.mp3`);
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
		callback();
	});
}

const getAnimation = (value) => {
	const {key, name, start, end, fps, loops = 1} = value;
	const textures = [];
	const spriteSheet = Textures[key];
	for (let frame = start; frame <= end; frame++) {
		textures.push(spriteSheet.get(name + `${frame}`.padStart(2, '0')));
	}
	const at = (t) => textures[Math.floor(t * fps / 1000) % textures.length];
	const duration = 1000/fps * textures.length * loops;

	return {at, duration};
}

export const Animations = {}

const loadAnimations = () => {
	Object.entries(TextureData).forEach(([key, value]) => {
		Object.entries(value.animations || {}).forEach(([animKey, animation]) => {
			Animations[animKey] = getAnimation({key, ...value, ...animation});
		})
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

if (import.meta.webpackHot) {
	import.meta.webpackHot.accept("./config", () => {
		PIXI.Loader.shared.reset();
		loadTextures(() => {
			loadAnimations();
		});
	})
}

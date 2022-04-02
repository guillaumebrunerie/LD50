import React from "react";
import * as PIXI from "pixi.js";

import TextureData from "./graphicsConfig";

export const Textures = {};

const getSpriteSheet = resource => ({
	get: (name) => {
		const sheet = resource.spritesheet;
		const index = sheet.data.frames.findIndex(d => d.filename === name);
		return sheet.textures[index];
	}
});

const getTextureAt = (res, tileWidth = 24, tileHeight = 24, frame) => {
	const tilesX = Math.floor(res.texture.width / tileWidth);
	const x = (frame % tilesX) * tileWidth;
	const y = Math.floor(frame / tilesX) * tileHeight;
	return new PIXI.Texture(res.texture.baseTexture, new PIXI.Rectangle(x, y, tileWidth, tileHeight));
};

const loadTextures = (callback) => {
	const loader = PIXI.Loader.shared;

	Object.entries(TextureData).forEach(([key, value]) => {
		loader.add(key, "./dist/" + (typeof value === "string" ? value : value.file));
	});

	loader.load((_, resources) => {
		Object.entries(TextureData).forEach(([key, value]) => {
			if (typeof value === "string") {
				if (value.endsWith(".json")) {
					Textures[key] = getSpriteSheet(resources[key]);
				} else {
					Textures[key] = resources[key].texture;
				}
			} else {
				const {tileWidth, tileHeight} = value;
				Textures[key] = {get: frame => getTextureAt(resources[key], tileWidth, tileHeight, frame)};
			}
		});
		callback();
	});
}

const getAnimation = (value) => {
	const {file, tileWidth, tileHeight, start, end, fps, loops = 1} = value;
	const textures = [];
	for (let frame = start; frame < end; frame++) {
		textures.push(getTextureAt(file, tileWidth, tileHeight, frame));
	}
	const at = (t) => textures[Math.floor(t * fps / 1000) % textures.length];
	const duration = 1000/fps * textures.length * loops;

	return {at, duration};
}

export const Animations = Object.fromEntries(Object.entries(TextureData).map(([key, value]) => [
	key,
	value.animations && Object.fromEntries(Object.entries(value.animations).map(([animKey, animation]) => [
		animKey,
		getAnimation({...value, ...animation})
	])
)]));

export const Loader = ({children}) => {
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => loadTextures(() => setIsLoading(false)), []);

	return isLoading ? null : children;
}

if (import.meta.webpackHot) {
	import.meta.webpackHot.accept("./graphicsConfig", () => {
		PIXI.Loader.shared.reset();
		loadTextures(() => {});
	})
}

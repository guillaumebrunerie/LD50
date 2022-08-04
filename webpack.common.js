const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
	entry: "./src/index.jsx",
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				options: {
					presets: ["@babel/preset-react"],
				}
			},
			{
				test: /\.(png|jpg|json)$/,
				type: "asset",
			}
		]
	},
	resolve: {
		extensions: ["*", ".js", ".jsx"],
		alias: {
			"@hooks": path.resolve(__dirname, "src/hooks/"),
			"@components": path.resolve(__dirname, "src/components/"),
		},
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js",
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: "gfx", to: "dist" },
				{ from: "audio", to: "dist" },
			],
		}),
	],
};

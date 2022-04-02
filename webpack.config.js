const path = require("path");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
	mode: isDevelopment ? "development" : "production",
	entry: "./src/index.jsx",
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				options: {
					presets: ["@babel/preset-react"],
					plugins: isDevelopment ? [require.resolve('react-refresh/babel')] : [],
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
	devServer: {
		static: "./dist",
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: "gfx", to: "dist" },
			],
		}),
		...isDevelopment ? [new ReactRefreshWebpackPlugin()] : []
	],
};

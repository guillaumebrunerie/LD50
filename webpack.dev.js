const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

module.exports = merge(common, {
	mode: 'development',
	// devtool: 'inline-source-map',

	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				options: {
					presets: ["@babel/preset-react"],
					plugins: [require.resolve('react-refresh/babel')],
				}
			}
		]
	},
	devServer: {
		static: './dist',
	},
	plugins: [
		new ReactRefreshWebpackPlugin()
	],
});

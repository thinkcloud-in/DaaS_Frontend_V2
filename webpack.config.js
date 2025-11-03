const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Entry point of your application
  entry: './src/index.js',
  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/', // Base path for all assets
  },
  // Module loaders
  module: {
    rules: [
      {
        // Babel loader for JSX and JavaScript files
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        // Style loader for CSS files
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // Add other loaders for images, fonts, etc. as needed
    ],
  },
  // Plugins
  plugins: [
    // Generates an HTML file with <script> injected
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
    }),
  ],
  // Development server configuration
  devServer: {
    historyApiFallback: true, // Handle history API fallback for SPA
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 3000,
  },
  // Enable source maps for debugging
  devtool: 'source-map',
};

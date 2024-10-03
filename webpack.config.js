import path from 'path';
import { fileURLToPath } from 'url';
import nodeExternals from 'webpack-node-externals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './index.js',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    filename: 'index.cjs',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs2',
    },
  },
  experiments: {
    outputModule: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};

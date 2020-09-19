const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const getFilesFromDir = require('./config/files')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const PAGE_DIR = path.join('src', 'pages', path.sep)

const htmlPlugins = getFilesFromDir(PAGE_DIR, ['.html']).map((filePath) => {
  const fileName = filePath.replace(PAGE_DIR, '')
  return new HtmlWebPackPlugin({
    chunks: [fileName.replace(path.extname(fileName), ''), 'vendor'],
    template: filePath,
    filename: fileName
  })
})

const entry = getFilesFromDir(PAGE_DIR, ['.js', '.jsx']).reduce((obj, filePath) => {
  const entryChunkName = filePath.replace(path.extname(filePath), '').replace(PAGE_DIR, '')
  if (entryChunkName in obj) {
    obj[entryChunkName] = [...(obj[entryChunkName]), `./${filePath}`]
  } else {
    obj[entryChunkName] = [`./${filePath}`]
  }
  return obj
}, {})

module.exports = (env, argv) => ({
  entry: entry,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash:6].js',
    publicPath: '/'
  },
  devtool: argv.mode === 'production' ? false : 'eval-source-maps',
  plugins: [
    ...htmlPlugins,
    new CleanWebpackPlugin()
  ],
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
      components: path.resolve(__dirname, 'src', 'components')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', { loader: 'css-loader', options: { modules: true } }],
        exclude: /node_modules/
      },
      {
        test: /\.(svg|jpg|gif|png)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: (url, resourcePath, context) => {
                if (argv.mode === 'development') {
                  const relativePath = path.relative(context, resourcePath)
                  return `${relativePath}`
                }
                return `/images/[hash:6].${path.basename(resourcePath)}`
              }
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: (url, resourcePath, context) => {
                if (argv.mode === 'development') {
                  const relativePath = path.relative(context, resourcePath)
                  return `${relativePath}`
                }
                return `/fonts/[hash:6].${path.basename(resourcePath)}`
              }
            }
          }
        ]
      }]
  },
  optimization: {
    minimize: argv.mode === 'production',
    minimizer: [new TerserPlugin()],
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          enforce: true
        }
      }
    }
  },
  devServer: {
    port: 9000,
    inline: true,
    historyApiFallback: {
      index: 'index.html',
      rewrites: [
        { from: /^\/products\/product$/, to: '/products/product.html' },
        { from: /^\/products\/product\//, to: '/products/product.html' }
      ]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        secure: false
      }
    }
  }
})

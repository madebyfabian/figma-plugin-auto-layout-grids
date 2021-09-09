const path = require('path'),
      manifest = require('./src/manifest.json'),
      fs = require('fs')

const WebpackMessages = require('webpack-messages')

console.clear()

module.exports = ( env, argv ) => {
  const mode          = argv.mode || 'development'
  const isProduction  = mode === 'production'
  const distFolder    = path.resolve(__dirname, 'dist')

  return {
    mode,
  
    // This is necessary because Figma's 'eval' works differently than normal eval
    devtool: isProduction ? false : 'inline-source-map',

    stats: false,

    performance: {
      hints: false
    },
    
    entry: {
      main: './src/main.ts'
    },

    output: {
      filename: '[name].js',
      path: distFolder,
    },  
    
    module: {
      rules: [
        // Converts TypeScript code to JavaScript
        { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      ],
    },

    resolveLoader: {
      modules: [path.join(__dirname, 'node_modules')]
    },

    resolve: {
      // Webpack tries these extensions for you if you omit the extension like "import './file'"
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.vue', '.json'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': path.resolve(__dirname, 'src/')
      }
    },

    plugins: [
      new WebpackMessages(),

      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('AfterEmitPlugin', compilation => {
            // Create build/manifest.json
            fs.writeFileSync(path.join(distFolder, 'manifest.json'), JSON.stringify({
              ...manifest,
              main: 'main.js',
              name: `${ isProduction ? '🚀 PROD' : '⚙️ DEV'} — ${ manifest.name || 'Please provide plugin name' }`,
              id: manifest.id || ''
            }))
          })
        }
      },
    ]
  }
}
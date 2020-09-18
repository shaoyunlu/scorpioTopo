import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss'

const resolveFile = function(filePath) {
  return path.join(__dirname, '..', filePath)
}

const isProductionEnv = process.env.NODE_ENV === 'production';

const processLess = function(context, payload) {
  return new Promise(( resolve, reject ) => {
    less.render({
      file: context
    }, function(err, result) {
      if( !err ) {
        resolve(result);
      } else {
        reject(err);
      }
    });

    less.render(context, {})
    .then(function(output) {
      // output.css = string of css
      // output.map = string of sourcemap
      // output.imports = array of string filenames of the imports referenced
      if( output && output.css ) {
        resolve(output.css);
      } else {
        reject({})
      }
    },
    function(err) {
      reject(err)
    });

  })
}

export default {
  input: './src/main.js',
  output: {
    //file: '../../../Project_New/rhweb-vintage/js/plugin/topo/VTopo.js',
    file: './demo/lib/VTopo.js',
    format: 'umd',
    name: 'VTopo'
  },
  plugins: [
      babel({
          exclude: 'node_modules/**'
      }),
      postcss({
        //extract: true,
        minimize: isProductionEnv,
        process: processLess,
      }),
  ]
};
import terser from '@rollup/plugin-terser'

const extensions = ['.js', '.ts']

export default {
  input: './out/index.js',
  output: [
    {
      file: './dist/lib/index.esm.js',
      format: 'esm'
    },
    {
      file: './dist/lib/index.cjs.js',
      format: 'cjs'
    },
  ],
  plugins: [terser()],
  external: ['react-router-dom']
}

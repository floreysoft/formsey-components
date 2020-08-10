import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import minifyHTML from 'rollup-plugin-minify-html-literals';

export default {
  input: 'packages/formsey-fields-native/index.ts',
  output: {
    dir: 'output',
    format: 'esm',
    sourcemap: false
  },
  plugins: [
    resolve(),
    minifyHTML(),
    typescript({ declarationDir: "output" }),
    terser({
      format: {
        comments: false
      }
    })]
}
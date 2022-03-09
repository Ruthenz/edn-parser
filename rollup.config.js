import pkg from './package.json';
import typescript from "rollup-plugin-ts"
import {terser} from "rollup-plugin-terser";

export default {
  input: "src/index.ts",
  external: [
    ...Object.keys(pkg.dependencies || {})
  ],
  output: [
    {file: "dist/index.cjs", format: "cjs"},
    {dir: "./dist", format: "es"}
  ],
  plugins: [typescript(), terser()]
}

import typescript from "@rollup/plugin-typescript"
import commonjs from "@rollup/plugin-commonjs"
import postcss from "rollup-plugin-postcss"
import resolve from "@rollup/plugin-node-resolve"
import url from "@rollup/plugin-url"
import svgr from "@svgr/rollup"
import babel, { getBabelOutputPlugin } from "@rollup/plugin-babel"

import pkg from "./package.json"

export default {
    input: "src/index.tsx",
    output: [{
            file: pkg.main,
            format: "cjs",
            exports: "auto",
            sourcemap: true
        },
        {
            file: pkg.module,
            format: "esm",
            exports: "auto",
            sourcemap: true
        },
    ],
    plugins: [
        postcss({
            modules: false
        }),
        url(),
        svgr(),
        resolve(),
        typescript(),
        commonjs(),
        babel({ presets: ["@babel/preset-react"], babelHelpers: "bundled" }),
        getBabelOutputPlugin({
            presets: ["@babel/preset-env"]
        })
    ],
    external: ["react", "react-dom"],
}
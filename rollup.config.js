import typescript from "@rollup/plugin-typescript"
import commonjs from "@rollup/plugin-commonjs"
import postcss from "rollup-plugin-postcss"
import resolve from "@rollup/plugin-node-resolve"
import url from "@rollup/plugin-url"
import svgr from "@svgr/rollup"
import babel, { getBabelOutputPlugin } from "@rollup/plugin-babel"
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import autoprefixer from 'autoprefixer'

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
        peerDepsExternal(),
        commonjs({
            include: 'node_modules/**',
            // This was required to fix some random errors while building
            namedExports: {
                'react-is': ['isForwardRef', 'isValidElementType'],
            },
        }),
        resolve(),
        babel({ presets: ["@babel/preset-react"], babelHelpers: "bundled" }),
        postcss({
            preprocessor: (content, id) => new Promise((res) => {
                const result = sass.renderSync({ file: id })

                res({ code: result.css.toString() })
            }),
            plugins: [autoprefixer],
            modules: {
                scopeBehaviour: 'global',
            },
            sourceMap: true,
            extract: true,
        }),
        url(),
        svgr(),
        typescript(),
        getBabelOutputPlugin({
            presets: ["@babel/preset-env"]
        })
    ],
    external: ["react", "react-dom"],
}
import typescript from "@rollup/plugin-typescript"
import commonjs from "@rollup/plugin-commonjs"
import postcss from "rollup-plugin-postcss"
import resolve from "@rollup/plugin-node-resolve"
import url from "@rollup/plugin-url"
import svgr from "@svgr/rollup"
import babel, { getBabelOutputPlugin } from "@rollup/plugin-babel"
import peerDepsExternal from "rollup-plugin-peer-deps-external"

export default [{
    input: [
        "src/index.tsx",
    ],
    output: [
        {
            dir: "dist",
            format: "esm",
            exports: "named",
            preserveModules: true,
            preserveModulesRoot: "src",
            sourcemap: true,
        }
    ],
    plugins: [
        peerDepsExternal(),
        resolve(),
        postcss({
            modules: false
        }),
        commonjs(),
        url(),
        svgr(),
        typescript({
            tsconfig: "./tsconfig.json",
            declaration: true,
            declarationDir: "dist",
        }),
        babel({ exclude: "node_modules/**", presets: ["@babel/preset-react"], babelHelpers: "bundled" }),
        getBabelOutputPlugin({
            presets: ["@babel/preset-react", "@babel/preset-env"],
            plugins: [["babel-plugin-styled-components", { displayName: true }]],
        }),
    ],
    external: ["react", "react-dom"],
}]
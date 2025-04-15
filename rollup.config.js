import commonjs from "@rollup/plugin-commonjs"
import postcss from "rollup-plugin-postcss"
import resolve from "@rollup/plugin-node-resolve"
import url from "@rollup/plugin-url"
import svgr from "@svgr/rollup"
import babel from "@rollup/plugin-babel"
import peerDepsExternal from "rollup-plugin-peer-deps-external"

export default {
    input: "src/index.tsx",
    output: [
        {
            dir: "dist",
            format: "esm",
            exports: "named",
            preserveModules: true,
            preserveModulesRoot: "src",
            sourcemap: true
        }
    ],
    plugins: [
        peerDepsExternal(),
        resolve({ extensions: [".js", ".jsx", ".ts", ".tsx"] }),
        postcss({
            extract: true,
            modules: false,
            minimize: true
        }),
        commonjs(),
        url(),
        svgr(),
        babel({
            babelHelpers: "bundled",
            exclude: "node_modules/**",
            extensions: [".ts", ".tsx", ".js", ".jsx"],
            presets: [
                "@babel/preset-env",
                "@babel/preset-react",
                "@babel/preset-typescript" // 👈 aggiunto preset per TS
            ],
            plugins: [["babel-plugin-styled-components", { displayName: true }]]
        })
    ],
    external: (id) =>
        ["react", "react-dom", "@photo-sphere-viewer/core", "photo-sphere-viewer-lensflare-plugin"].some(pkg => id === pkg || id.startsWith(pkg + "/")),
    
}

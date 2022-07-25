import * as React from "react"

/**
 * Default CSS definition for typescript,
 * will be overridden with file-specific definitions by rollup
 */
declare module "*.css" {
  const content: { [className: string]: string }
  export default content
}

type SvgrComponent = React.Component<React.SVGAttributes<SVGElement>>

declare module "*.svg" {
  const svgUrl: string
  const svgComponent: SvgrComponent
  export default svgUrl
  export { svgComponent as ReactComponent }
}

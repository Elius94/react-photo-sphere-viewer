# react-photo-sphere-viewer
> Photosphere Viewer for React.JS

![Screenshot](https://user-images.githubusercontent.com/14907987/194562000-0411b51e-f017-468a-a51c-c6ce6df9b629.png)


```bash
npm install @photo-sphere-viewer/core react-photo-sphere-viewer
```

> [!IMPORTANT]
> Since [v5.0.0-psv5.7.1](https://github.com/Elius94/react-photo-sphere-viewer/releases/tag/v5.0.0-psv5.7.1), to use `<ReactPhotoSphereViewer />` you have to manually install the JS library `@photo-sphere-viewer/core`. This is a breaking change. The library is not included in the package anymore. You can install it using the command `npm install @photo-sphere-viewer/core` or `yarn add @photo-sphere-viewer/core`. I decided to remove the library from the package to reduce the size of the package and to avoid the need to update the package every time the original library is updated. In particular, from now on, to use a plugin or an adapter, you need to import it directly from the package. For example, to use the `MarkersPlugin` you need to import it from the package `import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'`.

## Library Version
Original Wrapped Library: [PhotoSphereViewer](https://github.com/mistic100/Photo-Sphere-Viewer) Version: 5.7.1 [<font color="green">**NEW**</font>]
Now the component version is composed by the semantic version of the wrapper and the version of the original library. For example, the current version is 5.0.2-psv5.7.1. This means that the wrapper is in version 5.0.2 and the original library [psv](https://github.com/mistic100/Photo-Sphere-Viewer) is in version 5.7.1.

## Description

[![NPM](https://img.shields.io/npm/v/react-photo-sphere-viewer.svg)](https://www.npmjs.com/package/react-photo-sphere-viewer) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[](https://user-images.githubusercontent.com/14907987/180258193-7d6179dc-64d7-4b08-9381-95e061c9ff79.mp4)

This is a simple React component that allows you to display a 360° photo sphere.
It is based on [PhotoSphereViewer](https://github.com/mistic100/Photo-Sphere-Viewer) by [Mistic100](https://github.com/mistic100).
This component is a well managed wrapper around the original JS library. It is easy to use and has a lot of features. It is also easy to customize. It is also easy to extend.
Addictional features are:
 - Little Planet Mode: display the panorama like a little planet (Similar to the DJI drones exported panoramas)

 ## Demo
 [Enjoy it in this sandbox](https://codesandbox.io/s/sandbox-react-photo-sphere-viewer-by-elius94-j064sm?file=/src/App.js)

## Usage

* Using React
```jsx
import './App.css';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import React from 'react';

function App() {
  return (
    <div className="App">
      <ReactPhotoSphereViewer src="Test_Pano.jpg" height={'100vh'} width={"100%"}></ReactPhotoSphereViewer>
    </div>
  );
}

export default App;
```

* Using Next.js
```jsx
import './App.css';
import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
const ReactPhotoSphereViewer = dynamic(
  () =>
    import('react-photo-sphere-viewer').then(
      (mod) => mod.ReactPhotoSphereViewer
    ),
  {
    ssr: false,
  }
);

export default function Home() {  
  return (
    <div className="App">
      <ReactPhotoSphereViewer src="Test_Pano.jpg" height={'100vh'} width={"100%"}></ReactPhotoSphereViewer>
    </div>
  );
}
```

> [!IMPORTANT]
> To use `<ReactPhotoSphereViewer />` in Next.js with App Router, make sure to include [`"use client"`](https://nextjs.org/docs/app/building-your-application/rendering/client-components#using-client-components-in-nextjs) in your component embedding the viewer. Refer to the [documentation](https://nextjs.org/docs/app/building-your-application/rendering/client-components#using-client-components-in-nextjs) for more details.

## Little planet mode

I've added this custom effect that allows you to display the panorama like a little planet. To enable it, you need to pass the `littlePlanet` prop to the component.

```jsx
<ReactPhotoSphereViewer src="Test_Pano.jpg" littlePlanet={true} height={'100vh'} width={"100%"}></ReactPhotoSphereViewer>
```

The effect is this:

[](https://user-images.githubusercontent.com/14907987/180257570-4070d0b4-b3d8-493d-8f23-efde84074573.mp4)

## Features
### options
#### Standard props
```ts
type standardProps = {
  src: string; // The URL of the panorama image.
  height: number;
  width?: number;
  containerClass?: string; // The class name of the div that wrap the component.
  littlePlanet?: boolean; // Display the panorama like a little planet.
  hideNavbarButton?: boolean; // Hide the navbar button.
}
```
#### Original props
Currently all options of the original library are supported and exported as props. 

```ts
/**
 * Viewer configuration
 * @link https://photo-sphere-viewer.js.org/guide/config.html
 */
type ViewerConfig = {
    container: HTMLElement | string;
    panorama?: any;
    /** @deprecated Use the `overlay` plugin instead */
    overlay?: any;
    /** @deprecated Use the `overlay` plugin instead */
    overlayOpacity?: number;
    /** @default equirectangular */
    adapter?: AdapterConstructor | [AdapterConstructor, any];
    plugins?: Array<PluginConstructor | [PluginConstructor, any]>;
    /** @default null */
    caption?: string;
    /** @default null */
    description?: string;
    /** @default null */
    downloadUrl?: string;
    /** @default null */
    downloadName?: string;
    /** @default null */
    loadingImg?: string;
    /** @default 'Loading...' */
    loadingTxt?: string;
    /** @default `container` size */
    size?: CssSize;
    /** @default false */
    fisheye?: boolean | number;
    /** @default 30 */
    minFov?: number;
    /** @default 90 */
    maxFov?: number;
    /** @default 50 */
    defaultZoomLvl?: number;
    /** @default 0 */
    defaultYaw?: number | string;
    /** @default 0 */
    defaultPitch?: number | string;
    /** @default `0,0,0` */
    sphereCorrection?: SphereCorrection;
    /** @default 1 */
    moveSpeed?: number;
    /** @default 1 */
    zoomSpeed?: number;
    /** @default true */
    moveInertia?: boolean;
    /** @default true */
    mousewheel?: boolean;
    /** @default true */
    mousemove?: boolean;
    /** @default false */
    mousewheelCtrlKey?: boolean;
    /** @default false */
    touchmoveTwoFingers?: boolean;
    /** @deprecated configure `useXmpData` on EquirectangularAdapter */
    useXmpData?: boolean;
    panoData?: PanoData | PanoDataProvider;
    requestHeaders?: Record<string, string> | ((url: string) => Record<string, string>);
    /** @deprecated configure `backgroundColor` on EquirectangularAdapter */
    canvasBackground?: string;
    /** @default '{ alpha: true, antialias: true }' */
    rendererParameters?: WebGLRendererParameters;
    /** @default false */
    withCredentials?: boolean;
    /** @default 'zoom move download description caption fullscreen' */
    navbar?: boolean | string | Array<string | NavbarCustomButton>;
    lang?: {
        zoom: string;
        zoomOut: string;
        zoomIn: string;
        moveUp: string;
        moveDown: string;
        moveLeft: string;
        moveRight: string;
        download: string;
        fullscreen: string;
        menu: string;
        close: string;
        twoFingers: string;
        ctrlZoom: string;
        loadError: string;
        littlePlanetButton: string;
        littlePlanetIcon: string;
        [K: string]: string;
    };
    keyboard?: boolean | 'always' | 'fullscreen' | Record<string, ACTIONS | ((viewer: Viewer) => void)>;
    keyboardActions?: Record<string, ACTIONS | ((viewer: Viewer) => void)>;
};
```
> This code is generated from the original library. Click [here](http://photo-sphere-viewer.js.org/guide/config.html) to see documentation.

### Plugins
To use the standard plugins provided by the original library, you need to pass the `plugins` prop to the component. The prop is an array of plugins. Each plugin can be a constructor or an array of constructor and options. To include them in the component, you need to import them directly from the "@photo-sphere-viewer/" package.

> The only "third-party" plugin that is supported is the "Lensflare" plugin. To use it, you need to import it from the "react-photo-sphere-viewer" package, not from the original. That's because the plugin is made by me and it is not included in the original library.

```jsx
import { ReactPhotoSphereViewer, LensflarePlugin } from 'react-photo-sphere-viewer';
import { CompassPlugin } from '@photo-sphere-viewer/compass-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

function App() {
  const plugins = [
    [LensflarePlugin, {
      position: { pitch: 0, yaw: 0 },
      src: 'lensflare.png',
      width: 1000,
      height: 1000,
    }],
    [CompassPlugin, {
      hotspots: [
        { longitude: '0deg' },
        { longitude: '90deg' },
        { longitude: '180deg' },
        { longitude: '270deg' },
      ],
    }],
    [MarkersPlugin, {
      markers: [
        {
          id: 'polygon',
          polygonPx: [2941, 1413, 3042, 1402, 3222, 1419, 3433, 1463, 3480, 1505, 3438, 1538, 3241, 1543, 3041, 1555, 2854, 1559, 2739, 1516, 2775, 1469, 2941, 1413 ],
          svgStyle : {
            fill       : 'rgba(255,0,0,0.2)',
            stroke     : 'rgba(255, 0, 50, 0.8)',
            strokeWidth: '2px',
          },
          data: { compass: 'rgba(255, 0, 50, 0.8)' },
        },
        {
          id: 'polyline',
          polylinePx: [2478, 1635, 2184, 1747, 1674, 1953, 1166, 1852, 709, 1669, 301, 1519, 94, 1399, 34, 1356],
          svgStyle: {
            stroke        : 'rgba(80, 150, 50, 0.8)',
            strokeLinecap : 'round',
            strokeLinejoin: 'round',
            strokeWidth   : '20px',
          },
          data: { compass: 'rgba(80, 150, 50, 0.8)' },
        },
      ],
    }],
  ]


  return (
    <div className="App">
      <ReactPhotoSphereViewer src="Test_pano.jpg" plugins={plugins} height={'100vh'} width={"100%"}></ReactPhotoSphereViewer>
    </div>
  );
}
```

#### Calling plugin methods and handling events from outside the component [**NEW**](https://github.com/Elius94/react-photo-sphere-viewer/issues/6)

To handle events from outside the component, you need to declare the callback function in the `onReady(instance: Viewer)` prop. The `instance` is the instance of the viewer. You can call the plugin methods using the `instance.getPlugin()` method. The `instance.getPlugin()` method returns the plugin instance. You can call the plugin methods using the plugin instance.

```jsx
const handleReady = (instance) => {
  const markersPlugs = instance.getPlugin(MarkersPlugin);
  if (!markersPlugs)
    return;
  markersPlugs.addMarker({
    id: "imageLayer2",
    image: "drone.png",
    size: { width: 220, height: 220 },
    position: { yaw: '130.5deg', pitch: '-0.1deg' },
    tooltip: "Image embedded in the scene"
  });
  markersPlugs.addEventListener("select-marker", () => {
    console.log("asd");
  });
}

return (
  <div className="App">
    <ReactPhotoSphereViewer src="Test_pano.jpg" plugins={plugins} height={'100vh'} width={"100%"} onReady={handleReady}></ReactPhotoSphereViewer>
  </div>
);
```

> Click [here](https://photo-sphere-viewer.js.org/plugins/) to see plugins documentation.

### Note for Virtual Tour Plugin
Please follow this Sandbox template to see how to use the original plugin: [Sandbox](https://codesandbox.io/s/react-photo-sphere-viewer-virtual-tour-example-xg8tp4) 

Please remember to set the 'src' prop of the ReactPhotoSphereViewer component to a placeholder image, it colud be for example the first picture of the virtual tour. [#36](https://github.com/Elius94/react-photo-sphere-viewer/issues/36)

### Adapters (NEW - 3.1.0-psv5.0.1)

To use the standard library adapters provided by the original library, you need to pass the `adapter` prop to the component. The prop is an array of adapters. Each adapter can be a constructor or an array of constructor and options. To include them in the component, you need to import them directly from the "react-photo-sphere-viewer" package.

```jsx

import { CubemapAdapter, CubemapAdapterOptions } from '@photo-sphere-viewer/cubemap-adapter';
```

> Click [here](https://photo-sphere-viewer.js.org/guide/adapters/) to see adapters documentation.

### events
All documented events are exported as props (function names).

```ts
type ViewerEvents = {
  onPositionChange?(lat: number, lng: number, instance: Viewer): any;
  onZoomChange?(data: events.ZoomUpdatedEvent & { type: "zoom-updated"; }, instance: Viewer): any;
  onClick?(data: events.ClickEvent & { type: "click"; }, instance: Viewer): void;
  onDblclick?(data: events.ClickEvent & { type: "dblclick"; }, instance: Viewer): void;
  onReady?(instance: Viewer): void;
}
```

You can declare an event callback:
```js
const handleClick = (data: events.ClickEvent & { type: "click"; }) => {
  console.log(data);
}
```
and then:
```jsx
{/*Pass the callback to the component*/}
<ReactPhotoSphereViewer ref={photoSphereRef} src="Test_Pano.jpg" onClick={handleClick}></ReactPhotoSphereViewer>
```

> To see the original events, click [here](http://photo-sphere-viewer.js.org/guide/events.html).

### methods
To trigger a method you need to pass a reference to the component and access the method directly.

```js
// Create a reference to the component
const photoSphereRef = React.createRef<ReactPhotoSphereViewer>();

// And calling the method
photoSphereRef.current.zoom(10);

// Or to be sure that the component is mounted
React.useEffect(() => {
  if (!photoSphereRef.current)
    return;
  photoSphereRef.current.animate({
    yaw: 0,
    pitch: 0,
    zoom: 55,
    speed: '10rpm',
  }); // Or any other method
}, [photoSphereRef]);

```
And then:
```jsx
{/*Pass the ref to the component*/}
<ReactPhotoSphereViewer ref={photoSphereRef} src="Test_Pano.jpg"></ReactPhotoSphereViewer>
```
Currently managed methods are:
 - animate(options: AnimateOptions): utils.Animation<any>;
 - destroy(): void;
 - createTooltip(config: TooltipConfig): Tooltip;
 - needsContinuousUpdate(enabled: boolean): void;
 - observeObjects(userDataKey: string): void;
 - unobserveObjects(userDataKey: string): void;
 - setCursor(cursor: string): void;
 - stopAnimation(): PromiseLike<any>;
 - rotate(position: ExtendedPosition): void;
 - setOption(option: keyof UpdatableViewerConfig, value: unknown): void;
 - setOptions(options: Partial<UpdatableViewerConfig>): void;
 - getCurrentNavbar(): (string | object)[] | void;
 - zoom(value: number): void;
 - zoomIn(step: number): void;
 - zoomOut(step: number): void;
 - resize(size: CssSize): void;
 - enterFullscreen(): void;
 - exitFullscreen(): void;
 - toggleFullscreen(): void;
 - isFullscreenEnabled(): boolean | void;
 - startAutoRotate(): void;
 - stopAutoRotate(): void;
 - getPlugin<T>(pluginId: string | PluginConstructor): T;
 - getPosition(): Position; // Specify the return type
 - getZoomLevel(): number; // Specify the return type
 - getSize(): Size; // Specify the return type
 - needsUpdate(): void;
 - autoSize(): void;
 - setPanorama(path: any, options?: PanoramaOptions): Promise<boolean>;
 - toggleAutorotate(): void;
 - showError(message: string): void;
 - hideError(): void;
 - startKeyboardControl(): void;
 - stopKeyboardControl(): void;

> To see the original methods, click [here](http://photo-sphere-viewer.js.org/guide/methods.html).


## License

MIT © [elius94](https://github.com/elius94)

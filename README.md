# react-photo-sphere-viewer
> Photosphere Viewer for React.JS

```bash
npm install react-photo-sphere-viewer
```

[![NPM](https://img.shields.io/npm/v/react-photo-sphere-viewer.svg)](https://www.npmjs.com/package/react-photo-sphere-viewer) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[](https://user-images.githubusercontent.com/14907987/180258193-7d6179dc-64d7-4b08-9381-95e061c9ff79.mp4)

This is a simple React component that allows you to display a 360° photo sphere.
It is based on [PhotoSphereViewer](https://github.com/mistic100/Photo-Sphere-Viewer) by [Mistic100](https://github.com/mistic100).
This component is a well managed wrapper around the original JS library. It is easy to use and has a lot of features. It is also easy to customize. It is also easy to extend.
Addictional features are:
 - Little Planet Mode: display the panorama like a little planet (Similar to the DJI drones exported panoramas)

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
}
```
#### Original props
Currently all options of the original library are supported and exported as props. 

```ts
/**
 * @summary Viewer options, see {@link http://photo-sphere-viewer.js.org/guide/config.html}
 */
type ViewerOptions = {
  container: HTMLElement | string;
  panorama?: any;
  adapter?: AdapterConstructor<any> | [AdapterConstructor<any>, any];
  caption?: string;
  description?: string;
  downloadUrl?: string;
  loadingImg?: string;
  loadingTxt?: string;
  size?: Size;
  fisheye?: boolean;
  minFov?: number;
  maxFov?: number;
  defaultZoomLvl?: number;
  defaultLong?: number;
  defaultLat?: number;
  sphereCorrection?: { pan?: number, tilt?: number, roll?: number };
  moveSpeed?: number;
  zoomSpeed?: number;
  autorotateDelay?: number,
  autorotateIdle?: boolean;
  autorotateSpeed?: string | number;
  autorotateLat?: number;
  moveInertia?: boolean;
  mousewheel?: boolean;
  mousemove?: boolean;
  captureCursor?: boolean;
  mousewheelCtrlKey?: boolean;
  touchmoveTwoFingers?: boolean;
  useXmpData?: boolean;
  panoData?: PanoData | PanoDataProvider;
  requestHeaders?: Record<string, string> | ((url: string) => Record<string, string>);
  canvasBackground?: string;
  withCredentials?: boolean;
  navbar?: string | Array<string | NavbarCustomButton>;
  lang?: Record<string, string>;
  keyboard?: Record<string, string>;
  plugins?: Array<PluginConstructor<any> | [PluginConstructor<any>, any]>;
};
```
> This code is generated from the original library. Click [here](http://photo-sphere-viewer.js.org/guide/config.html) to see documentation.

### events
All documented events are exported as props (function names).

```ts
type ViewerEvents = {
  onPositionChange?(lat: number, lng: number): any;
  onZoomChange?(zoom: number): any;
  onClick?(data: ClickData): void;
  onDblclick?(data: ClickData): void;
  onReady?(): void;
}
```

You can declare an event callback:
```js
const handleClick = (data: ClickData) => {
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
```
And then:
```jsx
{/*Pass the ref to the component*/}
<ReactPhotoSphereViewer ref={photoSphereRef} src="Test_Pano.jpg"></ReactPhotoSphereViewer>
```
Currently managed methods are:
 - animate(options: AnimateOptions)
 - destroy()
 - rotate(options: { x: number, y: number })
 - setOption(option: keyof ViewerOptions, value: any)
 - zoom(value: number)
 - zoomIn()
 - zoomOut()
 - startAutoRotate()
 - stopAutoRotate()

> To see the original methods, click [here](http://photo-sphere-viewer.js.org/guide/methods.html).

## Usage

```jsx
import './App.css';
import ReactPhotoSphereViewer from 'react-photo-sphere-viewer';
import React from 'react';

function App() {
  const photoSphereRef = React.useRef();

  const handleClick = () => {
    photoSphereRef.current.animate({
      latitude: 0,
      longitude: 0,
      zoom: 55,
      speed: '10rpm',
    });
  }

  return (
    <div className="App">
      <ReactPhotoSphereViewer ref={photoSphereRef} src="Test_Pano.jpg" height={'100vh'} width={"100%"} onClick={handleClick}></ReactPhotoSphereViewer>
    </div>
  );
}

export default App;
```

## Little planet mode

I've added this custom effect that allows you to display the panorama like a little planet. To enable it, you need to pass the `littlePlanet` prop to the component.

```jsx
<ReactPhotoSphereViewer ref={photoSphereRef} src="Test_Pano.jpg" littlePlanet={true} height={'100vh'} width={"100%"} onClick={handleClick}></ReactPhotoSphereViewer>
```

The effect is this:

[](https://user-images.githubusercontent.com/14907987/180257570-4070d0b4-b3d8-493d-8f23-efde84074573.mp4)

## License

MIT © [elius94](https://github.com/elius94)

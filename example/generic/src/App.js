import './App.css';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { ReactPhotoSphereViewer, LensflarePlugin } from 'react-photo-sphere-viewer';
import { PlanPlugin } from '@photo-sphere-viewer/plan-plugin';
import { TileLayer } from 'leaflet';
import React from 'react';
import "@photo-sphere-viewer/plan-plugin/index.css"

function App() {
  const photoSphereRef = React.useRef();

  const handleClick = (instance) => {
    photoSphereRef.current.animate({
      yaw: 0,
      pitch: 0,
      zoom: 55,
      speed: '10rpm',
    });
  }

  const handleReady = (instance) => {
    const markersPlugs = instance.getPlugin(MarkersPlugin);
    if (!markersPlugs)
      return;
    console.log(markersPlugs);
    markersPlugs.addEventListener("select-marker", () => {
      console.log("asd");
    });
  }

  const plugins = [
    [
      [PlanPlugin, {
        defaultZoom: 14,
        coordinates: [6.78677, 44.58241],
        bearing: '120deg',
        layers: [
          {
            name: 'OpenStreetMap',
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; OpenStreetMap',
          },
          {
            name: 'OpenTopoMap',
            layer: new TileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
              subdomains: ['a', 'b', 'c'],
              maxZoom: 17,
            }),
            attribution: '&copy; OpenTopoMap',
          },
        ],
        hotspots: [
          {
            coordinates: [6.7783, 44.58506],
            id: 'green-lake',
            tooltip: 'Lac vert',
            color: 'green',
          },
        ],
      }],
      MarkersPlugin,
      {
        // list of markers
        markers: [
          {
            // image marker that opens the panel when clicked
            id: "image",
            position: { yaw: '0.33deg', pitch: '0.1deg' },
            image: "pin-blue.png",
            anchor: "bottom center",
            size: { width: 32, height: 32 },
            tooltip: "Mountain peak. <b>Click me!</b>"
          },
          {
            // image marker rendered in the 3D scene
            id: "imageLayer",
            image: "drone.png",
            size: { width: 220, height: 220 },
            position: { yaw: '13.5deg', pitch: '-0.1deg' },
            tooltip: "Image embedded in the scene"
          }
        ]
      }
    ],
    [
      LensflarePlugin,
      {
        // list of lensflares
        lensflares: [
          {
            id: 'sun',
            position: { yaw: '145deg', pitch: '2deg' },
            type: 0,
          }
        ]
      }
    ]
  ];

  return (
    <div className="App">
      <ReactPhotoSphereViewer
        ref={photoSphereRef}
        src="Test_pano.jpg"
        littlePlanet={true}
        lang={{
          littlePlanetButton: "Little Planet",
        }}
        hideNavbarButton={true}
        height={'100vh'}
        width={"100%"}
        onClick={handleClick}
        onReady={handleReady}
        plugins={plugins} />
    </div>
  );
}

export default App;

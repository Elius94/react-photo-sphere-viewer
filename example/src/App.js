import './App.css';
import { ReactPhotoSphereViewer/*, MarkersPlugin*/ } from 'react-photo-sphere-viewer';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import React from 'react';

function App() {
  const [markersManager, setMarkerManager] = React.useState();
  const photoSphereRef = React.useCallback((node) => {
    const markersPlugs = node?.getPlugin(MarkersPlugin);
    setMarkerManager(markersPlugs);
  }, []);

  const handleClick = () => {
    photoSphereRef.current.animate({
      yaw: 0,
      pitch: 0,
      zoom: 55,
      speed: '10rpm',
    });
  }

  React.useEffect(() => {
    if (markersManager) {
      console.log(markersManager);
      markersManager.addEventListener("select-marker", (e, marker, data) => {
        console.log("asd");
      });
      markersManager.addEventListener("over-marker", (e, marker) => {
        console.log(`Cursor is over marker ${marker.id}`);
      });
    }
  }, [markersManager]);

  const plugins = [
    [
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
            imageLayer: "drone.png",
            size: { width: 220, height: 220 },
            position: { yaw: '13.5deg', pitch: '-0.1deg' },
            tooltip: "Image embedded in the scene"
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
        height={'100vh'}
        width={"100%"}
        onClick={handleClick}
        plugins={plugins} />
    </div>
  );
}

export default App;

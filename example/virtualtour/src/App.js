import {
  ReactPhotoSphereViewer,
  VirtualTourPlugin,
  GalleryPlugin,
  MarkersPlugin
} from "react-photo-sphere-viewer";
import React from "react";

const baseUrl = "https://photo-sphere-viewer-data.netlify.app/assets/";
const caption = "Cape Florida Light, Key Biscayne <b>&copy; Pixexid</b>";

function App() {
  const pSRef = React.createRef();

  const handleReady = (instance) => {
    const virtualTour = instance.getPlugin(VirtualTourPlugin);
    if (!virtualTour) return;

    const markerLighthouse = {
      id: "marker-1",
      image: baseUrl + "pictos/pin-red.png",
      tooltip: "Cape Florida Light, Key Biscayne",
      size: { width: 32, height: 32 },
      anchor: "bottom center",
      gps: [-80.155973, 25.666601, 29 + 3]
    };

    virtualTour.setNodes(
      [
        {
          id: "1",
          panorama: baseUrl + "tour/key-biscayne-1.jpg",
          thumbnail: baseUrl + "tour/key-biscayne-1-thumb.jpg",
          name: "One",
          caption: `[1] ${caption}`,
          links: [{ nodeId: "2" }],
          markers: [markerLighthouse],
          gps: [-80.156479, 25.666725, 3],
          panoData: { poseHeading: 327 }
        },
        {
          id: "2",
          panorama: baseUrl + "tour/key-biscayne-2.jpg",
          thumbnail: baseUrl + "tour/key-biscayne-2-thumb.jpg",
          name: "Two",
          caption: `[2] ${caption}`,
          links: [{ nodeId: "3" }, { nodeId: "1" }],
          markers: [markerLighthouse],
          gps: [-80.156168, 25.666623, 3],
          panoData: { poseHeading: 318 }
        },
        {
          id: "3",
          panorama: baseUrl + "tour/key-biscayne-3.jpg",
          thumbnail: baseUrl + "tour/key-biscayne-3-thumb.jpg",
          name: "Three",
          caption: `[3] ${caption}`,
          links: [{ nodeId: "4" }, { nodeId: "2" }, { nodeId: "5" }],
          gps: [-80.155932, 25.666498, 5],
          panoData: { poseHeading: 310 }
        },
        {
          id: "4",
          panorama: baseUrl + "tour/key-biscayne-4.jpg",
          thumbnail: baseUrl + "tour/key-biscayne-4-thumb.jpg",
          name: "Four",
          caption: `[4] ${caption}`,
          links: [{ nodeId: "3" }, { nodeId: "5" }],
          gps: [-80.156089, 25.666357, 3],
          panoData: { poseHeading: 78 }
        },
        {
          id: "5",
          panorama: baseUrl + "tour/key-biscayne-5.jpg",
          thumbnail: baseUrl + "tour/key-biscayne-5-thumb.jpg",
          name: "Five",
          caption: `[5] ${caption}`,
          links: [{ nodeId: "6" }, { nodeId: "3" }, { nodeId: "4" }],
          gps: [-80.156292, 25.666446, 2],
          panoData: { poseHeading: 190 }
        },
        {
          id: "6",
          panorama: baseUrl + "tour/key-biscayne-6.jpg",
          thumbnail: baseUrl + "tour/key-biscayne-6-thumb.jpg",
          name: "Six",
          caption: `[6] ${caption}`,
          links: [{ nodeId: "5" }, { nodeId: "7" }],
          gps: [-80.156465, 25.666496, 2],
          panoData: { poseHeading: 295 }
        },
        {
          id: "7",
          panorama: baseUrl + "tour/key-biscayne-7.jpg",
          thumbnail: baseUrl + "tour/key-biscayne-7-thumb.jpg",
          name: "Seven",
          caption: `[7] ${caption}`,
          links: [{ nodeId: "6" }],
          gps: [-80.15707, 25.6665, 3],
          panoData: { poseHeading: 250, posePitch: 3 }
        }
      ],
      "2"
    );
  };

  const plugins = [
    MarkersPlugin,
    [
      GalleryPlugin,
      {
        thumbnailSize: { width: 100, height: 100 }
      }
    ],
    [
      VirtualTourPlugin,
      {
        positionMode: "gps",
        renderMode: "3d"
      }
    ]
  ];

  return (
    <div className="App" id={"container-360"}>
      <ReactPhotoSphereViewer
        ref={pSRef}
        loadingImg={baseUrl + "loader.gif"}
        touchmoveTwoFingers={true}
        mousewheelCtrlKey={true}
        defaultYaw={"130deg"}
        navbar={"zoom move gallery caption fullscreen"}
        height={"100vh"}
        width={"100%"}
        onReady={handleReady}
        littlePlanet={false}
        plugins={plugins}
        container={"container-360"}
        src={baseUrl + "tour/key-biscayne-3.jpg"}
      ></ReactPhotoSphereViewer>
    </div>
  );
}

export default App;

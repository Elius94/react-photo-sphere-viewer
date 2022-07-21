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
      <ReactPhotoSphereViewer ref={photoSphereRef} src="Test_pano.jpg" littlePlanet={true} height={'100vh'} width={"100%"} onClick={handleClick}></ReactPhotoSphereViewer>
    </div>
  );
}

export default App;

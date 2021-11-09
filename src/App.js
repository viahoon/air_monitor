import './App.css';
import { RenderAfterNavermapsLoaded, NaverMap, Marker } from 'react-naver-maps'
import { useEffect, useState } from 'react';
import axios from 'axios';


const naverMap = window.naver.maps;
let map = '';
let mapOptions = {
  center: { lat: 34.999027, lng: 126.792920  },
  zoom: 20,
  mapTypeId: naverMap.MapTypeId.SATELLITE,
};
let cadastralLayer = new naverMap.CadastralLayer();

function App() {
  useEffect(() => {
    map = new naverMap.Map('map', mapOptions);
    axios.get('https://b.aircondition.viasofts.com/measure/api/date/2021-11-03/2021-11-04')
    .then((result) => {
      result.data.map((data)=>{
        let latlngAltitude = data.latlng_altitude;
        let tempArray = latlngAltitude.split(",");

        console.log(tempArray[0],tempArray[1]);

        let circle = new naverMap.Circle({
          map: map,
          center: { lat: tempArray[0], lng: tempArray[1] },
          radius: 10,
    
          strokeColor: '#5347AA',
          strokeOpacity: 0.5,
          strokeWeight: 2,
          fillColor: '#E51D1A',
          fillOpacity: 0.7
        });
      })
    });
    

    

  });

  return (
    <div className="App">
      <div id="map" className="map"></div>
      <div style={{ position: 'relative', top: '-200px', backgroundColor: 'red', width: '200px', height: '200px' }}>
        <div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '80px', textAlign: 'right', paddingRight: '10px' }}>지도형태</div>
            <div>
              <select onChange={(e) => {
                map.setMapTypeId(naverMap.MapTypeId[e.target.value]);
              }}>
                <option value="SATELLITE" selected>위성지도</option>
                <option value="NORMAL">일반지도</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', marginTop: '10px' }}>
            <div style={{ width: '80px', textAlign: 'right', paddingRight: '10px' }}>지적도</div>
            <div><input type="checkbox" id="chkCadastral" onChange={(e) => {
              let obj = e.target;
              if (obj.checked === true) {
                cadastralLayer.setMap(map);
              } else {
                cadastralLayer.setMap(null);
              }
            }} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}




export default App;

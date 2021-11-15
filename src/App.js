import './App.css';
import { RenderAfterNavermapsLoaded, NaverMap, Marker } from 'react-naver-maps'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import "antd/dist/antd.css";


const naverMap = window.naver.maps;
let map = '';
let mapOptions = {
  // center: { lat: 34.999027, lng: 126.792920  },
  center: { lat: 35.72272445754895, lng: 127.35833625487176 },
  zoom: 20,
  mapTypeId: naverMap.MapTypeId.SATELLITE,
};
let cadastralLayer = new naverMap.CadastralLayer();

function App() {
  useEffect(() => {
    map = new naverMap.Map('map', mapOptions);
    axios.get('https://b.aircondition.viasofts.com/measure/api/date/2021-10-01/2021-10-01')
      .then((result) => {
        result.data.map((data) => {
          let latlngAltitude = data.latlng_altitude;
          let tempArray = latlngAltitude.split(",");
          console.log(tempArray[0], tempArray[1]);
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
      <div style={{ position: 'fixed', top: '10px', right: '10px', backgroundColor: '#00000032', padding: "10px"}}>
        <div>
          <div style={{ display: 'flex' }}>
            <div>
              <select onChange={(e) => {
                map.setMapTypeId(naverMap.MapTypeId[e.target.value]);
              }}>
                <option value="SATELLITE" selected>위성지도</option>
                <option value="NORMAL">일반지도</option>
              </select>
            </div>
            <div style={{ marginLeft: '10px' }}><input type="checkbox" id="chkCadastral" onChange={(e) => {
              let obj = e.target;
              if (obj.checked === true) {
                cadastralLayer.setMap(map);
              } else {
                cadastralLayer.setMap(null);
              }
            }} /></div>
            지적도
            <div style={{ marginLeft: '30px' }}>시작날짜 : <input type='date'></input>&nbsp;&nbsp;&nbsp;&nbsp;종료날짜 : <input type='date'></input>
              <Tooltip title="search">
                <Button type="primary" shape="circle" icon={<SearchOutlined />} style={{marginLeft:'10px'}} />
              </Tooltip>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}




export default App;

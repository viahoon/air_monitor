import './App.css';
import { RenderAfterNavermapsLoaded, NaverMap, Marker } from 'react-naver-maps'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import "antd/dist/antd.css";
import { BUILDER_KEYS } from '@babel/types';
import { Table, Tag, Space } from 'antd';
import reactDom from 'react-dom';


const naverMap = window.naver.maps;
let map = '';
let mapOptions = {
  // center: { lat: 34.999027, lng: 126.792920  },
  center: { lat: 35.72272445754895, lng: 127.35833625487176 },
  zoom: 20,
  mapTypeId: naverMap.MapTypeId.SATELLITE,
};
let cadastralLayer = new naverMap.CadastralLayer();
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
  },
  {
    title: '센서번호',
    dataIndex: 'device_id',
  },
  {
    title: '측정지역',
    dataIndex: 'measure_area',
  },
  {
    title: '측정시간',
    dataIndex: 'measure_time',
  },

];

function App() {
  let today = new Date();
  let year = today.getFullYear(); // 년도
  let month = today.getMonth() + 1;  // 월
  let date = today.getDate();  // 날짜

  let startDate = year + '-' + month + '-' + date;
  let endDate = year + '-' + month + '-' + date;

  let [urlValue, setUrlValue] = useState('https://b.aircondition.viasofts.com/measure/api/date/' + startDate + '/' + endDate);
  let [resultData, setResultData] = useState([]);


  useEffect(() => {
    map = new naverMap.Map('map', mapOptions);
    let tempResult = [];
    let tempDate;
    let tempPosition;
    axios.get(urlValue)
      .then((result) => {
        result.data.map((data, index) => {
          let latlngAltitude = data.latlng_altitude;
          let tempArray = latlngAltitude.split(",");
          let circle = new naverMap.Circle({
            map: map,
            center: { lat: tempArray[0], lng: tempArray[1] },
            radius: 10,

            // strokeColor: '#5347AA',
            // strokeOpacity: 0.2,
            strokeWeight: 0,
            fillColor: '#E51D1A',
            fillOpacity: 0.5
          });

          tempDate = new Date(data.measure_time);
          tempPosition = data.latlng_altitude.split(",");
          tempResult.push(
            {
              key: index,
              id: data.id,
              device_id: data.device_id,
              measure_area: data.measure_area,
              measure_time: tempDate.toLocaleString(),
              lat: tempPosition[0],
              lng: tempPosition[1],
            }
          )
        })
        setResultData(tempResult);
      });
  }, [urlValue]);

  return (
    <div className="App">
      <div id="map" className="map"></div>
      <div style={{ position: 'fixed', top: '10px', right: '10px', backgroundColor: '#00000032', padding: "10px" }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'blue' }}>
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
            }} /><span style={{ color: 'white', marginLeft: '5px' }}>지적도</span></div>
            <div style={{ marginLeft: '30px' }}>
              <span style={{ color: 'white' }}>시작날짜 : </span>
              <input type='date' id='startDate'></input>
              <span style={{ color: 'white', marginLeft: '20px' }}>종료날짜 : </span>
              <input type='date' id='endDate'></input>
              <Tooltip title="search">
                <Button type="primary" shape="circle" icon={<SearchOutlined />} style={{ marginLeft: '10px' }} onClick={() => {
                  let startDate = document.getElementById('startDate');
                  let endDate = document.getElementById('endDate');
                  if (startDate.value === '') {
                    alert('시작날짜를 입력하세요.');
                    startDate.focus();
                    return;
                  }
                  if (endDate.value === '') {
                    alert('종료날짜를 입력하세요.');
                    endDate.focus();
                    return;
                  }
                  setUrlValue('https://b.aircondition.viasofts.com/measure/api/date/' + startDate.value + '/' + endDate.value);
                }} />
              </Tooltip>
            </div>

          </div>
        </div>

      </div>
      <div style={{ position: 'fixed', top: '100px', right: '10px', height: '90%', overflowY: 'scroll', }}>
        <Table columns={columns} dataSource={resultData}
        onRow={(record, rowIndex) => {
          return {
            onClick: event => {
              map.panTo(new naverMap.LatLng(record.lat, record.lng));
              map.setZoom(18, true);
            }, // click row
            // onDoubleClick: event => {}, // double click row
            // onContextMenu: event => {}, // right button click row
            // onMouseEnter: event => {}, // mouse enter row
            // onMouseLeave: event => {}, // mouse leave row
          };
        }}
        />
      </div>
    </div>
  );
}




export default App;

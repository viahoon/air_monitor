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
let moveMapValue = false;

const cadastralLayer = new naverMap.CadastralLayer();
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
  },
  {
    title: '기기번호',
    dataIndex: 'device_id',
  },
  {
    title: '측정지역',
    dataIndex: 'measure_area',
  },
  {
    title: '미세먼지',
    dataIndex: 'cal_value_02',
  },
  {
    title: '초미세먼지',
    dataIndex: 'cal_value_03',
  },
  {
    title: '복합악취',
    dataIndex: 'cal_value_01',
  },
  {
    title: '측정시간',
    dataIndex: 'measure_time',
  },

];


const GasDef = {
  RESOLUTION: 1024,
  VOLTAGE: 5.0,

  SLOPE: {
    NH3: 41.359,
    H2S: 41.359,
    VOC: 76.92,
    O3: -10,
    CO: 138.89,
    SO2: 1.26,
    NO2: 1.99,
  },

  OFFSET: {
    NH3: -24.078,
    H2S: -24.01,
    VOC: 13.84,
    O3: 20.3,
    CO: -27.77,
    SO2: -0.4,
    NO2: -0.47,
  },

  T_ODER: {
    WEIGHT: {
      NH3: 0.5,
      H2S: 0.6,
      VOC: 0.28,
    },
    OFFSET: 2.9,
  }

}


function App() {
  let today = new Date();
  let year = today.getFullYear(); // 년도
  let month = today.getMonth() + 1;  // 월
  let date = today.getDate();  // 날짜

  let startDate = year + '-' + month + '-' + date;
  let endDate = year + '-' + month + '-' + date;

  let [urlValue, setUrlValue] = useState('https://b.aircondition.viasofts.com/measure/api/date/' + startDate + '/' + endDate);
  let [resultData, setResultData] = useState([]);
  let mapOptions = {
    center: { lat: 35.72272445754895, lng: 127.35833625487176 },
    zoom: 17,
    mapTypeId: naverMap.MapTypeId.SATELLITE,
  };

  useEffect(() => {
    map = new naverMap.Map('map', mapOptions);
    let tempResult = [];
    let tempDate;
    let tempPosition;
    let measure_result;
    axios.get(urlValue)
      .then((result) => {
        let firstLat, firstLng;
        result.data.map((data, index) => {
          let latlngAltitude = data.latlng_altitude;
          let tempArray = latlngAltitude.split(",");

          tempDate = new Date(data.measure_time);
          tempPosition = data.latlng_altitude.split(",");
          measure_result = JSON.parse(data.measure_result);
          if (index===0) {
            firstLat = tempPosition[0];
            firstLng = tempPosition[1];
          }

          let i = 1;
          for (const gas in measure_result) {
            let sensorData = Number(measure_result[gas]);
            if ((i >= 3 && i <= 6) || (i >= 9 && i <= 11)) {
              sensorData = sensorData / GasDef.RESOLUTION * GasDef.VOLTAGE;
            }
            switch (i) {
              case 3:
                sensorData = sensorData * GasDef.SLOPE.NH3 + GasDef.OFFSET.NH3;
                break;
              case 4:
                sensorData = sensorData * GasDef.SLOPE.H2S + GasDef.OFFSET.H2S;
                break;
              case 5:
                sensorData = sensorData * GasDef.SLOPE.VOC + GasDef.OFFSET.VOC;
                break;
              case 6:// CO
                sensorData = sensorData * GasDef.SLOPE.CO + GasDef.OFFSET.CO;
                break;
              case 9://O3
                sensorData = sensorData * GasDef.SLOPE.O3 + GasDef.OFFSET.O3;
                break;
              case 10: // SO2
                sensorData = sensorData * GasDef.SLOPE.SO2 + GasDef.OFFSET.SO2;
                break;
              case 11: //NO2
                sensorData = sensorData * GasDef.SLOPE.NO2 + GasDef.OFFSET.NO2;
                break;
            }
            sensorData = sensorData < 0 ? 0 : sensorData;
            measure_result[gas] = sensorData;
            i++;
          }

          let cal_value_01 =  measure_result.A3 * GasDef.T_ODER.WEIGHT.NH3
          + measure_result.A4 * GasDef.T_ODER.WEIGHT.H2S
          + measure_result.A5 * GasDef.T_ODER.WEIGHT.VOC
          + GasDef.T_ODER.OFFSET;
          cal_value_01 = cal_value_01.toFixed(3);

          let colorValue;
          let txtValue;
          // 복합악취의 경우
          // if (cal_value_01 < 12) {
          //   colorValue = '#00FF00';
          // } else if (cal_value_01>=12 && cal_value_01 < 15) {
          //   colorValue = '#FFFF00';
          // } else {
          //   colorValue = '#FF0000';
          // }

          //미세먼지10
          if (measure_result.A8 >= 0 && measure_result.A8 <= 30) {
            colorValue = '#32a1ff';
            txtValue = '좋음';
          } else if (measure_result.A8 > 30 && measure_result.A8 <= 80) {
            colorValue = '#00c73c';
            txtValue = '보통';
          } else if (measure_result.A8 > 80 && measure_result.A8 <= 150) {
            colorValue = '#fd9b5a';
            txtValue = '나쁨';
          } else if (measure_result.A8 > 150) {
            colorValue = '#ff5959';
            txtValue = '매우나쁨';
          }

          let circle = new naverMap.Circle({
            map: map,
            center: { lat: tempArray[0], lng: tempArray[1] },
            radius: 20,

            // strokeColor: '#5347AA',
            // strokeOpacity: 0.2,
            strokeWeight: 0,
            fillColor: colorValue,
            fillOpacity: 0.3
          });

          tempResult.push(
            {
              key: index,
              id: data.id,
              device_id: data.device_id,
              measure_area: data.measure_area,
              measure_time: tempDate.toLocaleString(),
              lat: tempPosition[0],
              lng: tempPosition[1],
              cal_value_01: cal_value_01,
              cal_value_02: measure_result.A8 + ' (' + txtValue + ')',
              cal_value_03: measure_result.A7,
            }
          )
        })
        setResultData(tempResult);
        if (moveMapValue) {
          map.panTo(new naverMap.LatLng(firstLat, firstLng));
          map.setZoom(17, true);
        }
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
            <div style={{ marginLeft: '10px' }}><input type="checkbox" onChange={(e) => {
              let obj = e.target;
              if (obj.checked === true) {
                cadastralLayer.setMap(map);
              } else {
                cadastralLayer.setMap(null);
              }
            }} /><span style={{ color: 'white', marginLeft: '5px' }}>지적도</span></div>
            <div style={{ marginLeft: '10px' }}>
              <input type="checkbox" onClick={(e)=>{
                  moveMapValue = e.target.checked;
                }}/>
              <span style={{ color: 'white', marginLeft: '5px' }}>지도이동</span>
            </div>


            <div style={{ marginLeft: '30px' }}>
              <span style={{ color: 'white' }}>시작날짜 : </span>
              <input type='date' id='startDate'></input>
              <span style={{ color: 'white', marginLeft: '20px' }}>종료날짜 : </span>
              <input type='date' id='endDate'></input>
              <span style={{ color: 'white', marginLeft: '20px' }}>기기번호 : </span>
              <select onChange={(e)=>{
                let startDate = document.getElementById('startDate');
                let endDate = document.getElementById('endDate');
                if (e.target.value === '') {
                  setUrlValue('https://b.aircondition.viasofts.com/measure/api/date/' + startDate.value + '/' + endDate.value);
                } else {
                  setUrlValue('https://b.aircondition.viasofts.com/measure/api/date/' + startDate.value + '/' + endDate.value + '?device_id=' + e.target.value);
                }
              }}>
                <option value="">전체</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
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
                map.setZoom(17, true);
              }, // click row
              // onDoubleClick: event => {}, // double click row
              // onContextMenu: event => {}, // right button click row
              // onMouseEnter: event => {}, // mouse enter row
              // onMouseLeave: event => {}, // mouse leave row
            };
          }}
        />
      </div>
      <div style={{ position: 'fixed', bottom: '10px', left: '10px' }}>
        <table>
          <tr>
            <td width="100" height="50" bgcolor="#32a1ff"><b>좋음</b></td>
          </tr>
          <tr>
            <td width="100" height="50" bgcolor="#00c73c"><b>보통</b></td>
          </tr>
          <tr>
            <td width="100" height="50" bgcolor="#fd9b5a"><b>나쁨</b></td>
          </tr>
          <tr>
            <td width="100" height="50" bgcolor="#ff5959"><b>매우나쁨</b></td>
          </tr>

        </table>
      </div>
    </div>
  );
}




export default App;


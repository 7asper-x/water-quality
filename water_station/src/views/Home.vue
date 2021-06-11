<template>
  <div>
    <div id="map"></div>
    <div class="streetName">
      <div class="SN"> <span id="street"></span></div>
    </div>
    <div class="stationInfo">
      <div><strong>Province:</strong> <span id="pro"></span></div>
      <div><strong>City:</strong> <span id="city"></span></div>
      <div><strong>Station:</strong> <span id="name"></span></div>
      <div><strong>Time:</strong> <span id="time"></span></div>
      <div><strong>Address:</strong> <span id="loc"></span></div>
      <div><strong>Water Quality:</strong> <span id="level"></span></div>
    </div>
    <div id="chart1"></div>
    <div class="color">
      <div v-for="(item,index) in waterCategoryLegend" class="legendItem">
        <div class="colorItem" :style="{'background-color':item[1]}"></div>
        <div>{{item[0]}}</div>
      </div>
    </div>
<!--    <div class="streetName">-->
<!--      <div><strong>Street Name:</strong> <span id="street"></span></div>-->
<!--    </div>-->
  </div>
</template>

<script>
import axios from "axios";
import * as echarts from 'echarts';
// axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
const mapboxgl = require('mapbox-gl');
const {InfluxDB} = require('@influxdata/influxdb-client')
const token = 'Fof57yHq8_5WgsNZUl9k6LgeshFKBhQ8tP98m6cpDA6mh8s2fE-eXAjZnmV3Yg40aKVYBGwF5-qGYnAEO09wKw=='
const org = 'ctri'
const bucket = 'test'
const client = new InfluxDB({url: 'http://58.23.17.121:8086', token: token})
const geojson_point = {"type":"Feature",
  "properties":{},
  "geometry":{
    "type":"Point",
    "coordinates":[105.380859375,31.57853542647338]
  }
}

export default {
  name: 'Map',
  data () {
    return{
      city: '北京市',
      waterCategoryLegend:[
        ['Ⅰ类', '#11D1E2'],
        ['Ⅱ类', '#2ECC77'],
        ['Ⅲ类', '#F0892E'],
        ['Ⅳ类', '#ff5a1f'],
        ['Ⅴ类', '#7D6025'],
        ['劣Ⅴ类', '#3E364E'],
        ['无数据', '#9c9c9c']
      ],
    }
  },
  mounted () {
    mapboxgl.accessToken = 'pk.eyJ1IjoiN2FzcGVyIiwiYSI6ImNrOGd6Mm16ODAwNGEzZ21kMGZodnJxbzIifQ.-0nYA6gFnhnS9_Ep3S7XZg';
    this.map = new mapboxgl.Map({
      container: 'map', // container id 绑定的组件的id
      style: 'mapbox://styles/7asper/ckp54h9x70qaj17phz7qukhae', //地图样式，可以使用官网预定义的样式,也可以自定义
      center: [107.682223, 34.658567], // 初始坐标系，这个是南京建邺附近
      zoom: 3,     // starting zoom 地图初始的拉伸比例
      // pitch: 60,  //地图的角度，不写默认是0，取值是0-60度，一般在3D中使用
      // bearing: -17.6, //地图的初始方向，值是北的逆时针度数，默认是0，即是正北
      antialias: true, //抗锯齿，通过false关闭提升性能
    });
    this.map.addControl(new mapboxgl.NavigationControl({showZoom: false,visualizePitch:true}),'bottom-right');

    this.map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        localGeocoder: this.coordinatesGeocoder,
        zoom: 10,
        placeholder: 'Enter Coordinates',
        mapboxgl: mapboxgl
      })
    );

    this.map.on('styledata', ()=>{
      this.setMapboxLayer();
      this.getWaterQuality();
      // this.getStaticData();
    });
  },
  methods: {
    setMapboxLayer(){
      // if(!this.map.getSource('city-boundary')){
      //   this.map.addSource('city-boundary', {
      //     'type': 'geojson',
      //     'data': `/users/static/street_boundary/${this.city}.json`,
      //   })
      // }
      // if(!this.map.getLayer('boundary')) {
      //   this.map.addLayer({
      //     'id':'boundary',
      //     'type':"line",
      //     'source': 'city-boundary',
      //     'layout':{
      //       'line-join':'bevel',
      //       'line-cap':'butt',
      //     },
      //     'paint': {
      //       'line-width':2,
      //       'line-color':'#cdff61',
      //       'line-dasharray': [5, 1],
      //     }
      //
      //   })
      // }
      if(!this.map.getSource('station-info')){
        this.map.addSource('station-info', {
        'type': 'geojson',
        'data': this.waterStationData?this.waterStationData:geojson_point
      })}
      if(!this.map.getLayer('station-poi')){
        this.map.addLayer({
        'id': 'station-poi',
        'type': 'circle',
        'source': 'station-info',
        'maxzoom': 19,
        'paint': {
          'circle-radius': 12,
          'circle-color': [
            'match',
            ['get', 'water_category'],
            'Ⅰ',
            '#11D1E2',
            'Ⅱ',
            '#2ECC77',
            'Ⅲ',
            '#F0892E',
            'Ⅳ',
            '#DD4444',
            'Ⅴ',
            '#7D6025',
            '劣Ⅴ',
            '#3E364E',
            /* other */ '#9c9c9c'
          ],
          'circle-pitch-alignment': 'map',
          'circle-opacity': 1,
          'circle-stroke-width': 0.5,
          'circle-stroke-color': '#ccc',
          'circle-blur': 0.2,
        }
      })
      if(!this.map.getLayer('station-labels')) {
        this.map.addLayer({
          'id': 'station-labels',
          'type': 'symbol',
          'source': 'station-info',
          'layout': {
            'text-field': '{water_category}',
            'text-font': [
              'Open Sans Bold',
              'Arial Unicode MS Bold'
            ],
            'text-size': 12
          },
          'paint': {
            'text-color': 'rgb(255,255,255)'
          }
        });
      }
        this.map.on('click', 'station-poi', (e)=>{
          const feature = e.features[0];
          var time_list = [];
          var water_category = [];
          const client = new InfluxDB({url: 'http://58.23.17.121:8086', token: token})
          const queryApi = client.getQueryApi(org)
          const fluxQuery =
            `from(bucket:"test")
            |> range(start: -30d)
            |> filter(fn: (r) => r._measurement == "water-qual")
            |> filter(fn: (r) => r["StationName"] == "${feature.properties.station_name}")
            |> filter(fn: (r) => r["_field"] == "WaterCategory")
            |> aggregateWindow(every: 1d, fn:mean, createEmpty: false)`

          const popup = new mapboxgl.Popup({offset: [0, -15]})
            .setLngLat(feature.geometry.coordinates)
            .setHTML(
              '<h3>' +
              '监测站：' +
              feature.properties.station_name +
              '</h3>' +
              '<div id="chart" style="height: 300px; width: 800px"></div>'
            )
            .addTo(this.map)
            .setMaxWidth("1000px");
          var chartDom = document.getElementById('chart');
          var myChart = echarts.init(chartDom);
          var option;
          queryApi.queryRows(fluxQuery, {
            next(row, tableMeta) {
              const o = tableMeta.toObject(row)
              time_list.push(o._time.slice(5, 10))
              water_category.push(o._value)
              // console.log(
              //   `${o._time} ${o._measurement} in ${o.StationName} ${o._field}=${o._value}`
              // )
            },
            error(error) {
              console.error(error)
              console.log('Finished ERROR')
            },
            complete() {
              option = {
                tooltip: {
                  trigger: 'axis'
                },

                xAxis: {
                  type: 'category',
                  data: time_list
                },
                yAxis: {
                  type: 'value'
                },
                toolbox: {
                  right: 10,
                  feature: {
                    dataZoom: {
                      yAxisIndex: 'none'
                    },
                    restore: {},
                    saveAsImage: {}
                  }
                },
                dataZoom: [{
                  startValue: '05-30'
                }, {
                  type: 'inside'
                }],
                visualMap: {
                  top: 50,
                  right: 10,
                  pieces: [{
                    gt: 0,
                    lte: 1,
                    color: '#11D1E2'
                  }, {
                    gt: 1,
                    lte: 2,
                    color: '#2ECC77'
                  }, {
                    gt: 2,
                    lte: 3,
                    color: '#F0892E'
                  }, {
                    gt: 3,
                    lte: 4,
                    color: '#FF5A1F'
                  }, {
                    gt: 4,
                    lte: 5,
                    color: '#7D6025'
                  }, {
                    gt: 5,
                    lte: 6,
                    color: '#3E364E'
                  }],
                  outOfRange: {
                    color: '#999'
                  }
                },
                series: [{
                  data: water_category,
                  type: 'bar',
                  markBar: {
                    silent: true,
                    barStyle: {
                      color: '#333'
                    },
                    data: [{
                      yAxis: 1
                    }, {
                      yAxis: 2
                    }, {
                      yAxis: 3
                    }, {
                      yAxis: 4
                    }, {
                      yAxis: 5
                    }, {
                      yAxis: 6
                    }]
                  }
                }]
              };

              option && myChart.setOption(option);
            }
          })
        })
        this.map.on('mousemove', 'station-poi', (e)=>{
          this.map.getCanvas().style.cursor = 'pointer';

          const feature = e.features[0];

          const waterCategory = feature.properties.water_category;
          const waterStation = feature.properties.station_name;
          const province = feature.properties.province;
          const city = feature.properties.city_area;
          const time = feature.properties.monitoring_time;
          const address = feature.properties.address;
          const loc = feature.geometry.coordinates;
          document.getElementById('pro').textContent = province
          document.getElementById('city').textContent = city
          document.getElementById('name').textContent = waterStation
          document.getElementById('time').textContent = time
          document.getElementById('loc').textContent = address
          document.getElementById('level').textContent = waterCategory
        });
        this.map.on('mouseleave', 'station-poi', ()=>{
          document.getElementById('pro').textContent = "";
          document.getElementById('city').textContent = "";
          document.getElementById('name').textContent = "";
          document.getElementById('time').textContent = "";
          document.getElementById('loc').textContent = "";
          document.getElementById('level').textContent = "";
          this.map.getCanvas().style.cursor = '';
        });
      }
    },
    getWaterQuality(){
      axios.post('/users/getWaterStationData', {}).then(res=>{
        if(res.data.status){
          this.waterStationData = {'type':'FeatureCollection',features:res.data.data};
          this.map.getSource('station-info').setData(this.waterStationData)
        }
      })
    },
    // getStaticData(){
    //   axios.get(`/users/static/street_boundary/${this.city}.json`, {}).then(res=>{
    //       this.boundaryData = res.data.data;
    //   })
    // },
    coordinatesGeocoder(query) {
      var hoveredStateId = null
      const city_matches = query.match(
        /[\u2E80-\u2EFF\u2F00-\u2FDF\u3000-\u303F\u31C0-\u31EF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FBF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]+/g
      )
      if (!city_matches) {
        return null;
      }
      if(!this.map.getSource('city-boundary')){
        this.map.addSource('city-boundary', {
          'type': 'geojson',
          'data': `/users/static/street_boundary/${city_matches}.json`,
          'generateId': true,
        })
      }
      this.map.getSource('city-boundary').setData(`/users/static/street_boundary/${city_matches}.json`)
      if(!this.map.getLayer('state-fills')) {
        this.map.addLayer({
          'id': 'state-fills',
          'type': 'fill',
          'source': 'city-boundary',
          'layout': {},
          'paint': {
            'fill-color': '#00c6ff',
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.5,
              0.1
            ]
          }
        }, 'station-poi');
      }
      if(!this.map.getLayer('boundary')) {
        this.map.addLayer({
          'id':'boundary',
          'type':"line",
          'source': 'city-boundary',
          'layout':{
            'line-join':'bevel',
            'line-cap':'butt',
          },
          'paint': {
            'line-width':2,
            'line-color':'#00c6ff',
            'line-dasharray': [5, 1],
          }

        }, 'station-poi')
      }
      this.map.on('mousemove', 'state-fills', (e)=>{
        if (e.features.length > 0) {
          if (hoveredStateId !== null) {
            this.map.setFeatureState(
              { source: 'city-boundary', id: hoveredStateId },
              { hover: false }
            );
          }
          hoveredStateId = e.features[0].id;
          this.map.setFeatureState(
            { source: 'city-boundary', id: hoveredStateId },
            { hover: true }
          );
        }
        const feature = e.features[0];

        document.getElementById('street').textContent = feature.properties.Name;
      });

      this.map.on('mouseleave', 'state-fills', ()=>{
        if (hoveredStateId !== null) {
          this.map.setFeatureState(
            { source: 'city-boundary', id: hoveredStateId },
            { hover: false }
          );
        }
        hoveredStateId = null;
        document.getElementById('street').textContent = '';
      });
      const matches = query.match(
        /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
      );
      if (!matches) {
        return null;
      }

      function coordinateFeature(lng, lat) {
        return {
          center: [lng, lat],
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          place_name: 'Lat: ' + lat + ' Lng: ' + lng,
          place_type: ['coordinate'],
          properties: {},
          type: 'Feature'
        };
      }

      const coord1 = Number(matches[1]);
      const coord2 = Number(matches[2]);
      const geocodes = [];

      if (coord1 < -90 || coord1 > 90) {

        geocodes.push(coordinateFeature(coord1, coord2));
      }

      if (coord2 < -90 || coord2 > 90) {

        geocodes.push(coordinateFeature(coord2, coord1));
      }

      if (geocodes.length === 0) {

        geocodes.push(coordinateFeature(coord1, coord2));
        geocodes.push(coordinateFeature(coord2, coord1));
      }

      return geocodes;
    },
  },
}
</script>

<style lang="css">
#map{
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
.stationInfo {
  /*z-index: 1;*/
  text-align: left;
  position: absolute;
  font-family: sans-serif;
  margin-top: 1px;
  margin-left: 1px;
  padding: 5px;
  width: 15%;
  border: 2px solid #525252;
  font-size: 5px;
  color: #000000;
  background-color: #ffffff;
  border-radius: 3px;
}
.SN {
  position: absolute;
  background-color: black;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  font-family: sans-serif;
  margin: auto;
  font-size: 30px;
  color: #ffffff;
}
.streetName {
  /*z-index: 1;*/
  position: relative;
}
.legendItem{
  display: flex;
  display: -webkit-flex;
  align-items: center;
  margin-right: 10px;
  color: white;
  /*border: 1px solid;*/
}
.colorItem{
  /*z-index: 1;*/
  /*position: absolute;*/
  width: 30px;
  height: 15px;
  border-radius: 5px;
  margin-left: 15px;
  margin-right: 3px;
}
.color{
  position: absolute;
  left: 0;
  bottom: 30px;
  z-index: 1;
}
</style>

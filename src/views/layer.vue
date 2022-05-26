<template>
    <div class="wrap">
        <div class="ol-map" ref="olMap"></div>
        <div class="layer">
            <RadioGroup v-model="layerName" type="button" button-style="solid" @on-change="handleLayer">
                <Radio label="osm">OSM</Radio>
                <Radio label="ship">海图</Radio>
                <Radio label="gdtc">地图</Radio>
                <Radio label="gwxc">卫星</Radio>
                <!-- <Radio label="vec">天地图底图</Radio>
                <Radio label="cva">天地图标注</Radio>
                <Radio label="img">天地图卫星</Radio> -->
                <Radio label="geoq">暗色</Radio>
                <Radio label="autonavi">高德</Radio>
                <!-- <Radio label="autonavi2">高德</Radio> -->
            </RadioGroup>
        </div>
        <!-- <div class="weather">
            <RadioGroup v-model="weatherName" type="button" button-style="solid" @on-change="handleWeather">
                <Radio label="waves">海浪</Radio>
                <Radio label="temperature">气温</Radio>
                <Radio label="pressure">气压</Radio>
            </RadioGroup>
        </div> -->
    </div>
</template>
<script>
import {RadioGroup, Radio} from 'view-design';
import 'ol/ol.css';
import Map from 'ol/Map'
import View from 'ol/View'
import { Tile as TileLayer } from 'ol/layer'
import {XYZ, OSM} from 'ol/source'
import { fromLonLat } from 'ol/proj' // fromLonLat方法能将坐标从经度/纬度转换为其他投影
import {createXYZ} from 'ol/tilegrid';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
// 定义海图坐标
proj4.defs(
  'EPSG:3395',
  '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs '
);
register(proj4);

export default {
    name: 'layer',
    components: {RadioGroup, Radio},
    data () {
        return {
            map: null,
            tileLayer: {},
            layerName: 'osm',
            weatherLayer: {},
            weatherName: ''
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.tileLayer['osm'] = new TileLayer({
                source: new OSM(),
                visible:true
            }),
            this.tileLayer['ship'] = new TileLayer({
                source: new XYZ({
                    url: 'http://m12.shipxy.com/tile.c?l=Na&m=o&x={x}&y={y}&z={z}',
                    projection: 'EPSG:3395',
                    tileGrid: new createXYZ({
                        extent: [
                            -20037508.342789244,
                            -20037508.342789244,
                            20037508.342789244,
                            20037508.342789244
                        ]
                    })
                }),
                visible:false
            })
            this.tileLayer['gdtc'] = new TileLayer({
                source: new XYZ({
                    url: 'https://gdtc.shipxy.com/tile.g?l=en&m=d&z={z}&x={x}&y={y}'
                }),
                visible:false
            })
            this.tileLayer['gwxc'] = new TileLayer({
                source: new XYZ({
                    url: 'http://gwxc.shipxy.com/tile.g?z={z}&x={x}&y={y}'
                }),
                visible:false
            })
            this.tileLayer['vec'] = new TileLayer({
                source: new XYZ({
                    url: 'http://t{1-4}.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=316cf152e80bd8a121b23746a5803c8b',
                }),
                visible:false
            })
            this.tileLayer['cva'] = new TileLayer({
                source: new XYZ({
                    url: 'http://t{1-4}.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=316cf152e80bd8a121b23746a5803c8b',
                }),
                visible:false
            })
            this.tileLayer['img'] = new TileLayer({
                source: new XYZ({
                    url: 'http://t{1-4}.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=316cf152e80bd8a121b23746a5803c8b',
                }),
                visible:false
            })
            this.tileLayer['geoq'] = new TileLayer({
                source: new XYZ({
                    url: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
                }),
                visible:false
            })
            this.tileLayer['autonavi'] = new TileLayer({
                source: new XYZ({
                    url: 'https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
                }),
                visible:false
            })
            this.tileLayer['autonavi2'] = new TileLayer({
                source: new XYZ({
                    url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7',
                }),
                visible:false
            })

            // ShipxyOptions.weather.weatherDataUrl = "https://qx.shipxy.com/oceanweather/v1/grid?type={type}&time={time}&forecasttime={forecasttime}&level=5&enc=1&source=1";
            // ShipxyOptions.weather.weatherTileUrl = 'https://qx.shipxy.com/oceanweather/v1/tile?type={type}&time={time}&forecasttime={forecasttime}&level={zl}&source=1&x={x}&y={y}&z={z}';
            let time = '2022-05-21%2008:00:00'; // 预报时间，前一天的20点整
            let forecasttime = '2022-05-23%2008:00:00'; // 预测未来5天，每天2、8、14、20点整
            this.weatherLayer['waves'] = new TileLayer({
                source: new XYZ({
                    tileUrlFunction: function(zxy) {
                        const [z, x, y] = zxy;
                        let type = 14;
                        let level = z > 6 ? 6 : z; // 最多6级
                        return `https://qx.shipxy.com/oceanweather/v1/tile?type=${type}&time=${time}&forecasttime=${forecasttime}&level=${level}&source=1&x=${x}&y=${y}&z=${z}`;
                    }
                }),
                visible:false
            })
            this.weatherLayer['temperature'] = new TileLayer({
                source: new XYZ({
                    tileUrlFunction: function(zxy) {
                        const [z, x, y] = zxy;
                        let type = 12;
                        let level = z > 7 ? 7 : z; // 最多7级
                        return `https://qx.shipxy.com/oceanweather/v1/tile?type=${type}&time=${time}&forecasttime=${forecasttime}&level=${level}&source=1&x=${x}&y=${y}&z=${z}`;
                    }
                }),
                visible:false
            })
            this.weatherLayer['pressure'] = new TileLayer({
                source: new XYZ({
                    tileUrlFunction: function(zxy) {
                        const [z, x, y] = zxy;
                        let type = 11;
                        let level = z > 6 ? 6 : z; // 最多6级
                        return `https://qx.shipxy.com/oceanweather/v1/tile?type=${type}&time=${time}&forecasttime=${forecasttime}&level=${level}&source=1&x=${x}&y=${y}&z=${z}`;
                    }
                }),
                visible:false
            })
            
            this.map = new Map({
                layers: [
                    this.tileLayer['osm'],
                    this.tileLayer['ship'],
                    this.tileLayer['gdtc'],
                    this.tileLayer['gwxc'],
                    this.tileLayer['vec'],
                    this.tileLayer['cva'],
                    this.tileLayer['img'],
                    this.tileLayer['geoq'],
                    this.tileLayer['autonavi'],
                    this.tileLayer['autonavi2'],
                    this.weatherLayer['waves'],
                    this.weatherLayer['temperature'],
                    this.weatherLayer['pressure'],
                ],
                target: this.$refs.olMap,
                view: new View({
                    center: fromLonLat([118.5, 24.2]),
                    zoom: 8,
                    multiWorld: true,
                    projection: 'EPSG:3857'
                })
            });
        },
        handleLayer() {
            Object.keys(this.tileLayer).map((item) => {
                this.tileLayer[item].setVisible(false);
            });
            this.tileLayer[this.layerName].setVisible(true);
        },
        handleWeather() {
            let view = this.map.getView(); // 地图
            if (view.getZoom() > 3) {
                view.animate({zoom: 3});
            }
            Object.keys(this.weatherLayer).map((item) => {
                this.weatherLayer[item].setVisible(false);
            });
            this.weatherLayer[this.weatherName].setVisible(true);
        }
    }
}
</script>
<style scoped>
.wrap{
    position: relative;
}
.ol-map {
    width: 100%;
    height:700px;
}
.layer{
    position: absolute;
    right:8px;
    bottom:8px;
}
.weather{
    position: absolute;
    right:8px;
    bottom:58px;
}
</style>

<template>
    <div id="map" class="map"></div>
</template>
<script>
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {XYZ} from 'ol/source';
import {Tile as TileLayer} from 'ol/layer';
import {fromLonLat} from 'ol/proj';
import { defaults, FullScreen, ScaleLine, ZoomSlider, Zoom, OverviewMap, MousePosition, ZoomToExtent } from 'ol/control'
export default {
    name: 'control',
    data () {
        return {
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            const tileLayer = new TileLayer({
                name: "seamap",
                source: new XYZ({
                    url: 'http://m12.shipxy.com/tile.c?l=Na&m=o&x={x}&y={y}&z={z}'
                }),
                visible:true
            });

            const tileLayer2 = new TileLayer({
                source: new XYZ({
                    url: 'http://m12.shipxy.com/tile.c?l=Na&m=o&x={x}&y={y}&z={z}'
                })
            })
    
            const map = new Map({
                layers: [tileLayer],
                target: 'map',
                view: new View({
                    center: fromLonLat([118.5, 24.2]),
                    zoom: 10,
                    projection: 'EPSG:3857' // 默认EPSG:3857，等同于900913，由墨卡托投影而来，EPSG:4326，等同于WGS84坐标系。
                }),
                controls: defaults({attribution: false}).extend([
                    new FullScreen(), // 全屏
                    new ScaleLine(), // 显示比例尺
                    new Zoom(), // 缩放按钮
                    new ZoomSlider(), // 缩放滚动条
                    new MousePosition(), // 鼠标位置
                    new OverviewMap({layers: [tileLayer2], collapseLabel: '\u00BB',  label: '\u00AB'}), // 鸟瞰图
                    new ZoomToExtent() // 放大到设定区域
                ])
            });
            console.log(map);
        }
    }
}
</script>
<style>
.map {
    width: 100%;
    height:700px;
}
.map .ol-overviewmap{
    left: auto;
    right:.5em;
    bottom: .5em;
}
.map .ol-rotate{
    top: 50%;
}
.map:hover .ol-mouse-position{
    background: rgba(0,60,136,0.3);
    border-radius: 4px;
    top:auto;
    right:auto;
    bottom: 8px;
    width:250px;
    left: 50%;
    transform: translateX(-50%);
    position: absolute;
    color:#fff;
    font-size: 12px;
    text-align: center;
}
</style>

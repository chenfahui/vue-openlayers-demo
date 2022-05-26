<template>
    <div id="map" class="map"></div>
</template>
<script>
import 'ol/ol.css';
import Map from 'ol/Map'
import View from 'ol/View'
import { Tile as TileLayer } from 'ol/layer'
import {XYZ} from 'ol/source'
import { fromLonLat } from 'ol/proj'
import Feature from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Style, Fill, Stroke, RegularShape} from 'ol/style';
import Point from 'ol/geom/Point';
import Select from 'ol/interaction/Select';
import {DragRotateAndZoom,  DoubleClickZoom,  DragPan,  PinchRotate,  PinchZoom,  KeyboardPan,  KeyboardZoom,  defaults as defaultInteractions,} from 'ol/interaction';
export default {
    name: 'interactions',
    components: {},
    data () {
        return {
            map: null,
            vectorLayer: null, // 船舶图层
            vectorSource: null, // 数据源
            originalFeatures: [], // 初始船舶
            lightFeature: null // 高亮船舶
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        /**
         * 船舶三角形样式
         */
        shapeStyle (feature) {
            let cog = feature.getProperties().cog;
            console.log('shape', cog);
            return new Style({
            image: new RegularShape({
                fill: new Fill({color: '#00cd00'}),
                stroke: new Stroke({color: 'black', width: 0.5}),
                points: 3,
                radius: 20,
                rotation: cog,
                angle: 0,
                scale: [0.5, 1]
            })
            });
        },
        /**
         * 船舶圆点样式
         */
        circleStyle (feature) {
            let cog = feature.getProperties().cog;
            console.log('circle', cog);
            return new Style({
            image: new RegularShape({
                fill: new Fill({ color: '#00cd00' }),
                points: 12,
                radius: 3,
                radius2: 4
            })
            });
        },
        /**
         * 选中框样式
         */
        selectedStyle () {
            const radius = 30;
            const longRadius = radius * Math.SQRT2;
            return [
            new Style({
                image: new RegularShape({
                stroke: new Stroke({
                    color: '#f00',
                    width: 2,
                    // 实虚比例，这里使用3:4:3:0比例，显示效果为  3实线 4透明  3实线  0透明，依次循环，形成一个选中框样式
                    lineDash: [longRadius * 3 / 10, longRadius * 4 / 10, longRadius * 3 / 10, 0]
                }),
                radius: radius,
                points: 4,
                // openlayers中，多边形默认角朝上，所以需要将图形翻转45度
                rotation: Math.PI / (180 / 45)
                })
            })
            ];
        },
        init() {
            const tileLayer = new TileLayer({
                name: "seamap",
                source: new XYZ({
                    url: 'http://m12.shipxy.com/tile.c?l=Na&m=o&x={x}&y={y}&z={z}'
                }),
                visible:true
            });
    
            this.map = new Map({
                layers: [tileLayer],
                target: 'map',
                view: new View({
                    center: fromLonLat([118.5, 24.2]),
                    zoom: 10,
                    multiWorld: true,
                }),
                // 注意：需要设置tabindex，才能使div获得键盘事件
                interactions: defaultInteractions().extend([
                    new DragRotateAndZoom(), // 按住shift键，用鼠标左键拖动地图，就能让地图旋转
                    new DoubleClickZoom(), // 鼠标左键双击地图，就可以放大地图
                    new DragPan(), // 鼠标左键，拖拽地图，就可以平移地图
                    new PinchRotate(), // 触摸屏上，用两个手指在触摸屏上旋转
                    new PinchZoom(), // 触摸屏上缩放，就可以缩放地图
                    new KeyboardPan(), // 键盘上的上下左右键，就可以平移地图
                    new KeyboardZoom() // 键盘上的+/-键，就可以缩放地图
                ])
            });
            this.handleClickInit();
            this.handleBoatInit();

        },
        // 渲染船舶
        handleBoatInit() {
            if (!this.vectorLayer) {
                this.vectorLayer = new VectorLayer({zIndex: 99});
                this.map.addLayer(this.vectorLayer);
                this.map.getView().on('change:resolution', (evt) => {
                    if (!this.vectorSource) {
                        return;
                    }
                    if (evt.target.getZoom() > 12) {
                        console.log(1);
                        this.vectorLayer.setStyle(this.shapeStyle);
                    } else {
                        console.log(2);
                        this.vectorLayer.setStyle(this.circleStyle);
                    }
                });
            } else {
                this.map.removeLayer(this.vectorLayer);
                this.vectorLayer = new VectorLayer({zIndex: 99});
                this.map.addLayer(this.vectorLayer);
            }
            this.vectorLayer.setStyle(this.circleStyle);
            
            const coordinates = [
                { mmsi: "001", lng: 118.5, lat: 24.2, cog: 180 }
            ];
            coordinates.forEach(item => {
                if (item.lng && item.lat && item.lng !== 'undefined' && item.lat !== 'undefined') {
                    let featureItem = new Feature({
                        geometry: new Point(fromLonLat([item.lng, item.lat])), // 点
                        coodinate: fromLonLat([item.lng, item.lat]), // 坐标
                        cog: item.cog,
                        mmsi: item.mmsi // mmsi
                    });
                    featureItem.setId(item.mmsi);
                    this.originalFeatures.push(featureItem);
                }
            });
            this.vectorSource = new VectorSource({
                features: this.originalFeatures
            });

            this.vectorLayer.setSource(this.vectorSource);
        },
        // 事物点击事件
        handleClickInit () {
            this.selectClick = new Select();
            this.selectClick.on('select', (e) => {
                if (e.selected.length > 0) {
                    let feature = e.selected[0];
                    this.handleShipLight(feature);
                }
            });
            this.map.addInteraction(this.selectClick);
        },
        // 船舶选中高亮
        handleShipLight (feature) {
            let coodinate = feature.getGeometry().getFirstCoordinate();
            let view = this.map.getView(); // 地图
            view.animate({center: coodinate, zoom: 15});
            feature.setStyle(this.selectedStyle().concat(this.shapeStyle(feature)));
        },
        // 船舶取消选择
        handleDeselect () {
            // 自动选中船舶
            if (this.lightFeature) {
                this.lightFeature.setStyle(null);
            }
            // 手动选中船舶
            if (!this.selectClick) return;
            let features = this.selectClick.getFeatures();
            if (!features) return;
            features && features.clear();
        },
        /**
         * 选中船舶
         */
        handleSelectShip (mmsi) {
            // 取消已选择的船舶
            this.handleDeselect();
            // 查找地图上的船舶
            let feature = this.vectorSource.getFeatureById(mmsi);
            if (feature) {
                this.lightFeature = feature;
                this.handleShipLight(feature);
            }
        }
    }
}
</script>
<style scoped>
.map {
    width: 100%;
    height:700px;
}
</style>

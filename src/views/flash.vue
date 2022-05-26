<template>
    <div id="map" class="map"></div>
</template>
<script>
import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import View from 'ol/View';
import {Circle as CircleStyle, Stroke, Style, Fill, RegularShape} from 'ol/style';
import {XYZ, Vector as VectorSource} from 'ol/source';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {easeOut} from 'ol/easing';
import {fromLonLat} from 'ol/proj';
import {getVectorContext} from 'ol/render';
import {unByKey} from 'ol/Observable';
/**
 * 船舶三角形样式
 */
const shapeStyle = new RegularShape({
    fill: new Fill({color: '#00cd00'}),
    stroke: new Stroke({color: 'black', width: 0.5}),
    points: 3,
    radius: 20,
    angle: 0,
    scale: [0.5, 1]
});

export default {
    name: 'flash',
    components: {},
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
    
            const source = new VectorSource({
                wrapX: false, // 地图缩小后，在一个页面只出现地图
            });
            const vector = new VectorLayer({
                source: source,
            });
    
            const map = new Map({
                layers: [tileLayer, vector],
                target: 'map',
                view: new View({
                    center: fromLonLat([118.5, 24.2]),
                    zoom: 10,
                    multiWorld: true,
                }),
            });
    
            function addRandomFeature() {
                const lon = 118 + Math.random();
                const lat = 23.7 + Math.random();
                const geom = new Point(fromLonLat([lon, lat]));
                let feature = new Feature(geom);
                feature.setStyle([
                    new Style({
                        image: shapeStyle
                    })
                ]);
                source.addFeature(feature);
            }
    
            const duration = 3000;
            function flash(feature) {
                const start = Date.now();
                const flashGeom = feature.getGeometry().clone();
                const listenerKey = tileLayer.on('postrender', animate);
        
                function animate(event) {
                    const frameState = event.frameState;
                    const elapsed = frameState.time - start;
                    if (elapsed >= duration) {
                        unByKey(listenerKey);
                        return;
                    }
                    const vectorContext = getVectorContext(event);
                    const elapsedRatio = elapsed / duration;
                    // 500毫秒开始，3000毫秒结束
                    const radius = easeOut(elapsedRatio) * 25 + 5;
                    const opacity = easeOut(1 - elapsedRatio);
        
                    const style = new Style({
                        image: new CircleStyle({
                            radius: radius,
                            stroke: new Stroke({
                                color: 'rgba(255, 0, 0, ' + opacity + ')',
                                width: 0.25 + opacity,
                            })
                        })
                    });
        
                    vectorContext.setStyle(style);
                    vectorContext.drawGeometry(flashGeom);
                    map.render();
                }
            }
    
            source.on('addfeature', function (e) {
                flash(e.feature);
            });
    
            window.setInterval(addRandomFeature, 1000);
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

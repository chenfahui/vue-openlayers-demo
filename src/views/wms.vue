<template>
    <div class="ol-map" ref="olMap"></div>
</template>
<script>
import 'ol/ol.css';
import Map from 'ol/Map'
import View from 'ol/View'
import { Tile as TileLayer } from 'ol/layer'
import { TileWMS } from 'ol/source'
import {OSM} from 'ol/source'
import { fromLonLat } from 'ol/proj' // fromLonLat方法能将坐标从经度/纬度转换为其他投影
export default {
    name: 'wms',
    components: {},
    data () {
        return {
            map: null,
            geoNames: [],
            geoLayers: null
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            const tileLayer = new TileLayer({
                source: new OSM()
            })
            this.map = new Map({
                layers: [tileLayer],
                target: this.$refs.olMap,
                view: new View({
                    center: fromLonLat([118.5, 24.2]),
                    zoom: 10,
                    multiWorld: true,
                })
            });
            this.showGeoLayer('v_map_ais', true);
        },
        /**
         * 展示GeoServer图层
         * @param {String} name 图层名称
         * @param {Boolean} visible 是否显示
         * @param {Number} zIndex 图层层级
         */
        showGeoLayer(name, visible, zIndex = 1) {
            // 先移除相同的name，防止重复
            for (let i = 0; i < this.geoNames.length; i++) {
                this.geoNames[i] === name && this.geoNames.splice(i, 1);
            }
            visible && this.geoNames.push(name);
            if (!this.geoNames || !this.geoNames.length) {
                // 清空GeoServer
                this.map.removeLayer(this.geoLayers);
                this.geoLayers = null;
                return;
            }
            let source = this.handleGeoSource(this.geoNames);
            if (this.geoLayers) {
                this.geoLayers.setSource(source);
                return;
            }
            this.geoLayers = new TileLayer({
                source,
                zIndex
            });
            this.map.addLayer(this.geoLayers, zIndex);
        },
        /**
         * GeoServer图层source
         * @param {Array} geoNames
         */
        handleGeoSource(geoNames) {
            return new TileWMS({
                ratio: 1,
                url: "http://218.5.222.103:8060/geoserver/chanpin/wms",
                params: {
                    FORMAT: "image/png",
                    VERSION: "1.1.1",
                    STYLES: "",
                    LAYERS: "chanpin:" + geoNames.join(","),
                    exceptions: "application/vnd.ogc.se_inimage"
                }
            });
        }
    }
}
</script>
<style scoped>
.ol-map {
    width: 100%;
    height:700px;
}
</style>

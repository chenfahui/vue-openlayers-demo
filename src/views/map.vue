<template>
    <div class="ol-map" ref="olMap"></div>
</template>
<script>
import 'ol/ol.css';
import Map from 'ol/Map'
import View from 'ol/View'
import { Tile as TileLayer } from 'ol/layer'
import {OSM} from 'ol/source'
import { fromLonLat } from 'ol/proj' // fromLonLat方法能将坐标从经度/纬度转换为其他投影
export default {
    name: 'map',
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
                source: new OSM()
            })
            const map = new Map({
                layers: [tileLayer],
                target: this.$refs.olMap,
                view: new View({
                    center: fromLonLat([118.5, 24.2]),
                    zoom: 10,
                    multiWorld: true,
                })
            });
            console.log(map);
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

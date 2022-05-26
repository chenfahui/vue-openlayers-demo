<template>
    <div class="ol-map" ref="olMap"></div>
</template>
<script>
import 'ol/ol.css';
import Map from 'ol/Map'
import View from 'ol/View'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import {OSM, Vector as VectorSource} from 'ol/source'
import {Circle as CircleStyle, Fill, Stroke, Style, RegularShape} from 'ol/style';
import { GeoJSON } from 'ol/format'
import geojsonData from './geojsonData.json'

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

const styles = {
  'Point': new Style({
    image: shapeStyle
  }),
  'LineString': new Style({
    stroke: new Stroke({
      color: 'green',
      width: 1,
    }),
  }),
  'MultiLineString': new Style({
    stroke: new Stroke({
      color: 'green',
      width: 1,
    }),
  }),
  'MultiPoint': new Style({
    image: shapeStyle,
  }),
  'MultiPolygon': new Style({
    stroke: new Stroke({
      color: 'yellow',
      width: 1,
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 0, 0.1)',
    }),
  }),
  'Polygon': new Style({
    stroke: new Stroke({
      color: 'rgba(6, 168, 249, 1)',
      lineDash: [4],
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(6, 168, 249, 0.2)',
    }),
  }),
  'GeometryCollection': new Style({
    stroke: new Stroke({
      color: 'magenta',
      width: 2,
    }),
    fill: new Fill({
      color: 'magenta',
    }),
    image: new CircleStyle({
      radius: 10,
      fill: null,
      stroke: new Stroke({
        color: 'magenta',
      }),
    }),
  }),
  'Circle': new Style({
    stroke: new Stroke({
      color: 'red',
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(255,0,0,0.2)',
    }),
  }),
};
export default {
    name: 'geojson',
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
            const styleFunction = function (feature) {
                return styles[feature.getGeometry().getType()];
            };
            const vectorSource = new VectorSource({
                features: new GeoJSON().readFeatures(geojsonData),
            })
            const vectorLayer = new VectorLayer({
                source: vectorSource,
                style: styleFunction
            })
            const map = new Map({
                layers: [tileLayer, vectorLayer],
                target: this.$refs.olMap,
                view: new View({
                    center: [118.5, 24.5],
                    zoom: 8,
                    projection: 'EPSG:4326'
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

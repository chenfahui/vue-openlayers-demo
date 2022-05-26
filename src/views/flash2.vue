<template>
    <div class="ol-map" ref="olMap"></div>
</template>
<script>
import "ol/ol.css";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { Map, View, Feature } from "ol";
import { Style, Circle, Stroke, Fill, RegularShape } from "ol/style";
import { Point } from "ol/geom";
import { defaults as defaultControls } from "ol/control";
import { fromLonLat } from "ol/proj";
import { getVectorContext } from "ol/render";

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
  data() {
    return {
      map: null,
      radius: 0,
    };
  },
  mounted() {
    this.initMap();
    const coordinates = [
      { lon: "118.5", lat: "24.2" },
      { lon: "118.3", lat: "24.3" },
    ];
    this.addDynamicPoints(coordinates);
  },
  methods: {
    /**
     * 初始化地图
     */
    initMap() {
        this.map = new Map({
            target: this.$refs.olMap,
            controls: defaultControls({
                zoom: true,
            }).extend([]),
            layers: [
            new TileLayer({
                source: new XYZ({
                    url: 'http://m12.shipxy.com/tile.c?l=Na&m=o&x={x}&y={y}&z={z}'
                }),
            }),
            ],
            view: new View({
                center: fromLonLat([118.5, 24.2]),
                zoom: 10,
            })
        });
    },
    /**
     * 批量添加闪烁点
     */
    addDynamicPoints(coordinates) {
      // 设置图层
      let pointLayer = new VectorLayer({ source: new VectorSource() });
      // 添加图层
      this.map.addLayer(pointLayer);
      // 循环添加feature
      let pointFeature = [];
      for (let i = 0; i < coordinates.length; i++) {
        // 创建feature，一个feature就是一个点坐标信息
        const feature = new Feature({
          geometry: new Point(fromLonLat([coordinates[i].lon, coordinates[i].lat])),
        });
        feature.setStyle([
            new Style({
                image: shapeStyle
            })
        ]);
        pointFeature.push(feature);
      }
      //把要素集合添加到图层
      pointLayer.getSource().addFeatures(pointFeature);
      // 关键的地方在此：监听postrender事件，在里面重新设置circle的样式
      let radius = 0;
      pointLayer.on("postrender", (evt) => {
        if (radius >= 30) radius = 0;
        var opacity = (30 - radius) * (1 / 30); //不透明度
        var pointStyle = new Style({
          image: new Circle({
            radius: radius,
            stroke: new Stroke({
              color: "rgba(255,0,0" + opacity + ")",
              width: 3 - radius / 10, //设置宽度
            }),
          }),
        });
        // 获取矢量要素上下文
        let vectorContext = getVectorContext(evt);
        vectorContext.setStyle(pointStyle);
        pointFeature.forEach((feature) => {
          vectorContext.drawGeometry(feature.getGeometry());
        });
        radius = radius + 0.3; //调整闪烁速度
        //请求地图渲染（在下一个动画帧处）
        this.map.render();
      });
    }
  }
};
</script>
<style scoped>
.ol-map {
    width: 100%;
    height:700px;
}
</style>
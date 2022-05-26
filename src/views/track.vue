<template>
    <div class="wrap">
        <div id="map" class="map"></div>
        <div class="control">
            <Button @click="handleTempStop" icon="ios-pause" v-if="ispuse === 0">暂停</Button>
            <Button @click="handleStart" icon="ios-play" v-else>开始</Button>
            <Button @click="handleStop" icon="ios-square">停止</Button>
            <Button @click="handlePrev" icon="ios-skip-backward" v-if="ispuse === 1">后退</Button>
            <Button @click="handleNext" icon="ios-skip-forward" v-if="ispuse === 1">前进</Button>
            <Button @click="handleRatioDown" icon="ios-rewind" v-if="ispuse === 0">减速</Button>
            <Button @click="handleRatioUp" icon="ios-fastforward" v-if="ispuse === 0">加速</Button>
            <span v-if="ispuse === 0">{{ratio}}</span>
            <Slider v-model="index" :max="newPoints.length - 1" :min="1" :step="1" @on-change="handleSlider"></Slider>
        </div>
    </div>
</template>
<script>
import {Button, Slider} from 'view-design';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Stroke, Style, Fill, RegularShape} from 'ol/style';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {LineString, Point} from 'ol/geom';
import {fromLonLat} from 'ol/proj';
export default {
    name: 'trackPlay',
    components: {Button, Slider},
    data () {
        return {
            map: null,
            points: [
                [
                    117.97119140625,
                    24.404636766948936
                ],
                [
                    117.9825210571289,
                    24.40807583649702
                ],
                [
                    117.99144744873048,
                    24.40995165313384
                ],
                [
                    118.00174713134764,
                    24.414641072789095
                ],
                [
                    118.01239013671874,
                    24.417454640960422
                ],
                [
                    118.0206298828125,
                    24.41839248307936
                ],
                [
                    118.03367614746094,
                    24.419017707286763
                ],
                [
                    118.04397583007811,
                    24.41995553778991
                ],
                [
                    118.05564880371092,
                    24.42089336132329
                ],
                [
                    118.06938171386719,
                    24.42089336132329
                ],
                [
                    118.07933807373045,
                    24.42089336132329
                ],
                [
                    118.08654785156249,
                    24.42089336132329
                ],
                [
                    118.09375762939453,
                    24.42183117788674
                ],
                [
                    118.10165405273438,
                    24.42151857314004
                ],
                [
                    118.11264038085938,
                    24.420580754253262
                ],
                [
                    118.11813354492186,
                    24.420580754253262
                ],
                [
                    118.12671661376952,
                    24.420268146408795
                ],
                [
                    118.1363296508789,
                    24.418705095570264
                ],
                [
                    118.14971923828124,
                    24.41995553778991
                ],
                [
                    118.15589904785156,
                    24.423081589128852
                ],
                [
                    118.16036224365233,
                    24.424331987979105
                ],
                [
                    118.16654205322266,
                    24.42808311017408
                ],
                [
                    118.1744384765625,
                    24.433397009006253
                ],
                [
                    118.1802749633789,
                    24.43839812102505
                ],
                [
                    118.18885803222656,
                    24.443399034681697
                ],
                [
                    118.19572448730467,
                    24.445274326156515
                ],
                [
                    118.20293426513672,
                    24.44683704773938
                ],
                [
                    118.21014404296875,
                    24.44902482540301
                ],
                [
                    118.21563720703124,
                    24.450900033171497
                ],
                [
                    118.22284698486327,
                    24.454962887603713
                ],
                [
                    118.2290267944336,
                    24.460900669941633
                ],
                [
                    118.23246002197266,
                    24.46652567921784
                ],
                [
                    118.23795318603514,
                    24.471212995009626
                ],
                [
                    118.24275970458984,
                    24.47558766563027
                ],
                [
                    118.2455062866211,
                    24.478712337272928
                ]
            ],
            newPoints: [],
            //轨迹线
            lineLayer: null,
            speed: 200,
            //起点终点标记
            startMarker: null,
            endMarker: null,
            markerLayer: null,
            shipLayer: null,
            inter: null,
            ispuse: null,
            index: 0,
            date: null,
            tempDate: null,
            center: null,
            moveFeature: null,
            ratio: 4
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
            this.markerLayer = new VectorLayer({
                source: new VectorSource()
            });
            this.shipLayer = new VectorLayer({
                source: new VectorSource(),
                style: this.shapeStyle
            });
            this.lineLayer = new VectorLayer({
                source: new VectorSource(),
                style: new Style({
                    fill: new Fill({
                        color: 'rgba(255, 0, 0, 0.5)'
                    }),
                    stroke: new Stroke({
                        color: 'red',
                        width: 3
                    })
                })
            });
    
            this.map = new Map({
                layers: [
                    tileLayer,
                    this.lineLayer,
                    this.markerLayer,
                    this.shipLayer
                ],
                target: 'map',
                view: new View({
                    center: fromLonLat([118.1, 24.4]),
                    zoom: 12,
                    projection: 'EPSG:3857'
                })
            });
            this.DealPoints();
            this.AddLineString();
        },
        /**
         * 船舶三角形样式
         */
        shapeStyle () {
            return new Style({
                image: new RegularShape({
                    fill: new Fill({color: '#00cd00'}),
                    stroke: new Stroke({color: 'black', width: 0.5}),
                    points: 3,
                    radius: 20,
                    rotation: 45,
                    scale: [0.5, 1]
                })
            });
        },
        AddLineString() {
            this.lineLayer.getSource().clear();
    
            let line = new LineString(this.newPoints);
    
            let feature = new Feature({
                geometry: line
            });
    
            this.lineLayer.getSource().addFeature(feature);
    
            this.SetMoveMark();
        },
        SetMoveMark() {
            this.startMarker = new Feature({
                geometry: new Point(this.newPoints[0])
            });
            this.startMarker.setStyle(this.style)
    
            this.endMarker = new Feature({
                geometry: new Point(this.newPoints[this.newPoints.length - 1])
            });
            this.endMarker.setStyle(this.style);
    
            this.markerLayer.getSource().addFeatures([this.startMarker, this.endMarker]);

            this.handleMove();
        },
        handleMove() {
            //动画
            this.index = 0;
            this.center = fromLonLat([120.277, 36.330]);
            this.moveFeature = (event) => {
                this.shipLayer.getSource().clear();
                if (this.index >= this.newPoints.length) {
                    // console.log(new Date());
                    this.stopAnimation();
                    clearInterval(this.inter);
                    return;
                }
                let currentPoint = new Point(this.newPoints[this.index]);
                let feature = new Feature(currentPoint);
                this.shipLayer.getSource().addFeature(feature)
                let frameState = event.frameState; // 动画帧数
                if (this.ispuse == 0) {
                    console.log('this.speed', this.speed);
                    let t = frameState.time - this.date;
        
                    if (t / this.speed > this.index) {
                        this.index = this.index + 1;
                    }
                }
            };
        },
 
        startAnimation() {
            this.startMarker.setStyle(this.style);
            this.map.on('postrender', this.moveFeature); // 在地图帧被渲染后触发
            this.map.render();
        },
        stopAnimation() {
            this.index = 0;
            this.date = 0;
            this.tempDate = 0;
            this.ispuse = 1;
            this.shipLayer && this.shipLayer.getSource().clear();
            (this.startMarker.getGeometry()).setCoordinates(this.newPoints[0]);
            this.map.un('postrender', this.moveFeature);
        },
        startMove() {
            this.inter && clearInterval(this.inter);
            this.inter = setInterval(() => {
                this.map.render();
            }, this.speed);
        },
        handleTempStop() {
            this.map.render();
            this.inter && clearInterval(this.inter);
            this.tempDate = (new Date()).getTime();
            this.ispuse = 1;
        },
    
    
        handleStart() {
            console.log(new Date());
            if (this.date == undefined || this.date == 0) {
                this.date = (new Date()).getTime();
            }
            if (this.tempDate != undefined && this.tempDate != 0) {
                this.date = this.date + ((new Date()).getTime() - this.tempDate);
            }
            this.ispuse = 0;
            this.startAnimation();
            this.startMove();
        },
        handleStop() {
            this.stopAnimation();
            clearInterval(this.inter);
        },
        handleNext() {
            this.index = this.index + 1;
            this.date = this.date - this.speed;
            this.map.render();
        },
        handlePrev() {
            this.index = this.index - 1;
            this.date = this.date + this.speed;
            this.map.render();
        },
        handleSlider(index) {
            this.date = index * this.speed;
        },
        handleRatioDown() {
            if (this.ratio > 1) {
                this.ratio = this.ratio / 2;
            }
            this.handleTrackRatio(this.ratio);
        },
        handleRatioUp() {
            if (this.ratio < 32) {
                this.ratio = this.ratio * 2;
            }
            this.handleTrackRatio(this.ratio);
        },
        handleTrackRatio(ratio) {
            let speed = 1 / ratio * 800; // 自定义倍率
            if (speed > this.speed) { // 加速 走过的轨迹加上时间
                this.date = this.date + (this.index * this.speed);
            } else { // 减速 走过的轨迹减去时间
                this.date = this.date - (this.index * this.speed);
            }
            console.log('speed', this.speed, this.date);
            this.speed = speed;
            this.ispuse === 0 && this.startMove();
        },
 
        DealPoints() {
            for (let i = 0; i < this.points.length; i++) {
                let currLng = parseFloat(this.points[i][0]);
                let currLat = parseFloat(this.points[i][1]);
    
                this.newPoints.push(fromLonLat([currLng, currLat]));
    
                if ((i + 1) == this.points.length) {
                    return false;
                }
    
                let nextLng = parseFloat(this.points[i + 1][0]);
                let nextLat = parseFloat(this.points[i + 1][1]);
    
                let diffLng = nextLng - currLng;
                let diffLat = nextLat - currLat;
    
                let currParamsLng = 0
                let currParamsLat = 0
    
                currParamsLng = 0.0001
                currParamsLat = (diffLat / diffLng) * 0.0001;
    
                if (diffLng < diffLat) {
                    currParamsLng = (diffLng / diffLat) * 0.0001;
                    currParamsLat = 0.0001
                }
                if (currParamsLng < 0) {
                    currParamsLng = -currParamsLng;
                }
    
                if (diffLat > 0) {
                    if (currParamsLat < 0) {
                        currParamsLat = -currParamsLat;
                    }
                } else {
                    if (currParamsLat > 0) {
                        currParamsLat = -currParamsLat;
                    }
                }
    
                if (diffLng == 0) {
                    currParamsLng = 0;
                    currParamsLat = 0.0001;
                }
    
                if (diffLat == 0) {
                    currParamsLng = 0.0001;
                    currParamsLat = 0;
                }
    
                if (diffLng > 0) {
                    currLng = currLng + currParamsLng;
                    currLat = currLat + currParamsLat;
                    while (currLng < nextLng) {
    
                        this.newPoints.push(fromLonLat([currLng, currLat]));
    
                        currLng = currLng + currParamsLng;
                        currLat = currLat + currParamsLat;
                    }
                } else if (diffLng < 0) {
                    currLng = currLng - currParamsLng;
                    currLat = currLat + currParamsLat;
                    while (currLng > nextLng) {
    
                        this.newPoints.push(fromLonLat([currLng, currLat]));
                        currLng = currLng - currParamsLng;
                        currLat = currLat + currParamsLat;
                    }
                } else {
                    currLng = currLng + currParamsLng;
                    currLat = currLat + currParamsLat;
                    while (currLat < nextLat) {
    
                        this.newPoints.push(fromLonLat([currLng, currLat]));
                        currLng = currLng + currParamsLng;
                        currLat = currLat + currParamsLat;
                    }
                }
            }
    
        }
    }
}
</script>
<style>
.wrap{
    position: relative;
}
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
.control{
    position: absolute;
    left:8px;
    bottom: 8px;
    width: 500px;
    background: #fff;
    padding:10px;
}
.control button{
    margin-right:5px;        
}
</style>

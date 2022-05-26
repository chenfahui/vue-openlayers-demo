<template>
    <div style="padding:30px;">
        <Tabs v-model="current" @on-click="handleTab">
            <TabPane label="map" name="map"></TabPane>
            <TabPane label="control" name="control"></TabPane>
            <TabPane label="interactions" name="interactions"></TabPane>
            <TabPane label="layer" name="layer"></TabPane>
            <TabPane label="wms" name="wms"></TabPane>
            <TabPane label="geojson" name="geojson"></TabPane>
            <TabPane label="flash" name="flash"></TabPane>
            <TabPane label="flash2" name="flash2"></TabPane>
            <TabPane label="track" name="track"></TabPane>
        </Tabs>
        <keep-alive>
            <router-view></router-view>
        </keep-alive>
    </div>
</template>
<script>
import {Tabs, TabPane} from 'view-design';
export default {
    name: 'layout',
    components: {Tabs, TabPane},
    data () {
        return {
            current: this.$route.name
        }
    },
    methods: {
        handleTab (name) {
            if (name === this.$route.name) return;
            this.$router.push(name);
        }
    }
}
</script>

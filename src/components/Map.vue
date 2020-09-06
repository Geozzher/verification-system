<template>
  <div id="root">
    <div ref="map" class="map">
      <QueryBuilding @mapboxExpression="getExpression" />
    </div>
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";

import QueryBuilding from "./QueryBuilding";

export default {
  components: { QueryBuilding },
  data() {
    return {
      map: null,
      style: {},
      positionLocation: [114.3, 30.6],
      // mapboxExpression: [],
      newStyle: {},
    };
  },
  //配置对象，与vue一致，但是在模板里data只能写函数形式
  mounted() {
    this.init();
  },

  computed: {},
  methods: {
    init() {
      mapboxgl.accessToken =
        "pk.eyJ1IjoiaHQxMjM0IiwiYSI6ImNpd2V2eHM1YjBiNDEydGxrNnlsZDg0aGwifQ.k_LeBX44fxrOrnsHvkh2fQ";

      // 渲染瓦片地图
      this.map = new mapboxgl.Map({
        container: this.$refs.map,
        // style: "streets-v11",
        style: {},
        zoom: 10,
        center: [114.2, 30.57],
      });

      this.$http
        .get("static/mapbox-resource/style/basic.json")
        .then((res) => {
          console.log("基础样式：", res);
          this.style = res.body;
          this.map.setStyle(res.body);

          //注册点击事件
          this.map.on("click", function (e) {
            console.log("点击");
          });
        })
        .catch((err) => {
          console.log("读取style失败!\n " + err);
        });
    },
    getExpression(value) {
      // console.log("getExp : ",Exp);
      // this.mapboxExpression = Exp;
      // this.style.layers[1]["filter"] = this.mapboxExpression;
      this.newStyle = value;
      // 判断id重复
      let id = value.id;
      let flag = JSON.stringify(
        this.style.layers.filter((item) => item.id === value.id)
      );
      console.log("flag  ", flag);
      if (flag === "[]" && id !== "") {
        // todo 测试的是线要素，要考虑压盖顺序
        this.style.layers.splice(8, 0, value);
      } else if (id === "") {
        this.$Message.warning("图层Id不能为空!");
      } else {
        // console.log("id重复，请修改id！");
        this.$Message.warning("图层Id重复，请修改Id!");
        return;
      }
    },
  },
  watch: {
    style: {
      handler: function (newVal, oldVal) {
        console.log("newVal", newVal.layers[1]);
        if (JSON.stringify(oldVal) !== "{}")
          console.log("oldVal", oldVal.layers[1]);
        this.map.setStyle(newVal);
        // this.map.on("load", () => {
        //   console.log("加载完成!");
        //   this.map.setFilter("park", newVal.layers[1].filter);
        // });
        // this.map.setStyle(newVal)

        // this.map.setFilter('park',newVal.layers[1].filter)
      },
      deep: true, //对象内部的属性监听，也叫深度监听
    },
  },
};
</script>

<style>
a.mapboxgl-ctrl-logo {
  display: none;
}
.map {
  /* width: 1368px;
  height: 740px; */
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0px;
  top: 0px;
}
.root {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
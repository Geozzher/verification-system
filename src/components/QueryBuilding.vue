<template>
  <div class="operate-panel">
    <Tag class="tag1">数据过滤</Tag>

    <div class="box" style="height:100%;">
      <div>
        <Tag class="tag2" style="margin-bottom:10px">图层Id</Tag>
        <Input class="layer" v-model="layerId" required></Input>
      </div>
      <div>
        <Tag class="tag2">选择数据源</Tag>
        <Select class="layer" v-model="selectedLayerC">
          <Option v-for="(value,key) in layerList" :value="key" :key="key">{{ key }}</Option>
        </Select>
      </div>
    </div>

    <div class="box">
      <Tag class="tag2">要素过滤</Tag>
      <div class="fields">
        <ul
          v-for="(field,index) in this.layerPropertries.fields"
          :key="index"
          v-model="selectedField"
        >
          <li
            :class="{'field':'true','hoverBg':index==hoverIndex}"
            type="text"
            @click="handleClick($event,field)"
            @mouseover="hoverIndex = index"
            @mouseout="hoverIndex = -1"
          >{{field}}</li>
        </ul>
      </div>
    </div>

    <div class="box">
      <div class="operators">
        <span v-for="(operator,index) in operators" :key="index">
          <Button class="operator" @click="operateClick">{{operator}}</Button>
        </span>
        <Button style="margin-left:72px;height:25px" @click="startConvert">新建</Button>
      </div>
      <textarea type="text" class="expression" v-model="sqlExpression"></textarea>

      <Tag class="tag2 tag3">Mapbox表达式</Tag>
      <span class="expression mapboxExp" v-text="displayMapboxExp"></span>
    </div>
  </div>
</template>
<script>
import { Button, Select, List, Input } from "view-design";
import { convert } from "../assets/js/sql-convert/sql-parse";
export default {
  components: {
    Button,
    Select,
    List,
  },
  data() {
    return {
      operators: [
        "=",
        "!=",
        ">",
        ">=",
        "<",
        "<=",
        "()",
        "and",
        "not",
        "or",
        "in",
        "is",
        "null",
      ],
      sqlExpression: "",
      mapboxExpression: [],
      layerPropertries: {
        fields: [],
        layerType: "",
      },
      layerList: {},
      selectedLayer: "",
      selectedField: "",
      layerId: "",
      clickIndex: -1,
      hoverIndex: -1,
    };
  },
  computed: {
    displayMapboxExp: {
      get: function () {
        if (this.mapboxExpression.length === 0) return;
        else return JSON.stringify(this.mapboxExpression);
      },
    },
    selectedLayerC: {
      get: function () {
        return this.selectedLayer;
      },
      set: function (newVal, oldVal) {
        this.selectedLayer = newVal;
        this.layerPropertries = this.layerList[newVal];
      },
    },
  },

  mounted() {
    this.init();
  },
  methods: {
    handleClick(event, key) {
      // console.log(event.target.innerHTML);
      this.selectedField = key;
      this.sqlExpression = this.sqlExpression + " " + key;
      console.log(key);
    },
    init() {
      this.$http
        .get("static/mapbox-resource/layer/layers-constitute.json")
        .then((res) => {
          console.log("图层架构：", res);
          this.layerList = res.body;
        })
        .catch((err) => {
          console.log("读取layer失败!\n " + err);
        });
    },
    operateClick(event) {
      console.log(event);
      this.sqlExpression =
        this.sqlExpression + " " + event.target.innerText + " ";
    },
    /**
     * 样式写死，目前仅仅实现数据筛选
     */
    newStyle(id, type, sourceLayer, filter) {
      if(id!==""){
 const typeMap = {
        point: "symbol",
        polyline: "line",
        polygon: "fill",
      };
      let newstyle = {
        id: id,
        type: typeMap[type],
        source: "os",
        "source-layer": sourceLayer,
        paint: {},
        layout: {},
        interactive: true,
      };
      if (JSON.stringify(filter) !== "[]") {
        newstyle["filter"] = filter;
      }

      switch (typeMap[type]) {
        case "symbol": {
          newstyle["paint"] = {
            "text-color": "#a7a7a7",
          };
          newstyle["layout"] = {
            "text-field": "{name}",
            "text-size": 10,
          };
          break;
        }
        case "line": {
          newstyle["paint"] = {
            "line-color": "#ffbd76",
            "line-width": 2,
          };
          newstyle["layout"] = {};
          break;
        }
        case "fill": {
          newstyle["paint"] = {};
          newstyle["layout"] = {};
          break;
        }
      }
      return newstyle;
      }else{
        return {id: id}
      }
     
    },
    startConvert() {
      //先清空Mapbox表达式框
      this.mapboxExpression = [];
      if (this.sqlExpression !== "")
        // try {
        this.mapboxExpression = convert(this.sqlExpression);
      // } catch (e) {
      // globalHandleError(e, cur, "errorCaptured hook");
      // }

      // console.log("mapboxExpression", this.mapboxExpression);

      this.$emit(
        "mapboxExpression",
        this.newStyle(
          this.layerId,
          this.layerPropertries.layerType,
          this.selectedLayer,
          this.mapboxExpression
        )
      );
    },
  },
};
</script>
<style>
.tag1 {
  height: 100%;
  border: solid #ffffff;
  background-color: #ffffff;
  font-family: Impact, Haettenschweiler, "Times New Roman", sans-serif;
  font-weight: bolder;
  font-size: 18px;
}
.tag2 {
  height: 100%;
  width: 100px;
  border: solid #ffffff;
  background-color: #ffffff;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-size: 14px;
  vertical-align: top;
}
.tag3 {
  height: 100%;
  width: 80%;
  margin: 0px 0px;
}
.hoverBg {
  background: #ccc;
  color: #fff;
}
.clickBg {
  background: rgb(95, 134, 207);
  color: #fff;
}
.expression {
  width: 250px;
  height: 80px;
  border: solid 1px #dcdee2;
  border-radius: 5px;
  overflow-x: auto;
  padding: 5px 5px 5px 5px;
}
.mapboxExp {
  border: solid 1px #ffffff;
}
.box {
  width: 280px;
  margin: 0px 5px 5px 5px;
  padding: 5px 5px 0px 5px;
}

.layer {
  width: 140px;
  /* height: 20px; */
}
.fields {
  width: 140px;
  height: 70px;
  border: solid 1px #dcdee2;
  border-radius: 5px;
  overflow-x: auto;
  overflow-y: auto;
  cursor: pointer;
  display: inline-block;
}
.field {
  width: 100%;
}
.operate-panel {
  width: 280px;
  border: solid 1px #dcdee2;
  border-radius: 5px;
  padding: 2px 6px 2px 6px;
  z-index: 99999;
  position: absolute;
  top: 30px;
  left: 30px;
  background-color: #ffffff;
}
.operators {
  width: 250px;
  margin-bottom: 5px;
}

.operator {
  width: 25px;
  height: 25px;
  margin: 1px 1.25px 1px 1.25px;
  padding: 0px;
  font-size: 12px;
}
</style>

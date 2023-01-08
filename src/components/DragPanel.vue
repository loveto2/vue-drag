<template>
  <widget
    class="drag-panel"
    :meta-data="canvasData.metaData"
    :is-resizable="canvasData.isResizable"
    :is-draggable="canvasData.isDraggable"
  >
    <widget
      v-for="widgetData in canvasData.metaData.widgetList"
      :key="widgetData.id"
      :meta-data="widgetData"
    />
  </widget>
</template>

<script>
import { reactive } from "vue";
import * as uuid from "uuid";
import Widget from "./Widget.vue";
import { WIDGET_TYPE } from "./types";

const id = uuid.v4();

export default {
  components: { Widget },
  setup() {
    const canvasData = reactive({
      isDraggable: false,
      isResizable: false,
      metaData: {
        id,
        widgetType: WIDGET_TYPE.CANVAS,
        widgetList: [],
      },
    });

    return {
      canvasData,
    };
  },
};
</script>

<style lang="scss" scoped>
.drag-panel {
  flex: 1;
  position: relative;
  cursor: default;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-top: none;
  border-bottom: none;
}
</style>

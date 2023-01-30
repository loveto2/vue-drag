<template>
  <widget class="drag-panel" :meta-data="canvasData.metaData" :is-resizable="canvasData.isResizable"
    @setActiveId="setActiveId" :is-draggable="canvasData.isDraggable">
    <widget v-for="containerData in canvasData.metaData.widgetList" :key="containerData.id"
      :isActive="containerData.id === activeId" :data-container-id="containerData.id" :meta-data="containerData"
      @setActiveId="setActiveId">
      <widget v-for="widgetData in containerData.widgetList" :key="widgetData.id" :isActive="widgetData.id === activeId"
        :meta-data="widgetData" @setActiveId="setActiveId">
      </widget>
    </widget>
  </widget>
</template>

<script setup lang="ts">
import * as uuid from "uuid";

export interface MetaData {
  id: string;
  isActive: boolean;
  widgetType: string;
  widgetList: MetaData[];
}

interface CanvasData {
  isDraggable: boolean;
  isResizable: boolean;
  metaData: MetaData;
}

const id = uuid.v4();

const canvasData = reactive<CanvasData>({
  isDraggable: false,
  isResizable: false,
  metaData: {
    id,
    isActive: false,
    widgetType: 'canvas',
    widgetList: [],
  },
});

const activeId = ref('')

const setActiveId = (id: string) => {
  activeId.value = id
}

</script>

<style lang="scss" scoped>
.drag-panel {
  flex: 1;
  position: relative;
  overflow: hidden;
  cursor: default;
  background: linear-gradient(-90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px) 0% 0% / 8px 8px,
    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px) 0% 0% / 8px 8px;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-top: none;
  border-bottom: none;
}
</style>

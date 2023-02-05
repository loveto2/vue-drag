<template>
  <widget class="drag-panel" ref="dragPanel" :meta-data="canvasData.metaData" :is-resizable="canvasData.isResizable"
    @setActiveId="setActiveId" :is-draggable="canvasData.isDraggable">
    <widget v-for="containerData in canvasData.metaData.children" :key="containerData.id"
      :isActive="containerData.id === activeId" :data-container-id="containerData.id" :meta-data="containerData"
      @setActiveId="setActiveId">
      <widget v-for="widgetData in containerData.children" :key="widgetData.id" :isActive="widgetData.id === activeId"
        :meta-data="widgetData" @setActiveId="setActiveId">
      </widget>
    </widget>
  </widget>
</template>

<script setup lang="ts">
import * as uuid from "uuid";

export interface MetaData {
  id: string;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
  isActive: boolean;
  widgetType: string;
  children: MetaData[];
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
    width: 0,
    height: 0,
    pageX: 0,
    pageY: 0,
    isActive: false,
    widgetType: 'canvas',
    children: [],
  },
});

const activeId = ref('')

const setActiveId = (id: string) => {
  activeId.value = id
}

const dragPanel = ref<Vue|null>(null)

onMounted(() => {
  console.log(dragPanel.value)
  if (dragPanel.value) {
    const dom = dragPanel.value.$el as HTMLElement
    const { width, height, x, y } = dom.getBoundingClientRect()
    canvasData.metaData.width = width
    canvasData.metaData.height = height
    canvasData.metaData.pageX = x
    canvasData.metaData.pageY = y
  }
})

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

<template>
  <div class="widget-list">
    <div
      class="widget"
      v-for="widget of widgetList"
      :key="widget.code"
      @mousedown="mousedown($event, widget)"
    >
      {{ widget.name }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDrag } from '../lib/drag'
import { DragType, MetaData, State, WidgetType } from '../types';

const { mousedown } = useDrag(DragType.dragdrop)

const dragType = ref(DragType)

const widgetList = ref<MetaData[]>([
  {
    code: "label",
    name: "容器",
    width: 500,
    height: 300,
    widgetType: WidgetType.container,
  },
  {
    code: "tabs",
    name: "标签页",
    width: 300,
    height: 180,
    widgetType: WidgetType.subContainer,
  },
  {
    code: "button",
    name: "按钮",
    width: 150,
    height: 80,
    widgetType: WidgetType.widget,
  },
  {
    code: "icon",
    name: "图标",
    width: 80,
    height: 80,
    widgetType: WidgetType.widget,
  },
  {
    code: "text",
    name: "文本",
    width: 300,
    height: 100,
    widgetType: WidgetType.widget,
  },
]);

const isInRect = (pageX: number, pageY: number, el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  return (
    pageX > rect.x &&
    pageX < rect.x + rect.width &&
    pageY > rect.y &&
    pageY < rect.y + rect.height
  );
};

const getContainer = (pointerX: number, pointerY: number) => {
  // const subContainerList = map.get(WIDGET_TYPE.SUB_CONTAINER) || [];
  // const containerList = map.get(WIDGET_TYPE.CONTSINER) || [];
  // const canvasList = map.get(WIDGET_TYPE.CANVAS) || [];

  let parentContainer = null;
  // for (const subContainer of subContainerList) {
  //   const inRect = isInRect(pointerX, pointerY, subContainer.el);
  //   if (inRect) {
  //     parentContainer = subContainer;
  //     break;
  //   }
  // }
  // if (!parentContainer) {
  //   for (const container of containerList) {
  //     const inRect = isInRect(pointerX, pointerY, container.el);
  //     if (inRect) {
  //       parentContainer = container;
  //       break;
  //     }
  //   }
  // }
  // if (!parentContainer) {
  //   for (const canvas of canvasList) {
  //     const inRect = isInRect(pointerX, pointerY, canvas.el);
  //     if (inRect) {
  //       parentContainer = canvas;
  //       break;
  //     }
  //   }
  // }
  return parentContainer;
};

const dragstart = (state: State) => {
  console.log("dragstart", state);
  const {
    target,
    dimensionsBeforeMove: { width, height, pageX, pageY },
  } = state;
  const shadowNode = target?.cloneNode(true);
  // target.style.opacity = 0;
  // shadowNode.style.width = width + "px";
  // shadowNode.style.height = height + "px";
  // shadowNode.style.left = pageX + "px";
  // shadowNode.style.top = pageY + "px";
  // shadowNode.style.background = "pink";
  // shadowNode.style.position = "absolute";
  // document.body.appendChild(shadowNode);
  // state.shadowNode = shadowNode;

  // target.style.cursor = "grabbing";
  document.body.style.cursor = "grabbing";
};

const dragmove = (data: unknown) => {
  // console.log("dragmove", data);
  // const {
  //   state: {
  //     shadowNode,
  //     dimensionsBeforeMove: { pageX, pageY },
  //     pointerX,
  //     pointerY,
  //   },
  //   delta: { deltaX, deltaY },
  // } = data;
  // shadowNode.style.left = pageX + deltaX + "px";
  // shadowNode.style.top = pageY + deltaY + "px";

  // const container = getContainer(pointerX, pointerY);
  // if (container) {
  //   data.state.container = container;
  // } else {
  //   data.state.container = null;
  // }
};

const dragend = (data: unknown) => {
  // console.log("dragend", data);
  // const {
  //   state: { target, shadowNode, container, metaData, pointerX, pointerY },
  // } = data;
  // target.style.transition = "opacity .3s";
  // target.style.opacity = 1;
  // shadowNode.style.transition = "opacity .3s";
  // shadowNode.style.opacity = 0;
  // shadowNode.addEventListener("transitionend", () => {
  //   document.body.removeChild(shadowNode);
  // });
  // if (container) {
  //   emitter.emit(`drop-${container.id}`, {
  //     pointerX,
  //     pointerY,
  //     metaData,
  //   });
  //   data.state.container = null;
  // }

  // target.style.cursor = "";
  // document.body.style.cursor = "";
};

onMounted(() => {
  // emitter.on(`dragstart-${DRAG_TYPE.DRAG}-`, dragstart);
  // emitter.on(`dragmove-${DRAG_TYPE.DRAG}-`, dragmove);
  // emitter.on(`dragend-${DRAG_TYPE.DRAG}-`, dragend);
});

onUnmounted(() => {
  // emitter.off(`dragstart-${DRAG_TYPE.DRAG}-`, dragstart);
  // emitter.off(`dragmove-${DRAG_TYPE.DRAG}-`, dragmove);
  // emitter.off(`dragend-${DRAG_TYPE.DRAG}-`, dragend);
});
</script>

<style lang="scss" scoped>
.widget-list {
  width: 350px;
  padding: 18px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .widget {
    width: 150px;
    height: 120px;
    border: 1px solid black;
    cursor: grab;
    user-select: none;
  }
}
</style>

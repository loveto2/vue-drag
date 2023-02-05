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
import * as uuid from 'uuid'
import { emit, register, unregister } from "@/lib/drag";
import { Pointer } from "@/types";
import { map, WidgetType, MetaData } from "./store";

export interface WidgetConfig {
  code: string;
  name: string;
  width: number;
  height: number;
  widgetType: WidgetType,
}

export interface State {
  target: HTMLElement;
  container?: MetaData;
  shadowNode?: HTMLElement;
  widgetConfig: WidgetConfig;
  dimensionsBeforeMove: {
    pointerX: number;
    pointerY: number;
    pageX: number;
    pageY: number;
    width: number;
    height: number;
    left: number;
    top: number;
  };
}

const widgetList = ref<WidgetConfig[]>([
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

const isInRect = (pageX: number, pageY: number, metaData: MetaData) => {
  return (
    pageX > metaData.pageX &&
    pageX < metaData.pageX + metaData.width &&
    pageY > metaData.pageY &&
    pageY < metaData.pageY + metaData.height
  )
};

const getContainer = (pointerX: number, pointerY: number) => {
  const subContainerMap =
    map.get(WidgetType.subContainer) || new Map<string, MetaData>();
  const containerMap =
    map.get(WidgetType.container) || new Map<string, MetaData>();
  const canvasMap = map.get(WidgetType.canvas) || new Map<string, MetaData>();

  let parentContainer: null | MetaData = null;
  for (const subContainer of subContainerMap.values()) {
    const inRect = isInRect(pointerX, pointerY, subContainer);
    if (inRect) {
      parentContainer = subContainer;
      break;
    }
  }
  if (!parentContainer) {
    for (const container of containerMap.values()) {
      const inRect = isInRect(pointerX, pointerY, container);
      if (inRect) {
        parentContainer = container;
        break;
      }
    }
  }
  if (!parentContainer) {
    for (const canvas of canvasMap.values()) {
      const inRect = isInRect(pointerX, pointerY, canvas);
      if (inRect) {
        parentContainer = canvas;
        break;
      }
    }
  }
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

const state = ref<null | State>(null);

const dragmove = (pointer: Pointer) => {
  if (state.value) {
    const { pointerX, pointerY } = pointer;
    const { shadowNode, dimensionsBeforeMove } = state.value;
    const deltaX = pointerX - dimensionsBeforeMove.pointerX;
    const deltaY = pointerY - dimensionsBeforeMove.pointerY;
    if (shadowNode) {
      shadowNode.style.left = dimensionsBeforeMove.left + deltaX + "px";
      shadowNode.style.top = dimensionsBeforeMove.top + deltaY + "px";
    }

    const container = getContainer(pointerX, pointerY);
    if (container) {
      state.value.container = container;
    }
  }
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

const normalizeMetaData = (widgetConfig: WidgetConfig, pointer: Pointer): MetaData | null => {
  if (state.value) {
    let left = 0, top = 0
    const { container } = state.value
    const { pointerX, pointerY } = pointer;
    const { width = 10, height = 10, widgetType = WidgetType.widget } = widgetConfig;
    if (container) {
      const { pageX, pageY } = container
      left = pointerX - pageX - width / 2
      top = pointerY - pageY - height / 2
    }
    return {
      id: uuid.v4(),
      width,
      height,
      pageX: pointerX,
      pageY: pointerY,
      left,
      top,
      widgetType,
      children: []
    }
  }
  return null
};

const dragend = (pointer: Pointer) => {
  if (state.value) {
    const { target, shadowNode, widgetConfig, container } = state.value;
    const metaData = normalizeMetaData(widgetConfig, pointer);
    target.style.transition = "opacity .3s";
    target.style.opacity = "1";
    if (shadowNode) {
      shadowNode.style.transition = "opacity .3s";
      shadowNode.style.opacity = "0";
      shadowNode.addEventListener("transitionend", () => {
        document.body.removeChild(shadowNode);
      });
    }
    console.log(container, map);
    if (container) {
      emit(`drop-${container.id}`, metaData);
    }

    target.style.cursor = "";
    document.body.style.cursor = "";

    state.value = null;
  }
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

const events = {
  dragmove,
  dragend,
};

const mousedown = (e: MouseEvent, widgetConfig: WidgetConfig) => {
  const { pageX: pointerX, pageY: pointerY, target } = e;
  const targetElement = target as HTMLElement;
  const { width, height, x, y } = targetElement.getBoundingClientRect();
  const shadowNode = targetElement.cloneNode(true) as HTMLElement;

  targetElement.style.opacity = "0";
  shadowNode.style.width = width + "px";
  shadowNode.style.height = height + "px";
  shadowNode.style.left = x + "px";
  shadowNode.style.top = y + "px";
  shadowNode.style.background = "pink";
  shadowNode.style.position = "absolute";
  document.body.appendChild(shadowNode);

  targetElement.style.cursor = "grabbing";
  document.body.style.cursor = "grabbing";

  state.value = {
    target: targetElement,
    shadowNode,
    widgetConfig,
    dimensionsBeforeMove: {
      pointerX,
      pointerY,
      pageX: x,
      pageY: y,
      width,
      height,
      left: x,
      top: y,
    },
  };
};

onMounted(() => {
  register(events);
  // emitter.on(`dragstart-${DRAG_TYPE.DRAG}-`, dragstart);
  // emitter.on(`dragmove-${DRAG_TYPE.DRAG}-`, dragmove);
  // emitter.on(`dragend-${DRAG_TYPE.DRAG}-`, dragend);
});

onUnmounted(() => {
  unregister(events);
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

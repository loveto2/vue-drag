<template>
  <div class="widget" ref="widgetRef" :style="widgetStyle">
    <div class="content" @mousedown.stop="bodyMousedown">
      <slot />
      **{{ metaData.id }}
      <!-- <Widget v-for="widgetData in metaData.widgetList" :key="widgetData.id" :meta-data="widgetData" /> -->
    </div>
    <!-- <div class="content" v-else>
      <slot />
      {{ metaData.code }}
      ##{{ metaData.id }}
      <widget v-for="widgetData in metaData.widgetList" :key="widgetData.id" :meta-data="widgetData" />
    </div> -->
    <div class="stick-wrapper" v-show="isActive">
      <div
        v-for="stick in sticks"
        :key="stick"
        class="stick"
        :class="['stick-' + stick, isResizable ? '' : 'not-resizable']"
        :style="stickStyle(stick)"
        @mousedown.stop="stickMousedown($event, stick)"
      ></div>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: "Widget",
};
</script>
<script setup lang="ts">
import { off, on, register, unregister } from "@/lib/drag";
import { Pointer, WidgetType } from "@/types";
import { MetaData } from "./store";
import { map } from "./store";

export interface State {
  target: HTMLElement;
  metaData?: MetaData;
  stickData?: string;
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

interface WidgetProps {
  isDraggable: boolean;
  isResizable: boolean;
  sticks: string[];
  stickSize: number;
  parentScaleX: number;
  parentScaleY: number;
  limitMode: LimitMode;
  snapToGrid: boolean;
  gridX: number;
  gridY: number;
  isActive: boolean;
  metaData: MetaData;
}

enum LimitMode {
  none = "none",
  parent = "parent",
  component = "component",
}

enum Sticks {
  tl = "tl",
  tm = "tm",
  tr = "tr",
  mr = "mr",
  br = "br",
  bm = "bm",
  bl = "bl",
  ml = "ml",
}

const emits = defineEmits(["setActiveId"]);

const props = withDefaults(defineProps<WidgetProps>(), {
  isDraggable: true,
  isResizable: true,
  sticks: () => ["tl", "tm", "tr", "mr", "br", "bm", "bl", "ml"],
  stickSize: 8,
  parentScaleX: 1,
  parentScaleY: 1,
  limitMode: LimitMode.none,
  snapToGrid: true,
  gridX: 8,
  gridY: 8,
  isActive: false,
});

// const props = defineProps({
//   isDraggable: {
//     type: Boolean,
//     default: true,
//   },
//   isResizable: {
//     type: Boolean,
//     default: true,
//   },
//   sticks: {
//     type: Array<string>,
//     default() {
//       return ["tl", "tm", "tr", "mr", "br", "bm", "bl", "ml"];
//     },
//   },
//   stickSize: {
//     type: Number,
//     default: 8,
//   },
//   parentScaleX: {
//     type: Number,
//     default: 1,
//   },
//   parentScaleY: {
//     type: Number,
//     default: 1,
//   },
//   limitMode: {
//     type: [Boolean, String],
//     default: 'parent',
//     validator: value => {
//       if (typeof value == "string") {
//         return ['parent', 'component'].includes(value);
//       }
//       return true;
//     }
//   },
//   snapToGrid: {
//     type: Boolean,
//     default: true,
//   },
//   gridX: {
//     type: Number,
//     default: 8,
//   },
//   gridY: {
//     type: Number,
//     default: 8,
//   },
//   isActive: {
//     type: Boolean,
//     default: false,
//   },
//   metaData: {
//     type: Object,
//     required: true,
//   },
// })

const widgetRef = ref<null | HTMLElement>(null);

const { id, widgetType = WidgetType.widget } = props.metaData;

const addWidget = () => {
  console.log("addWidget");
  if (widgetRef.value) {
    let widgetMap = map.get(widgetType);
    if (widgetMap) {
      widgetMap.set(id, props.metaData);
    } else {
      widgetMap = new Map<string, MetaData>();
      widgetMap.set(id, props.metaData);
      map.set(widgetType, widgetMap);
    }
  }
};

const removeWidget = () => {
  let widgetList = map.get(widgetType);
  if (widgetList) {
    widgetList.delete(id);
  }
};

const drop = (metaData: any) => {
  console.log(metaData);
  props.metaData.children.push(metaData);
};

const limits = {
  width: {
    max: Number.POSITIVE_INFINITY,
    min: 0,
  },
  height: {
    max: Number.POSITIVE_INFINITY,
    min: 0,
  },
  left: {
    max: Number.POSITIVE_INFINITY,
    min: Number.NEGATIVE_INFINITY,
  },
  top: {
    max: Number.POSITIVE_INFINITY,
    min: Number.NEGATIVE_INFINITY,
  },
};

const calculateLimitByBody = () => {
  const { limitMode, metaData } = props;
  if (LimitMode.parent === limitMode) {
    if (widgetRef.value) {
      const { parentElement } = widgetRef.value;
      if (parentElement) {
        const { width, height } = parentElement.getBoundingClientRect();
        limits.width.max = width;
        limits.height.max = height;
        limits.left.max = width - metaData.width;
        limits.top.max = height - metaData.height;
      }
    }
    limits.left.min = 0;
    limits.top.min = 0;
  } else if (LimitMode.component === limitMode) {
  }
};

const calculateLimitByStick = () => {
  calculateLimitByBody();
  const {
    width: { max: maxWidth },
    height: { max: maxHeight },
  } = limits;
  const { limitMode, metaData } = props;
  if (LimitMode.parent === limitMode) {
    const { children } = metaData;
    const topList = [metaData.height];
    const leftList = [metaData.width];
    const bottomList = [metaData.height];
    const rightList = [metaData.width];
    let bottom, right;
    for (const widget of children) {
      const { top, left, width, height } = widget;
      topList.push(top);
      leftList.push(left);
      bottom = metaData.height - top - height;
      right = metaData.width - left - width;
      bottomList.push(bottom);
      rightList.push(right);
    }
    const topDelta = Math.min.apply(null, topList);
    const leftDelta = Math.min.apply(null, leftList);
    const bottomDelta = Math.min.apply(null, bottomList);
    const rightDelta = Math.min.apply(null, rightList);
    limits.top.max = metaData.top + topDelta;
    limits.left.max = metaData.left + leftDelta;
    limits.width.max = maxWidth - metaData.left;
    limits.width.min = metaData.width - rightDelta;
    limits.height.max = maxHeight - metaData.left;
    limits.height.min = metaData.height - bottomDelta;
  } else if (LimitMode.component === limitMode) {
  }
};

const bodyState = ref<null | State>(null);

const bodyDragmove = (pointer: Pointer) => {
  if (bodyState.value) {
    const { pointerX, pointerY } = pointer;
    const { dimensionsBeforeMove, metaData } = bodyState.value;
    const deltaX = pointerX - dimensionsBeforeMove.pointerX;
    const deltaY = pointerY - dimensionsBeforeMove.pointerY;
    let left = dimensionsBeforeMove.left + deltaX;
    let top = dimensionsBeforeMove.top + deltaY;
    const { snapToGrid, gridX, gridY } = props;
    if (snapToGrid) {
      left = Math.round(left / gridX) * gridX;
      top = Math.round(top / gridY) * gridY;
    }
    if (left < limits.left.min) left = limits.left.min;
    if (left > limits.left.max) left = limits.left.max;
    if (top < limits.top.min) top = limits.top.min;
    if (top > limits.top.max) top = limits.top.max;
    if (metaData) {
      metaData.left = left;
      metaData.top = top;
    }
  }
};

const bodyDragend = () => {
  if (bodyState.value) {
    const { target } = bodyState.value;
    target.style.cursor = "";
    document.body.style.cursor = "";

    bodyState.value = null;
  }
};

const bodyEvents = {
  dragmove: bodyDragmove,
  dragend: bodyDragend,
};

const bodyMousedown = async (e: MouseEvent) => {
  emits("setActiveId", id);
  await nextTick();
  if (!props.isActive) return;
  console.log("dargstart:", props.metaData);
  const { pageX: pointerX, pageY: pointerY, target } = e;
  const metaData = props.metaData as MetaData;
  const { width, height, pageX = 0, pageY = 0, left = 0, top = 0 } = metaData;
  document.body.style.cursor = "grabbing";

  calculateLimitByBody();

  bodyState.value = {
    target: target as HTMLElement,
    metaData,
    dimensionsBeforeMove: {
      pointerX,
      pointerY,
      width,
      height,
      pageX,
      pageY,
      left,
      top,
    },
  };
};

const stickstart = () => {
  // console.log("stickstart:", state);
  // const { target, dimensionsBeforeMove, metaData: { stick } } = state;
  // dimensionsBeforeMove.width = props.metaData.width
  // dimensionsBeforeMove.height = props.metaData.height
  // dimensionsBeforeMove.left = props.metaData.left
  // dimensionsBeforeMove.top = props.metaData.top
  // let cursor = ''
  // switch (stick) {
  //   case 'tl':
  //   case 'br':
  //     cursor = 'nwse-resize'
  //     break;
  //   case 'tm':
  //   case 'bm':
  //     cursor = 'ns-resize'
  //     break;
  //   case 'tr':
  //   case 'bl':
  //     cursor = 'nesw-resize'
  //     break;
  //   case 'ml':
  //   case 'mr':
  //     cursor = 'ew-resize'
  //     break;
  // }
  // target.style.cursor = cursor
  // widgetRef.value.style.cursor = cursor
};
const stickState = ref<null | State>(null);

const dimensionsBeforeMoveMap = new Map();

const stickDragmove = (pointer: Pointer) => {
  if (stickState.value) {
    const { pointerX, pointerY } = pointer;
    const { snapToGrid, gridX, gridY, metaData } = props;
    const { dimensionsBeforeMove, stickData } = stickState.value;
    if (stickData) {
      let deltaX = pointerX - dimensionsBeforeMove.pointerX;
      let deltaY = pointerY - dimensionsBeforeMove.pointerY;
      if (snapToGrid) {
        deltaX = Math.round(deltaX / gridX) * gridX;
        deltaY = Math.round(deltaY / gridY) * gridY;
      }
      let width, height, left, top, diff;
      if (stickData.includes("l")) {
        width = dimensionsBeforeMove.width - deltaX;
        left = dimensionsBeforeMove.left + deltaX;
        if (left < limits.left.min) {
          left = limits.left.min;
          diff = dimensionsBeforeMove.left - left;
          width = dimensionsBeforeMove.width + diff;
        } else if (left > limits.left.max) {
          left = limits.left.max;
          diff = left - dimensionsBeforeMove.left;
          width = dimensionsBeforeMove.width - diff;
        }
        metaData.width = width;
        metaData.left = left;
        const { children } = metaData;
        deltaX = metaData.left - dimensionsBeforeMove.left;
        for (const widget of children) {
          const { id } = widget;
          const { left } = dimensionsBeforeMoveMap.get(id);
          widget.left = left - deltaX;
          if (widget.left < 0) widget.left = 0;
        }
      }
      if (stickData.includes("r")) {
        width = dimensionsBeforeMove.width + deltaX;
        if (width < limits.width.min) width = limits.width.min;
        if (width > limits.width.max) width = limits.width.max;
        props.metaData.width = width;
      }
      if (stickData.includes("t")) {
        height = dimensionsBeforeMove.height - deltaY;
        top = dimensionsBeforeMove.top + deltaY;
        if (top < limits.top.min) {
          top = limits.top.min;
          diff = dimensionsBeforeMove.top - top;
          height = dimensionsBeforeMove.height + diff;
        } else if (top > limits.top.max) {
          top = limits.top.max;
          diff = top - dimensionsBeforeMove.top;
          height = dimensionsBeforeMove.height - diff;
        }
        props.metaData.height = height;
        props.metaData.top = top;
        const { children } = metaData;
        deltaY = metaData.top - dimensionsBeforeMove.top;
        for (const widget of children) {
          const { id } = widget;
          const { top } = dimensionsBeforeMoveMap.get(id);
          widget.top = top - deltaY;
          if (widget.top < 0) widget.top = 0;
        }
      }
      if (stickData.includes("b")) {
        height = dimensionsBeforeMove.height + deltaY;
        if (height < limits.height.min) height = limits.height.min;
        if (height > limits.height.max) height = limits.height.max;
        props.metaData.height = height;
      }
    }
  }
};
const stickDragend = () => {
  if (stickState.value) {
    const { target } = stickState.value;
    target.style.cursor = "";
    if (widgetRef.value) {
      widgetRef.value.style.cursor = "";
    }
    stickState.value = null;
  }
};

const stickEvents = {
  dragmove: stickDragmove,
  dragend: stickDragend,
};

const stickMousedown = (e: MouseEvent, stick: string) => {
  if (!props.isActive) return;
  console.log("stickstart:", stick);
  const { pageX: pointerX, pageY: pointerY, target } = e;
  const {
    width,
    height,
    pageX,
    pageY,
    left,
    top,
    children,
  } = props.metaData;
  calculateLimitByStick();
  // dimensionsBeforeMove.width = props.metaData.width
  // dimensionsBeforeMove.height = props.metaData.height
  // dimensionsBeforeMove.left = props.metaData.left
  // dimensionsBeforeMove.top = props.metaData.top
  for (const widget of children) {
    const { id, top, left } = widget;
    dimensionsBeforeMoveMap.set(id, { top, left });
  }

  let cursor = "";
  switch (stick) {
    case "tl":
    case "br":
      cursor = "nwse-resize";
      break;
    case "tm":
    case "bm":
      cursor = "ns-resize";
      break;
    case "tr":
    case "bl":
      cursor = "nesw-resize";
      break;
    case "ml":
    case "mr":
      cursor = "ew-resize";
      break;
  }
  const targetElement = target as HTMLElement;
  targetElement.style.cursor = cursor;
  if (widgetRef.value) {
    widgetRef.value.style.cursor = cursor;
  }

  stickState.value = {
    target: targetElement,
    stickData: stick,
    dimensionsBeforeMove: {
      pointerX,
      pointerY,
      width,
      height,
      pageX,
      pageY,
      left,
      top,
    },
  };
};

onMounted(() => {
  addWidget();
  on(`drop-${id}`, drop);

  if (props.isDraggable) {
    register(bodyEvents);
    // on(`dragstart-${DRAG_TYPE.BODY_MOVE}-${id}`, dragstart);
    // on(`dragmove-${DRAG_TYPE.BODY_MOVE}-${id}`, dragmove);
    // on(`dragend-${DRAG_TYPE.BODY_MOVE}-${id}`, dragend);
  }
  if (props.isResizable) {
    register(stickEvents);
    // on(`dragstart-${DRAG_TYPE.STICK_MOVE}-${id}`, stickstart);
    // on(`dragmove-${DRAG_TYPE.STICK_MOVE}-${id}`, stickmove);
    // on(`dragend-${DRAG_TYPE.STICK_MOVE}-${id}`, stickend);
  }
});

onUnmounted(() => {
  removeWidget();
  off(`drop-${id}`, drop);

  if (props.isDraggable) {
    unregister(bodyEvents);
    // off(`dragstart-${DRAG_TYPE.BODY_MOVE}-${id}`, dragstart);
    // off(`dragmove-${DRAG_TYPE.BODY_MOVE}-${id}`, dragmove);
    // off(`dragend-${DRAG_TYPE.BODY_MOVE}-${id}`, dragend);
  }
  if (props.isResizable) {
    unregister(stickEvents);
    // off(`dragstart-${DRAG_TYPE.STICK_MOVE}-${id}`, stickstart);
    // off(`dragmove-${DRAG_TYPE.STICK_MOVE}-${id}`, stickmove);
    // off(`dragend-${DRAG_TYPE.STICK_MOVE}-${id}`, stickend);
  }
});

const widgetStyle = computed(() => {
  const { width, height, left, top, widgetType } = props.metaData;
  if (widgetType === WidgetType.canvas) return
  return {
    width: width + "px",
    height: height + "px",
    left: left + "px",
    top: top + "px",
  };
});

const styleMapping = {
  y: {
    t: "top",
    m: "marginTop",
    b: "bottom",
  },
  x: {
    l: "left",
    m: "marginLeft",
    r: "right",
  },
};

const stickStyle = computed(() => {
  const { stickSize, parentScaleX, parentScaleY } = props;
  return (stick: string) => {
    const stickStyle: Record<string, string> = {
      width: `${stickSize / parentScaleX}px`,
      height: `${stickSize / parentScaleY}px`,
    };
    const [vertical, horizontal] = stick;
    const verticalKey = vertical as keyof typeof styleMapping.y;
    const horizontalKey = horizontal as keyof typeof styleMapping.x;
    stickStyle[styleMapping.y[verticalKey]] = `${
      stickSize / parentScaleX / -2
    }px`;
    stickStyle[styleMapping.x[horizontalKey]] = `${
      stickSize / parentScaleX / -2
    }px`;
    return stickStyle;
  };
});

const stickData = computed(() => {
  return (stick: string) => ({
    id,
    stick,
  });
});
</script>

<style lang="scss" scoped>
.widget {
  position: absolute;
  cursor: grab;
  user-select: none;
  border: 1px solid black;

  .content {
    width: 100%;
    height: 100%;
  }

  .stick {
    box-sizing: border-box;
    position: absolute;
    font-size: 1px;
    background: #ffffff;
    border: 1px solid #6c6c6c;
    box-shadow: 0 0 2px #bbb;
  }

  .inactive .stick {
    display: none;
  }

  .stick-tl,
  .stick-br {
    cursor: nwse-resize;
  }

  .stick-tm,
  .stick-bm {
    left: 50%;
    cursor: ns-resize;
  }

  .stick-tr,
  .stick-bl {
    cursor: nesw-resize;
  }

  .stick-ml,
  .stick-mr {
    top: 50%;
    cursor: ew-resize;
  }

  .stick.not-resizable {
    display: none;
  }
}
</style>

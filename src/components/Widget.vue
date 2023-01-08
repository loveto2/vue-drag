<template>
  <div class="widget" ref="widgetRef" :style="widgetStyle">
    <div
      class="content"
      v-if="isDraggable"
      @mousedown="mousedown(metaData, DRAG_TYPE.BODY_MOVE, $event)"
    >
      <slot />
      {{ metaData.code }}
    </div>
    <div class="content" v-else>
      <slot />
      {{ metaData.code }}
    </div>
    <div
      v-for="stick in sticks"
      :key="stick"
      class="stick"
      :class="['stick-' + stick, isResizable ? '' : 'not-resizable']"
      @mousedown="mousedown(stickData(stick), DRAG_TYPE.STICK_MOVE, $event)"
      :style="stickStyle(stick)"
    ></div>
  </div>
</template>

<script>
import * as uuid from "uuid";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { emitter, map, useDrag } from "./useDrag";
import { WIDGET_TYPE, DRAG_TYPE } from "./types";
export default {
  props: {
    isDraggable: {
      type: Boolean,
      default: true,
    },
    isResizable: {
      type: Boolean,
      default: true,
    },
    sticks: {
      type: Array,
      default() {
        return ["tl", "tm", "tr", "mr", "br", "bm", "bl", "ml"];
      },
    },
    stickSize: {
      type: Number,
      default: 8,
    },
    parentScaleX: {
      type: Number,
      default: 1,
    },
    parentScaleY: {
      type: Number,
      default: 1,
    },
    metaData: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const widgetRef = ref(null);

    const mousedown = useDrag();

    const { id, widgetType = WIDGET_TYPE.WIDGET } = props.metaData;

    const addWidget = () => {
      const widget = {
        id,
        el: widgetRef.value,
      };
      const widgetList = map.get(widgetType);
      if (widgetList) {
        widgetList.push(widget);
      } else {
        map.set(widgetType, [widget]);
      }
    };

    const removeWidget = () => {
      let widgetList = map.get(widgetType);
      if (widgetList) {
        widgetList = widgetList.filter((widget) => widget.id !== id);
        map.set(widgetType, widgetList);
      }
    };

    const drop = ({ pointerX, pointerY, metaData }) => {
      console.log("drop:", metaData);
      const { width, height } = metaData;
      const { x, y } = widgetRef.value.getBoundingClientRect();
      metaData = {
        ...metaData,
        id: uuid.v4(),
        left: pointerX - x - width / 2,
        top: pointerY - y - height / 2,
      };
      props.metaData.widgetList.push(metaData);
    };

    const dragstart = (state) => {
      console.log("dargstart:", state, props.metaData);
      state.target.style.cursor = "grabbing";
      document.body.style.cursor = "grabbing";
    };

    const dragmove = (data) => {
      console.log("dragmove:", data);
      const {
        state: { dimensionsBeforeMove, metaData },
        delta: { deltaX, deltaY },
      } = data;
      metaData.left = dimensionsBeforeMove.left + deltaX;
      metaData.top = dimensionsBeforeMove.top + deltaY;
    };

    const dragend = (data) => {
      console.log("dragend", data);
      const { state } = data;
      state.target.style.cursor = "";
      document.body.style.cursor = "";
    };

    const stickstart = (state) => {
      console.log("stickstart:", state);
      const { target, dimensionsBeforeMove, metaData: { stick } } = state;
      dimensionsBeforeMove.width = props.metaData.width
      dimensionsBeforeMove.height = props.metaData.height
      dimensionsBeforeMove.left = props.metaData.left
      dimensionsBeforeMove.top = props.metaData.top

      let cursor = ''
      switch (stick) {
        case 'tl':
        case 'br':
          cursor = 'nwse-resize'
          break;
        case 'tm':
        case 'bm':
          cursor = 'ns-resize'
          break;
        case 'tr':
        case 'bl':
          cursor = 'nesw-resize'
          break;
        case 'ml':
        case 'mr':
          cursor = 'ew-resize'
          break;
      }
      target.style.cursor = cursor
      widgetRef.value.style.cursor = cursor
    };
    const stickmove = (data) => {
      console.log("stickmove:", data);
      const {
        state: { dimensionsBeforeMove, metaData: { stick } },
        delta: { deltaX, deltaY },
      } = data;
      if (stick.includes('l')) {
        props.metaData.width = dimensionsBeforeMove.width - deltaX;
        props.metaData.left = dimensionsBeforeMove.left + deltaX;
      }
      if (stick.includes('r')) {
        props.metaData.width = dimensionsBeforeMove.width + deltaX;
      }
      if (stick.includes('t')) {
        props.metaData.height = dimensionsBeforeMove.height - deltaY;
        props.metaData.top = dimensionsBeforeMove.top + deltaY;
      }
      if (stick.includes('b')) {
        props.metaData.height = dimensionsBeforeMove.height + deltaY;
      }
    };
    const stickend = (data) => {
      console.log("stickend:", data);
      const { state: { target } } = data;
      target.style.cursor = ''
      widgetRef.value.style.cursor = ''
    };

    onMounted(() => {
      addWidget();
      emitter.on(`drop-${id}`, drop);

      if (props.isDraggable) {
        emitter.on(`dragstart-${DRAG_TYPE.BODY_MOVE}-${id}`, dragstart);
        emitter.on(`dragmove-${DRAG_TYPE.BODY_MOVE}-${id}`, dragmove);
        emitter.on(`dragend-${DRAG_TYPE.BODY_MOVE}-${id}`, dragend);
      }
      if (props.isResizable) {
        emitter.on(`dragstart-${DRAG_TYPE.STICK_MOVE}-${id}`, stickstart);
        emitter.on(`dragmove-${DRAG_TYPE.STICK_MOVE}-${id}`, stickmove);
        emitter.on(`dragend-${DRAG_TYPE.STICK_MOVE}-${id}`, stickend);
      }
    });

    onUnmounted(() => {
      removeWidget();
      emitter.off(`drop-${id}`, drop);

      if (props.isDraggable) {
        emitter.off(`dragstart-${DRAG_TYPE.BODY_MOVE}-${id}`, dragstart);
        emitter.off(`dragmove-${DRAG_TYPE.BODY_MOVE}-${id}`, dragmove);
        emitter.off(`dragend-${DRAG_TYPE.BODY_MOVE}-${id}`, dragend);
      }
      if (props.isResizable) {
        emitter.off(`dragstart-${DRAG_TYPE.STICK_MOVE}-${id}`, stickstart);
        emitter.off(`dragmove-${DRAG_TYPE.STICK_MOVE}-${id}`, stickmove);
        emitter.off(`dragend-${DRAG_TYPE.STICK_MOVE}-${id}`, stickend);
      }
    });

    const widgetStyle = computed(() => {
      const { width, height, left, top } = props.metaData;
      return {
        width: width ? width + "px" : "",
        height: height ? height + "px" : "",
        left: left ? left + "px" : "",
        top: top ? top + "px" : "",
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
      return (stick) => {
        const stickStyle = {
          width: `${stickSize / parentScaleX}px`,
          height: `${stickSize / parentScaleY}px`,
        };
        stickStyle[styleMapping.y[stick[0]]] = `${
          stickSize / parentScaleX / -2
        }px`;
        stickStyle[styleMapping.x[stick[1]]] = `${
          stickSize / parentScaleX / -2
        }px`;
        return stickStyle;
      };
    });

    const stickData = computed(() => {
      return (stick) => ({
        id,
        stick,
      });
    });

    return {
      widgetRef,
      widgetStyle,
      stickStyle,
      stickData,
      mousedown,
      DRAG_TYPE,
    };
  },
};
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

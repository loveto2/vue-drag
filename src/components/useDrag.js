import mitt from "mitt";

export const emitter = mitt();
export const map = new Map();

export function useDrag() {
  let pendding = false;
  const state = {
    type: null,
    pointerX: null,
    pointerY: null,
    target: null,
    metaData: null,
    dimensionsBeforeMove: {
      pointerX: null,
      pointerY: null,
      pageX: null,
      pageY: null,
      width: null,
      height: null,
      left: null,
      top: null,
    },
  };
  const mousedown = (metaData, type, e) => {
    pendding = true;
    const { left = null, top = null, id = "" } = metaData;
    const { target, pageX: pointerX, pageY: pointerY } = e;
    const { x, y, width, height } = target.getBoundingClientRect();
    state.type = type;
    state.target = target;
    state.metaData = metaData;
    state.dimensionsBeforeMove.left = left;
    state.dimensionsBeforeMove.top = top;
    state.dimensionsBeforeMove.width = width;
    state.dimensionsBeforeMove.height = height;
    state.dimensionsBeforeMove.pageX = x;
    state.dimensionsBeforeMove.pageY = y;
    state.dimensionsBeforeMove.pointerX = pointerX;
    state.dimensionsBeforeMove.pointerY = pointerY;

    const eventName = `dragstart-${type}-${id}`;
    emitter.emit(eventName, state);

    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  };

  const mousemove = (e) => {
    if (pendding) {
      const { pageX: pointerX, pageY: pointerY } = e;
      state.pointerX = pointerX;
      state.pointerY = pointerY;
      const {
        dimensionsBeforeMove,
        type,
        metaData: { id = "" },
      } = state;
      const delta = {
        deltaX: pointerX - dimensionsBeforeMove.pointerX,
        deltaY: pointerY - dimensionsBeforeMove.pointerY,
      };

      const eventName = `dragmove-${type}-${id}`;
      emitter.emit(eventName, {
        state,
        delta,
      });
    }
  };

  const mouseup = (e) => {
    if (pendding) {
      pendding = false;
      const { pageX, pageY } = e;
      state.pageX = pageX;
      state.pageY = pageY;
      const {
        dimensionsBeforeMove,
        type,
        metaData: { id = "" },
      } = state;
      const delta = {
        deltaX: pageX - dimensionsBeforeMove.pageX,
        deltaY: pageY - dimensionsBeforeMove.pageY,
      };

      const eventName = `dragend-${type}-${id}`;
      emitter.emit(eventName, {
        state,
        delta,
      });
    }
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);
  };

  return mousedown;
}

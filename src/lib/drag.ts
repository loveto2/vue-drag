import mitt, { Handler } from "mitt";

const emitter = mitt();

export const on = (type: string, handler: Handler<unknown>) => {
  emitter.on(type, handler);
};

export const off = (type: string, handler?: Handler<unknown>) => {
  emitter.off(type, handler);
};

export const emit = (type: string, data: unknown) => {
  emitter.emit(type, data);
};

const handlers = {
  dragmove: new Set<Function>(),
  dragend: new Set<Function>(),
};

export interface EventHandler {
  dragmove: Function;
  dragend: Function;
}

export const register = (handler: EventHandler) => {
  const { dragmove, dragend } = handlers;
  dragmove.add(handler.dragmove);
  dragend.add(handler.dragend);
};

export const unregister = (handler: EventHandler) => {
  const { dragmove, dragend } = handlers;
  dragmove.delete(handler.dragmove);
  dragend.delete(handler.dragend);
};

// const mousedown = (e: MouseEvent, metaData: MetaData) => {
//   console.log('mousedown', e, metaData)
//   pending = true
//   const { type } = state
//   emitter.emit(`${DragEventType.dragstart}-${type}`, state)
// }
const mousemove = (e: MouseEvent) => {
  const { pageX: pointerX, pageY: pointerY } = e;
  const { dragmove } = handlers;
  for (const handler of dragmove) {
    try {
      handler({
        pointerX,
        pointerY,
      });
    } catch (error) {
      console.error(error);
    }
  }
};
const mouseup = (e: MouseEvent) => {
  const { pageX: pointerX, pageY: pointerY } = e;
  const { dragend } = handlers;
  for (const handler of dragend) {
    try {
      handler({
        pointerX,
        pointerY,
      });
    } catch (error) {
      console.error(error);
    }
  }
};

const init = () => {
  document.addEventListener("mousemove", mousemove);
  document.addEventListener("mouseup", mouseup);
};

let installed = false;

export default {
  install() {
    if (!installed) {
      init();
      installed = true;
    }
  },
};

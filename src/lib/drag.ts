import { MetaData, DragEventType, State, DragType } from './../types/index';
import mitt, { Handler } from 'mitt'

const emitter = mitt()

export const on = (type: string, handler: Handler<unknown>) => {
  emitter.on(type, handler)
}

export const off = (type: string, handler?: Handler<unknown>) => {
  emitter.off(type, handler)
}

export const emit = (type: string) => {
  emitter.emit(type)
}

let installed = false
let pending = false

const state: State = {
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
}

const mousedown = (e: MouseEvent, metaData: MetaData) => {
  console.log('mousedown', e, metaData)
  pending = true
  const { type } = state
  emitter.emit(`${DragEventType.dragstart}-${type}`, state)
}
const mousemove = (e: MouseEvent) => {
  if (pending) {
    console.log('mousemove', e)
    const { type } = state
    emitter.emit(`${DragEventType.dragmove}-${type}`, state)
  }
}
const mouseup = (e: MouseEvent) => {
  if (pending) {
    console.log('mouseup', e)
    const { type } = state
    emitter.emit(`${DragEventType.dragend}-${type}`, state)
    pending = false
  }
}

const init = () => {
  document.addEventListener('mousemove', mousemove)
  document.addEventListener('mouseup', mouseup)
}

export const useDrag = (type: DragType) => {
  state.type = type
  return { mousedown }
}

export default {
  install() {
    if (!installed) {
      init()
      installed = true
    }
  }
}
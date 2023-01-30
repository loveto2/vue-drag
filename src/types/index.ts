export enum DragEventType {
  dragstart = 'dragstart',
  dragmove = 'dragmove',
  dragend = 'dragend',
}

export enum DragType {
  dragdrop = 'dragdrop',
  bodymove = 'bodymove',
  stickmove = 'stickmove',
}

export enum WidgetType {
  canvas = 'canvas',
  container = 'container',
  subContainer = 'subContainer',
  widget = 'widget',
  backgroundWidget = 'backgroundWidget',
}

export interface Container {
  id: string;
  el: HTMLElement;
}

export interface Pointer {
  pointerX: number;
  pointerY: number;
}

export interface MetaData {
  code: string,
  name: string,
  width: number,
  height: number,
  pageX?: number,
  pageY?: number,
  left?: number,
  top?: number,
  widgetType: WidgetType,
  widgetList: MetaData[];
}

export interface State {
  target: HTMLElement,
  shadowNode: HTMLElement | null,
  metaData: MetaData,
  container: Container | null,
  dimensionsBeforeMove: {
    pointerX: number,
    pointerY: number,
    pageX: number,
    pageY: number,
    width: number,
    height: number,
    left: number,
    top: number,
  },
}
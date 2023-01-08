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

export interface MetaData {
  code: string,
  name: string,
  width: number,
  height: number,
  widgetType: WidgetType,
}

export interface State {
  type: DragType | null,
  pointerX: number | null,
  pointerY: number | null,
  target: HTMLElement | null,
  metaData: MetaData | null,
  dimensionsBeforeMove: {
    pointerX: number | null,
    pointerY: number | null,
    pageX: number | null,
    pageY: number | null,
    width: number | null,
    height: number | null,
    left: number | null,
    top: number | null,
  },
}
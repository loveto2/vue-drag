export enum WidgetType {
  canvas = 'canvas',
  container = 'container',
  subContainer = 'subContainer',
  widget = 'widget',
  backgroundWidget = 'backgroundWidget',
}

export interface Rect {
  width: number;
  height: number;
  pageX: number;
  pageY: number;
  left: number;
  top: number;
}

export interface MetaData {
  id: string;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
  left: number;
  top: number;
  parent?: MetaData;
  widgetType: WidgetType,
  children: MetaData[];
}

export const map = new Map<WidgetType, Map<string, MetaData>>()
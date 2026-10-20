export interface LayoutPosition {
  x: number;
  y: number;
  width: number;
  height?: number;
}

export interface LayoutNode<T = unknown> extends LayoutPosition {
  id: string;
  data: T;
}

export interface LayoutEdge<E = unknown> {
  id: string;
  sourceId: string;
  targetId: string;
  data?: E;
}

export interface LayoutResult<N = unknown, E = unknown> {
  nodePositions: Map<string, LayoutNode<N>>;
  edges: E[];
  canvasWidth: number;
  canvasHeight: number;
}

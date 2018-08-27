import * as React from "react";
export interface MultiBarProps {
  data: Array;
  titleMap: Object;
  number: number;
  padding?: [number, number, number, number];
  height?: number;
  style?: React.CSSProperties;
}

export default class MultiBar extends React.Component<MultiBarProps, any> {}

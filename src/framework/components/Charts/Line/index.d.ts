import * as React from "react";

export interface LineProps {
  color?: string;
  height: number;
  data: Array<{
    x: number;
    y: number;
  }>;
}

export default class Line extends React.Component<LineProps, any> {}

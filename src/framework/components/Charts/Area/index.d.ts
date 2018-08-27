import * as React from "react";

export interface AreaProps {
  color?: string;
  height: number;
  data: Array<{
    x: number;
    y: number;
  }>;
}

export default class Area extends React.Component<AreaProps, any> {}

import React from 'react';
import { Chart, Axis, Tooltip, Geom } from 'bizcharts';
import autoHeight from '../autoHeight';
import styles from '../index.less';

@autoHeight()
export default class Line extends React.Component {
  render() {
    const {
      height,
      padding,
      data,
    } = this.props;

    const scale = {
      x: {
        type: 'cat',
      },
      y: {
        min: 0,
      },
    };

    const tooltip = [
      'x*y',
      (x, y) => ({
        name: x,
        value: y,
      }),
    ];

    const chartHeight = height;

    return (
      <div className={styles.chart} style={{ height }} ref={this.handleRoot}>
        <Chart height={chartHeight} data={data} scale={scale} forceFit padding={padding || 'auto'}>
          <Axis name="x" />
          <Axis name="y" />
          <Tooltip crosshairs={{type: 'line'}} />
          <Geom tooltip={tooltip} shape="smooth" type="line" position="x*y" />
          <Geom tooltip={tooltip} shape="smooth" type="point" position="x*y" size={2} />
        </Chart>
      </div>
    );
  }
}

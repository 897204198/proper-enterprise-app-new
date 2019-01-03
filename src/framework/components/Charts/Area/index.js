import React from 'react';
import { Chart, Axis, Tooltip, Geom } from 'bizcharts';
import autoHeight from '../autoHeight';
import styles from '../index.less';

@autoHeight()
export default class Area extends React.Component {
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
          <Axis
            name="y"
            label={{
            formatter: (val) => {
              return `${(val / 1000).toFixed(1)}k`;
            }}}
          />
          <Tooltip crosshairs={{type: 'line'}} />
          <Geom tooltip={tooltip} shape="smooth" type="area" position="x*y" />
          <Geom tooltip={tooltip} shape="smooth" type="line" position="x*y" size={2} />
        </Chart>
      </div>
    );
  }
}

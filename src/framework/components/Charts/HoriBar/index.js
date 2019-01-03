import React from 'react';
import { Chart, Tooltip, Geom, Legend, Axis } from 'bizcharts';
import DataSet from '@antv/data-set';
import autoHeight from '../autoHeight';
import styles from '../index.less';

@autoHeight()
export default class HoriBar extends React.Component {
  render() {
    const {
      height = 400,
      padding,
      titleMap = {
        y1: 'y1',
        y2: 'y2',
      },
      data = [
        {
          x: 0,
          y1: 0,
          y2: 0,
        },
      ],
    } = this.props;

    data.sort((a, b) => a.x - b.x);

    const ds = new DataSet();

    const dv = ds.createView();
    dv
      .source(data)
      .transform({
        type: 'map',
        callback(row) {
          const newRow = { ...row };
          newRow[titleMap.y1] = row.y1;
          newRow[titleMap.y2] = row.y2;
          return newRow;
        },
      })
      .transform({
        type: 'fold',
        fields: [titleMap.y1, titleMap.y2], // 展开字段集
        key: 'key', // key字段
        value: 'value', // value字段
      });

    return (
      <div className={styles.chart} style={{ height }}>
        <div>
          <Chart
            height={height}
            padding={padding || 'auto'}
            data={dv}
            forceFit
          >
            <Axis name="x" />
            <Tooltip />
            <Legend name="key" position="top" />
            <Geom
              type="interval"
              position="x*value"
              color={['key', ['#108ee9', '#2fc25b']]}
              adjust={[{ type: 'dodge', marginRatio: 1 / 24 }]} />
          </Chart>
        </div>
      </div>
    );
  }
}
import React from 'react';
import { Chart, Tooltip, Geom, Legend, Axis } from 'bizcharts';
import DataSet from '@antv/data-set';
import autoHeight from '../autoHeight';
import styles from '../index.less';

@autoHeight()
export default class MultiBar extends React.Component {
  render() {
    const {
      height = 400,
      padding,
      titleMap,
      data,
      number
    } = this.props;

    data.sort((a, b) => a.x - b.x);

    const fieldsArray = [];
    for (let i = 1; i <= number; i++) {
      fieldsArray.push(titleMap[`y${i}`]);
    }

    const ds = new DataSet();

    const dv = ds.createView();
    dv
      .source(data)
      .transform({
        type: 'map',
        callback(row) {
          const newRow = { ...row };
          for (let i = 1; i <= number; i++) {
            newRow[titleMap[`y${i}`]] = row[`y${i}`];
          }
          return newRow;
        },
      })
      .transform({
        type: 'fold',
        fields: fieldsArray, // 展开字段集
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
              color={['key', ['#108ee9', '#2fc25b', '#f4333c']]}
              adjust={[{ type: 'dodge', marginRatio: 1 / 24 }]} />
          </Chart>
        </div>
      </div>
    );
  }
}

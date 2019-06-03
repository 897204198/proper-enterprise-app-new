import React, { PureComponent } from 'react';
import { Collapse } from 'antd';
import styles from './index.less';

const { Panel } = Collapse;

export default class OopCollapse extends PureComponent {
  state = {
  }
  componentDidMount() {
  }
  renderPanels = (arr) => {
    return arr.map((panel) => {
      const { header, content, key, ...params } = panel
      return (
        <Panel header={header} key={key} {...params}>
          {content}
        </Panel>
      );
    });
  }
  render() {
    const { horizontal = false, defaultActiveKey, panelList, onChange, ...params } = this.props
    const defaultKey = Array.isArray(defaultActiveKey) && defaultActiveKey.length ? defaultActiveKey : null
    return (
      <div className={horizontal ? styles.OopCollapse : ''}>
        <div className="OopcollapseWrapper">
          <Collapse defaultActiveKey={defaultKey} onChange={onChange} {...params}>
            {
              this.renderPanels(panelList)
            }
          </Collapse>
        </div>
      </div>
    )
  }
}
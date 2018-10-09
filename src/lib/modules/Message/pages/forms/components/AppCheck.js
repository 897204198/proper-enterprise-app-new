import React from 'react';
import { Checkbox } from 'antd';

export default class AppCheck extends React.Component {
  render() {
    const { headerName, checkChange, name, checked } = this.props
    const onChange = (e) => {
      checkChange(name, e.target.checked)
    }
    return (
          <Checkbox
            checked={checked}
            onChange={onChange}
          >
            {headerName}
          </Checkbox>
    );
  }
}
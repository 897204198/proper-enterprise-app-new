import React, {Fragment} from 'react';
import {Card} from 'antd';
import UIDocDetails from './UIDocDetails';
import UIDocDemoCode from './UIDocDemoCode';

export default class UIDocument extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  componentDidMount() {
  }

  render() {
    const {name, option = []} = this.props;
    return (
      <Fragment>
        <Card title="代码演示">
          {
            option.map(it=>(
              <UIDocDemoCode key={it.fileName} name={name} fileName={it.fileName} component={it.component} title={it.title} desc={it.desc} width={it.width} />
            ))
          }
        </Card>
        <Card title="详细介绍" style={{marginTop: 24}}>
          <UIDocDetails name={name} />
        </Card>
      </Fragment>)
  }
}

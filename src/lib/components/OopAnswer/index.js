import React from 'react';
import { Input, Button, Avatar, Form } from 'antd';
import styles from './index.less';

const { TextArea } = Input;

@Form.create()
export default class OopAnswer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  sendMes = (fn) => {
    fn(this.props.form.getFieldValue('mesCon'))
    this.props.form.setFieldsValue({
      mesCon: ''
    })
  }
  render() {
    const { mesArray, width, height, sendMes } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.messageWrap} style={{width}}>
        <div className={styles.messageBox} style={{height}}>
        {
          mesArray.map((item) => {
            return (
              <div className={`${styles.message} ${item.owner ? styles.messageRight : styles.messageLeft}`} key={item.id}>
                <div className={styles.userImg}>
                {
                  item.owner ? <Avatar icon="user" style={{ backgroundColor: '#387ef5' }} /> : <Avatar icon="user" />
                }
                </div>
                <div className={styles.msgDetail}>
                  <div className={styles.msgInfo}>
                    <p>{item.name}&nbsp;{item.time}</p>
                  </div>
                  <div className={styles.msgContent}>
                    <p className={styles.lineBreaker}>{item.mes}</p>
                  </div>
                </div>
              </div>
            )
          })
        }
        </div>
        <div className={styles.sendWrap}>
          <div className={styles.inputBox}>
          {
            getFieldDecorator('mesCon')(<TextArea placeholder="请输入..." autosize={{ minRows: 1}} />)
          }
          </div>
          <div className={styles.buttonBox}>
            <Button onClick={() => { this.sendMes(sendMes) }}>发送</Button>
          </div>
        </div>
      </div>
    )
  }
}
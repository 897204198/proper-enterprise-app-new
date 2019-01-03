import React, { PureComponent } from 'react';
import styles from './index.less';

export default class OopText extends PureComponent {
  render() {
    const { text } = this.props;
    return (
      <div className={styles.container}>
        <div
          className={styles.editBox}
          dangerouslySetInnerHTML={{__html: text}}
        />
      </div>
    )
  }
}

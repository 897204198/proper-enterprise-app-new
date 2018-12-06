import React from 'react';
import Netdisk from '../index'

export default class PublicDisk extends React.PureComponent {
  render() {
    return <Netdisk owner="public" />
  }
}
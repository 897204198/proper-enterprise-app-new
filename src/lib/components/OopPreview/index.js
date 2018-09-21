import React, { PureComponent, Fragment } from 'react';
import { Modal, Tooltip, Icon } from 'antd';
import { isApp } from '../../../framework/utils/utils';

import styles from './index.less';

export default class OopPreview extends PureComponent {
  state = {
    scales: 1,
    degs: 0,
    horWidth: 0,
    verWidth: 0
  }

  componentDidMount() {
    if (isApp()) {
      this.getNaturalSize2();
    } else {
      this.getNaturalSize();
    }
  }

  // 初始化图片
  getNaturalSize = () => {
    const { innerWith, innerHeight } = window;
    const image = new Image();
    image.src = this.props.img.src;
    const naturalWidth = image.width;
    const naturalHeight = image.height;
    const maxWith = this.props.img.maxWith ? this.props.img.maxWith : innerWith;
    let horWidth = naturalWidth > maxWith ? maxWith : naturalWidth;
    let horHeight = (horWidth / naturalWidth) * naturalHeight;
    if (horHeight > (innerHeight - 100)) {
      const width = ((innerHeight - 100) / horHeight) * horWidth;
      horWidth = width;
      horHeight = (horWidth / naturalWidth) * naturalHeight;
    }
    const verWidth = horWidth > horHeight ? horHeight : (horWidth / naturalHeight) * naturalWidth;
    this.setState({
      horWidth,
      verWidth
    }, () => {
      const img = document.getElementById('image');
      const modalBody = img.offsetParent;
      const modalContent = modalBody.offsetParent;
      const modalWrap = modalContent.offsetParent;
      const wrap = modalWrap.offsetParent;
      wrap.style.display = 'flex';
      wrap.style.justifyContent = 'center';
      wrap.style.alignItems = 'center';
      modalWrap.style.width = `${horWidth}px`;
      modalWrap.style.minWidth = '330px';
      modalWrap.style.maxWidth = `${innerWith}px`;
      modalContent.style.width = `${horWidth}px`;
      modalContent.style.minWidth = '330px';
      modalBody.style.height = `${horHeight}px`;
      modalBody.style.maxHeight = `${innerHeight - 100}px`;
      modalBody.style.minHeight = '200px';
    });
  }

  // 初始化图片2
  getNaturalSize2 = () => {
    const { innerWith, innerHeight } = window;
    const image = new Image();
    image.src = this.props.img.src;
    const naturalWidth = image.width;
    const naturalHeight = image.height;
    const maxWith = this.props.img.maxWith ? this.props.img.maxWith : innerWith;
    let horWidth = naturalWidth > maxWith ? maxWith : naturalWidth;
    let horHeight = (horWidth / naturalWidth) * naturalHeight;
    if (horHeight > (innerHeight - 100)) {
      const width = ((innerHeight - 100) / horHeight) * horWidth;
      horWidth = width;
      horHeight = (horWidth / naturalWidth) * naturalHeight;
    }
    const verWidth = horWidth > horHeight ? horHeight : (horWidth / naturalHeight) * naturalWidth;
    this.setState({
      horWidth,
      verWidth
    }, () => {
      const wrap = document.getElementsByClassName('ant-modal-wrap')[0];
      const modalContent = document.getElementsByClassName('ant-modal-content')[0];
      const modalWrap = modalContent.offsetParent;
      const modalBody = document.getElementsByClassName('ant-modal-body')[0];
      wrap.style.display = 'flex';
      wrap.style.justifyContent = 'center';
      wrap.style.alignItems = 'center';
      wrap.style.zIndex = 2000;
      modalWrap.style.width = `${horWidth}px`;
      modalWrap.style.minWidth = '330px';
      modalWrap.style.maxWidth = `${innerWith}px`;
      // modalContent.style.width = `${horWidth}px`;
      modalContent.style.minWidth = '330px';
      modalBody.style.height = `${horHeight}px`;
      modalBody.style.maxHeight = `${innerHeight - 100}px`;
      modalBody.style.minHeight = '200px';
    });
  }
  // 图片缩放
  scale = (flag) => {
    const { maxScale = 3, minScale = 0.1 } = this.props;
    const { scales } = this.state;
    const inScale = Number(scales.toFixed(1));
    if (flag) {
      const scale = inScale < maxScale ? (scales + 0.1) : maxScale;
      this.setState({
        scales: scale
      });
    } else {
      const scale = inScale > minScale ? (scales - 0.1) : minScale;
      this.setState({
        scales: scale
      });
    }
  }

  // 图片旋转
  rotate = (flag) => {
    const img = document.getElementById('image');
    const { degs } = this.state;
    if (flag) {
      this.setState({
        degs: degs > 0 ? (degs - 90) : 270,
        scales: 1
      }, () => {
        img.style.left = '50%';
        img.style.top = '50%';
      });
    } else {
      this.setState({
        degs: degs < 270 ? (degs + 90) : 0,
        scales: 1
      }, () => {
        img.style.left = '50%';
        img.style.top = '50%';
      });
    }
  }

  // 下载图片
  download = () => {
    const { img: {src, filename = 'pic'}} = this.props;
    let imgData = '';
    let img = document.createElement('img');
    img.setAttribute('crossOrigin', 'Anonymous');
    img.onload = () => {
      imgData = this.getBase64Image(img);
      let a = document.createElement('a');
      a.href = imgData;
      a.download = filename;
      a.click();
      a = null;
      img = null;
    }
    img.src = src;
  }

  // 图片转base64
  getBase64Image = (img) =>{
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const dataURL = canvas.toDataURL('image/png');
    canvas = null;
    return dataURL;
  }

  // 拖拽图片
  mouseDown = (e) => {
    e.preventDefault();
    if (e.button === 0) {
      const img = document.getElementById('image');
      const modalBody = img.offsetParent;
      const disX = e.clientX - img.offsetLeft;
      const disY = e.clientY - img.offsetTop;
      const { scales } = this.state;
      if (scales > 1) {
        document.body.style.cursor = 'move';
        modalBody.onmousemove = (event) => {
          const x = event.clientX - disX;
          const y = event.clientY - disY;
          img.style.left = `${x}px`;
          img.style.top = `${y}px`;
        }
        document.onmouseup = () => {
          modalBody.onmousemove = null;
          document.onmouseup = null;
          document.body.style.cursor = 'default';
        }
      }
    }
  }
  onTouchMove = (e) => {
    const img = document.getElementById('image');
    const modalBody = document.getElementsByClassName('ant-modal-body')[0];
    const disX = e.changedTouches[0].clientX - img.offsetLeft;
    const disY = e.changedTouches[0].clientY - img.offsetTop;
    modalBody.ontouchmove = (event) => {
      const x = event.changedTouches[0].clientX - disX;
      const y = event.changedTouches[0].clientY - disY;
      img.style.left = `${x}px`;
      img.style.top = `${y}px`;
    }
    document.ontouchend = () => {
      modalBody.ontouchmove = null;
      document.ontouchend = null;
    }
  }

  render() {
    const { img } = this.props;
    const { scales, degs, horWidth, verWidth } = this.state;
    const index = degs / 90;
    const Footer = (
      <Fragment>
        <a onClick={() => this.scale(true)}>
          <Tooltip title="放大">
            <Icon type="plus-circle-o" style={{ fontSize: 24, color: '#999' }} />
          </Tooltip>
        </a>
        <a onClick={() => this.scale(false)}>
          <Tooltip title="缩小">
            <Icon type="minus-circle-o" style={{ fontSize: 24, color: '#999' }} />
          </Tooltip>
        </a>
        <a
          style={{transform: 'rotateY(180deg)'}}
          onClick={() => this.rotate(1)}>
          <Tooltip title="逆时针旋转">
            <Icon type="reload" style={{ fontSize: 24, color: '#999' }} />
          </Tooltip>
        </a>
        <a
          style={{}}
          onClick={() => this.rotate(0)}>
          <Tooltip title="顺时针旋转">
            <Icon type="reload" style={{ fontSize: 24, color: '#999' }} />
          </Tooltip>
        </a>
        <a onClick={this.download}>
          <Tooltip title="另存为">
            <Icon type="download" style={{ fontSize: 24, color: '#999' }} />
          </Tooltip>
        </a>
      </Fragment>
    );
    return (
      <Modal
        className={styles.OopPreview}
        maskClosable={false}
        footer={Footer}
        title="."
        {...this.props}
      >
        <img
          id="image"
          onMouseDown={e => this.mouseDown(e)}
          onTouchMove={e => this.onTouchMove(e)}
          style={{
            width: isApp ? '100%' : `${index % 2 === 1 ? verWidth : horWidth}px`,
            transform: `translate(-50%, -50%) scale(${scales}, ${scales}) rotate(${this.state.degs}deg)`,
            cursor: `${scales > 1 ? 'move' : 'default'}`
          }}
          alt={img.alt}
          src={img.src}
        />
      </Modal>
    )
  }
}

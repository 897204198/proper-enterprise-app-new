import React, { PureComponent } from 'react';
import { Modal, Tooltip, Button, Icon } from 'antd';
import pinchZoom from 'pinch-zoom-proper';
import { isApp } from '@framework/utils/utils';
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
      // this.getNaturalSize();
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
      const img = this.image;
      const modalBody = img.offsetParent;
      const modalContent = modalBody.offsetParent;
      const modalWrap = modalContent.offsetParent;
      const wrap = modalWrap.offsetParent;
      wrap.style.display = 'flex';
      wrap.style.justifyContent = 'center';
      wrap.style.alignItems = 'center';
    });
  }

  // 初始化图片2
  getNaturalSize2 = () => {
    const { innerWith, innerHeight } = window;
    const image = new Image();
    image.src = this.props.img.src;
    image.onload = ()=>{
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
      });
    }
  }
  // 图片缩放
  scale = (flag) => {
    const { maxScale = 3, minScale = 0.2 } = this.props;
    const { scales } = this.state;
    const inScale = Number(scales.toFixed(1));
    if (flag) {
      const scale = inScale < maxScale ? (scales + 0.2) : maxScale;
      this.setState({
        scales: scale
      });
    } else {
      const scale = inScale > minScale ? (scales - 0.2) : minScale;
      this.setState({
        scales: scale
      });
    }
  }

  // 图片旋转
  rotate = (flag) => {
    const img = this.image;
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

  // 双指放大
  onImgLoaded = ()=>{
    const { degs, horWidth, verWidth } = this.state;
    const index = degs / 90;
    const width = isApp() ? '100%' : `${index % 2 === 1 ? verWidth : horWidth}px`;
    if (width !== '0px') {
      this.image.style.width = width;
    }
    new pinchZoom(this.image.parentNode, {}); // eslint-disable-line
  }
  // 拖拽图片
  mouseDown = (e) => {
    e.preventDefault();
    if (e.button === 0) {
      const img = this.image;
      const imgParent = img.parentNode;
      const disX = e.clientX - img.offsetLeft;
      const disY = e.clientY - img.offsetTop;
      imgParent.onmousemove = (event) => {
        const x = event.clientX - disX;
        const y = event.clientY - disY;
        img.style.left = `${x}px`;
        img.style.top = `${y}px`;
      }
      document.onmouseup = () => {
        imgParent.onmousemove = null;
        document.onmouseup = null;
        document.body.style.cursor = 'default';
      }
    }
  }
  render() {
    const { img } = this.props;
    const { scales } = this.state;
    const Footer = (
      <div className={styles.footerButtons}>
        <Button onClick={() => this.scale(true)}>
          <Tooltip title="放大">
            <Icon type="plus-circle-o" style={{ fontSize: 24, color: '#999' }} />
          </Tooltip>
        </Button>
        <Button onClick={() => this.scale(false)}>
          <Tooltip title="缩小">
            <Icon type="minus-circle-o" style={{ fontSize: 24, color: '#999' }} />
          </Tooltip>
        </Button>
        <Button
          style={{transform: 'rotateY(180deg)'}}
          onClick={() => this.rotate(1)}>
          <Tooltip title="逆时针旋转">
            <Icon type="reload" style={{ fontSize: 24, color: '#999' }} />
          </Tooltip>
        </Button>
        <Button
          style={{}}
          onClick={() => this.rotate(0)}>
          <Tooltip title="顺时针旋转">
            <Icon type="reload" style={{ fontSize: 24, color: '#999' }} />
          </Tooltip>
        </Button>
        <Button onClick={this.download}>
          <Tooltip title="另存为">
            <Icon type="download" style={{ fontSize: 24, color: '#999' }} />
          </Tooltip>
        </Button>
      </div>
    );
    return (
      <Modal
        className={styles.OopPreview}
        width={800}
        maskClosable={false}
        footer={Footer}
        {...this.props}
      >
        <div className={styles.imageParent}>
          <img
            ref={(el)=>{ this.image = el }}
            onMouseDown={e => this.mouseDown(e)}
            onLoad={e => this.onImgLoaded(e)}
            style={{
              // width: isApp() ? '100%' : `${index % 2 === 1 ? verWidth : horWidth}px`,
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `translate(-50%, -50%) scale(${scales}, ${scales}) rotate(${this.state.degs}deg)`,
              cursor: `${scales !== 1 ? 'move' : 'default'}`
            }}
            alt={img.alt}
            src={img.src}
          />
        </div>
      </Modal>
    )
  }
}

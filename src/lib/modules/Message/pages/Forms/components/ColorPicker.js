import React from 'react'
import reactCSS from 'reactcss'
import { SketchPicker } from 'react-color'
import icon from '../../../assets/color-icon@36x18.png'

// const primaryColor = require('@/config/theme.js')['primary-color']

export default class ColorPicker extends React.Component {
  state = {
    displayColorPicker: false,
    // defaultColor: primaryColor || '#1890ff',
    defaultColor: ''
  };

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  };

  handleChange = (color) => {
    this.setState({ defaultColor: color.hex })
    this.props.colorChange({ color })
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.color && this.props.color !== nextProps.color) {
      this.setState({ defaultColor: nextProps.color })
    }
  }
  render() {
    const { defaultColor } = this.state
    const styles = reactCSS({
      default: {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: defaultColor,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
          verticalAlign: 'middle'
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
          top: '-360px'
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    return (
      <div style={{display: 'inline-block'}}>
        {
          defaultColor ?
          (
            <div style={ styles.swatch } onClick={ this.handleClick }>
              <div style={ styles.color } />
            </div>
          ) :
          (
            <div>
              <img src={icon} alt="选择颜色" onClick={ this.handleClick } style={{cursor: 'pointer'}} />
            </div>
          )
        }
        {
          this.state.displayColorPicker ? (
            <div style={ styles.popover }>
                <div style={ styles.cover } onClick={ this.handleClose } />
                <SketchPicker color={ this.state.defaultColor } onChange={ this.handleChange } />
            </div>
          ) : null
        }

      </div>
    )
  }
}


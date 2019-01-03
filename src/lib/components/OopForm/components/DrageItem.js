import React, { Component } from 'react';
import {DragSource, DropTarget} from 'react-dnd';
import {findDOMNode} from 'react-dom';

/**
 * Implements the drag source contract.
 */
const cardSource = {
  beginDrag(props) {
    const {text, id, index} = props
    return {
      text,
      id,
      index
    };
  }
};
const cardTarget = {
  hover(props, monitor, component) {
    const item = monitor.getItem()
    const dragIndex = item.index
    const hoverIndex = props.index
    const { moveCard } = props;
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

    // Determine mouse position
    const clientOffset = monitor.getClientOffset()

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }

    // Time to actually perform the action
    moveCard(dragIndex, hoverIndex)

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    item.index = hoverIndex
  }
}


@DropTarget('formItem', cardTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))
@DragSource('formItem', cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
export default class DrageItem extends Component {
  render() {
    const { isDragging, connectDragSource, connectDropTarget, component, style } = this.props;
    return connectDragSource(
      connectDropTarget(<div style={{...style, opacity: isDragging ? 0 : 1 }}>
        {component}
      </div>)
    );
  }
}

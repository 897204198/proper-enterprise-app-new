import React from 'react';
import { Card, Icon, Button, Row, Popconfirm, Spin, Popover} from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import OopForm from '@pea/components/OopForm';
import { makeTableCfgConfig } from '../utils';

const primaryColor = require('@/config/theme.js')['primary-color']

const addColBtnStyle = {
  fontSize: '22px',
  verticalAlign: '-webkit-baseline-middle',
  color: primaryColor
}
const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  ...draggableStyle
});
const getListStyle = isDraggingOver => ({
  border: '2px dashed transparent',
  borderColor: isDraggingOver ? '#ddd' : 'transparent',
  padding: '5px 10px',
  minHeight: '42px',
  display: 'flex'
});

export const ColumnsEdit = (props) => {
  const { loading, self, curTableRecord, showCols, hideCols, curCol, dragging, onSubmit, onSelect, onRemove, onDragStart, onDragEnd, addTableCol } = props
  return (
    <div>
      <Spin spinning={loading}>
        <Row gutter={16}>
          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="colLine" style={{marginBottom: '10px'}}>
              <div style={{padding: '5px 10px', width: '80px', lineHeight: '2.3'}}>显示列:</div>
              <div className={`${dragging ? 'dragging' : ''}`}>
                <Droppable droppableId="show" direction="horizontal">
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                        {showCols.map((item, index) => (
                            <Draggable
                                key={item.dataIndex}
                                draggableId={item.dataIndex}
                                index={index}
                                >
                                {/* eslint-disable-next-line */}
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={()=>onSelect(item)}
                                    className={`colItem ${curCol === item.dataIndex ? 'active' : ''}`}
                                    style={getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style
                                  )}>{`${index + 1} ${item.title}`}</div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
              <div style={{padding: '5px 10px', lineHeight: '2'}}><Popover content="新建列"><Icon type="plus-circle" style={{...addColBtnStyle}} onClick={addTableCol} /></Popover></div>
            </div>
            <div className="colLine">
              <div style={{padding: '5px 10px', width: '80px', lineHeight: '2.3'}}>不显示列:</div>
              <div className={`${dragging ? 'dragging' : ''}`}>
                <Droppable droppableId="hide" direction="horizontal">
                    {(provided, snapshot) => (
                        <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                            {hideCols.map((item, index) => (
                                <Draggable
                                    key={item.dataIndex}
                                    draggableId={item.dataIndex}
                                    index={index}
                                    >
                                    {/* eslint-disable-next-line */}
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={()=>onSelect(item)}
                                        className={`colItem ${curCol === item.dataIndex ? 'active' : ''} hideCol`}
                                        style={getItemStyle(
                                          snapshot.isDragging,
                                          provided.draggableProps.style
                                      )}>{item.title}</div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
              </div>
            </div>
          </DragDropContext>
          <Card title="列信息编辑" bordered={false}>
            <OopForm {...makeTableCfgConfig(curTableRecord)} ref={(el)=>{ self.oopTableCfgForm = el && el.getWrappedInstance() }} defaultValue={curTableRecord} />
            <div style={{textAlign: 'right', paddingRight: '5%'}}>
              <Button type="primary" onClick={onSubmit} style={{marginLeft: '20%'}}>保存</Button>
              <Popconfirm
                title="确认删除？"
                onConfirm={() => onRemove(curTableRecord._id)}>
                <Button type="danger" style={{marginLeft: '10px'}}>删除</Button>
              </Popconfirm>
            </div>
          </Card>
        </Row>
      </Spin>
    </div>
  )
}

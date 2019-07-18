import React from 'react';
import { Card, Icon, Button, Row, Popconfirm, Spin, Popover} from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import OopForm from '@pea/components/OopForm';

const addColBtnStyle = {
  fontSize: '22px',
  verticalAlign: '-webkit-baseline-middle',
  color: '#1890ff'
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
const makeTableCfgConfig = (formEntity) => {
  return {
    columnsNum: 2,
    formLayoutConfig: {
      labelCol: {
        xs: {span: 24},
        sm: {span: 4},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 18},
      },
    },
    formJson: [
      {
        name: '_id',
        component: {
          name: 'Input',
          props: {type: 'hidden'}
        },
        wrapper: true
      },
      {
        name: 'syncTag',
        component: {
          name: 'Input',
          props: {
            type: 'hidden',
          }
        },
        wrapper: true
      },
      {
        label: '列名',
        key: 'title',
        name: 'title',
        component: {
          name: 'Input',
          props: {
            placeholder: '请输入列名',
          }
        },
        initialValue: formEntity.title || '',
        rules: [{
          required: true,
          message: '此项为必填项'
        }]
      },
      {
        label: '字段名',
        key: 'dataIndex',
        name: 'dataIndex',
        component: {
          name: 'Input',
          props: {
            placeholder: '请输入字段名'
          }
        },
        initialValue: formEntity.dataIndex || '',
        rules: [{
          required: true,
          message: '此项为必填项'
        }]
      },
      {
        label: '列宽',
        key: 'width',
        name: 'width',
        component: {
          name: 'InputNumber',
          props: {
            placeholder: '请输入字段名',
          }
        },
        initialValue: formEntity.width || '',
        rules: [{
          required: false,
          message: '此项为必填项'
        }],
        subscribe: [{
          name: 'hover',
          publish: [{
            value(chanageValue) {
              return chanageValue === true
            },
            property: 'rules[0].required'
          }]
        }],
      },
      {
        label: '排序',
        key: 'sorter',
        name: 'sorter',
        component: {
          name: 'RadioGroup',
          children: [{
            label: '否',
            value: false
          }, {
            label: '是',
            value: true
          }, {
            label: '自定义',
            value: 'custom'
          }],
        },
        initialValue: formEntity.sorter || false,
      },
      // {
      //   label: '筛选',
      //   key: 'filter',
      //   name: 'filter',
      //   component: {
      //     name: 'TextArea',
      //     props: {
      //       placeholder: '请输入筛选规则',
      //       autosize: true
      //     }
      //   },
      //   initialValue: formEntity.filter || '',
      // },
      {
        label: '自定义渲染',
        key: 'render',
        name: 'render',
        component: {
          name: 'TextArea',
          props: {
            placeholder: '例：(text) => {return <span style={{color: "red"}}>{text}</span>}',
            autosize: true
          }
        },
        initialValue: formEntity.render || '',
      },
      {
        label: '排序规则',
        key: 'sorterRule',
        name: 'sorterRule',
        component: {
          name: 'TextArea',
          props: {
            placeholder: '例：(a, b) => { return a - b }',
            autosize: true
          }
        },
        rules: [{
          required: true,
          message: '请输入排序规则'
        }],
        initialValue: formEntity.sorterRule || '',
        subscribe: [{
          name: 'sorter',
          publish: [{
            value(chanageValue) {
              return chanageValue === 'custom'
            },
            property: 'display'
          }]
        }],
      },
      {
        label: '鼠标悬停提示',
        key: 'hover',
        name: 'hover',
        component: {
          name: 'RadioGroup',
          children: [{
            label: '关闭',
            value: false
          }, {
            label: '开启',
            value: true
          }],
        },
        initialValue: formEntity.hover || false,
      },
    ]
  }
}
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

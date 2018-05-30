import React, { Component, Fragment } from 'react'
import moment from 'moment'
import { observer, Observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import { Modal, Tag, Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Table, InputNumber, DatePicker, Radio, message, Badge, Upload, Checkbox, Cascader } from 'antd'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout'
import FooterToolbar from 'Components/FooterToolbar'
import { getProvince } from 'Util/province'
import './style.less'
import EditStore from './store'
const CheckboxGroup = Checkbox.Group
const Search = Input.Search
const FormItem = Form.Item
const { Option } = Select
const { TextArea } = Input
const dateFormat = 'YYYY-MM-DD HH:mm'
let editStore
@Form.create()
@observer
export default class EditNotice extends Component {
  componentWillMount() {
    let { params } = this.props.match
    editStore = new EditStore()
    editStore.fetchData({ id: params.id })
    editStore.fetchCityList()
    editStore.fetchProject()
    editStore.fetchBidInfoList()
  }

  async componentDidMount() {}

  editNotice = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.id = this.props.match.params.id
        values.endTime = moment(values.endTime).format('YYYY-MM-DD HH:mm')
        if (editStore.currentBidInfo) { values.fileReviewId = editStore.currentBidInfo.id }
        editStore.editNotice(values, this.props.history)
      }
    })
  }
  suffixLen = (field, max) => {
    console.log(this.props.form.getFieldsValue())
    return <span style={{ color: '#00000073' }}>{(this.props.form.getFieldsValue()[field] || '').length}/{max}</span>
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const columns = [
      {
        title: '序号',
        dataIndex: 'id',
      },
      {
        title: '文档名称',
        dataIndex: 'fileName'
      },
      {
        title: '对外显示的文档名称',
        dataIndex: 'fileOutName',
        render: (text, record, index) => {
          return <Observer>{() =>
            <Form.Item>
              {getFieldDecorator('file' + record.id, {
                rules: [{ max: 40, message: '不能超过40字' }],
                initialValue: text,
              })(<Input />)
              }
            </Form.Item>
          }
          </Observer>
        },
      },
      {
        title: '显示',
        dataIndex: 'isDisplay',
        className: 'table-center',
        render: (text, record, index) => {
          return <Observer>{() => <Checkbox onChange={(event) => editStore.changeCheckbox(record)} checked={text === 0} />}</Observer>
        },
      },
      {
        title: '操作',
        render: (text, record, index) => (
          <a onClick={(event) => editStore.removeFlie(record)}> 删除</a>
        ),
      },
    ]
    const uploadButton = (
      <div>
        <Icon type={editStore.Uploading ? 'loading' : 'plus'} />
        <div className='ant-upload-text'>图片上传</div>
      </div>
    )
    let bidInfoColumns = [
      {
        title: '序号',
        dataIndex: 'id',
      },
      {
        title: '招标文件名称',
        dataIndex: 'name',
        width: 150
      },
      {
        title: '项目名称',
        dataIndex: 'projectName',
        width: 150
      },
      {
        title: '所属小镇',
        dataIndex: 'townName',
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text, record, index) => {
          let str = ''
          switch (text) {
            case 0:
              str = '未发起'
              break
            case 1:
              str = '审批中'
              break
            case 2:
              str = '审批通过'
              break
            case 3:
              str = '终止审批'
              break
          }
          return str
        },
      },
      {
        title: '操作',
        render: (text, record, index) => (
          <a onClick={() => editStore.lineFlie(record)}> 关联</a>
        ),
      },
    ]
    const fileModal = (
      <Modal
        title='选择招标文件'
        visible={editStore.modalVisible}
        onCancel={editStore.closeModal}
        // bodyStyle={{ padding: 0 }}
        width={800}
        footer={null}
      >
        <Table
          loading={editStore.loading}
          dataSource={editStore.bidInfoList}
          columns={bidInfoColumns}
          onChange={editStore.handleBidFileTableChange}
          pagination={{
            pageSize: editStore.bidFilePageInfo.pageSize,
            total: editStore.bidFilePageInfo.records,
            showTotal: total => `共 ${total} 条数据`,
            defaultPageSize: 10,
          }}
        />
      </Modal>
    )
    let initData = editStore.detailData
    return (
      <div className='edit-notice'>
        <PageHeaderLayout title='编辑公告'>
          <Card title='项目概况' className='card' bordered={false}>
            <Form layout='vertical'>
              <Row gutter={16}>
                <Col lg={6} md={12} sm={24}>
                  <Form.Item label='公告名称'>
                    {getFieldDecorator('noticeName', {
                      rules: [{ required: true, message: '请输入公告名称' }, { max: 40, message: '不能超过40字' }],
                      initialValue: initData.noticeName
                    })(<Input placeholder='请输入公告名称' />)}
                  </Form.Item>
                </Col>
                <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                  <Form.Item label='报名截止时间'>
                    {getFieldDecorator('endTime', {
                      rules: [{ required: true, message: '请选择' }],
                      initialValue: moment(initData.endTime)
                    })(
                      <DatePicker format={dateFormat} showTime={{ defaultValue: moment('00:00:00', 'HH:mm') }} placeholder='报名截止时间' style={{ width: '100%' }} />
                    )}
                  </Form.Item>
                </Col>
                <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
                  <Form.Item label='招标类型'>
                    {getFieldDecorator('bidType', {
                      rules: [{ required: true, message: '请选择招标类型' }],
                      initialValue: initData.bidType
                    })(
                      <Select placeholder='招标类型'>
                        {(editStore.biddingType || []).map((item, index) => <Option key={item.id} value={item.id}>{item.name}</Option>)}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col lg={6} md={12} sm={24}>
                  <Form.Item label='所属小镇'>
                    {getFieldDecorator('townId', {
                      initialValue: initData.townId * 1 || ''
                    })(
                      <Select
                        // mode='tags'
                        style={{ width: '100%' }}
                        showSearch
                        allowClear
                        placeholder='请选择所属小镇'
                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      >
                        {(editStore.projectList || []).map((item) => <Option key={item.id} value={item.id}>{item.proName}</Option>)}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                  <Form.Item label='所在城市'>
                    {getFieldDecorator('city', {
                      rules: [{ required: true, message: '请选择所在城市' }],
                      initialValue: [getProvince(editStore.cityList, initData.city), initData.city]
                    })(
                      <Cascader options={editStore.cityList} onChange={() => {}} placeholder='请选择所在城市' />
                    )}
                  </Form.Item>
                </Col>
                <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
                  <Form.Item label='业务类型'>
                    {getFieldDecorator('businessType', {
                      rules: [{ required: true, message: '请选择业务类型' }],
                      initialValue: initData.businessType
                    })(
                      <Select placeholder='请选择业务类型'>
                        {editStore.businessType.map((item, index) => <Option key={index} value={item.id}>{item.name}</Option>)}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card title='投标须知' className='card' bordered={false}>
            <Form layout='vertical' >
              <Row gutter={16}>
                <Col lg={24} md={12} sm={24}>
                  <Form.Item label='投标须知'>
                    {getFieldDecorator('noticeContent', {
                      rules: [{ required: true, message: '请输入投标须知' }, { max: 2000, message: '不能超过2000字' }],
                      initialValue: initData.noticeContent
                    })(<TextArea placeholder='投标须知' autosize={{ minRows: 6 }} />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card title='联系方式' className='card' bordered={false}>
            <Form layout='vertical' >
              <Row gutter={16}>
                <Col lg={6} md={12} sm={24}>
                  <Form.Item label='联系人'>
                    {getFieldDecorator('linkman', {
                      rules: [{ required: true, message: '请输入联系人' }, { max: 20, message: '不能超过20字' }],
                      initialValue: initData.linkman
                    })(<Input placeholder='请输入联系人' />)}
                  </Form.Item>
                </Col>
                <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                  <Form.Item label='联系电话'>
                    {getFieldDecorator('phone', {
                      rules: [
                        { required: true, message: '请输入联系电话' }
                      ],
                      initialValue: initData.phone
                    })(
                      <Input placeholder='联系电话' />
                    )}
                  </Form.Item>
                </Col>
                <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
                  <Form.Item label='联系邮箱'>
                    {getFieldDecorator('email', {
                      rules: [{ required: true, message: '请输入联系邮箱' },
                        { type: 'email', message: '请输入正确邮箱' }],
                      initialValue: initData.email
                    })(
                      <Input placeholder='联系邮箱' />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card title='其他设置' className='card' bordered={false}>
            <Form layout='vertical' >
              <Row gutter={16}>
                <Col lg={24} md={12} sm={24}>
                  <Form.Item label='显示平台'>
                    {getFieldDecorator('displays', {
                      rules: [{ required: true, message: '请选择显示平台' }],
                      initialValue: initData.displays,
                    })(
                      <CheckboxGroup options={[
                        { label: '官网', value: 'displayPc' },
                        { label: '金诚逸', value: 'displayApp' },
                      ]}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card title='APP分享设置' className='card' bordered={false}>
            <Form layout='vertical' >
              <Row gutter={16}>
                <Col lg={8} md={12} sm={24} span={16}>
                  <Form.Item label='标题'>
                    <div>
                      {getFieldDecorator('title', {
                        rules: [{ required: true, message: '请输入标题' }, { max: 20, message: '不能超过20字' }],
                        initialValue: initData.title
                      })(
                        <Input placeholder='请输入标题' />
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col lg={8} md={12} sm={24} span={16}>
                  <Form.Item label='摘要'>
                    <div>
                      {getFieldDecorator('summary', {
                        rules: [{ required: true, message: '请输入摘要' }, { max: 30, message: '不能超过30字' }],
                        initialValue: initData.summary
                      })(
                        <Input placeholder='请输入摘要' />
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col lg={8} md={12} sm={24} >
                  <Form.Item label='分享配图'>
                    <p className='avatar-upload-remark'>图片支持png,jpg格式,建议尺寸 200*200</p>
                    <div>
                      {getFieldDecorator('shareImg', {
                        rules: [{ required: true, message: '需要上传配图' }],
                        initialValue: {}
                      })(
                        <Upload
                          name='document'
                          listType='picture-card'
                          className='avatar-uploader'
                          showUploadList={false}
                          action='/bidding/files/upload'
                          accept='.png, .jpg, .jpge,.PNG, .JPG,  .JPGE'
                          data={{ docType: 2 }}
                          beforeUpload={editStore.beforeUpload}
                          onChange={editStore.handleShareChange}
                        >
                          {(editStore.imageUrl || editStore.shareImgUrl) ? <img style={{ width: 200, height: 200 }} src={editStore.imageUrl || editStore.shareImgUrl} alt='' /> : uploadButton}
                        </Upload>
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
          <Card title='招标文件' className='card' bordered={false}>
            <Form layout='vertical' >
              <Row gutter={16}>
                <Col lg={8} md={12} sm={24} span={16}>
                  <Button icon='plus' type='primary' onClick={editStore.openModal}>关联招标文件</Button>
                  {fileModal}
                  <div className='file-tag'>
                    {(editStore.currentBidInfo || editStore.currentBidInfo)
                      ? <Tag closable onClose={editStore.clearBidInfo}>
                        {((editStore.currentBidInfo || {}).id || (editStore.currentBidInfo || {}).id)}.
                        {((editStore.currentBidInfo || {}).name || (editStore.currentBidInfo || {}).name)}
                      </Tag>
                      : null}</div>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card title='附件' className='card' bordered={false}>
            <div className='tableList'>
              <div className='tableListOperator'>
                <Upload
                  name='document'
                  action='/bidding/files/upload'
                  accept='.doc, .xls,  .docx, .xlsx, .txt, .pdf,.DOC, .XLS, .DOCX, .XLSX, .TXT, .PDF'
                  onChange={editStore.uploadFileListChange.bind(editStore)}
                  data={{ docType: 0 }}
                  multiple
                >
                  <Button icon='plus' type='primary'>上传附件</Button>
                </Upload>
                <p className='upload-remark'>可支持doc、pdf、xls 、txt等格式的文件，每个文件大小不得超过64M</p>
              </div>
              <Table
                loading={editStore.loading}
                dataSource={editStore.fileList}
                columns={columns}
                defaultPageSize={10}
              />
            </div>

          </Card>
          <div className='subimit-box'>
            <Button disabled={editStore.submiting} onClick={(e) => this.editNotice(e)}>
             提交
            </Button>
          </div>

          {/* <FooterToolbar style={{ width: '100%' }}>
            <Button type='primary'>
            提交
            </Button>
          </FooterToolbar> */}
        </PageHeaderLayout>
      </div>
    )
  }
}

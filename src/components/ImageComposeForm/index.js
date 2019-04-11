import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Button, Icon, Menu, Dropdown, notification, Select, Input, Modal} from 'antd';

import globalUtil from '../../utils/global';
import CodeMirror from 'react-codemirror';
require('codemirror/mode/yaml/yaml');
require('codemirror/lib/codemirror.css');
require('../../styles/codemirror.less');


const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
  },
};

@connect(({ user, global, loading }) => ({
	groups: global.groups,
	createAppByCompose: loading.effects['createApp/createAppByCompose']
}), null, null, {withRef: true})

@Form.create()
export default class Index extends PureComponent {
	constructor(props){
		super(props);
		this.state = {
		}
	}
	onAddGroup = () => {
		this.setState({addGroup: true})
	}
	cancelAddGroup = () => {
		this.setState({addGroup: false})
	}
	handleSubmit = (e) => {
		e.preventDefault();
		const form = this.props.form;
		form.validateFields((err, fieldsValue) => {
	        if (err) return;
	        this.props.onSubmit && this.props.onSubmit(fieldsValue)
	    });
	}
	render(){
		const { getFieldDecorator, getFieldValue } = this.props.form;
		const data = this.props.data || {};
		const showSubmitBtn = this.props.showSubmitBtn === void 0 ? true : this.props.showSubmitBtn;
		const {createAppByCompose} = this.props;
		var options = {
            lineNumbers: true,
            theme: "monokai",
            mode: 'yaml'
        };

		return (
				<Fragment>
			        <Form onSubmit={this.handleSubmit} layout="horizontal" hideRequiredMark>
			          <Form.Item
			            {...formItemLayout}
			            label="应用名称"
			          >
			            {getFieldDecorator('group_name', {
			              initialValue: data.group_name || '',
			              rules: [{ required: true, message: '应用名称' }],
			            })(
			              <Input style={{maxWidth: 300}} placeholder="应用名称" />
			            )}
			          </Form.Item>
			          <Form.Item
			            {...formItemLayout}
			            label="DockerCompose配置"
			          >
			          	{getFieldDecorator('yaml_content', {
			                initialValue: data.yaml_content || '',
			                rules: [
			                  { required: true, message: '请输入DockerCompose配置内容' }
			                ],
			              })(
											<div>
												<CodeMirror options={options} placeholder="" />
												<span>注意：Rainbond将解析DockerCompose配置中的服务相关属性用来便捷创建服务，其中的动态变量不支持解析赋值</span>
											</div>
			              )}
			              
			          </Form.Item>
			          
			          {
			          showSubmitBtn ? 
			          <Form.Item
			            wrapperCol={{
			              xs: { span: 24, offset: 0 },
			              sm: { span: formItemLayout.wrapperCol.span, offset: formItemLayout.labelCol.span },
			            }}
			            label=""
			          >
			          	
			          		<Button  onClick={this.handleSubmit} type="primary" loading={createAppByCompose}>
				              新建应用
				            </Button>
				          
			            
			          </Form.Item>
			            :null
			          }
			        </Form>
			     
			</Fragment>
		)
	}
}
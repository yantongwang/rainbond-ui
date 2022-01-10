/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-duplicate-case */
/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
/* eslint-disable no-undef */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/sort-comp */
/* eslint-disable prettier/prettier */
import rainbondUtil from '@/utils/rainbond';
import { Avatar, Dropdown, Icon, Layout, Menu, notification, Spin } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Debounce from 'lodash-decorators/debounce';
import React, { PureComponent } from 'react';
import userIcon from '../../../public/images/user-icon-small.png';
import { setNewbieGuide } from '../../services/api';
import ChangePassword from '../ChangePassword';
import styles from './index.less';
import token from './token';

const { SubMenu } = Menu;
const { Header } = Layout;

@connect(({ user, global, appControl }) => ({
  rainbondInfo: global.rainbondInfo,
  appDetail: appControl.appDetail,
  currentUser: user.currentUser,
  enterprise: global.enterprise
}))
export default class GlobalHeader extends PureComponent {
  constructor(props) {
    super(props);
    const { enterprise } = this.props;
    this.state = {
      isNewbieGuide: false && rainbondUtil.isEnableNewbieGuide(enterprise),
      showChangePassword: false
    };
  }

  handleMenuClick = ({ key }) => {
    const { dispatch } = this.props;
    if (key === 'userCenter') {
      dispatch(routerRedux.push(`/account/center`));
    }
    if (key === 'cpw') {
      this.showChangePass();
    }
    if (key === 'logout') {
      dispatch({ type: 'user/logout' });
    }
  };
  showChangePass = () => {
    this.setState({ showChangePassword: true });
  };
  cancelChangePass = () => {
    this.setState({ showChangePassword: false });
  };
  handleChangePass = vals => {
    this.props.dispatch({
      type: 'user/changePass',
      payload: {
        ...vals
      },
      callback: () => {
        notification.success({ message: '修改成功，请重新登录' });
      }
    });
  };

  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
  };
  @Debounce(600)
  handleVip = () => {
    const { dispatch, eid } = this.props;
    dispatch(routerRedux.push(`/enterprise/${eid}/orders/overviewService`));
  };
  handlIsOpenNewbieGuide = () => {
    const { eid, dispatch } = this.props;
    setNewbieGuide({
      enterprise_id: eid,
      data: {
        NEWBIE_GUIDE: { enable: false, value: '' }
      }
    }).then(() => {
      notification.success({
        message: '关闭成功'
      });
      dispatch({
        type: 'global/fetchEnterpriseInfo',
        payload: {
          enterprise_id: eid
        },
        callback: info => {
          if (info && info.bean) {
            this.setState({
              isNewbieGuide: rainbondUtil.isEnableNewbieGuide(info.bean)
            });
          }
        }
      });
    });
  };
  // Menu的切换事件
  handleMenuClickSelect = id => {
    const { dispatch } = this.props;
    switch (id) {
      case 0:
        dispatch(routerRedux.push('/'));
        break;
      case 1:
        dispatch(
          routerRedux.push({
            pathname: '/team/cheitnp6/region/demo/index',
            state: 'team'
          })
        );
        break;
      case 2:
        dispatch(routerRedux.push('/team/cheitnp6/region/demo/apps/1'));
        break;
      case 3:
        dispatch(
          routerRedux.push(
            '/team/cheitnp6/region/demo/components/gr059ce1/overview'
          )
        );
        break;
      case 4:
        // 监控部署地址
        window.open(
          'http://demo.c9f961.grapps.cn/#/team/cheitnp6/region/demo/apps/9'
        );
        break;
      case 5:
        // 后台部署地址
        window.open(
          'http://demo.c9f961.grapps.cn/#/team/cheitnp6/region/demo/apps/2'
        );
        break;
      case 6:
        // 点击复制Token
        this.handleCopyToken();
        break;
      case 7:
        window.open(
          'http://demo.c9f961.grapps.cn/#/team/k86bpcjz/region/demo/apps/3'
        );
        break;
      case 8:
        window.open(
          'http://demo.c9f961.grapps.cn/#/team/cheitnp6/region/demo/components/gr5427bd/monitor'
        );
        break;
      default:
        break;
    }
  };
  // 复制Token
  handleCopyToken = () => {
    const ipt = document.querySelector('#token');
    ipt.type = 'text';
    // 选中文本
    ipt.select();
    // 复制Token
    document.execCommand('Copy');
    ipt.type = 'hidden';
    window.open('http://20001.gr64017a.59zlynqu.c9f961.grapps.cn/kiali/');
  };
  // 鼠标移上
  handleMouseUserOver = id => {
    const menuItem = document.getElementsByClassName('menuItem');
    // 排他
    for (let i = 0; i < menuItem.length; i++) {
      for (let j = 0; j < menuItem.length; j++) {
        menuItem[j].classList.remove('activeSvg');
      }
      menuItem[id].classList.add('activeSvg');
    }
  };
  // 鼠标移除
  handleMouseOut = id => {
    const menuItem = document.getElementsByClassName('menuItem');
    menuItem[id].classList.remove('activeSvg');
  };

  render() {
    const { currentUser, customHeader, rainbondInfo, collapsed } = this.props;
    if (!currentUser) {
      return null;
    }
    const handleUserSvg = () => (
      <svg viewBox="0 0 1024 1024" width="13" height="13">
        <path
          d="M511.602218 541.281848a230.376271 230.376271 0 1 0 0-460.752543 230.376271 230.376271 0 0 0 0 460.752543zM511.960581 0a307.168362 307.168362 0 0 1 155.63197 572.049879c188.806153 56.826147 330.615547 215.939358 356.059326 413.551004 2.406152 18.788465-11.570008 35.836309-31.228783 38.140072-19.60758 2.303763-37.525735-11.006866-39.931887-29.795331-27.645153-214.505906-213.430817-376.025269-438.73881-376.02527-226.536667 0-414.728483 161.826532-442.322441 376.02527-2.406152 18.788465-20.324307 32.099094-39.931887 29.795331-19.658775-2.303763-33.634936-19.351607-31.228783-38.140072 25.392585-196.79253 167.969899-355.700963 357.08322-413.039057A307.168362 307.168362 0 0 1 511.960581 0z"
          fill="#555555"
          p-id="1138"
        />
      </svg>
    );
    const handleEditSvg = () => (
      <svg width="15px" height="15px" viewBox="0 0 1024 1024">
        <path d="M626.9 248.2L148.2 726.9 92.1 932.3l204.6-57 480.5-480.5-150.3-146.6z m274.3-125.8c-41-41-107.5-41-148.5 0l-80.5 80.5L823.1 349l78.1-78.2c41-41 41-107.5 0-148.4zM415.1 932.3h452.2v-64.6H415.1v64.6z m193.8-193.8h258.4v-64.6H608.9v64.6z" />
      </svg>
    );
    const handleLogoutSvg = () => (
      <svg width="15px" height="15px" viewBox="0 0 1024 1024">
        <path d="M1024 445.44 828.414771 625.665331l0-116.73472L506.88 508.930611l0-126.98112 321.53472 0 0-116.73472L1024 445.44zM690.174771 41.985331 100.34944 41.985331l314.37056 133.12 0 630.78528 275.45472 0L690.17472 551.93472l46.08 0 0 296.96L414.72 848.89472 414.72 1024 0 848.894771 0 0l736.25472 0 0 339.97056-46.08 0L690.17472 41.98528 690.174771 41.985331zM690.174771 41.985331" />
      </svg>
    );
    const MenuItems = (key, component, text) => {
      return (
        <Menu.Item key={key}>
          <Icon
            component={component}
            style={{
              marginRight: 8
            }}
          />
          {text}
        </Menu.Item>
      );
    };

    const menu = (
      <div className={styles.uesrInfo}>
        <Menu selectedKeys={[]} onClick={this.handleMenuClick}>
          {MenuItems('userCenter', handleUserSvg, '个人中心')}
          {MenuItems('cpw', handleEditSvg, '修改密码')}
          {!rainbondUtil.logoutEnable(rainbondInfo) &&
            MenuItems('logout', handleLogoutSvg, '退出登录')}
        </Menu>
      </div>
    );
    // 体验向导
    const guideData = [
      {
        id: 0,
        name: '企业视图功能'
      },
      { id: 1, name: '团队视图功能' },
      { id: 2, name: '应用视图功能' },
      { id: 3, name: '组件视图功能' },
      {
        id: 4,
        name: '应用示例：SkyWalking'
      },
      {
        id: 5,
        name: '应用示例：后台管理系统'
      },
      {
        id: 6,
        name: '应用示例：Istio(点击复制Token)'
      },
      {
        id: 7,
        name: '应用示例：SpringCloud'
      },
      {
        id: 8,
        name: '插件示例：性能分析插件'
      }
    ];
    const SVG = (
      <svg
        t="1641811433831"
        className="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="5924"
        width="20"
        height="20"
        className={`${styles.arrow}`}
      >
        <path
          d="M438.584533 738.132267c14.946133 15.374933 39.2 15.374933 54.1792 0l192.600533-198.250667c14.9376-15.403733 14.9376-40.3744 0-55.746133L492.763733 285.890133c-14.9792-15.403733-39.233067-15.403733-54.1792 0-14.970667 15.3792-14.970667 40.3456 0 55.7504L604.1056 512.0064l-165.521067 170.346667C423.613867 697.7568 423.613867 722.7232 438.584533 738.132267L438.584533 738.132267zM438.584533 738.132267"
          p-id="5925"
          fill="#ffffff"
        />
      </svg>
    );

    const menuSelect = (
      <div>
        <Menu className={styles.menuSelect}>
          {guideData.map(item => {
            return (
              <Menu.Item
                className="menuItem"
                key={item.id}
                onClick={() => {
                  this.handleMenuClickSelect(item.id);
                }}
                onMouseOver={() => {
                  this.handleMouseUserOver(item.id);
                }}
                onMouseLeave={() => {
                  this.handleMouseOut(item.id);
                }}
              >
                <div className={styles.viewItem}>
                  {item.name}
                  {SVG}
                </div>
              </Menu.Item>
            );
          })}
        </Menu>
      </div>
    );

    return (
      <Header className={styles.header}>
        <Icon
          className={styles.trigger}
          type={!collapsed ? 'menu-unfold' : 'menu-fold'}
          style={{ color: '#ffffff', float: 'left' }}
          onClick={this.toggle}
        />

        {customHeader && customHeader()}
        <div className={styles.right}>
          {/* 体验向导 */}
          <Dropdown
            overlay={menuSelect}
            overlayClassName={styles.namespace}
            arrow
          >
            <span
              style={{ cursor: 'pointer' }}
              className={`${styles.experience_title}`}
            >
              DEMO演示向导
            </span>
          </Dropdown>
          {currentUser ? (
            <Dropdown overlay={menu}>
              <span className={`${styles.action} ${styles.account}`}>
                <Avatar size="small" className={styles.avatar} src={userIcon} />
                <span className={styles.name}>{currentUser.user_name}</span>
              </span>
            </Dropdown>
          ) : (
            <Spin
              size="small"
              style={{
                marginLeft: 8
              }}
            />
          )}
        </div>
        {/* change password */}
        {this.state.showChangePassword && (
          <ChangePassword
            onOk={this.handleChangePass}
            onCancel={this.cancelChangePass}
          />
        )}
        {/* Token的input框 */}
        <input type="hidden" value={token} id="token" />
      </Header>
    );
  }
}

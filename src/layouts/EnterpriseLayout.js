/* eslint-disable no-unused-expressions */
/* eslint-disable no-shadow */
/* eslint-disable prefer-destructuring */
/* eslint-disable react/sort-comp */
import { Layout, Alert } from 'antd';
import classNames from 'classnames';
import { connect } from 'dva';
import { Redirect, routerRedux } from 'dva/router';
import { enquireScreen } from 'enquire-js';
import deepEqual from 'lodash.isequal';
import memoizeOne from 'memoize-one';
import pathToRegexp from 'path-to-regexp';
import PropTypes from 'prop-types';
import { stringify } from 'querystring';
import React, { Fragment, PureComponent } from 'react';
import { ContainerQuery } from 'react-container-query';
import DocumentTitle from 'react-document-title';
import logo from '../../public/logo.png';
import { getMenuData } from '../common/enterpriseMenu';
import AuthCompany from '../components/AuthCompany';
import GlobalHeader from '../components/GlobalHeader';
import headerStype from '../components/GlobalHeader/index.less';
import GlobalRouter from '../components/GlobalRouter';
import Loading from '../components/Loading';
import PageLoading from '../components/PageLoading';
import ServiceOrder from '../components/ServiceOrder';
import SiderMenu from '../components/SiderMenu';
import Authorized from '../utils/Authorized';
import globalUtil from '../utils/global';
import rainbondUtil from '../utils/rainbond';
import userUtil from '../utils/user';
import MemoryTip from './MemoryTip';
import Context from './MenuContext';
import styles from './EnterpriseLayout.less'
const { Content } = Layout;

const getBreadcrumbNameMap = memoizeOne(meun => {
  const routerMap = {};
  const mergeMeunAndRouter = meunData => {
    meunData.forEach(meunItem => {
      if (meunItem.children) {
        mergeMeunAndRouter(meunItem.children);
      }
      // Reduce memory usage
      routerMap[meunItem.path] = meunItem;
    });
  };
  mergeMeunAndRouter(meun);
  return routerMap;
}, deepEqual);

const query = {
  'screen-xs': {
    maxWidth: 575
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199
  },
  'screen-xl': {
    minWidth: 1200
  }
};

let isMobile;
enquireScreen(b => {
  isMobile = b;
});

class EnterpriseLayout extends PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
    currRegion: PropTypes.string,
    currTeam: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.breadcrumbNameMap = getBreadcrumbNameMap(
      getMenuData(this.props.groups)
    );
    this.state = {
      isMobile,
      enterpriseList: [],
      enterpriseInfo: false,
      ready: false,
      alertInfo:[],
      offLineDisNew: [
        {
          key: 'welcome',
          value: true
        },
        { key: 'applicationInfo', value: true },
        { key: 'installApp', value: true }
      ]
    };
  }

  componentDidMount() {
    this.getEnterpriseList();
  }
  // 获取执行的步骤

  // 获取平台公共信息(判断用户是否是离线)
  handleGetEnterpeiseMsg = (data, eid) => {
    const { dispatch } = this.props;
    const { offLineDisNew } = this.state;
    dispatch({
      type: 'global/fetchRainbondInfo',
      callback: res => {
        // 判断是否是离线的状态
        if (
          res &&
          res.is_offline !== 'false' &&
          (res.is_offline || res.is_offline === 'true')
        ) {
          dispatch({
            type: 'global/putNewbieGuideConfig',
            payload: {
              arr: [...offLineDisNew]
            },
            callback: res => {
              if (res) {
                const isNewbieGuide = rainbondUtil.isEnableNewbieGuide(data);
                dispatch({
                  type: 'global/fetchNewbieGuideConfig',
                  callback: res => {
                    if (
                      res &&
                      res.list &&
                      res.list.length === 3 &&
                      isNewbieGuide
                    ) {
                      dispatch(routerRedux.push(`/enterprise/${eid}/clusters`));
                    }
                  }
                });
              }
            },
            handleError: err => {}
          });
        } else {
          const isNewbieGuide = rainbondUtil.isEnableNewbieGuide(data);
          isNewbieGuide && this.getNewbieGuideConfig(eid);
        }
      },
      handleError: err => {}
    });
  };
  // get enterprise list
  getEnterpriseList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchEnterpriseList',
      callback: res => {
        if (res && res.status_code === 200) {
          const ready = !!(res.list && res.list.length > 0);
          this.setState(
            {
              enterpriseList: res.list,
              ready
            },
            () => {
              if (ready) {
                this.redirectEnterpriseView();
                this.load();
                this.getAlertInfo()
              } else {
                this.handleJumpLogin();
              }
            }
          );
        } else {
          this.handleJumpLogin();
        }
      },
      handleError: () => {
        this.handleJumpLogin();
      }
    });
  };

  loadClusters = eid => {
    const { dispatch, currentUser } = this.props;
    dispatch({
      type: 'region/fetchEnterpriseClusters',
      payload: {
        enterprise_id: eid,
        check_status: 'no'
      },
      callback: res => {
        const adminer = userUtil.isCompanyAdmin(currentUser);
        if (res && res.list && res.list.length === 0 && adminer) {
          dispatch(
            routerRedux.push(`/enterprise/${eid}/shared/local?init=true`)
          );
        }
      }
    });
  };

  load = () => {
    enquireScreen(mobile => {
      this.setState({ isMobile: mobile });
    });
    // 连接云应用市场
  };

  getChildContext = () => {
    const { location } = this.props;
    return { location, breadcrumbNameMap: this.breadcrumbNameMap };
  };

  matchParamsPath = pathname => {
    const pathKey = Object.keys(this.breadcrumbNameMap).find(key => {
      return pathToRegexp(key).test(pathname);
    });
    return this.breadcrumbNameMap[pathKey];
  };

  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed
    });
  };

  getContext() {
    const { location } = this.props;
    return {
      location,
      breadcrumbNameMap: this.breadcrumbNameMap
    };
  }
  handleJumpLogin = () => {
    const { dispatch } = this.props;
    dispatch(routerRedux.push('/user/login'));
  };
  redirectEnterpriseView = () => {
    const {
      dispatch,
      currentUser,
      rainbondInfo,
      match: {
        params: { eid }
      }
    } = this.props;
    const { enterpriseList } = this.state;
    if ((!eid || eid === 'auto') && enterpriseList.length > 0) {
      let selectE = null;
      enterpriseList.map(item => {
        if (item.enterprise_id === currentUser.enterprise_id) {
          selectE = item;
        }
        return item;
      });
      if (selectE == null) {
        selectE = enterpriseList[0];
      }
      this.handlePutLog(rainbondInfo, selectE);
      this.fetchEnterpriseInfo(selectE.enterprise_id);
      this.setState({ enterpriseInfo: selectE });
      dispatch(
        routerRedux.replace(`/enterprise/${selectE.enterprise_id}/index`)
      );
    } else {
      enterpriseList.map(item => {
        if (item.enterprise_id === eid) {
          this.fetchEnterpriseInfo(eid);
          this.handlePutLog(rainbondInfo, item);
          this.setState({ enterpriseInfo: item });
        }
        return item;
      });
    }
  };
  handlePutLog = (rainbondInfo, item) => {
    globalUtil.putLog(Object.assign(rainbondInfo, item));
  };
  getNewbieGuideConfig = eid => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchNewbieGuideConfig',
      callback: res => {
        const isNext = rainbondUtil.handleNewbie(res && res.list, 'welcome');
        if (isNext) {
          this.loadClusters(eid);
        }
      }
    });
  };
  fetchEnterpriseInfo = eid => {
    if (!eid) {
      return null;
    }
    const { dispatch } = this.props;
    // this.fetchEnterpriseService(eid);
    dispatch({
      type: 'global/fetchEnterpriseInfo',
      payload: {
        enterprise_id: eid
      },
      callback: res => {
        if (res && res.bean) {
          // 获取平台信息
          this.handleGetEnterpeiseMsg(res.bean, eid);
        }
      }
    });
  };

  fetchEnterpriseService = eid => {
    const { dispatch } = this.props;
    dispatch({
      type: 'order/fetchEnterpriseService',
      payload: {
        enterprise_id: eid
      }
    });
  };
  getAlertInfo = () => {
    const { 
      dispatch,
      match: {
        params: { eid }
      } 
    } = this.props;
    dispatch({
      type: 'global/getRainbondAlert',
      payload: {
        enterprise_id: eid
      },
      callback: res => {
        if (res && res.bean) {
          //获取平台报警信息
          if(res.list.length > 0){
            this.setState({
              alertInfo: res.list
            })
          }
        }
      },handleError: err => {
        console.log(err)
      }
    });
  }
  render() {
    const {
      memoryTip,
      currentUser,
      collapsed,
      location,
      location: { pathname },
      match: {
        params: { eid }
      },
      orders,
      children,
      rainbondInfo,
      enterprise,
      showAuthCompany
    } = this.props;
    const { enterpriseList, enterpriseInfo, ready, alertInfo } = this.state;
    const autoWidth = collapsed ? 'calc(100% - 416px)' : 'calc(100% - 116px)';
    const BillingFunction = rainbondUtil.isEnableBillingFunction();
    const queryString = stringify({
      redirect: window.location.href
    });
    if (!ready || !enterpriseInfo) {
      return <PageLoading />;
    }
    if (!currentUser || !rainbondInfo || enterpriseList.length === 0) {
      return <Redirect to={`/user/login?${queryString}`} />;
    }
    const fetchLogo = rainbondUtil.fetchLogo(rainbondInfo, enterprise) || logo;
    const customHeader = () => {
      return (
        <div className={headerStype.enterprise}>
          {/* {BillingFunction && (
            <Tooltip
              title={
                enterpriseServiceInfo.type === "vip"
                  ? "尊贵的付费企业用户"
                  : "免费用户"
              }
            >
              {globalUtil.fetchSvg(enterpriseServiceInfo.type)}
            </Tooltip>
          )} */}
          {(enterprise && enterprise.enterprise_alias) ||
            (enterpriseInfo && enterpriseInfo.enterprise_alias)}
        </div>
      );
    };
    const layout = () => {
      return (
        <Layout>
          <SiderMenu
            currentEnterprise={enterpriseInfo}
            enterpriseList={enterpriseList}
            currentUser={currentUser}
            logo={fetchLogo}
            Authorized={Authorized}
            collapsed={collapsed}
            location={location}
            isMobile={this.state.isMobile}
            onCollapse={this.handleMenuCollapse}
          />
          <Layout>
            <GlobalHeader
              eid={eid}
              logo={fetchLogo}
              isPubCloud={
                rainbondInfo &&
                rainbondInfo.is_public &&
                rainbondInfo.is_public.enable
              }
              currentUser={currentUser}
              collapsed={collapsed}
              onCollapse={this.handleMenuCollapse}
              isMobile={this.state.isMobile}
              customHeader={customHeader}
            />
            <Layout style={{ flexDirection: 'row' }}>
              <GlobalRouter
                currentEnterprise={enterpriseInfo}
                enterpriseList={enterpriseList}
                title={
                  rainbondInfo &&
                  rainbondInfo.title &&
                  rainbondInfo.title.enable &&
                  rainbondInfo.title.value
                }
                currentUser={currentUser}
                Authorized={Authorized}
                menuData={getMenuData(eid, currentUser, enterprise)}
                showMenu
                pathname={pathname}
                location={location}
                isMobile={this.state.isMobile}
                collapsed={collapsed}
                onCollapse={this.handleMenuCollapse}
              />
              <Content
                key={eid}
                style={{
                  height: 'calc(100vh - 64px)',
                  overflow: 'auto',
                  width: autoWidth
                }}
              >
                {/* 报警信息 */}
                {alertInfo.length > 0 && alertInfo.map((item)=>{
                  return (
                    <div className={styles.alerts}>
                      <Alert
                        style={{ textAlign: 'left', marginTop: '4px', marginBottom:'4px',color:'#c40000',background:'#fff1f0',border:' 1px solid red' }}
                        message={item.annotations.description}
                        type="warning"
                        showIcon
                      />
                    </div>
                 )
                })}
                <div
                  style={{
                    margin: '24px 24px 0'
                  }}
                >
                  <Authorized
                    logined
                    // authority={children.props.route.authority}
                    authority={['admin', 'user']}
                    noMatch={<Redirect to="/user/login" />}
                  >
                    {children}
                  </Authorized>
                </div>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      );
    };
    const SiteTitle = rainbondUtil.fetchSiteTitle(rainbondInfo);

    return (
      <Fragment>
        <DocumentTitle title={SiteTitle}>
          <ContainerQuery query={query}>
            {params => (
              <Context.Provider value={this.getContext()}>
                <div className={classNames(params)}>{layout()}</div>
              </Context.Provider>
            )}
          </ContainerQuery>
        </DocumentTitle>

        <Loading />

        {/* 企业尚未认证 */}
        {showAuthCompany && (
          <AuthCompany eid={eid} marketName={showAuthCompany} currStep={0} />
        )}
        {memoryTip && <MemoryTip memoryTip={memoryTip} />}

        {orders && BillingFunction && (
          <ServiceOrder
            // enterpriseServiceInfo={enterpriseServiceInfo}
            eid={eid}
            orders={orders}
          />
        )}
      </Fragment>
    );
  }
}
export default connect(({ user, global, index, loading }) => ({
  currentUser: user.currentUser,
  notifyCount: user.notifyCount,
  collapsed: global.collapsed,
  groups: global.groups,
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
  currTeam: globalUtil.getCurrTeamName(),
  currRegion: globalUtil.getCurrRegionName(),
  rainbondInfo: global.rainbondInfo,
  payTip: global.payTip,
  memoryTip: global.memoryTip,
  noMoneyTip: global.noMoneyTip,
  showAuthCompany: global.showAuthCompany,
  orders: global.orders,
  overviewInfo: index.overviewInfo,
  nouse: global.nouse,
  enterprise: global.enterprise
  // enterpriseServiceInfo: order.enterpriseServiceInfo
}))(EnterpriseLayout);

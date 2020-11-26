import { LocationHistory, NavManager, RouteManagerContext, generateId, getConfig } from '@ionic/react';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { IonRouteInner } from './IonRouteInner';
import { ReactRouterViewStack } from './ReactRouterViewStack';
import StackManager from './StackManager';
class IonRouterInner extends React.PureComponent {
    constructor(props) {
        super(props);
        this.exitViewFromOtherOutletHandlers = [];
        this.locationHistory = new LocationHistory();
        this.viewStack = new ReactRouterViewStack();
        this.routeMangerContextState = {
            canGoBack: () => this.locationHistory.canGoBack(),
            clearOutlet: this.viewStack.clear,
            findViewItemByPathname: this.viewStack.findViewItemByPathname,
            getChildrenToRender: this.viewStack.getChildrenToRender,
            goBack: () => this.handleNavigateBack(),
            createViewItem: this.viewStack.createViewItem,
            findViewItemByRouteInfo: this.viewStack.findViewItemByRouteInfo,
            findLeavingViewItemByRouteInfo: this.viewStack.findLeavingViewItemByRouteInfo,
            addViewItem: this.viewStack.add,
            unMountViewItem: this.viewStack.remove
        };
        const routeInfo = {
            id: generateId('routeInfo'),
            pathname: this.props.location.pathname,
            search: this.props.location.search
        };
        this.locationHistory.add(routeInfo);
        this.handleChangeTab = this.handleChangeTab.bind(this);
        this.handleResetTab = this.handleResetTab.bind(this);
        this.handleNavigate = this.handleNavigate.bind(this);
        this.handleNavigateBack = this.handleNavigateBack.bind(this);
        this.props.registerHistoryListener(this.handleHistoryChange.bind(this));
        this.handleSetCurrentTab = this.handleSetCurrentTab.bind(this);
        this.state = {
            routeInfo
        };
    }
    handleChangeTab(tab, path, routeOptions) {
        const routeInfo = this.locationHistory.getCurrentRouteInfoForTab(tab);
        const [pathname, search] = path.split('?');
        if (routeInfo) {
            this.incomingRouteParams = Object.assign(Object.assign({}, routeInfo), { routeAction: 'push', routeDirection: 'none' });
            if (routeInfo.pathname === pathname) {
                this.incomingRouteParams.routeOptions = routeOptions;
                this.props.history.push(routeInfo.pathname + (routeInfo.search || ''));
            }
            else {
                this.incomingRouteParams.pathname = pathname;
                this.incomingRouteParams.search = search ? '?' + search : undefined;
                this.incomingRouteParams.routeOptions = routeOptions;
                this.props.history.push(pathname + (search ? '?' + search : ''));
            }
        }
        else {
            this.handleNavigate(pathname, 'push', 'none', undefined, routeOptions, tab);
        }
    }
    handleHistoryChange(location, action) {
        var _a, _b, _c;
        let leavingLocationInfo;
        if (this.incomingRouteParams) {
            if (this.incomingRouteParams.routeAction === 'replace') {
                leavingLocationInfo = this.locationHistory.previous();
            }
            else {
                leavingLocationInfo = this.locationHistory.current();
            }
        }
        else {
            leavingLocationInfo = this.locationHistory.current();
        }
        const leavingUrl = leavingLocationInfo.pathname + leavingLocationInfo.search;
        if (leavingUrl !== location.pathname) {
            if (!this.incomingRouteParams) {
                if (action === 'REPLACE') {
                    this.incomingRouteParams = {
                        routeAction: 'replace',
                        routeDirection: 'none',
                        tab: this.currentTab // TODO this isn't legit if replacing to a page that is not in the tabs
                    };
                }
                if (action === 'POP') {
                    const ri = this.locationHistory.current();
                    if (ri && ri.pushedByRoute) {
                        const prevInfo = this.locationHistory.findLastLocation(ri);
                        this.incomingRouteParams = Object.assign(Object.assign({}, prevInfo), { routeAction: 'pop', routeDirection: 'back' });
                    }
                    else {
                        const direction = 'none';
                        this.incomingRouteParams = {
                            routeAction: 'pop',
                            routeDirection: direction,
                            tab: this.currentTab
                        };
                    }
                }
                if (!this.incomingRouteParams) {
                    this.incomingRouteParams = {
                        routeAction: 'push',
                        routeDirection: ((_a = location.state) === null || _a === void 0 ? void 0 : _a.direction) || 'forward',
                        routeOptions: (_b = location.state) === null || _b === void 0 ? void 0 : _b.routerOptions,
                        tab: this.currentTab
                    };
                }
            }
            let routeInfo;
            if ((_c = this.incomingRouteParams) === null || _c === void 0 ? void 0 : _c.id) {
                routeInfo = Object.assign(Object.assign({}, this.incomingRouteParams), { lastPathname: leavingLocationInfo.pathname });
                this.locationHistory.add(routeInfo);
            }
            else {
                const isPushed = (this.incomingRouteParams.routeAction === 'push' && this.incomingRouteParams.routeDirection === 'forward');
                routeInfo = Object.assign(Object.assign({ id: generateId('routeInfo') }, this.incomingRouteParams), { lastPathname: leavingLocationInfo.pathname, pathname: location.pathname, search: location.search, params: this.props.match.params, prevRouteLastPathname: leavingLocationInfo.lastPathname });
                if (isPushed) {
                    routeInfo.tab = leavingLocationInfo.tab;
                    routeInfo.pushedByRoute = leavingLocationInfo.pathname;
                }
                else if (routeInfo.routeAction === 'pop') {
                    const r = this.locationHistory.findLastLocation(routeInfo);
                    routeInfo.pushedByRoute = r === null || r === void 0 ? void 0 : r.pushedByRoute;
                }
                else if (routeInfo.routeAction === 'push' && routeInfo.tab !== leavingLocationInfo.tab) {
                    // If we are switching tabs grab the last route info for the tab and use its pushedByRoute
                    const lastRoute = this.locationHistory.getCurrentRouteInfoForTab(routeInfo.tab);
                    routeInfo.pushedByRoute = lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.pushedByRoute;
                }
                else if (routeInfo.routeAction === 'replace') {
                    // Make sure to set the lastPathname, etc.. to the current route so the page transitions out
                    const currentRouteInfo = this.locationHistory.current();
                    routeInfo.lastPathname = (currentRouteInfo === null || currentRouteInfo === void 0 ? void 0 : currentRouteInfo.pathname) || routeInfo.lastPathname;
                    routeInfo.prevRouteLastPathname = currentRouteInfo === null || currentRouteInfo === void 0 ? void 0 : currentRouteInfo.lastPathname;
                    routeInfo.pushedByRoute = (currentRouteInfo === null || currentRouteInfo === void 0 ? void 0 : currentRouteInfo.pushedByRoute) || routeInfo.pushedByRoute;
                    routeInfo.routeDirection = (currentRouteInfo === null || currentRouteInfo === void 0 ? void 0 : currentRouteInfo.routeDirection) || routeInfo.routeDirection;
                    routeInfo.routeAnimation = (currentRouteInfo === null || currentRouteInfo === void 0 ? void 0 : currentRouteInfo.routeAnimation) || routeInfo.routeAnimation;
                }
                this.locationHistory.add(routeInfo);
            }
            this.setState({
                routeInfo
            });
        }
        this.incomingRouteParams = undefined;
    }
    handleNavigate(path, routeAction, routeDirection, routeAnimation, routeOptions, tab) {
        this.incomingRouteParams = Object.assign(this.incomingRouteParams || {}, {
            routeAction,
            routeDirection,
            routeOptions,
            routeAnimation,
            tab
        });
        if (routeAction === 'push') {
            this.props.history.push(path);
        }
        else {
            this.props.history.replace(path);
        }
    }
    handleNavigateBack(defaultHref = '/', routeAnimation) {
        const config = getConfig();
        defaultHref = defaultHref ? defaultHref : config && config.get('backButtonDefaultHref');
        const routeInfo = this.locationHistory.current();
        if (routeInfo && routeInfo.pushedByRoute) {
            const prevInfo = this.locationHistory.findLastLocation(routeInfo);
            if (prevInfo) {
                this.incomingRouteParams = Object.assign(Object.assign({}, prevInfo), { routeAction: 'pop', routeDirection: 'back', routeAnimation: routeAnimation || routeInfo.routeAnimation });
                if (routeInfo.lastPathname === routeInfo.pushedByRoute) {
                    this.props.history.goBack();
                }
                else {
                    this.handleNavigate(prevInfo.pathname + (prevInfo.search || ''), 'pop', 'back');
                }
            }
            else {
                this.handleNavigate(defaultHref, 'pop', 'back');
            }
        }
        else {
            this.handleNavigate(defaultHref, 'pop', 'back');
        }
    }
    handleResetTab(tab, originalHref, originalRouteOptions) {
        const routeInfo = this.locationHistory.getFirstRouteInfoForTab(tab);
        if (routeInfo) {
            const newRouteInfo = Object.assign({}, routeInfo);
            newRouteInfo.pathname = originalHref;
            newRouteInfo.routeOptions = originalRouteOptions;
            this.incomingRouteParams = Object.assign(Object.assign({}, newRouteInfo), { routeAction: 'pop', routeDirection: 'back' });
            this.props.history.push(newRouteInfo.pathname + (newRouteInfo.search || ''));
        }
    }
    handleSetCurrentTab(tab) {
        this.currentTab = tab;
        const ri = Object.assign({}, this.locationHistory.current());
        if (ri.tab !== tab) {
            ri.tab = tab;
            this.locationHistory.update(ri);
        }
    }
    render() {
        return (React.createElement(RouteManagerContext.Provider, { value: this.routeMangerContextState },
            React.createElement(NavManager, { ionRoute: IonRouteInner, ionRedirect: {}, stackManager: StackManager, routeInfo: this.state.routeInfo, onNavigateBack: this.handleNavigateBack, onNavigate: this.handleNavigate, onSetCurrentTab: this.handleSetCurrentTab, onChangeTab: this.handleChangeTab, onResetTab: this.handleResetTab, locationHistory: this.locationHistory }, this.props.children)));
    }
}
export const IonRouter = withRouter(IonRouterInner);
IonRouter.displayName = 'IonRouter';
//# sourceMappingURL=IonRouter.js.map
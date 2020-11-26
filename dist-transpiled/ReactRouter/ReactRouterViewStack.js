import { IonRoute, ViewLifeCycleManager, ViewStacks, generateId } from '@ionic/react';
import React from 'react';
import { matchPath } from 'react-router';
export class ReactRouterViewStack extends ViewStacks {
    constructor() {
        super();
        this.createViewItem = this.createViewItem.bind(this);
        this.findViewItemByRouteInfo = this.findViewItemByRouteInfo.bind(this);
        this.findLeavingViewItemByRouteInfo = this.findLeavingViewItemByRouteInfo.bind(this);
        this.getChildrenToRender = this.getChildrenToRender.bind(this);
        this.findViewItemByPathname = this.findViewItemByPathname.bind(this);
    }
    createViewItem(outletId, reactElement, routeInfo, page) {
        const viewItem = {
            id: generateId('viewItem'),
            outletId,
            ionPageElement: page,
            reactElement,
            mount: true,
            ionRoute: false
        };
        const matchProps = {
            exact: reactElement.props.exact,
            path: reactElement.props.path || reactElement.props.from,
            component: reactElement.props.component
        };
        const match = matchPath(routeInfo.pathname, matchProps);
        if (reactElement.type === IonRoute) {
            viewItem.ionRoute = true;
            viewItem.disableIonPageManagement = reactElement.props.disableIonPageManagement;
        }
        viewItem.routeData = {
            match,
            childProps: reactElement.props
        };
        return viewItem;
    }
    getChildrenToRender(outletId, ionRouterOutlet, routeInfo) {
        const viewItems = this.getViewItemsForOutlet(outletId);
        // Sync latest routes with viewItems
        React.Children.forEach(ionRouterOutlet.props.children, (child) => {
            const viewItem = viewItems.find(v => {
                return matchComponent(child, v.routeData.childProps.path || v.routeData.childProps.from);
            });
            if (viewItem) {
                viewItem.reactElement = child;
            }
        });
        const children = viewItems.map(viewItem => {
            let clonedChild;
            if (viewItem.ionRoute && !viewItem.disableIonPageManagement) {
                clonedChild = (React.createElement(ViewLifeCycleManager, { key: `view-${viewItem.id}`, mount: viewItem.mount, removeView: () => this.remove(viewItem) }, React.cloneElement(viewItem.reactElement, {
                    computedMatch: viewItem.routeData.match
                })));
            }
            else {
                const match = matchComponent(viewItem.reactElement, routeInfo.pathname);
                clonedChild = (React.createElement(ViewLifeCycleManager, { key: `view-${viewItem.id}`, mount: viewItem.mount, removeView: () => this.remove(viewItem) }, React.cloneElement(viewItem.reactElement, {
                    computedMatch: viewItem.routeData.match
                })));
                if (!match && viewItem.routeData.match) {
                    viewItem.routeData.match = undefined;
                    viewItem.mount = false;
                }
            }
            return clonedChild;
        });
        return children;
    }
    findViewItemByRouteInfo(routeInfo, outletId) {
        const { viewItem, match } = this.findViewItemByPath(routeInfo.pathname, outletId);
        if (viewItem && match) {
            viewItem.routeData.match = match;
        }
        return viewItem;
    }
    findLeavingViewItemByRouteInfo(routeInfo, outletId, mustBeIonRoute = true) {
        const { viewItem } = this.findViewItemByPath(routeInfo.lastPathname, outletId, false, mustBeIonRoute);
        return viewItem;
    }
    findViewItemByPathname(pathname, outletId) {
        const { viewItem } = this.findViewItemByPath(pathname, outletId);
        return viewItem;
    }
    findViewItemByPath(pathname, outletId, forceExact, mustBeIonRoute) {
        let viewItem;
        let match;
        let viewStack;
        if (outletId) {
            viewStack = this.getViewItemsForOutlet(outletId);
            viewStack.some(matchView);
            if (!viewItem) {
                viewStack.some(matchDefaultRoute);
            }
        }
        else {
            const viewItems = this.getAllViewItems();
            viewItems.some(matchView);
            if (!viewItem) {
                viewItems.some(matchDefaultRoute);
            }
        }
        return { viewItem, match };
        function matchView(v) {
            if (mustBeIonRoute && !v.ionRoute) {
                return false;
            }
            const matchProps = {
                exact: forceExact ? true : v.routeData.childProps.exact,
                path: v.routeData.childProps.path || v.routeData.childProps.from,
                component: v.routeData.childProps.component
            };
            const myMatch = matchPath(pathname, matchProps);
            if (myMatch) {
                viewItem = v;
                match = myMatch;
                return true;
            }
            return false;
        }
        function matchDefaultRoute(v) {
            // try to find a route that doesn't have a path or from prop, that will be our default route
            if (!v.routeData.childProps.path && !v.routeData.childProps.from) {
                match = {
                    path: pathname,
                    url: pathname,
                    isExact: true,
                    params: {}
                };
                viewItem = v;
                return true;
            }
            return false;
        }
    }
}
function matchComponent(node, pathname, forceExact) {
    const matchProps = {
        exact: forceExact ? true : node.props.exact,
        path: node.props.path || node.props.from,
        component: node.props.component
    };
    const match = matchPath(pathname, matchProps);
    return match;
}
//# sourceMappingURL=ReactRouterViewStack.js.map
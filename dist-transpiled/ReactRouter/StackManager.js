import { RouteManagerContext, StackContext, generateId, getConfig } from '@ionic/react';
import React from 'react';
import { matchPath } from 'react-router-dom';
import { clonePageElement } from './clonePageElement';
export class StackManager extends React.PureComponent {
    constructor(props) {
        super(props);
        this.stackContextValue = {
            registerIonPage: this.registerIonPage.bind(this),
            isInOutlet: () => true
        };
        this.registerIonPage = this.registerIonPage.bind(this);
        this.transitionPage = this.transitionPage.bind(this);
        this.handlePageTransition = this.handlePageTransition.bind(this);
        this.id = generateId('routerOutlet');
    }
    componentDidMount() {
        if (this.routerOutletElement) {
            this.setupRouterOutlet(this.routerOutletElement);
            // console.log(`SM Mount - ${this.routerOutletElement.id} (${this.id})`);
            this.handlePageTransition(this.props.routeInfo);
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props.routeInfo.pathname !== prevProps.routeInfo.pathname) {
            this.handlePageTransition(this.props.routeInfo);
        }
    }
    componentWillUnmount() {
        // console.log(`SM UNMount - ${(this.routerOutletElement?.id as any).id} (${this.id})`);
        this.context.clearOutlet(this.id);
    }
    async handlePageTransition(routeInfo) {
        var _a, _b;
        // If routerOutlet isn't quite ready, give it another try in a moment
        if (!this.routerOutletElement || !this.routerOutletElement.commit) {
            setTimeout(() => this.handlePageTransition(routeInfo), 10);
        }
        else {
            let enteringViewItem = this.context.findViewItemByRouteInfo(routeInfo, this.id);
            let leavingViewItem = this.context.findLeavingViewItemByRouteInfo(routeInfo, this.id);
            if (!leavingViewItem && routeInfo.prevRouteLastPathname) {
                leavingViewItem = this.context.findViewItemByPathname(routeInfo.prevRouteLastPathname, this.id);
            }
            // Check if leavingViewItem should be unmounted
            if (leavingViewItem) {
                if (routeInfo.routeAction === 'replace') {
                    leavingViewItem.mount = false;
                }
                else if (!(routeInfo.routeAction === 'push' && routeInfo.routeDirection === 'forward')) {
                    if (routeInfo.routeDirection !== 'none' && (enteringViewItem !== leavingViewItem)) {
                        leavingViewItem.mount = false;
                    }
                }
                else if ((_a = routeInfo.routeOptions) === null || _a === void 0 ? void 0 : _a.unmount) {
                    leavingViewItem.mount = false;
                }
            }
            const enteringRoute = matchRoute((_b = this.ionRouterOutlet) === null || _b === void 0 ? void 0 : _b.props.children, routeInfo);
            if (enteringViewItem) {
                enteringViewItem.reactElement = enteringRoute;
            }
            if (!enteringViewItem) {
                if (enteringRoute) {
                    enteringViewItem = this.context.createViewItem(this.id, enteringRoute, routeInfo);
                    this.context.addViewItem(enteringViewItem);
                }
            }
            if (enteringViewItem && enteringViewItem.ionPageElement) {
                this.transitionPage(routeInfo, enteringViewItem, leavingViewItem);
            }
            else if (leavingViewItem && !enteringRoute && !enteringViewItem) {
                // If we have a leavingView but no entering view/route, we are probably leaving to
                // another outlet, so hide this leavingView. We do it in a timeout to give time for a
                // transition to finish.
                // setTimeout(() => {
                if (leavingViewItem.ionPageElement) {
                    leavingViewItem.ionPageElement.classList.add('ion-page-hidden');
                    leavingViewItem.ionPageElement.setAttribute('aria-hidden', 'true');
                }
                // }, 250);
            }
            this.forceUpdate();
        }
    }
    registerIonPage(page, routeInfo) {
        const foundView = this.context.findViewItemByRouteInfo(routeInfo, this.id);
        if (foundView) {
            foundView.ionPageElement = page;
            foundView.ionRoute = true;
        }
        this.handlePageTransition(routeInfo);
    }
    async setupRouterOutlet(routerOutlet) {
        const canStart = () => {
            const config = getConfig();
            const swipeEnabled = config && config.get('swipeBackEnabled', routerOutlet.mode === 'ios');
            if (swipeEnabled) {
                return this.context.canGoBack();
            }
            else {
                return false;
            }
        };
        const onStart = () => {
            this.context.goBack();
        };
        routerOutlet.swipeHandler = {
            canStart,
            onStart,
            onEnd: _shouldContinue => true
        };
    }
    async transitionPage(routeInfo, enteringViewItem, leavingViewItem) {
        const routerOutlet = this.routerOutletElement;
        const direction = (routeInfo.routeDirection === 'none' || routeInfo.routeDirection === 'root')
            ? undefined
            : routeInfo.routeDirection;
        if (enteringViewItem && enteringViewItem.ionPageElement && this.routerOutletElement) {
            if (leavingViewItem && leavingViewItem.ionPageElement && (enteringViewItem === leavingViewItem)) {
                // If a page is transitioning to another version of itself
                // we clone it so we can have an animation to show
                const match = matchComponent(leavingViewItem.reactElement, routeInfo.pathname, true);
                if (match) {
                    const newLeavingElement = clonePageElement(leavingViewItem.ionPageElement.outerHTML);
                    if (newLeavingElement) {
                        this.routerOutletElement.appendChild(newLeavingElement);
                        await runCommit(enteringViewItem.ionPageElement, newLeavingElement);
                        this.routerOutletElement.removeChild(newLeavingElement);
                    }
                }
                else {
                    await runCommit(enteringViewItem.ionPageElement, undefined);
                }
            }
            else {
                await runCommit(enteringViewItem.ionPageElement, leavingViewItem === null || leavingViewItem === void 0 ? void 0 : leavingViewItem.ionPageElement);
                if (leavingViewItem && leavingViewItem.ionPageElement) {
                    leavingViewItem.ionPageElement.classList.add('ion-page-hidden');
                    leavingViewItem.ionPageElement.setAttribute('aria-hidden', 'true');
                }
            }
        }
        async function runCommit(enteringEl, leavingEl) {
            enteringEl.classList.add('ion-page');
            enteringEl.classList.add('ion-page-invisible');
            await routerOutlet.commit(enteringEl, leavingEl, {
                deepWait: true,
                duration: direction === undefined ? 0 : undefined,
                direction: direction,
                showGoBack: direction === 'forward',
                progressAnimation: false,
                animationBuilder: routeInfo.routeAnimation
            });
        }
    }
    render() {
        const { children } = this.props;
        const ionRouterOutlet = React.Children.only(children);
        this.ionRouterOutlet = ionRouterOutlet;
        const components = this.context.getChildrenToRender(this.id, this.ionRouterOutlet, this.props.routeInfo, () => {
            this.forceUpdate();
        });
        return (React.createElement(StackContext.Provider, { value: this.stackContextValue }, React.cloneElement(ionRouterOutlet, {
            ref: (node) => {
                if (ionRouterOutlet.props.setRef) {
                    ionRouterOutlet.props.setRef(node);
                }
                if (ionRouterOutlet.props.forwardedRef) {
                    ionRouterOutlet.props.forwardedRef.current = node;
                }
                this.routerOutletElement = node;
                const { ref } = ionRouterOutlet;
                if (typeof ref === 'function') {
                    ref(node);
                }
            }
        }, components)));
    }
    static get contextType() {
        return RouteManagerContext;
    }
}
export default StackManager;
function matchRoute(node, routeInfo) {
    let matchedNode;
    React.Children.forEach(node, (child) => {
        const matchProps = {
            exact: child.props.exact,
            path: child.props.path || child.props.from,
            component: child.props.component
        };
        const match = matchPath(routeInfo.pathname, matchProps);
        if (match) {
            matchedNode = child;
        }
    });
    if (matchedNode) {
        return matchedNode;
    }
    // If we haven't found a node
    // try to find one that doesn't have a path or from prop, that will be our not found route
    React.Children.forEach(node, (child) => {
        if (!(child.props.path || child.props.from)) {
            matchedNode = child;
        }
    });
    return matchedNode;
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
//# sourceMappingURL=StackManager.js.map
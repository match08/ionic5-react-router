import { __rest } from "tslib";
import React from 'react';
import { Router } from 'react-router';
import { IonRouter } from './IonRouter';
export class IonReactMemoryRouter extends React.Component {
    constructor(props) {
        super(props);
        this.history = props.history;
        this.history.listen(this.handleHistoryChange.bind(this));
        this.registerHistoryListener = this.registerHistoryListener.bind(this);
    }
    handleHistoryChange(location, action) {
        if (this.historyListenHandler) {
            this.historyListenHandler(location, action);
        }
    }
    registerHistoryListener(cb) {
        this.historyListenHandler = cb;
    }
    render() {
        const _a = this.props, { children } = _a, props = __rest(_a, ["children"]);
        return (React.createElement(Router, Object.assign({}, props),
            React.createElement(IonRouter, { registerHistoryListener: this.registerHistoryListener }, children)));
    }
}
//# sourceMappingURL=IonReactMemoryRouter.js.map
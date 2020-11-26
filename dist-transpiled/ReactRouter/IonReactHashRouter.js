import { __rest } from "tslib";
import { createHashHistory as createHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import { IonRouter } from './IonRouter';
export class IonReactHashRouter extends React.Component {
    constructor(props) {
        super(props);
        const { history } = props, rest = __rest(props, ["history"]);
        this.history = history || createHistory(rest);
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
        return (React.createElement(Router, Object.assign({ history: this.history }, props),
            React.createElement(IonRouter, { registerHistoryListener: this.registerHistoryListener }, children)));
    }
}
//# sourceMappingURL=IonReactHashRouter.js.map
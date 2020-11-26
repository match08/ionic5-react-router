import React from 'react';
import { Route } from 'react-router';
export class IonRouteInner extends React.PureComponent {
    render() {
        return (React.createElement(Route, { path: this.props.path, exact: this.props.exact, render: this.props.render, computedMatch: this.props.computedMatch }));
    }
}
//# sourceMappingURL=IonRouteInner.js.map
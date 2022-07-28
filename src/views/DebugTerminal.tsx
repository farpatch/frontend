import * as React from 'react';
import Terminal from './Terminal';

class DebugTerminal extends React.Component<{}, { currentState: string }> {

    constructor(props: React.PropsWithChildren) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            currentState: "Initializing",
        };
    }

    handleChange(newState: string) {
        this.setState({ currentState: newState });
    }

    render() {
        return <Terminal ws="debugws" onStateChange={this.handleChange}>
            <div>{this.state.currentState}</div>
        </Terminal>;
    }
}

export default DebugTerminal;
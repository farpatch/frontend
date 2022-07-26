import * as React from 'react';
import Terminal from './Terminal';

class DebugTerminal extends React.Component {
    render() {
        return <Terminal ws="debugws" onData={() => {}} />;
    }
}

export default DebugTerminal;
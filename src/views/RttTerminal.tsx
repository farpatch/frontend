import * as React from 'react';
import Terminal from './Terminal';

class RttTerminal extends React.Component {
    render() {
        return <Terminal ws="ws/rtt" onData={(ws, data) => ws.send(data)} stateId='connection-status-RTT' />;
    }
}

export default RttTerminal;
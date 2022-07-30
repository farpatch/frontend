import * as React from 'react';
import Terminal from './Terminal';

class SerialTerminal extends React.Component {
    render() {
        return <>
            <Terminal ws="ws/uart" onData={(ws, data) => ws.send(data)} stateId='connection-status-Serial' />
        </>;
    }
}

export default SerialTerminal;
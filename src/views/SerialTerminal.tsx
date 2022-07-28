import * as React from 'react';
import Terminal from './Terminal';

class SerialTerminal extends React.Component {
    render() {
        return <>
        <Terminal ws="terminal" onData={(ws, data) => ws.send(data)} />
        {/* <div>{this.getStateString()}</div> */}
        </>;
    }
}

export default SerialTerminal;
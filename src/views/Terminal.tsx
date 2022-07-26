import * as React from 'react';
import XTerm from '../components/XTerm';
import { FitAddon } from 'xterm-addon-fit';
import { SerializeAddon } from "xterm-addon-serialize";
import { array } from 'prop-types';


interface TerminalProps {
    ws: string | URL,
    onData: (websocket: WebSocket, data: string) => void | null,
};

interface TerminalState {
    state: string,
    wsKey: string,
    className: string,
}

class Terminal extends React.Component<TerminalProps, TerminalState> {
    xtermRef: React.RefObject<XTerm> = React.createRef();
    fitAddon = new FitAddon();
    serializeAddon = new SerializeAddon();
    wsKey: string;

    static terminalMap = new Map<string, Terminal>();
    static savedSerialization = new Map<string, string>();
    static bufferedData = new Map<string, Array<Uint8Array>>();
    static websocketMap = new Map<string, WebSocket>();

    constructor(props: TerminalProps) {
        super(props);
        window.addEventListener('resize', () => {
            if (this.xtermRef.current !== null) {
                this.fitAddon.fit();
            }
        });
        this.wsKey = JSON.stringify(props.ws);
        Terminal.terminalMap.set(this.wsKey, this);
        this.state = {
            state: this.getStateString(),
            wsKey: this.wsKey,
            className: 'term-' + this.wsKey.replace('"', ''),
        };
    }

    getStateString() {
        var ws = Terminal.websocketMap.get(this.wsKey);
        if (!ws) {
            return "Initializing...";
        } else if (ws.readyState == WebSocket.OPEN) {
            return "Connected";
        } else {
            return "Reconnecting...";
        }
    }

    componentDidMount() {
        // Connect, but only if this is the first time we're running
        if (!Terminal.websocketMap.has(this.wsKey)) {
            this.connect();
            this.setState({ state: this.getStateString() });
        }
        var terminal = this.xtermRef.current;
        if (terminal !== null) {
            // Reconstitute the terminal window
            var serializedData = Terminal.savedSerialization.get(this.wsKey);
            if (serializedData) {
                terminal?.terminal.write(serializedData);
            }

            // If there's buffered data that was accumulated while we weren't looking, add
            // it to the terminal window.
            var buffered = Terminal.bufferedData.get(this.wsKey);
            if (buffered) {
                buffered.forEach((val) => terminal?.terminal.write(val));
            }
            this.fitAddon.fit();
        }
    }

    componentWillUnmount() {
        var serialization = this.serializeAddon.serialize();
        // Sometimes we get called twice, during which time we've restored the
        // existing buffer but it hasn't yet been painted. As a result, the
        // serialization string is "" even though it should have been restored.
        // In this case, don't bother updating the saved serialization -- it's
        // either empty, or contains the value that we will want to update later.
        if (serialization) {
            Terminal.savedSerialization.set(this.wsKey, this.serializeAddon.serialize());
            Terminal.bufferedData.delete(this.wsKey);
        }
    }

    // Connect timeout in milliseconds
    timeout = 250;

    connect = () => {
        var ws = new WebSocket("ws://" + window.location.host + "/" + this.props.ws);
        ws.binaryType = 'arraybuffer';
        Terminal.websocketMap.set(this.wsKey, ws);

        // let that = this; // cache the this
        let thatKey = this.wsKey;
        var connectInterval: NodeJS.Timeout;

        // websocket onopen event listener
        ws.onopen = () => {
            var that = Terminal.terminalMap.get(thatKey);
            if (that) {
                that.setState({ state: that.getStateString() });
                that.timeout = 250; // reset timer to 250 on open of websocket connection
            }
            clearTimeout(connectInterval); // clear Interval on on open of websocket connection
        };

        // websocket onclose event listener
        ws.onclose = e => {
            // Retry interval is double the last one, ceiling of 10 sec.
            var that = Terminal.terminalMap.get(thatKey);
            if (that) {
                var retryInterval = Math.min(10000, (that.timeout + that.timeout));
                console.log(
                    `Socket is closed. Reconnect will be attempted in ${retryInterval / 1000} seconds.`,
                    e.reason
                );

                that.timeout = retryInterval; //increment retry interval
                connectInterval = setTimeout(this.check, retryInterval); //call check function after timeout
                that.setState({ state: that.getStateString() });
            }
        };

        // websocket onerror event listener
        ws.onerror = err => {
            console.error(
                "Socket encountered error: ",
                err.type,
                "Closing socket"
            );

            Terminal.websocketMap.get(thatKey)?.close();
            Terminal.websocketMap.delete(thatKey);
        };

        ws.onmessage = e => {
            var that = Terminal.terminalMap.get(thatKey);
            var writtenData = new Uint8Array(e.data);
            // Append the data to the terminal. If no terminal is attached,
            // buffer it in the `bufferedData` dict.
            if (that && that.xtermRef.current && that.xtermRef.current?.props.className === that.state.className) {
                that.xtermRef.current?.terminal.write(writtenData);
            } else {
                var buffered = Terminal.bufferedData.get(thatKey);
                // Create a new array buffer if none exists.
                if (!buffered) {
                    buffered = [];
                    Terminal.bufferedData.set(thatKey, buffered);
                }
                buffered.push(writtenData);
            }
        };
    }

    /**
     * utilited by the @function connect to check if the connection is close, if so attempts to reconnect
     */
    check = () => {
        const ws = Terminal.websocketMap.get(this.wsKey);
        if (!ws || ws.readyState == WebSocket.CLOSED) this.connect(); //check if websocket instance is closed, if so call `connect` function.
    };

    render() {
        return <><XTerm
            ref={this.xtermRef}
            className={this.state.className}
            addons={[this.fitAddon, this.serializeAddon]}
            options={{ cursorBlink: true, convertEol: true }}
            onData={(data) => {
                var ws = Terminal.websocketMap.get(this.wsKey);
                if (ws && this.props.onData) {
                    this.props.onData(ws, data);
                }
            }}
        /><div>{this.getStateString()}</div></>;
    }
}

export default Terminal;
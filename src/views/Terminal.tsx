import * as React from 'react';
import { Box } from '@mui/material';
import XTerm from '../components/XTerm';
import { FitAddon } from 'xterm-addon-fit';
import { SerializeAddon } from "xterm-addon-serialize";
import { array } from 'prop-types';
import { appBarHeight } from '../utils/use-app-bar-height';

interface TerminalProps extends React.PropsWithChildren {
    ws: string | URL,
    stateId?: string,
    onData?: (websocket: WebSocket, data: string) => void,
    onConnected?: (websocket: WebSocket) => void,
    onDisconnected?: (websocket: WebSocket) => void,
    onStateChange?: (newState: string) => void,
};

interface TerminalState {
    state: string,
    wsKey: string,
    className: string,
    componentHeight: number | null,
}

interface WebSocketTimeout extends WebSocket {
    ontimeout?: () => void,
    intervalId?: NodeJS.Timer,
}

class Terminal extends React.Component<TerminalProps, TerminalState> {
    xtermRef: React.RefObject<XTerm> = React.createRef();
    body: React.RefObject<HTMLDivElement> = React.createRef();
    fitAddon = new FitAddon();
    serializeAddon = new SerializeAddon();
    wsKey: string;
    bodyHeight = 0;

    static terminalMap = new Map<string, Terminal>();
    static savedSerialization = new Map<string, string>();
    static bufferedData = new Map<string, Array<Uint8Array>>();
    static websocketMap = new Map<string, WebSocket>();

    constructor(props: TerminalProps) {
        super(props);
        this.wsKey = JSON.stringify(props.ws);
        Terminal.terminalMap.set(this.wsKey, this);
        var [stateString, stateColor] = this.getStateValues();
        this.state = {
            state: stateString,
            wsKey: this.wsKey,
            className: 'term-' + this.wsKey.replace('"', '').replace('"', ''),
            componentHeight: null,
        };
    }

    resizeTerminal() {
        if (this.xtermRef.current !== null) {
            var elements = document.getElementsByClassName(this.state.className);
            for (var idx = 0; idx < elements.length; idx++) {
                var element = elements[idx];
                (element as HTMLDivElement).style.height = "calc(100vh - " + appBarHeight + "px - " + this.bodyHeight + "px)";
                (element as HTMLDivElement).style.backgroundColor = "black";
            }
            this.fitAddon.fit();
        }
    }

    getStateValues() {
        var ws = Terminal.websocketMap.get(this.wsKey);
        if (!ws) {
            return ["Initializing...", 'rgb(0, 149, 255)'];
        } else if (ws.readyState == WebSocket.OPEN) {
            return ["Connected", 'rgb(75, 210, 143)'];
        } else {
            return ["Reconnecting...", 'rgb(255, 170, 0)'];
        }
    }

    updateState() {
        var [stateString, stateColor] = this.getStateValues();
        if (this.props.stateId) {
            var stateId = this.props.stateId;
            var element = document.getElementById(stateId);
            if (element) {
                element.style.backgroundColor = stateColor;
            }
        }
        this.setState({ state: stateString });
        if (this.props.onStateChange) {
            this.props.onStateChange(stateString);
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.resizeTerminal.bind(this));
        // Connect, but only if this is the first time we're running
        if (!Terminal.websocketMap.has(this.wsKey)) {
            this.connect();
            this.updateState();
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
            this.bodyHeight = this.body.current?.clientHeight || 0;
            this.resizeTerminal();
        }
        this.updateState();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeTerminal.bind(this));
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
        // Don't double-connect. If this is already in the map, then there might already
        // be a connection ongoing. In that case, don't create a new one and simply allow
        // that connection to either fail (in which case it will be retried) or succeed.
        if (Terminal.websocketMap.has(this.wsKey)) {
            return;
        }
        var ws: WebSocketTimeout = new WebSocket("ws://" + window.location.host + "/" + this.props.ws);
        ws.binaryType = 'arraybuffer';
        Terminal.websocketMap.set(this.wsKey, ws);

        // let that = this; // cache the this
        let thatKey = this.wsKey;
        var connectInterval: NodeJS.Timeout;

        // websocket onopen event listener
        ws.onopen = () => {
            var that = Terminal.terminalMap.get(thatKey);
            if (that?.props.onConnected) {
                that.props.onConnected(ws);
            }
            if (that) {
                this.updateState();
                that.timeout = 250; // reset timer to 250 on open of websocket connection
            }
            clearTimeout(connectInterval); // clear Interval on on open of websocket connection
        };

        // websocket onclose event listener
        ws.onclose = e => {
            clearInterval(ws.intervalId);

            // Retry interval is double the last one, ceiling of 10 sec.
            var that = Terminal.terminalMap.get(thatKey);
            if (that) {
                var retryInterval = Math.min(10000, (that.timeout + that.timeout));
                console.log(
                    `Socket is closed. Reconnect will be attempted in ${retryInterval / 1000} seconds.`,
                    e.reason
                );

                // Delete the websocket map entry. It will get recreated
                // by the `check()` function.
                Terminal.websocketMap.delete(thatKey);

                if (that?.props.onDisconnected) {
                    that.props.onDisconnected(ws);
                }

                that.timeout = retryInterval; //increment retry interval
                connectInterval = setTimeout(this.check.bind(that), retryInterval); //call check function after timeout
                this.updateState();
            } else {
                console.log(`No 'that' object exists!`);
                debugger;
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
        };

        ws.ontimeout = function () {
            if (ws.readyState == WebSocket.OPEN) {
                ws.send('');
            }
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

        // Send a null packet every 2000 ms, in order to ensure the wifi connection
        // is still up.
        ws.intervalId = setInterval(ws.ontimeout.bind(ws), 2000);
    }

    /**
     * utilited by the @function connect to check if the connection is close, if so attempts to reconnect
     */
    check = () => {
        const ws = Terminal.websocketMap.get(this.wsKey);
        if (!ws || ws.readyState == WebSocket.CLOSED) this.connect(); //check if websocket instance is closed, if so call `connect` function.
    };

    render() {
        return <Box height={"calc(100vh - " + appBarHeight + "px)"}>
            <XTerm
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
            />
            <div ref={this.body}>{this.props.children}</div>
        </Box>;
    }
}

export default Terminal;
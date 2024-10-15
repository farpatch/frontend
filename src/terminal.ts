const BASE_PATH = 'ws://' + window.location.host + "/ws/";

const OPCODE_DATA = 0;
const OPCODE_PING = 1;

interface DataListener {
    (data: Uint8Array): void;
}

export class KeepaliveTcpSocket {
    intervalId: NodeJS.Timeout;
    replacementCreated: boolean = false;
    connected: boolean = false;
    /// This is set to `false` when a ping is issued, and is set to
    /// `true` when a response is received.
    pingReceived: boolean = true;
    socket: WebSocket | null = null;
    kind: string;
    startTime = Date.now();

    closeEventListeners: EventListener[] = [];
    createEventListeners: EventListener[] = [];
    errorEventListeners: EventListener[] = [];
    openEventListeners: EventListener[] = [];
    messageEventListeners: DataListener[] = [];

    constructor(kind: string) {
        this.intervalId = setInterval(() => this.ontimeout(), 2000);
        this.kind = kind;
    }

    addEventListener(eventName: string, listener: EventListener, _options?: boolean | AddEventListenerOptions | undefined) {
        if (eventName === "close") {
            this.closeEventListeners.push(listener);
        } else if (eventName === "error") {
            this.errorEventListeners.push(listener);
        } else if (eventName === "open") {
            this.openEventListeners.push(listener);
        } else if (eventName === "create") {
            this.createEventListeners.push(listener);
        }
        // } else if (eventName === "message") {
        //     this.messageEventListeners.push(listener);
        // }
    };

    onclose: (event: CloseEvent) => void = (event) => { for (const listener of this.closeEventListeners) { listener(event); } };
    onerror: (event: Event) => void = (event) => { for (const listener of this.errorEventListeners) { listener(event); } };
    onopen: (event: Event) => void = (event) => { for (const listener of this.openEventListeners) { listener(event); } };
    onmessage: (data: Uint8Array) => void = (event) => { for (const listener of this.messageEventListeners) { listener(event); } };
    oncreate: (event: Event) => void = (event) => { for (const listener of this.createEventListeners) { listener(event); } };

    connect() {
        this.connected = true;
        this.recreateSocket();
    }

    ontimeout() {
        // Send "PING" packet
        if (!this.connected) {
            return;
        }
        // console.log("Ping deadline for " + this.kind + " (uptime: " + (Date.now() - this.startTime) + "ms)");
        if (this.socket?.readyState == WebSocket.OPEN) {
            if (!this.pingReceived) {
                console.log("Ping deadline for " + this.kind + " hit without having received ping response -- recreating socket");
                this.replacementCreated = true;
                this.onclose(new CloseEvent("close"));
                try {
                    this.socket?.close();
                    this.socket = null;
                } catch (e) {
                    console.log("Error closing socket");
                    console.log(e);
                }
                this.recreateSocket();
                return;
            }
            this.pingReceived = false;
            this.send(new Uint8Array(), OPCODE_PING);
        } else {
            // console.log("Socket not open, recreating socket");
            this.replacementCreated = true;
            this.onclose(new CloseEvent("close"));
            try {
                this.socket?.close();
                this.socket = null;
            } catch (e) {
                console.log("Error closing socket");
                console.log(e);
            }
            this.recreateSocket();
        }
    }

    send(data: string | Uint8Array, packetType?: number) {
        // If data is a string, convert it into a Uint8Array
        if (typeof data === "string") {
            data = new TextEncoder().encode(data);
        }

        // Prefix the data with the opcode type
        var paddedData = new Uint8Array(data.length + 1);
        paddedData.set(data, 1);
        paddedData[0] = packetType || OPCODE_DATA;

        try {
            this.socket?.send(paddedData);
        } catch (e) {
            // TODO: Buffer data and resend
            console.log("Error sending data");
            console.log(e);
        }
    }

    recreateSocket() {
        // If the socket exists and if a replacement has yet to be created,
        // close the existing socket.
        if ((this.socket !== null) && !this.replacementCreated) {
            this.socket?.close();
            this.socket = null;
        }
        this.oncreate(new Event("create"));
        this.socket = new WebSocket(BASE_PATH + this.kind);
        this.socket.binaryType = 'arraybuffer';
        this.replacementCreated = false;

        // Mark the first ping as having been received, to prevent the connection
        // from being torn down immediately.
        this.pingReceived = true;

        this.socket.onmessage = (event: MessageEvent) => {
            var data = new Uint8Array(event.data);
            var opcode = data[0];
            var payload = data.slice(1);
            if (opcode == OPCODE_PING) {
                this.pingReceived = true;
                return;
            } else if (opcode != OPCODE_DATA) {
                console.log("Received unknown opcode: " + opcode);
                return;
            }
            this.onmessage(payload);
        };

        this.socket.onerror = (event: Event) => {
            console.log("Socket error");
            // Don't recreate the socket. Instead, let the "ping" process
            // discover the error and recreate the socket.
        }

        this.socket.onclose = (event: CloseEvent) => {
            if (this.socket === null) {
                return;
            }
            this.socket.onerror = null;
            this.socket.onclose = null;
            this.socket = null;
        }

        this.socket.onopen = (event: Event) => {
            // Because of how we stack up connection requests, the browser may not
            // have closed the connection properly, even though we issue a `socket.close()`.
            // As a result, we may get lots of "open" connections that have yet to be
            // garbage collected. Force these stale connections to get closed to ease
            // the burden on the poor web server.
            if (event.target != this.socket) {
                // console.log("Ignoring event for stale socket for " + this.kind);
                (event.target as WebSocket)?.close();
                return;
            }
            this.onopen(event);
        };
    }
}

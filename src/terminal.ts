const BASE_PATH = 'ws://' + window.location.host + "/ws/";

export class KeepaliveTcpSocket {
    intervalId: NodeJS.Timeout;
    replacementCreated: boolean = false;
    socket: WebSocket | null = null;
    kind: string;

    closeEventListeners: EventListener[] = [];
    createEventListeners: EventListener[] = [];
    errorEventListeners: EventListener[] = [];
    openEventListeners: EventListener[] = [];
    messageEventListeners: EventListener[] = [];

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
        } else if (eventName === "message") {
            this.messageEventListeners.push(listener);
        } else if (eventName === "create") {
            this.createEventListeners.push(listener);
        }
    };

    onclose: (event: CloseEvent) => void = (event) => { for (const listener of this.closeEventListeners) { listener(event); } };
    onerror: (event: Event) => void = (event) => { for (const listener of this.errorEventListeners) { listener(event); } };
    onopen: (event: Event) => void = (event) => { for (const listener of this.openEventListeners) { listener(event); } };
    onmessage: (event: MessageEvent) => void = (event) => { for (const listener of this.messageEventListeners) { listener(event); } };
    oncreate: (event: Event) => void = (event) => { for (const listener of this.createEventListeners) { listener(event); } };

    connect() {
        this.recreateSocket();
    }

    ontimeout() {
        if (this.socket?.readyState == WebSocket.OPEN) {
            this.send('');
        }
    }

    send(data: string | ArrayBufferView | Blob | ArrayBufferLike) {
        try {
            this.socket?.send(data);
        } catch (e) {
            console.log("Error sending data: " + e);
            if (!this.replacementCreated) {
                this.replacementCreated = true;
                this.onclose(new CloseEvent("close"));
                this.recreateSocket();
            }
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

        this.socket.onmessage = (event: MessageEvent) => {
            this.onmessage(event);
        };

        this.socket.onerror = (event: Event) => {
            this.onerror(event);
            this.socket?.close();
        }

        this.socket.onclose = (event: CloseEvent) => {
            if (this.socket === null) {
                return;
            }
            this.socket.onerror = null;
            this.socket.onclose = null;
            clearInterval(this.intervalId);
            if (!this.replacementCreated) {
                this.replacementCreated = true;
                this.onclose(event);
                this.recreateSocket();
            } else {
                console.log("a replacement socket was already being created -- skipping");
            }
        }

        this.socket.onopen = (event: Event) => {
            this.onopen(event);
        };
    }
}

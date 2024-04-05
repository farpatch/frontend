import { WidgetState, FarpatchWidget, NavWidget } from "../interfaces";
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SerializeAddon } from '@xterm/addon-serialize';

class KeepaliveWebSocket extends WebSocket {
    intervalId: NodeJS.Timeout;
    replacementCreated: boolean = false;

    constructor(url: string) {
        super(url);
        this.intervalId = setInterval(() => this.ontimeout(), 2000);
    }

    ontimeout() {
        if (this.readyState == WebSocket.OPEN) {
            this.send('');
        }
    }
}

export class DebugWidget implements FarpatchWidget {
    name: string;
    icon: string = "scroll";
    title: string = "Debug";
    socket: KeepaliveWebSocket | undefined = undefined;
    index: number = 0;
    websocketUrl: string = "ws://" + window.location.host + "/ws/debug";

    view: HTMLElement;
    navItem: NavWidget;
    updateState: (state: WidgetState) => void = () => { };

    zork: Generator | undefined = undefined;
    zorkCallback: (value: string | PromiseLike<string>) => void = () => { };
    terminalLine: string = "";

    terminal: Terminal;
    fitAddon: FitAddon;
    serializeAddon: SerializeAddon;
    resizeFunction: () => void;
    initialized: boolean = false;
    constructor(name: string) {
        this.name = name;
        this.navItem = new NavWidget(this);
        this.view = document.createElement("div");
        this.view.classList.add("terminal");
        this.terminal = new Terminal({ theme: { background: "#000000" } });
        this.fitAddon = new FitAddon();
        this.serializeAddon = new SerializeAddon();
        this.resizeFunction = this.resizeTerminal.bind(this);
    }

    updateIndex(index: number): void {
        this.index = index;
    }

    onInit(): void {
        console.log("Initialized Debug Widget");
    }

    readLine(): Promise<string> {
        return new Promise((_resolve, _reject) => { });
    }

    onFocus(element: HTMLElement): void {
        console.log("Displaying Debug Log Widget");
        if (!this.initialized) {
            // Ensure the parent frame doesn't get any scrollbars, since we're taking up the whole view
            element.style.overflow = "hidden";
            // console.log("Initializing xterm.js");
            this.terminal.loadAddon(this.fitAddon);
            this.terminal.loadAddon(this.serializeAddon);
            this.terminal.onKey((e) => {
                // console.log("Key pressed: " + e.key);
                this.terminal.write(e.key);
                if (e.key === '\r') {
                    this.terminal.write('\n');
                }
            });
            this.terminal.open(this.view);
            this.createSocket();
            this.initialized = true;
        }
        element.appendChild(this.view);
        window.addEventListener('resize', this.resizeFunction);
        window.setTimeout(() => {
            this.terminal.focus();
            this.resizeFunction();
        }, 10);
    }

    onBlur(element: HTMLElement): void {
        console.log("Archiving Debug Widget");
        element.removeChild(this.view);
        window.removeEventListener('resize', this.resizeFunction);
    }

    // Whenever the window is resized, update the size of the terminal
    resizeTerminal() {
        this.fitAddon.fit();
    }

    createSocket() {
        if ((this.socket !== undefined) && !this.socket?.replacementCreated) {
            this.socket?.close();
        }
        this.updateState(WidgetState.Paused);
        this.socket = new KeepaliveWebSocket(this.websocketUrl);
        this.socket.binaryType = 'arraybuffer';
        this.socket.replacementCreated = false;

        this.socket.onmessage = (event: MessageEvent) => {
            this.terminal.write(new Uint8Array(event.data));
        };

        this.socket.onerror = (_event: Event) => {
            this.updateState(WidgetState.Error);
            this.socket?.close();
        }

        this.socket.onclose = (event: CloseEvent) => {
            if (typeof this.socket === "undefined") {
                return;
            }
            this.socket.onerror = null;
            this.socket.onclose = null;
            clearInterval(this.socket.intervalId);
            // if (event.wasClean) {
            //     this.terminal.write("[Websocket] Connection closed");
            // } else {
            //     // e.g. server process killed or network down
            //     // event.code is usually 1006 in this case
            //     this.terminal.write("[Websocket] Connection died");
            // }

            if (!this.socket.replacementCreated) {
                this.socket.replacementCreated = true;
                this.updateState(WidgetState.Error);
                this.createSocket();
            } else {
                console.log("a replacement socket was already being created -- skipping");
            }
        }

        this.socket.onopen = (_e: Event) => {
            this.updateState(WidgetState.Active);
            // this.terminal.write("\x1B[1;3;31m[Websocket] Connection established\x1B[0m\r\n");
        };

    }
}

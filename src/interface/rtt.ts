import { FarpatchWidget, makeNavView, WidgetState } from "../interfaces";
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SerializeAddon } from '@xterm/addon-serialize';

export class RttWidget implements FarpatchWidget {
    name: string;
    icon: string = "microchip";
    title: string = "RTT";
    index: number = 0;
    socket: WebSocket | undefined = undefined;
    websocketUrl: string = "ws://" + window.location.host + "/ws/rtt";

    view: HTMLElement;
    navItem: HTMLElement;

    terminal: Terminal;
    fitAddon: FitAddon;
    serializeAddon: SerializeAddon;
    resizeFunction: () => void;
    initialized: boolean = false;
    updateState: (state: WidgetState) => void = () => { };

    constructor(name: string) {
        this.name = name;
        this.navItem = makeNavView(this);
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
        console.log("Initialized RTT Widget");

        this.terminal.open(this.view);

        this.terminal.onData(chunk => {
            this.socket?.send(chunk)
        })
        this.fitAddon.activate(this.terminal)
        this.fitAddon.fit()
        this.terminal.focus()
    }

    onFocus(element: HTMLElement): void {
        console.log("Displaying RTT Widget");
        if (!this.initialized) {
            // Ensure the parent frame doesn't get any scrollbars, since we're taking up the whole view
            element.style.overflow = "hidden";
            console.log("Initializing xterm.js");
            this.terminal.loadAddon(this.fitAddon);
            this.terminal.loadAddon(this.serializeAddon);
            this.terminal.onKey((e) => {
                console.log("Key pressed: " + e.key);
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
        console.log("Archiving RTT Widget");
        element.removeChild(this.view);
        window.removeEventListener('resize', this.resizeFunction);
    }

    // Whenever the window is resized, update the size of the terminal
    resizeTerminal() {
        this.fitAddon.fit();
    }

    createSocket() {
        this.updateState(WidgetState.Paused);
        this.socket = new WebSocket(this.websocketUrl);
        this.socket.binaryType = 'arraybuffer';
        this.socket.onopen = (_e: Event) => {
            this.updateState(WidgetState.Active);
            this.terminal.write("\x1B[1;3;31m[Websocket] Connection established\x1B[0m\r\n");
        };

        this.socket.onmessage = (event: MessageEvent) => {
            this.terminal.write(new Uint8Array(event.data));
        };

        this.socket.onerror = (_event: Event) => {
            this.updateState(WidgetState.Error);
            this.socket?.close();
        }

        this.socket.onclose = (event: CloseEvent) => {
            if (event.wasClean) {
                this.updateState(WidgetState.Error);
                this.terminal.write("[Websocket] Connection closed");
            } else {
                // e.g. server process killed or network down
                // event.code is usually 1006 in this case
                this.updateState(WidgetState.Error);
                this.terminal.write("[Websocket] Connection died");
            }
            this.createSocket();
        }
    }
}

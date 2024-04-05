import { FarpatchWidget, NavWidget, WidgetState } from "../interfaces";
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SerializeAddon } from '@xterm/addon-serialize';
import { KeepaliveTcpSocket } from "../terminal";

export class RttWidget implements FarpatchWidget {
    name: string;
    icon: string = "chip";
    title: string = "RTT";
    index: number = 0;
    socket: KeepaliveTcpSocket;
    visible: boolean = false;

    view: HTMLElement;
    navItem: NavWidget;

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
        this.terminal = new Terminal({ theme: { background: "#000000" }, convertEol: true });
        this.fitAddon = new FitAddon();
        this.serializeAddon = new SerializeAddon();
        this.resizeFunction = this.resizeTerminal.bind(this);
        this.socket = new KeepaliveTcpSocket("rtt");
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
        this.socket.onmessage = (event: MessageEvent) => {
            this.terminal.write(new Uint8Array(event.data));
            if (!this.visible) {
                this.navItem.setHasData(true);
            }
        }
        this.socket.onopen = (_event: Event) => {
            this.navItem.updateState(WidgetState.Active);
        }
        this.socket.onclose = (_event: CloseEvent) => {
            this.navItem.updateState(WidgetState.Error);
        }
        this.socket.oncreate = (_event) => {
            this.navItem.updateState(WidgetState.Paused);
        }
        this.socket.onerror = (_event: Event) => {
            this.navItem.updateState(WidgetState.Error);
        }
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
                this.terminal.write(e.key);
                if (e.key === '\r') {
                    this.terminal.write('\n');
                }
            });
            this.terminal.open(this.view);
            this.socket.connect();
            this.initialized = true;
        }
        element.appendChild(this.view);
        window.addEventListener('resize', this.resizeFunction);
        window.setTimeout(() => {
            this.terminal.focus();
            this.resizeFunction();
        }, 10);
        this.visible = true;
        this.navItem.setHasData(false);
    }

    onBlur(element: HTMLElement): void {
        console.log("Archiving RTT Widget");
        element.removeChild(this.view);
        window.removeEventListener('resize', this.resizeFunction);
        this.visible = false;
    }

    // Whenever the window is resized, update the size of the terminal
    resizeTerminal() {
        this.fitAddon.fit();
    }
}

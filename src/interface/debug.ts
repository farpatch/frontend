import { WidgetState, FarpatchWidget, NavWidget } from "../interfaces";
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SerializeAddon } from '@xterm/addon-serialize';
import { KeepaliveTcpSocket } from "../terminal";

export class DebugWidget implements FarpatchWidget {
    name: string;
    icon: string = "scroll";
    title: string = "Debug";
    socket: KeepaliveTcpSocket = new KeepaliveTcpSocket("debug");
    index: number = 0;
    visible: boolean = false;

    view: HTMLElement;
    navItem: NavWidget;

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

        this.socket.onclose = (_event: CloseEvent) => {
            this.navItem.updateState(WidgetState.Error);
        }
        this.socket.onopen = (_event: Event) => {
            this.navItem.updateState(WidgetState.Active);
        }
        this.socket.onmessage = (event: MessageEvent) => {
            this.terminal.write(new Uint8Array(event.data));
            if (!this.visible) {
                this.navItem.setHasData(true);
            }
        }
        this.socket.onerror = (_event: Event) => {
            this.navItem.updateState(WidgetState.Error);
        }
        this.socket.oncreate = (_event) => {
            this.navItem.updateState(WidgetState.Paused);
        }
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
        this.visible = true;
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
            this.socket.connect();
            this.initialized = true;
        }
        element.appendChild(this.view);
        window.addEventListener('resize', this.resizeFunction);
        window.setTimeout(() => {
            this.terminal.focus();
            this.resizeFunction();
        }, 10);
        this.navItem.setHasData(false);
    }

    onBlur(element: HTMLElement): void {
        console.log("Archiving Debug Widget");
        element.removeChild(this.view);
        window.removeEventListener('resize', this.resizeFunction);
        this.visible = false;
    }

    // Whenever the window is resized, update the size of the terminal
    resizeTerminal() {
        this.fitAddon.fit();
    }
}

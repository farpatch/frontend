import { FarpatchWidget, WidgetState, NavWidget } from "../interfaces";
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SerializeAddon } from '@xterm/addon-serialize';

export class UartWidget implements FarpatchWidget {
    name: string;
    icon: string = "keyboard";
    title: string = "UART";
    index: number = 0;

    view: HTMLElement;
    navItem: NavWidget;

    terminal: Terminal;
    fitAddon: FitAddon;
    serializeAddon: SerializeAddon;
    resizeFunction: () => void;
    initialized: boolean = false;
    updateState: (state: WidgetState) => void = () => { };
  
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
        console.log("Initialized UART Widget");
    }
    onFocus(element: HTMLElement): void {
        console.log("Displaying UART Widget");
        if (!this.initialized) {
            // Ensure the parent frame doesn't get any scrollbars, since we're taking up the whole view
            element.style.overflow = "hidden";
            console.log("Initializing xterm.js");
            // var terminalContainer = document.createElement("div");
            // this.view.appendChild(terminalContainer);
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
            this.terminal.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\r\n');
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
        console.log("Archiving UART Widget");
        element.removeChild(this.view);
        window.removeEventListener('resize', this.resizeFunction);
    }

    // Whenever the window is resized, update the size of the terminal
    resizeTerminal() {
        this.fitAddon.fit();
    }
}

import { FarpatchWidget, makeNavView } from "../interfaces";
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SerializeAddon } from '@xterm/addon-serialize';
import JSZM from "../../lib/zork";
var co = require("../../lib/co/index.js");

export class DebugWidget implements FarpatchWidget {
    name: string;
    icon: string = "scroll";
    title: string = "Debug";
    index: number = 0;

    view: HTMLElement;
    navItem: HTMLElement;

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
        this.navItem = makeNavView(name, this.icon, this.title);
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
        return new Promise((resolve, reject) => { });
    }

    onFocus(element: HTMLElement): void {
        console.log("Displaying Debug Widget");
        if (!this.initialized) {
            // Ensure the parent frame doesn't get any scrollbars, since we're taking up the whole view
            element.style.overflow = "hidden";
            console.log("Initializing xterm.js");
            this.terminal.loadAddon(this.fitAddon);
            this.terminal.loadAddon(this.serializeAddon);
            this.terminal.onKey((e) => {
                this.terminal.write(e.key);
                if (e.key === '\h') {
                    if (this.terminalLine.length > 0) {
                        this.terminalLine = this.terminalLine.substring(0, this.terminalLine.length - 1);
                    }
                }
                if (e.key === '\r') {
                    this.terminal.write('\n');
                    var zcb = this.zorkCallback;
                    var tl = this.terminalLine;
                    this.zorkCallback = () => { };
                    this.terminalLine = "";
                    zcb(tl);
                }
                else {
                    this.terminalLine += e.key;
                }
            });
            this.terminal.open(this.view);

            var zorkTerminal = this.terminal;
            var debugWidget = this;
            fetch("/zork1.z3").then((response) => {
                response.arrayBuffer().then((buffer) => {
                    this.zork = co.co(function* () {
                        var zork = new JSZM(new Uint8Array(buffer));
                        zork.print = function* (str: string) {
                            str = str.replace("\n", "\r\n");
                            zorkTerminal.write(str);
                        };
                        zork.read =  function* (maxlen: number): Generator  {
                            // console.log("Zork: read " + maxlen);
                            var val = yield new Promise((resolve, reject) => {
                                debugWidget.zorkCallback = resolve;
                            });
                            return val;
                        };
                        yield* zork.run();
                    });
                })
            });
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

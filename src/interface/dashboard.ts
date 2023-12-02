import { FarpatchWidget, makeNavView as makeNavItem } from "../interfaces";

class DashboardItem {
  id: string;
  name: string;
  value: string;
  constructor(id: string, name: string, value: string) {
    this.id = id;
    this.name = name;
    this.value = value;
  }
  render(): HTMLElement {
    var field: HTMLElement = document.createElement("div");
    field.classList.add("dashboard-item");

    var itemTitle = document.createElement("span");
    itemTitle.classList.add("dashboard-item-title");
    itemTitle.innerText = this.name;
    // itemTitle.setAttribute("aria-hidden", "true");
    // itemTitle.classList.add("las");
    // itemTitle.classList.add("la-3x");
    // itemTitle.classList.add("la-" + this.id);
    // itemTitle.classList.add("icon");

    var itemValue: HTMLElement = document.createElement("span");
    itemValue.classList.add("dashboard-item-value");
    itemValue.innerHTML = this.value;

    // // var label: HTMLElement = document.createElement("label");
    // // label.setAttribute("for", this.id);
    // // label.setAttribute("id", this.id);
    // // label.setAttribute("aria-hidden", "true");
    // // label.innerText = this.name;

    // var input: HTMLElement = document.createElement("input");
    // input.setAttribute("name", this.id);
    // input.setAttribute("aria-labelledby", this.id);
    // input.setAttribute("type", "range");
    // input.setAttribute("value", this.value);
    // input.setAttribute("max", "10");
    // input.setAttribute("style", "--track-fill: 30%");

    // inputStack.appendChild(label);
    // inputStack.appendChild(input);
    field.appendChild(itemTitle);
    field.appendChild(itemValue);

    return field;
  }
}

class DashboardSection {
  id: string;
  name: string;
  items: DashboardItem[];
  constructor(id: string, name: string, items: DashboardItem[]) {
    this.id = id;
    this.name = name;
    this.items = items;
  }

  render(): HTMLElement {
    var root: HTMLElement = document.createElement("section");
    var header: HTMLElement = document.createElement("header");
    var h2: HTMLElement = document.createElement("h2");
    h2.innerText = this.name;
    header.classList.add("dashboard-section-header");
    header.appendChild(h2);
    root.classList.add("dashboard-section");
    root.appendChild(header);

    var fieldset: HTMLElement = document.createElement("fieldset");
    fieldset.classList.add("dashboard-section");
    for (var i = 0; i < this.items.length; i++) {
      fieldset.appendChild(this.items[i].render());
    }

    root.appendChild(fieldset);

    return root;
  }
}

export class DashboardWidget implements FarpatchWidget {
  index: number = 0;
  view: HTMLElement = document.createElement("form");
  navItem: HTMLElement;
  name: string;
  icon: string = "home";
  title: string = "Dashboard";

  sections: DashboardSection[];

  constructor(name: string) {
    this.name = name;
    this.navItem = makeNavItem(name, this.icon, this.title);

    this.sections = [
      new DashboardSection("voltages", "Voltages", [
        new DashboardItem("system-voltage", "System", "3.3V"),
        new DashboardItem("target-voltage", "Target", "1.8V"),
        new DashboardItem("usb-voltage", "USB", "5.0V"),
        new DashboardItem("extra-voltage", "Extra", "3.8V"),
      ]),
      new DashboardSection("network", "Network", [
        new DashboardItem("ip-address", "IP Address", "10.0.0.5"),
        new DashboardItem("gdb-port", "GDB Port", "2022"),
        new DashboardItem("uart-port", "UART Port", "2023"),
      ]),
      new DashboardSection("target", "Target", [
        new DashboardItem("detected-devices", "Detected Devices", "STM32F4"),
        new DashboardItem("flash-size", "Flash Size", "512k"),
        new DashboardItem("ram-size", "RAM Size", "32k"),
      ]),
      new DashboardSection("about", "About", [
        new DashboardItem("farpatch-version", "Farpatch Version", "5555239293"),
        new DashboardItem("bmp-version", "Blackmagic Version", "1.10.0"),
      ]),
    ];
  }

  updateIndex(index: number): void {
    this.index = index;
  }

  onInit(): void {
    this.view.classList.add("dashboard-view");
    for (var i = 0; i < this.sections.length; i++) {
      this.view.appendChild(this.sections[i].render());
    }

    console.log("Initialized Dashboard Widget");
  }
  onFocus(element: HTMLElement): void {
    console.log("Displaying Dashboard Widget");
    element.appendChild(this.view);
  }
  onBlur(element: HTMLElement): void {
    console.log("Archiving Dashboard Widget");
    element.removeChild(this.view);
  }
}

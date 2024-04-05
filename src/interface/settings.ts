import { WidgetState, FarpatchWidget, NavWidget } from "../interfaces";


class SettingsItem {
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
    field.classList.add("settings-item");

    var itemTitle = document.createElement("span");
    itemTitle.classList.add("settings-item-title");
    itemTitle.innerText = this.name;

    var itemValue: HTMLElement = document.createElement("span");
    itemValue.classList.add("settings-item-value");
    itemValue.id = 'settings-item-value-' + this.id;
    itemValue.innerHTML = this.value;

    field.appendChild(itemTitle);
    field.appendChild(itemValue);

    return field;
  }
}

class SettingsSection {
  id: string;
  name: string;
  items: SettingsItem[];
  constructor(id: string, name: string, items: SettingsItem[]) {
    this.id = id;
    this.name = name;
    this.items = items;
  }

  render(): HTMLElement {
    var root: HTMLElement = document.createElement("section");
    var header: HTMLElement = document.createElement("header");
    var h2: HTMLElement = document.createElement("h2");
    h2.classList.add("settings-section-title");
    h2.innerText = this.name;
    header.classList.add("settings-section-header");
    header.appendChild(h2);
    root.classList.add("settings-section");
    root.appendChild(header);

    var fieldset: HTMLElement = document.createElement("fieldset");
    fieldset.classList.add("settings-section");
    for (var i = 0; i < this.items.length; i++) {
      fieldset.appendChild(this.items[i].render());
    }

    root.appendChild(fieldset);

    return root;
  }
}

export class SettingsWidget implements FarpatchWidget {
  index: number = 0;
  view: HTMLElement = document.createElement("div");
  navItem: NavWidget;
  name: string;
  icon: string = "sliders-h";
  title: string = "Settings";
  sections: SettingsSection[];

  constructor(name: string) {
    this.name = name;
    this.navItem = new NavWidget(this);

    this.sections = [
      new SettingsSection("ap", "Access Point", [
        new SettingsItem("ap-enabled", "Enabled", ""),
        new SettingsItem("ap-ssid", "SSID", ""),
        new SettingsItem("ap-password", "Password", ""),
      ]),
      new SettingsSection("wifi", "Wifi", [
        new SettingsItem("voltage-system", "System", ""),
        new SettingsItem("voltage-target", "Target", ""),
        new SettingsItem("voltage-usb", "USB", ""),
        new SettingsItem("voltage-debug", "Debug", ""),
        new SettingsItem("voltage-ext", "Extra", ""),
      ]),
      new SettingsSection("update", "Update", [
        new SettingsItem("input", "Firmware", ""),
        new SettingsItem("start", "", ""),
      ]),
    ];

  }

  updateIndex(index: number): void {
    this.index = index;
  }

  onInit(): void {
    this.view.classList.add("settings-view");
    for (var i = 0; i < this.sections.length; i++) {
      this.view.appendChild(this.sections[i].render());
    }

    console.log("Initialized Settings Widget");
  }

  onFocus(element: HTMLElement): void {
    element.appendChild(this.view);

    fetch("/fp/status").then((response: Response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    }).then((json) => {
      if (!json) {
        throw new Error("Response was not JSON");
      }
    });
  }

  onBlur(element: HTMLElement): void {
    element.removeChild(this.view);
  }
}

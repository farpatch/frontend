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
    h2.id = 'settings-section-h2-' + this.id;
    h2.classList.add("settings-section-title");
    h2.innerText = this.name;
    header.id = 'settings-section-header-' + this.id;
    header.classList.add("settings-section-header");
    header.appendChild(h2);
    root.id = 'settings-section-' + this.id;
    root.classList.add("settings-section");
    root.appendChild(header);

    var fieldset: HTMLElement = document.createElement("fieldset");
    fieldset.id = 'settings-section-fieldset-' + this.id;
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
  wifiPasswordField: HTMLElement;

  constructor(name: string) {
    this.name = name;
    this.navItem = new NavWidget(this);

    this.sections = [
      new SettingsSection("ap", "AP Mode", [
        new SettingsItem("ap-enabled", "Enabled", ""),
        new SettingsItem("ap-ssid", "SSID", ""),
        new SettingsItem("ap-password", "Password", ""),
      ]),
      new SettingsSection("update", "Update", []),
      new SettingsSection("wifi", "Wifi Client", []),
    ];

    this.wifiPasswordField = document.createElement("form");
    var wifiPasswordInput = document.createElement("input");
    wifiPasswordInput.type = "password";
    wifiPasswordInput.name = "password";
    wifiPasswordInput.value = "";
    wifiPasswordInput.autocomplete = "off";
    wifiPasswordInput.id = "settings-item-value-wifi-password-input";
    this.wifiPasswordField.appendChild(wifiPasswordInput);
    var wifiPasswordSsid = document.createElement("input");
    wifiPasswordSsid.type = "hidden";
    wifiPasswordSsid.name = "ssid";
    wifiPasswordSsid.value = "";
    wifiPasswordSsid.id = "settings-item-value-wifi-password-ssid";
    this.wifiPasswordField.appendChild(wifiPasswordSsid);
    var wifiPasswordSubmit = document.createElement("button");
    wifiPasswordSubmit.innerText = "Connect";
    wifiPasswordSubmit.id = "settings-item-value-wifi-password-submit";
    this.wifiPasswordField.appendChild(wifiPasswordSubmit);

    var wifiPasswordForget = document.createElement("button");
    wifiPasswordForget.innerText = "Forget";
    wifiPasswordForget.id = "settings-item-value-wifi-password-forget";
    this.wifiPasswordField.appendChild(wifiPasswordForget);

    this.wifiPasswordField.onsubmit = (event) => {
      var headers = new Headers();
      var method;
      headers.append('Content-Type', 'application/json');
      headers.append('X-Custom-ssid', wifiPasswordSsid.value);
      if (event.submitter === wifiPasswordForget) {
        this.wifiPasswordField.previousSibling?.remove();
        method = "DELETE";
      } else if (event.submitter === wifiPasswordSubmit) {
        console.log("Connecting to AP");
        headers.append('X-Custom-pwd', wifiPasswordInput.value);
        var element = this.wifiPasswordField.previousSibling as HTMLElement;
        element.classList.add("settings-item-wifi-known");
        method = "POST";
      } else {
        throw new Error("Unknown submitter");
      }
      this.wifiPasswordField.remove();

      fetch("/fp/sta/connect", {
        method: method,
        headers: headers,
        body: JSON.stringify({ timestamp: Date.now() })
      }).then((response: Response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      }).then((json) => {
        if (!json) {
          throw new Error("Response was not JSON");
        }
      });
      return false;
    }
  }

  updateIndex(index: number): void {
    this.index = index;
  }

  updateSsid(ssid: Element, password: Element, enabled: Element): void {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (!(enabled as HTMLInputElement).checked) {
      headers.append('X-Custom-disable', 'true');
    } else {
      headers.append('X-Custom-ssid', (ssid as HTMLInputElement).value);
      // headers.append('X-Custom-password', (password as HTMLInputElement).value);
    }
    fetch("/fp/ap", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ timestamp: Date.now() })
    }).then((response: Response) => {
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

  onInit(): void {
    this.view.classList.add("settings-view");
    for (var i = 0; i < this.sections.length; i++) {
      this.view.appendChild(this.sections[i].render());
    }

    var ap_enabled = this.view.querySelector("#settings-item-value-ap-enabled");
    var ssid_container = this.view.querySelector("#settings-item-value-ap-ssid");
    var password_container = this.view.querySelector("#settings-item-value-ap-password");

    var ssid_input = document.createElement("input");
    ssid_input.type = "text";
    ssid_input.name = "ssid";
    ssid_input.value = "";
    ssid_input.autocomplete = "off";
    ssid_input.id = "settings-item-value-ap-ssid-input";

    var password_input = document.createElement("input");
    password_input.type = "password";
    password_input.name = "password";
    password_input.value = "";
    password_input.readOnly = true;
    password_input.disabled = true;
    password_input.id = "settings-item-value-ap-password-input";

    var enabled_checkbox = document.createElement("input");
    enabled_checkbox.type = "checkbox";
    enabled_checkbox.name = "enabled";
    enabled_checkbox.checked = false;
    enabled_checkbox.id = "settings-item-value-ap-enabled-checkbox";

    ssid_input.onchange = () => { this.updateSsid(ssid_input, password_input, enabled_checkbox) };
    enabled_checkbox.onchange = () => {
      this.updateSsid(ssid_input, password_input, enabled_checkbox);
      ssid_input.readOnly = !enabled_checkbox.checked;
      ssid_input.disabled = !enabled_checkbox.checked;
    };
    password_input.onchange = () => { this.updateSsid(ssid_input, password_input, enabled_checkbox) };

    ap_enabled?.appendChild(enabled_checkbox);
    ssid_container?.appendChild(ssid_input);
    password_container?.appendChild(password_input);

    var updateElement = this.view.querySelector("#settings-section-fieldset-update");
    var updater = document.createElement("form");
    updateElement?.appendChild(updater);

    var updaterFile = document.createElement("input") as HTMLInputElement;
    updaterFile.id = "settings-item-value-update-file";
    updaterFile.type = "file";
    updater.appendChild(updaterFile);

    var updaterInput = document.createElement("input") as HTMLInputElement;
    updaterInput.id = "settings-item-value-update-submit";
    updaterInput.type = "submit";
    updaterInput.value = "Update";
    updater.appendChild(updaterInput);

    updater.onsubmit = (event) => {
      var file = updaterFile.files?.item(0);
      if (!file) {
        throw new Error("No file selected");
      }

      fetch("/fp/flash/upload", {
        method: "POST",
        body: file
      }).then((response: Response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      }).then((json) => {
        if (!json) {
          throw new Error("Response was not JSON");
        }
        if (!json.success) {
          throw new Error("Update failed");
        }
        fetch("/fp/flash/reboot").then((response: Response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        }).then((json) => {
          if (!json) {
            throw new Error("Response was not JSON");
          }
          console.log("Rebooting");
        });
      });
      return false;
    }
  }

  rssiToIcon(rssi: number): string {
    if (rssi >= -60) {
      return 'w0';
    }
    else if (rssi >= -67) {
      return 'w1';
    }
    else if (rssi >= -75) {
      return 'w2';
    }
    else {
      return 'w3';
    }
  }

  createWifiListing(ssid: string, rssi: number): HTMLElement {
    var scanResult = document.createElement("div");
    scanResult.classList.add("settings-item-wifi");
    var scanResultTitle = document.createElement("span");
    scanResultTitle.classList.add("settings-item-title");
    scanResultTitle.classList.add(this.rssiToIcon(rssi));
    scanResultTitle.innerText = ssid;
    scanResult.appendChild(scanResultTitle);
    scanResult.onclick = (event) => {
      var input = this.wifiPasswordField.querySelector("input[type=password]") as HTMLInputElement;
      var ssid = this.wifiPasswordField.querySelector("input[type=hidden]") as HTMLInputElement;
      var forget = this.wifiPasswordField.querySelector("button#settings-item-value-wifi-password-forget") as HTMLButtonElement;
      // Insert the password field just below the item that was clicked
      if (event.currentTarget) {
        var target = event.currentTarget as HTMLElement;
        if (ssid) {
          ssid.value = target.innerText;
        }
        if (forget) {
          forget.hidden = !target.classList.contains("settings-item-wifi-known");
        }
        target.parentElement?.insertBefore(this.wifiPasswordField, target.nextSibling);
      }
      if (input) {
        input.focus();
        input.value = "";
      }
    }
    return scanResult;
  }

  onFocus(element: HTMLElement): void {
    element.appendChild(this.view);

    fetch("/fp/ap").then((response: Response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    }).then((json) => {
      if (!json) {
        throw new Error("Response was not JSON");
      }

      var enabled = document.getElementById("settings-item-value-ap-enabled-checkbox") as HTMLInputElement;
      var ssid = document.getElementById("settings-item-value-ap-ssid-input") as HTMLInputElement;
      var password = document.getElementById("settings-item-value-ap-password-input") as HTMLInputElement;
      enabled.checked = json.enabled;
      ssid.value = json.ssid;
      ssid.readOnly = !json.enabled;
      ssid.disabled = !json.enabled;
      password.value = json.password ? "********" : "";
    });

    fetch("/fp/sta").then((response: Response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    }).then((json) => {
      if (!json) {
        throw new Error("Response was not JSON");
      }

      var station_root = document.getElementById("settings-section-fieldset-wifi");
      var scanResults = document.createElement("div");
      var scanResultsEntities: { [key: string]: HTMLElement } = {};

      for (var ap in json) {
        var scanResult = this.createWifiListing(json[ap].ssid, json[ap].rssi);
        scanResults.appendChild(scanResult);

        scanResultsEntities[json[ap].ssid] = scanResult;
      }
      station_root?.replaceChildren(...[scanResults]);

      // Get the list of configured stations to add context to any stations
      // that we know about.
      fetch("/fp/sta/status").then((response: Response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      }).then((json) => {
        if (!json) {
          throw new Error("Response was not JSON");
        }

        for (var station_index in json.ssids) {
          var sta = json.ssids[station_index];
          if (scanResultsEntities[sta.ssid]) {
            scanResultsEntities[sta.ssid].classList.add("settings-item-wifi-known");
          } else {
            var scanResult = this.createWifiListing(sta.ssid, -127);
            scanResult.classList.add("settings-item-wifi-known");
            scanResults.appendChild(scanResult);
          }
        }
      });
    });

  }

  onBlur(element: HTMLElement): void {
    element.removeChild(this.view);
  }
}

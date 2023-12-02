
import { UartWidget } from "./interface/uart";
import { DashboardWidget } from "./interface/dashboard";
import { RttWidget } from "./interface/rtt";
import { DebugWidget } from "./interface/debug";
import { SettingsWidget } from "./interface/settings";

export interface FarpatchWidget {
    index: number,
    name: string,
    view: HTMLElement,
    navItem: HTMLElement,
    icon: string,
    title: string,
    updateIndex(index: number): void,
    onInit(): void,
    onFocus(element: HTMLElement): void,
    onBlur(element: HTMLElement): void,
}

export function makeNavView(name: string, icon: string, title: string): HTMLElement {
    var navView: HTMLElement = document.createElement("li");
    navView.classList.add("sidenav-item");
    navView.id = name + "-button";

    var navViewLink = document.createElement("a");
    navViewLink.classList.add("sidenav-link");

    var navViewIcon = document.createElement("span");
    navViewIcon.classList.add("las");
    navViewIcon.classList.add("la-3x");
    navViewIcon.classList.add("la-" + icon);
    navViewIcon.classList.add("icon");

    var navViewText = document.createElement("span");
    navViewText.classList.add("link-text");
    navViewText.innerText = title;

    navViewLink.appendChild(navViewIcon);
    navViewLink.appendChild(navViewText);

    navView.appendChild(navViewLink);

    return navView;
}

export const farpatchWidgets: FarpatchWidget[] = [
    new DashboardWidget("dashboard"),
    new UartWidget("uart"),
    new RttWidget("rtt"),
    new DebugWidget("debug"),
    new SettingsWidget("settings"),
];

for (var i = 0; i < farpatchWidgets.length; i++) {
    farpatchWidgets[i].updateIndex(i);
}
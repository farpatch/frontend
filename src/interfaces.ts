
import { UartWidget } from "./interface/uart";
import { DashboardWidget } from "./interface/dashboard";
import { RttWidget } from "./interface/rtt";
import { DebugWidget } from "./interface/debug";
import { SettingsWidget } from "./interface/settings";

/// Used to add an icon to the navigation bar
export enum WidgetState {
    /// No icon
    Idle,

    /// Icon is green, or otherwise "good"
    Active,

    /// Icon is yellow, or otherwise "trying to be good"
    Paused,

    /// Icon is red, or otherwise "bad"
    Error,
}

export interface FarpatchWidget {
    index: number,
    name: string,
    view: HTMLElement,
    navItem: HTMLElement,
    icon: string,
    title: string,
    updateState: (state: WidgetState) => void,
    updateIndex(index: number): void,
    onInit(): void,
    onFocus(element: HTMLElement): void,
    onBlur(element: HTMLElement): void,
}

export function makeNavView(widget: FarpatchWidget): HTMLElement {
    var navView: HTMLElement = document.createElement("li");
    navView.classList.add("sidenav-item");
    navView.id = widget.name + "-button";

    var navViewLink = document.createElement("a");
    navViewLink.classList.add("sidenav-link");

    var navViewIcon = document.createElement("span");
    navViewIcon.classList.add("las");
    navViewIcon.classList.add("la-3x");
    navViewIcon.classList.add("la-" + widget.icon);
    navViewIcon.classList.add("icon");

    var navViewText = document.createElement("span");
    navViewText.classList.add("link-text");
    navViewText.innerText = widget.title;

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
    farpatchWidgets[i].updateState = function(state: WidgetState) {
        var states = ["Idle", "Active", "Paused", "Error"];
        var icon = this.navItem;
        icon.classList.remove("widget-state-active");
        icon.classList.remove("widget-state-paused");
        icon.classList.remove("widget-state-error");
        if (state == WidgetState.Active) {
            icon.classList.add("widget-state-active");
        } else if (state == WidgetState.Paused) {
            icon.classList.add("widget-state-paused");
        } else if (state == WidgetState.Error) {
            icon.classList.add("widget-state-error");
        }
        console.log("State update for " + this.name + ": " + states[state]);
    }
}

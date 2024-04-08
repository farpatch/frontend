import { get } from 'http';
import { FarpatchWidget, farpatchWidgets } from './interfaces';

// TODO: Get the current widget from the address bar, if one exists
var currentWidget: FarpatchWidget = farpatchWidgets[0];
var widgetViews: HTMLElement[] = [];
// var currentWidgetView: HTMLElement = document.getElementById(currentWidgetName + "-view") as HTMLElement;

function collapseSidebar(main: HTMLElement, sideNav: HTMLElement) {
    main.classList.add("main-sidebar-rail");
    sideNav.classList.add("sidenav-rail");
}

function expandSidebar(main: HTMLElement, sideNav: HTMLElement) {
    main.classList.remove("main-sidebar-rail");
    sideNav.classList.remove("sidenav-rail");
}

function addToggleSidebarListener(element: HTMLElement) {
    // Hide or show the sidebar. MaterialUI calls this toggling between
    // a "rail" and a "sidebar".
    element.addEventListener('click', function () {
        // Hide or show the main content area
        var main = document.getElementsByTagName("main")[0];
        // Adjust the width of the sidebar as well
        var sideNav = document.querySelectorAll(".sidenav")[0] as HTMLElement;
        var config = getPageConfig();
        if (main.classList.contains("main-sidebar-rail")) {
            expandSidebar(main, sideNav);
            delete config['r'];
        } else {
            config['r'] = "f";
            collapseSidebar(main, sideNav);
        }
        savePageConfig(config);

    }, false);
}

function deactivateWidget(widget: FarpatchWidget) {
    widget.navItem.navView.classList.remove("sidenav-item-active");
    widgetViews[widget.index].classList.remove("main-content-active");
    widget.onBlur(widgetViews[widget.index]);
}

function activateWidget(widget: FarpatchWidget) {
    widget.navItem.navView.classList.add("sidenav-item-active");
    widgetViews[widget.index].classList.add("main-content-active");
    widget.onFocus(widgetViews[widget.index]);
}

function getPageConfig(): { [key: string]: string } {
    var hash = window.location.hash.substring(1);
    if (!hash) {
        return {};
    }
    return hash.split("&")
        .map(v => v.split(`=`, 1).concat(v.split(`=`).slice(1).join(`=`)))
        .reduce((pre, [key, value]) => ({ ...pre, [key]: value }), {});
}

function savePageConfig(config: { [key: string]: string }) {
    var hash = Object.keys(config)
        .map(key => `${key}=${config[key]}`)
        .join("&");
    window.location.hash = '#' + hash;
}

function switchToWidget(widget: FarpatchWidget) {
    if (widget === currentWidget) {
        return;
    }
    deactivateWidget(currentWidget);
    currentWidget = widget;
    activateWidget(widget);
    var config = getPageConfig();
    config['page'] = widget.name;
    savePageConfig(config);
}

// On load, add a listener for mouse clicks on the navigation bar.
function setupNavItem(widget: FarpatchWidget) {
    var w = widget;
    widget.navItem.navView.addEventListener('click', function () {
        switchToWidget(w);
    }, false);
}

document.addEventListener('DOMContentLoaded', function () {
    // Populate the page
    var body = document.getElementsByTagName("body")[0];
    var sidenav = document.createElement("nav");
    var mainView: HTMLElement = document.createElement("main");

    sidenav.classList.add("sidenav");
    var sidenavList = document.createElement("ul");
    sidenavList.classList.add("sidenav-nav");

    for (var i = 0; i < farpatchWidgets.length; i++) {
        var widget = farpatchWidgets[i];
        widget.onInit();

        var widgetView = document.createElement("div");
        widgetView.classList.add("main-content");
        widgetView.id = widget.name + "-view";
        widgetViews.push(widgetView);

        mainView.appendChild(widgetView);
        sidenavList.appendChild(widget.navItem.navView);

        setupNavItem(widget);
    }

    // Add the button to collapse the sidebar
    var sidebarFiller = document.createElement("li");
    sidebarFiller.classList.add("sidenav-item-filler");
    sidenavList.appendChild(sidebarFiller);
    var toggleSidebar = document.createElement("li");
    toggleSidebar.classList.add("sidenav-item");
    toggleSidebar.classList.add("sidenav-item-toggle");
    toggleSidebar.id = "rail-toggle-button";
    var toggleSidebarLink = document.createElement("a");
    toggleSidebarLink.classList.add("sidenav-link");
    var toggleSidebarIcon = document.createElement("span");
    toggleSidebarIcon.classList.add("si");
    toggleSidebarIcon.classList.add("si-3x");
    toggleSidebarIcon.classList.add("si-menu");
    toggleSidebarIcon.classList.add("icon");
    var toggleSidebarText = document.createElement("span");
    toggleSidebarText.classList.add("link-text");
    toggleSidebarText.innerText = "Hide";
    toggleSidebarLink.appendChild(toggleSidebarIcon);
    toggleSidebarLink.appendChild(toggleSidebarText);
    toggleSidebar.appendChild(toggleSidebarLink);
    sidenavList.appendChild(toggleSidebar);
    addToggleSidebarListener(toggleSidebar);

    sidenav.appendChild(sidenavList);
    body.appendChild(sidenav);
    body.appendChild(mainView);

    currentWidget = farpatchWidgets[0];
    var config = getPageConfig();
    if (config['page']) {
        var maybeFirstWidget = farpatchWidgets.find(w => w.name === config['page']);
        if (maybeFirstWidget) {
            currentWidget = maybeFirstWidget;
        }
    }
    if (config['r']) {
        collapseSidebar(mainView, sidenav);
    }
    activateWidget(currentWidget);

    // resizeViewport();
}, false);

import { FarpatchWidget, farpatchWidgets } from './interfaces';

// TODO: Get the current widget from the address bar, if one exists
var currentWidget: FarpatchWidget = farpatchWidgets[0];
var widgetViews: HTMLElement[] = [];
// var currentWidgetView: HTMLElement = document.getElementById(currentWidgetName + "-view") as HTMLElement;

function addToggleSidebarListener(element: HTMLElement) {
    // Hide or show the sidebar. MaterialUI calls this toggling between
    // a "rail" and a "sidebar".
    element.addEventListener('click', function () {
        // Hide or show the main content area
        var main = document.getElementsByTagName("main")[0];
        // Adjust the width of the sidebar as well
        var sideNav = document.querySelectorAll(".sidenav")[0];
        if (main.classList.contains("main-sidebar-rail")) {
            main.classList.remove("main-sidebar-rail");
            sideNav.classList.remove("sidenav-rail");
        } else {
            main.classList.add("main-sidebar-rail");
            sideNav.classList.add("sidenav-rail");
        }

    }, false);
}

function deactivateWidget(widget: FarpatchWidget) {
    widget.navItem.classList.remove("sidenav-item-active");
    widgetViews[widget.index].classList.remove("main-content-active");
    widget.onBlur(widgetViews[widget.index]);
}

function activateWidget(widget: FarpatchWidget) {
    widget.navItem.classList.add("sidenav-item-active");
    widgetViews[widget.index].classList.add("main-content-active");
    widget.onFocus(widgetViews[widget.index]);
}

function switchToWidget(widget: FarpatchWidget) {
    if (widget === currentWidget) {
        return;
    }
    deactivateWidget(currentWidget);
    currentWidget = widget;
    activateWidget(widget);
}

// On load, add a listener for mouse clicks on the navigation bar.
function setupNavItem(widget: FarpatchWidget) {
    var w = widget;
    widget.navItem.addEventListener('click', function () {
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
        sidenavList.appendChild(widget.navItem);

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
    toggleSidebarIcon.classList.add("las");
    toggleSidebarIcon.classList.add("la-3x");
    toggleSidebarIcon.classList.add("la-bars");
    toggleSidebarIcon.classList.add("icon");
    var toggleSidebarText = document.createElement("span");
    toggleSidebarText.classList.add("link-text");
    toggleSidebarText.innerText = "Hide Sidebar";
    toggleSidebarLink.appendChild(toggleSidebarIcon);
    toggleSidebarLink.appendChild(toggleSidebarText);
    toggleSidebar.appendChild(toggleSidebarLink);
    sidenavList.appendChild(toggleSidebar);
    addToggleSidebarListener(toggleSidebar);

    sidenav.appendChild(sidenavList);
    body.appendChild(sidenav);
    body.appendChild(mainView);

    currentWidget = farpatchWidgets[0];
    activateWidget(farpatchWidgets[0]);
}, false);

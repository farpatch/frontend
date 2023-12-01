import { FarpatchWidget } from './interfaces';
import { UartWidget } from './interface/uart';
import { DashboardWidget } from './interface/dashboard';

var FarpatchWidgets: { [key: string]: FarpatchWidget } = {
    "dashboard": new DashboardWidget(),
    "uart": new UartWidget(),
};

// TODO: Get the current widget from the address bar, if one exists
var currentWidgetName: string = "dashboard";
var currentWidget: FarpatchWidget = FarpatchWidgets[currentWidgetName];
var currentWidgetView: HTMLElement = document.getElementById(currentWidgetName + "-view") as HTMLElement;

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

// On load, add a listener for mouse clicks on the navigation bar.
function setupNavItem(element: HTMLElement) {
    // Get the base name of the element in order to set up the callback.
    var elementBase = element.id.replace("-button", "");
    if (typeof (FarpatchWidgets[elementBase]) === 'undefined') {
        console.log("No widget found for " + elementBase);
        // return;
    } else {
        console.log("Setting up widget for " + elementBase);
        var elementContent = document.getElementById(elementBase + "-view");
        if (typeof (elementContent) === 'undefined' || elementContent === null) {
            console.log("No element found for " + elementBase + "-view");
            return;
        }
        FarpatchWidgets[elementBase].onInit();

        if (FarpatchWidgets[elementBase] === currentWidget) {
            element.classList.add("sidenav-item-active");
            FarpatchWidgets[elementBase].onFocus(elementContent);
            currentWidgetView = elementContent;
            elementContent.classList.add("main-content-active");
        } else {
            console.log("Not initializing widget " + elementBase);
        }
    }

    // Hook "click" for each navigation item. The listener will:
    //      1. Loop through each nav item and remove the "active" class for
    //         each inactive item and add it to the newly-clicked item.
    //      2. Unhide the correct view to activate it
    element.addEventListener('click', function () {
        var main = document.getElementsByTagName("main")[0];
        var navItems = document.querySelectorAll(".sidenav-item");
        var elementBase = element.id.replace("-button", "");
        if (typeof (FarpatchWidgets[elementBase]) !== 'undefined') {
            if (FarpatchWidgets[elementBase] !== currentWidget) {
                var newElementContent = document.getElementById(elementBase + "-view");
                if (typeof (newElementContent) === 'undefined' || newElementContent === null) {
                    console.log("No element found for " + elementBase + "-view");
                    return;
                }

                currentWidget.onBlur(currentWidgetView);
                FarpatchWidgets[elementBase].onFocus(newElementContent);
                currentWidget = FarpatchWidgets[elementBase];
                currentWidgetName = elementBase;
                currentWidgetView = newElementContent;
            }
        }

        for (var i = 0; i < navItems.length; i++) {
            var navItem = navItems[i];
            if (navItem === element) {
                if (!navItem.classList.contains("sidenav-item-active")) {
                    navItem.classList.add("sidenav-item-active");
                }
            } else {
                navItem.classList.remove("sidenav-item-active");
            }
        }

        var mainViews = document.querySelectorAll(".main-content-active");
        for (var i = 0; i < mainViews.length; i++) {
            var mainView = mainViews[i];
            mainView.classList.remove("main-content-active");
        }

        var elementBase = element.id.replace("-button", "");
        var elementContent = document.getElementById(elementBase + "-view");
        if (typeof (elementContent) === 'undefined' || elementContent === null) {
            console.log("No element found for " + elementBase + "-view");
            return;
        }
        elementContent.classList.add("main-content-active");
    }, false);
}

document.addEventListener('DOMContentLoaded', function () {
    var navItems = document.querySelectorAll(".sidenav-item");
    for (var i = 0; i < navItems.length; i++) {
        // For the "toggle" button, don't add a listener. Instead, have it
        // toggle the visibility of the sidebar.
        if (navItems[i].classList.contains("sidenav-item-toggle")) {
            addToggleSidebarListener(navItems[i] as HTMLElement);
        } else {
            setupNavItem(navItems[i] as HTMLElement);
        }
    }

    // var navItems = document.querySelectorAll(".main-viewport");
    // for (var i = 0; i < navItems.length; i++) {
    //     addNavListener(navItems[i]);
    // }
}, false);

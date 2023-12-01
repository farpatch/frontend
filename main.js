
function addTiggleSidebarListener(element) {
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
function addNavListener(element) {
    // Hook "click" for each navigation item. The listener will:
    //      1. Loop through each nav item and remove the "active" class for
    //         each inactive item and add it to the newly-clicked item.
    //      2. Unhide the correct view to activate it
    element.addEventListener('click', function () {
        var navItems = document.querySelectorAll(".sidenav-item");
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

        var navItems = document.querySelectorAll(".main-content-active");
        for (var i = 0; i < navItems.length; i++) {
            var navItem = navItems[i];
            navItem.classList.remove("main-content-active");
        }

        var elementBase = element.id.replace("-button", "");
        var elementContent = document.getElementById(elementBase + "-view");
        elementContent.classList.add("main-content-active");
    }, false);
}

document.addEventListener('DOMContentLoaded', function () {
    var navItems = document.querySelectorAll(".sidenav-item");
    for (var i = 0; i < navItems.length; i++) {
        // For the "toggle" button, don't add a listener. Instead, have it
        // toggle the visibility of the sidebar.
        if (navItems[i].classList.contains("sidenav-item-toggle")) {
            addTiggleSidebarListener(navItems[i]);
        } else {
            addNavListener(navItems[i]);
        }
    }

    // var navItems = document.querySelectorAll(".main-viewport");
    // for (var i = 0; i < navItems.length; i++) {
    //     addNavListener(navItems[i]);
    // }
}, false);

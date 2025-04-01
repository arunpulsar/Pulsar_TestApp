let currentIndex = 0; // Index to track which set of tabs is currently visible
const totalTabs = 5; // Total number of tabs in the interface
let visibleTabs = 3; // Number of visible tabs initially

/**
 * Slides between sets of tabs based on the direction.
 *
 * @param {number} direction - 1 to move forward, -1 to move backward.
 */
function slideTabs(direction) {
  if (direction === 1 && currentIndex === 0) {
    // Move from the first three tabs to the last two tabs
    currentIndex = totalTabs - 2;
    if (isReflectE || connectionType == "serial") {
      visibleTabs = 2;
    } else {
      visibleTabs = 1;
    }
  } else if (direction === -1 && currentIndex === totalTabs - 2) {
    // Move from the last two tabs back to the first three tabs
    currentIndex = 0;
    visibleTabs = 3;
  }

  // Update visibility after sliding tabs
  updateVisibility();
}

/**
 * Updates the visibility of tabs based on the currentIndex and visibleTabs.
 */
function updateVisibility() {
  const tabs = document.querySelectorAll(".accordion-tab");

  tabs.forEach((tab, index) => {
    tab.style.display = "none"; // Hide all tabs by default
    if (index >= currentIndex && index < currentIndex + visibleTabs) {
      tab.style.display = "block"; // Show only the tabs that are within the current range
    }
  });

  // Hide or show the arrows based on the currentIndex and visibleTabs
  if (currentIndex === 0) {
    document.getElementById("prev-arrow").style.display = "none"; // Hide the left arrow when showing the first set of tabs
    document.getElementById("next-arrow").style.display = "flex"; // Show the right arrow to slide to the next set of tabs
  } else if (currentIndex === totalTabs - 2) {
    document.getElementById("prev-arrow").style.display = "flex"; // Show the left arrow to go back to the first set of tabs
    document.getElementById("next-arrow").style.display = "none"; // Hide the right arrow when showing the last set of tabs
  }
}

// Initial call to set the visibility of tabs on page load
updateVisibility();

/**
 * Opens a specific tab and displays its content.
 *
 * @param {Event} evt - The event that triggers the tab open action.
 * @param {string} tabName - The ID of the tab to display.
 */
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;

  // Hide all tabs by default
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Remove the "active" class from all tab links
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Display the clicked tab and mark it as active
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

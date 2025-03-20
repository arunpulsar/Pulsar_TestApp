let prodModal_open = 0;
/**
 * Opens the production setup modal and overlay for configuring various settings.
 *
 * This function displays the modal and overlay for the production setup,
 * which includes options for accelerometer settings, transducer settings, and time settings.
 */
function openProdModal() {
  // Display the production setup modal and overlay
  document.getElementById("modal_prod_setup").style.display = "block";
  document.getElementById("modalOverlayProd").style.display = "block";
  prodModal_open = 1;
}

/**
 * Closes the production setup modal and overlay.
 *
 * This function hides the production setup modal and overlay when the user
 * finishes configuring the settings.
 */
function closeProdModal() {
  // Hide the production setup modal and overlay
  document.getElementById("modal_prod_setup").style.display = "none";
  document.getElementById("modalOverlayProd").style.display = "none";
  document.getElementById("xAxis").value = "";
  document.getElementById("yAxis").value = "";
  document.getElementById("zAxis").value = "";
  document.getElementById("xMid").value = "";
  document.getElementById("yMid").value = "";
  document.getElementById("zMid").value = "";
  document.getElementById("calStat").value = "";
  document.getElementById("tiltEnable").value = "";
  document.getElementById("upTime").value = "";
  document.getElementById("coreTemp").value = "";
  document.getElementById("coreMin").value = "";
  document.getElementById("coreMax").value = "";
  document.getElementById("avgSig").value = "";
  document.getElementById("capSupply").value = "";
  document.getElementById("transducerTemp").value = "";
  document.getElementById("transducerType").value = "";
  document.getElementById("measurementUnits").value = "";
  document.getElementById("serialNumber").value = "";
  document.getElementById("distGet").value = "";
  prodModal_open = 0;
  document.getElementById("cmd").value = "/ACCESS:" + 0;
  document.getElementById("cmd").type = "password";
  send_command();
}

let timeoutID_accel_cal; // Declare a variable to store the timeout ID for accelerometer calibration

/**
 * Sends a command to calibrate the accelerometer and displays a loading screen.
 *
 * This function sends the "ACCEL CAL" command, which starts the accelerometer calibration process.
 * A timeout is set for 25 seconds, after which a failure loading screen is shown if calibration doesn't complete.
 */
function calibrateAccelerometer() {
  sendTX("ACCEL CAL");
  showLoadingScreen();
  CommandSent = "ACCEL CAL";

  // Set a timeout of 25 seconds for accelerometer calibration
  timeoutID_accel_cal = setTimeout(() => {
    hideLoadingScreen_fail(); // Hide the loading screen if calibration fails
  }, 25000);
}

/**
 * Sends a command to refresh the accelerometer data.
 *
 * This function sends the "REFRESH ACCEL" command to retrieve the latest accelerometer readings.
 */
function refreshAccelerometer() {
  sendTX("REFRESH ACCEL");
  CommandSent = "REFRESH ACCEL";
}

/**
 * Sends a command to get the current transducer temperature.
 *
 * This function sends the "/P586" command to query the transducer temperature.
 */
function getTransducerTemp() {
  document.getElementById("transducerTemp").value = "";
  sendTX("/P586");
  CommandSent = "temp_query";
}

/**
 * Sends a command to set the transducer temperature.
 *
 * This function retrieves the temperature value from the input field and sends it via the "/P245" command.
 */
function setTransducerTemp() {
  sendTX("/P245:" + document.getElementById("transducerTemp").value);
  CommandSent = "temp_set";
}

/**
 * Sends a command to get the type of transducer.
 *
 * This function sends the "/P101" command to query the transducer type.
 */
function getTransducerType() {
  document.getElementById("transducerType").value = "";
  sendTX("/P101");
  CommandSent = "transducertype_query";
}

/**
 * Sends a command to set the transducer type.
 *
 * This function retrieves the selected transducer type from the input field and sends it via the "/P101" command.
 */
function setTransducerType() {
  sendTX("/P101:" + document.getElementById("transducerType").value);
  CommandSent = "transducertype_set";
}

/**
 * Sends a command to get the current measurement units.
 *
 * This function sends the "/P104" command to query the measurement units.
 */
function getMeasurementUnits() {
  document.getElementById("measurementUnits").value = "";
  sendTX("/P104");
  CommandSent = "measurementunits_query";
}

/**
 * Sends a command to set the measurement units.
 *
 * This function retrieves the selected measurement units from the input field and sends it via the "/P104" command.
 */
function setMeasurementUnits() {
  sendTX("/P104:" + document.getElementById("measurementUnits").value);
  CommandSent = "measurementunits_set";
}

/**
 * Sends a command to get the serial number.
 *
 * This function sends the "/P92" command to query the serial number.
 */
function getSerialNumber() {
  document.getElementById("serialNumber").value = "";
  sendTX("/P92");
  CommandSent = "serialnumber_query";
}

/**
 * Sends a command to set the serial number.
 *
 * This function retrieves the serial number from the input field and sends it via the "/P92" command.
 */
function setSerialNumber() {
  sendTX("/P92:" + document.getElementById("serialNumber").value);
  CommandSent = "serialnumber_set";
}

/**
 * Sends a command to refresh the live data.
 *
 * This function sends the "REFRESH LIVE" command to retrieve live data from the device.
 */
function refreshLiveData() {
  sendTX("REFRESH LIVE");
  CommandSent = "REFRESH LIVE";
}

/**
 * Sends a command to reset the unit.
 *
 * This function sends the "RESET UNIT" command to reset the device.
 */
function resetUnit() {
  sendTX("RESET UNIT");
  CommandSent = "RESET UNIT";
}

/**
 * Sends a command to get the distance selection.
 *
 * This function sends the "GET DIST" command to query the distance selection.
 */
function getdistSelect() {
  sendTX("GET DIST");
  CommandSent = "GET DIST";
}

/**
 * Sends a command to set the distance selection.
 *
 * This function retrieves the selected distance value from the input field and sends it via the "DIST SELECT" command.
 */
function setdistSelect() {
  var select = document.getElementById("distSelect");
  var selectedValue = select.value;
  sendTX("DIST SELECT:" + selectedValue);
  CommandSent = "SET DIST";
}

/**
 * Sends a command to set the default unit.
 *
 * This function sends the "/P88:1" command to set the default unit on the device.
 */
function defaultUnit() {
  document.getElementById("defaultUnit_button").style.backgroundColor = "#FFCE34";
  sendTX("/P88:1");
  CommandSent = "DEFAULT UNIT";
}

/**
 * Sends a command to get the current time.
 *
 * This function sends the "GET TIME" command to query the current time on the device.
 */
function getTime() {
  sendTX("GET TIME");
  CommandSent = "GET TIME";
}

/**
 * Sends a command to set the time on the device.
 *
 * This function retrieves the current time from the system, formats it, and sends it via the "SET TIME" command.
 */
function setTime() {
  // Get the current date and time from the system
  let currentTime = new Date();
  let day = String(currentTime.getDate()).padStart(2, "0");
  let month = String(currentTime.getMonth() + 1).padStart(2, "0");
  let year = String(currentTime.getFullYear()).slice(-2);
  let hours = String(currentTime.getHours()).padStart(2, "0");
  let minutes = String(currentTime.getMinutes()).padStart(2, "0");
  let seconds = String(currentTime.getSeconds()).padStart(2, "0");

  // Format the time as "DD-MM-YY HH:MM:SS"
  let time = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

  // Set the time value in the input field and send the "SET TIME" command
  var select = document.getElementById("setTime");
  select.value = time;
  sendTX("SET TIME:" + time);
  CommandSent = "SET TIME";
}
function sendAccess() {
  var select = document.getElementById("access-box");
  // if (connectionType === "serial") {
  //   sendTX("/ACCESS:" + select.value);
  // } else if (connectionType === "bluetooth") {
  //   sendAT("/ACCESS:" + select.value);
  // }
  // CommandSent = "ACCESS";
  document.getElementById("cmd").value = "/ACCESS:" + select.value;
  document.getElementById("cmd").type = "password";
  send_command();
}
function copyText() {
  const logText = document.getElementById("log");
  logText.select();
  document.execCommand("copy");
}

async function opendistXML() {
  // Create an input element to select a file
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".xml"; // Accept only XML files

  // Event handler when a file is selected
  fileInput.onchange = async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    // Read the file contents
    const text = await file.text();

    // Parse the XML content
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");
    const distributors = xmlDoc.getElementsByTagName("distributor");

    // Get the select element
    const select = document.getElementById("distSelect");

    // Clear existing options
    select.innerHTML = "";

    // Populate the select element with options
    for (let distributor of distributors) {
      const name = distributor.getElementsByTagName("name")[0].textContent;
      const value = distributor.getElementsByTagName("value")[0].textContent.trim();

      const option = document.createElement("option");
      option.value = value;
      option.textContent = name;
      select.appendChild(option);
    }
  };

  // Trigger file selection dialog
  fileInput.click();
}

// saveProdSettings() is going to send "FACTORY CAL"
function saveProdSettings() {
  document.getElementById("saveProdSettings-button").style.backgroundColor = "#FFCE34";
  sendTX("FACTORY CAL");
  CommandSent = "FACTORY CAL";
}

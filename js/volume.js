let p_tid = {};
for (let i = 600; i <= 641; i++) {
  p_tid[`p${i}_tid`] = 0;
}

/**
 * Sets the volume by calling the `displayVesselShape` function with a parameter of 1.
 * This is used to send a command for updating the vessel shape based on the selected value.
 */
function set_volume() {
  // Call displayVesselShape with a value of 1 to send the command
  displayVesselShape(1);
}

/**
 * Updates the vessel image or sends a command based on the selected vessel shape.
 *
 * @param {number} call - A flag to determine if a command should be sent (1) or
 *                        if the vessel image should be updated (0).
 */
function displayVesselShape(call) {
  // Get the select element with ID 'p600List'
  var select = document.getElementById("p600List");
  // Update the image source or send a command based on the selected value
  if (select.value != 0) {
    if (call == 1) {
      // If call is 1, set an interval to repeatedly send the command
      p_tid[`p${600}_tid`] = setInterval(function () {
        var selectedValue = select.value; // Retrieve the selected value each time
        if (connectionType === "serial") {
          // Send a command over serial connection
          sendTX("/P600:" + (selectedValue - 1));
        } else if (connectionType === "bluetooth") {
          // Send a command over AT connection
          sendAT("/P600:" + (selectedValue - 1));
        }
      }, 1500);
      CommandSent = "";
    } else {
      // If call is not 1, update the vessel image
      var image = document.getElementById("vesselImage");
      image.src = "./img/Volume/Vessel_" + (select.value - 1) + ".bmp";
    }
  }
}

/**
 * Updates the volume parameter based on the input value from the given element ID.
 * Sends a command depending on the connection type and input element ID.
 *
 * @param {string} id - The ID of the input element (e.g., "p601-box", "p602-box").
 */
function volume_param(id) {
  // Get the trimmed value from the input element with the specified ID
  var inputValue = document.getElementById(id).value.trim();

  // Check if the input value is a valid number
  if (!isNaN(inputValue) && inputValue !== "" && inputValue <= 100e3) {
    var number = parseFloat(inputValue);
    // Define an interval to repeatedly send the command
    p_tid[`p${id.slice(1, 4)}_tid`] = setInterval(function () {
      if (id === "p601-box") {
        if (connectionType === "serial") {
          sendTX("/P601:" + number);
        } else if (connectionType === "bluetooth") {
          sendAT("/P601:" + number);
        }
      }
      if (id === "p602-box") {
        if (connectionType === "serial") {
          sendTX("/P602:" + number);
        } else if (connectionType === "bluetooth") {
          sendAT("/P602:" + number);
        }
      }
      if (id === "p603-box") {
        if (connectionType === "serial") {
          sendTX("/P603:" + number);
        } else if (connectionType === "bluetooth") {
          sendAT("/P603:" + number);
        }
      }
      if (id === "p606-box") {
        if (number <= 10e8) {
          if (connectionType === "serial") {
            sendTX("/P606:" + number);
          } else if (connectionType === "bluetooth") {
            sendAT("/P606:" + number);
          }
        } else {
          // Handle the case where the input is not a valid number
          document.getElementById(id).value = "";
          hideLoadingScreen_fail();
          reset_volume_ui();
          alert(lang_map[164]);
        }
      }
      CommandSent = "";
    }, 1500);
  } else {
    // Handle the case where the input is not a valid number
    document.getElementById(id).value = "";
    hideLoadingScreen_fail();
    reset_volume_ui();
    alert(lang_map[164]);
  }
}

function reset_volume_ui() {
  for (let i = 601; i <= 603; i++) {
    document.getElementById(`p${i}-box`).value = "";
  }
  document.getElementById(`p606-box`).value = "";
  for (let i = 610; i <= 641; i++) {
    document.getElementById(`p${i}-box`).value = "";
  }
}
/**
 * Parses the incoming ID, extracts the parameter number, and sends the value using the `sendTX` function.
 *
 * @param {string} id - The ID of the input element to parse (e.g., "p610-box").
 */
function breakpoints(id) {
  // Get the trimmed value from the input element with the specified ID
  var inputValue = document.getElementById(id).value.trim();
  // Check if the input value is a valid number
  if (!isNaN(inputValue) && inputValue !== "") {
    var number = parseFloat(inputValue);
    // If reset_breakpoints_var is set, override the number with 0
    if (reset_breakpoints_var == 1) {
      number = 0;
    }
    // Extract the number part from the ID (e.g., "p610-box" -> "610")
    var parsedId = id.match(/p(\d+)-box/);
    if (parsedId && parsedId[1]) {
      // Format the extracted ID for transmission (e.g., "/P610:")
      var formattedId = "/P" + parsedId[1] + ":";
      updateProgress();
      // Send the formatted command using sendTX with the extracted value
      p_tid[`p${parsedId[1]}_tid`] = setInterval(function () {
        if (connectionType === "serial") {
          sendTX(formattedId + number);
        } else if (connectionType === "bluetooth") {
          sendAT(formattedId + number);
        }
      }, 1500);
      CommandSent = "";
    } else {
      // Handle the case where the ID does not match the expected pattern
      // console.log("Invalid ID format. Please ensure the ID is in the correct format (e.g., p610-box).");
    }
  } else {
    // Handle the case where the input is not a valid number
    document.getElementById(id).value = "";
    alert(lang_map[164]);
  }
}

/**
 * Concatenates segments based on the input set value, while replacing the middle 32 segments of the parameter set 2.
 *
 * @param {number} set - The set value to determine the source of new segment data.
 */
function concatenateSegments(set) {
  // Replace the new segment with the float values from the 32 breakpoints
  // let newSegmentsStr = "3F800000".repeat(32);
  let newSegmentsStr = "";
  newSegmentsStr = breakpoints_to_hex(set);
  // Ensure the string has exactly 256 characters (32 segments of 8 characters)
  if (newSegmentsStr.length !== 256) {
    throw new Error("The new segments string must contain exactly 256 characters (32 segments).");
  }
  // Split the new segments string into 8-character chunks
  let newSegments = [];
  for (let i = 0; i < newSegmentsStr.length; i += 8) {
    newSegments.push(newSegmentsStr.slice(i, i + 8));
  }
  // Define the original hex string for parameter set 2 and split it into 8 character chunks
  let originalHexString = temp_set2_storage;
  let originalHexChunks = [];
  for (let i = 0; i < originalHexString.length; i += 8) {
    originalHexChunks.push(originalHexString.slice(i, i + 8));
  }
  // Skip the first 21 original segments
  let result = originalHexChunks.slice(0, 21);

  // Add the new 32 segments
  result = result.concat(newSegments);

  // Add the next 7 original segments (from segment 53 to 59)
  result = result.concat(originalHexChunks.slice(53, 60));

  // Concatenate all segments back into a single string
  result.join("");

  // Prepare the parsed data from the combined hex string
  const parsedData_vol = prepareParsedData(result.join(""));

  // Create a Uint8Array from the parsed data to include all 60 segments
  const vol_set = createUint8Array(parsedData_vol, 0, 60); // Process all 60 segments

  // Concatenate the string identifier with the Uint8Array for the full dataset
  const combined_vol_set = concatenateStringAndUint8Array("/SET2(60):", vol_set);

  // Send the combined dataset
  sendTX(combined_vol_set, true);
  // Reset the CommandSent variable
  CommandSent = "";
}

/**
 * Converts the entire hex string into an array of Uint8Array objects for parsed data.
 *
 * @param {string} hexString - A string containing hexadecimal values. Each segment should be 8 characters long.
 * @returns {Array<Object>} - An array of objects, where each object contains a Uint8Array representing
 *                            a segment of the hex string.
 */
function prepareParsedData(hexString) {
  const parsedData_vol = [];
  // Loop through the hex string, extracting 8-character segments
  for (let i = 0; i < hexString.length; i += 8) {
    const segment = hexString.slice(i, i + 8);

    // Convert the hex segment into a Uint8Array and push it as an object to the parsedData array
    parsedData_vol.push({ uint8Array: hexStringToUint8Array(segment) });
  }
  return parsedData_vol;
}

/**
 * Converts a hexadecimal string into a Uint8Array.
 *
 * @param {string} hexString - A string containing hexadecimal values.
 *                             The string should have an even length.
 * @returns {Uint8Array} - A typed array containing the byte values represented by the hex string.
 */
function hexStringToUint8Array(hexString) {
  const byteArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray[i / 2] = parseInt(hexString.slice(i, i + 2), 16);
  }
  return byteArray;
}

/**
 * Function to generate a 32-segment hex string from the input boxes of the breakpoints.
 *
 * @param {number} set - The set value (1 or 0). If set is 1, generate a hex string
 *                       from the input values; if set is 0, generate a hex string
 *                       representing 32 segments of zeros.
 * @returns {string} - A hex string representing the 32 segments.
 */
function breakpoints_to_hex(set) {
  let newSegment_temp = "";

  if (set == 1) {
    // Generate the hex string from the input values (p610-box to p641-box)
    for (let i = 610; i <= 641; i++) {
      const id = `p${i}-box`;
      const inputValue = Number(document.getElementById(id).value.trim());

      // Convert the numerical value to a big-endian hex string
      const hexValue = floatToBigEndianHex(inputValue);
      newSegment_temp += hexValue;
    }
  } else if (set == 0) {
    // Generate a hex string representing 32 segments of zeros
    newSegment_temp = "00000000".repeat(32); // 32 segments of 8 zeros each
  }
  return newSegment_temp;
}

/**
 * ================================================================
 * Individual Breakpoint Management Functions
 * ================================================================
 * The following functions provide functionality to manage breakpoints individually
 * by setting or resetting specific sets of parameters. These functions are used to:
 *
 * - Set individual breakpoints for specific parameter sets (set 1 or set 2).
 * - Update input boxes to reflect the current breakpoint values.
 * - Reset all breakpoint parameters to their default values.
 *
 * These functions are intended for cases where parameters need to be updated or reset
 * sequentially rather than sending them all at once in a concatenated segment.
 * They rely on the `breakpoints` function to handle the actual setting of individual values.
 *
 * Usage: This can work in a system that does not support dealing with hex strings for
 * changing parameters.
 */

/**
 * Sets the breakpoints for set 1 by calling the breakpoints function
 * and updating the set1 and set2 variables accordingly.
 */
function set_breakpoints_1() {
  // Set the flags for set1 and set2
  set1 = 1;
  set2 = 1;
  reset_breakpoints_var = 0;
  // Call the breakpoints function for the input box identified by 'p610-box'
  breakpoints("p610-box");
}
/**
 * Resets the breakpoints by setting specific variables to their default values
 * and calling the `breakpoints` function.
 */
function reset_breakpoints() {
  // Reset the values for set1, set2, and reset_breakpoints_var
  set1 = 0;
  set2 = 0;
  reset_breakpoints_var = 1;
  // Call the breakpoints function to reset the input box identified by 'p610-box'
  breakpoints(`p610-box`);
}
/**
 * Handles the update of breakpoints by processing a message received in hexadecimal format,
 * extracting values, and updating the corresponding input boxes.
 */
function handle_breakpoint_update(asciiMessage) {
  // Match the pattern '/Pxxx:y' where xxx is the parameter number and y is the value
  const match = asciiMessage.match(/\/P(\d{3}):(\d+)/);
  if (match) {
    // Extract the parameter number (e.g., '610') and the value (e.g., '0')
    const pNumber = match[1];
    const value = Number(match[2]);
    // Update the corresponding input box with the extracted value
    document.getElementById(`p${pNumber}-box`).value = value;
    clearInterval(p_tid[`p${pNumber}_tid`]);
    clearTimeout(bar_responseTimeout);
    // Calculate the next parameter number (e.g., for '610', the next would be '611')
    const nextPNumber = parseInt(pNumber) + 1;
    delay(1000);
    // If the next parameter is within range, and set1 or set2 is active, call the breakpoints function
    if ((nextPNumber <= 625 && set1 == 1) || (nextPNumber <= 641 && set2 == 1)) {
      breakpoints(`p${nextPNumber}-box`);
    }
    // If the reset_breakpoints_var is set, call breakpoints for the next parameter within the range
    if (reset_breakpoints_var == 1 && nextPNumber <= 641) {
      breakpoints(`p${nextPNumber}-box`);
    }
  }
}

// Also, for individual breakpoint updates, to handle the breakpoint updates the following logic may be used
// inside the UART listening function:
// if (
//   !hexToAscii(receiveBufferHex).includes("/P600") &&
//   !hexToAscii(receiveBufferHex).includes("/P601") &&
//   !hexToAscii(receiveBufferHex).includes("/P602") &&
//   !hexToAscii(receiveBufferHex).includes("/P603") &&
//   !hexToAscii(receiveBufferHex).includes("/P605") &&
//   !hexToAscii(receiveBufferHex).includes("/P606") &&
//   !hexToAscii(receiveBufferHex).includes("/P604") &&
//   !hexToAscii(receiveBufferHex).includes("/P607") &&
//   !hexToAscii(receiveBufferHex).includes("/P697") &&
//   c_state == 3
// ) {
//   handle_breakpoint_update();
// }
//
// This will ensure that when the c_state = 3, i.e. when the application is at the third accordion (VOLUME tab), and the
// listening event is triggered by any incoming data, it is safe to assume it is a breakpoint update reply, and can
// call the function "handle_breakpoint_update()".

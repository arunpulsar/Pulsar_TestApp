/**
 * Function to get data from a file and parse it.
 *
 * Opens an XML file, reads its contents, and processes it to update relevant data
 * and generate specific parameter sets.
 */
async function openXML() {
  // Create an input element to select a file
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".xml"; // Accept only XML files

  // Event handler when a file is selected
  fileInput.onchange = async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    // Create a FileReader to read the file content
    const filereader = new FileReader();

    // Event handler when the file is successfully read
    filereader.onload = async function (e) {
      xml_loaded = true; // Mark that XML has been loaded
      const xmlString = e.target.result; // Get the XML string from the file
      const parsedData = parseXML(xmlString); // Parse the XML string
      table_update(parsedData); // Update the table with parsed data

      // Create Uint8Array for different sets of parameters from the parsed data
      const firstSet = createUint8Array(parsedData, 0, 60); // First 60 parameters
      const secondSet = createUint8Array(parsedData, 60, 60); // Next 60 parameters
      let remainingCount = parsedData.length - 120;
      const remainingSet = createUint8Array(parsedData, 120, remainingCount); // Remaining parameters up to 158

      // Combine the sets with their respective headers and parameter data
      combined_firstSet = concatenateStringAndUint8Array("/SET1(60):", firstSet);
      combined_secondSet = concatenateStringAndUint8Array("/SET2(60):", secondSet);
      let remainingSetHeader = "/SET3(" + remainingCount + "):";
      combined_remainingSet = concatenateStringAndUint8Array(remainingSetHeader, remainingSet);
    };

    // Start reading the selected file as text
    filereader.readAsText(file);
  };

  // Programmatically trigger a click on the file input to open the file dialog
  fileInput.click();
}
/**
 * Parses the XML string to extract and process parameter data.
 *
 * This function reads the XML string, extracts the relevant parameter information,
 * converts it to the necessary format, and returns the parsed data.
 *
 * @param {string} xmlString - The XML string to parse.
 * @returns {Array} - An array of parsed parameter data.
 */
function parseXML(xmlString) {
  // Create a DOMParser to parse the XML string into an XML document
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  // Get all <Parameters> elements from the parsed XML
  const parametersList = xmlDoc.getElementsByTagName("Parameters");
  parsedData = []; // Initialize an array to store parsed data
  const indexSet = new Set(); // Set to track unique indexes

  // Loop through all parameters in the XML
  for (let i = 0; i < parametersList.length; i++) {
    const parameters = parametersList[i];

    // Extract the index of the current parameter
    const index = parameters.getElementsByTagName("Index")[0].textContent;

    // Skip if the index has already been processed (ensure uniqueness)
    if (indexSet.has(index)) {
      continue;
    }

    // Extract the parameter name and its value
    const parameter = parameters.getElementsByTagName("Parameter")[0].textContent;
    const value = parameters.getElementsByTagName("Value")[0].textContent;

    // Convert the float value to a big-endian hex representation
    const floatValueHex = floatToBigEndianHex(value);

    // Convert the float value to a Uint8Array
    const floatArray = new Float32Array(1);
    floatArray[0] = value;
    const uintArray = new Uint8Array(floatArray.buffer).reverse(); // Reverse byte order for big-endian

    // Push the parsed parameter data into the array
    parsedData.push({
      index,
      parameter,
      value,
      floatValueHex,
      uint8Array: Array.from(uintArray), // Store the Uint8Array as an array of bytes
    });

    // Add the index to the set to ensure uniqueness in the future iterations
    indexSet.add(index);
  }

  // Return the array of parsed data
  return parsedData;
}
/**
 * Updates the HTML table with parsed data.
 *
 * This function dynamically creates table rows and populates them with the
 * parameter data, applying styles to the table and its cells.
 *
 * @param {Array} parsedData - The array of parsed parameter data to display.
 */
function table_update(parsedData) {
  // Display the table container and the close button
  document.getElementById("tableContainer").style.display = "block";
  document.getElementById("close_button").style.display = "inline";

  // Get the body of the table where the rows will be inserted
  var tableBody = document.getElementById("tableBody");

  // Clear any existing rows in the table
  tableBody.innerHTML = "";

  // Loop through the parsed data and create a new row for each entry
  for (var i = 0; i < parsedData.length; i++) {
    var row = tableBody.insertRow(); // Insert a new row into the table body

    // Insert two cells into the row
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);

    // Set the text content of the cells
    cell1.textContent = parsedData[i].parameter;
    cell2.textContent = parsedData[i].value;

    // Apply borders to the top and bottom of the row
    row.style.borderTop = "1px solid black";
    row.style.borderBottom = "1px solid black";

    // Apply consistent styling to both cells in the row
    const cells = [cell1, cell2];
    cells.forEach((cell) => {
      cell.style.borderRight = "1px solid black"; // Add right border to each cell
      cell.style.textAlign = "center"; // Center align the text
      cell.style.fontFamily = "'Segoe UI SemiBold'"; // Set the font family
      cell.style.fontSize = "24pt"; // Set the font size
      cell.style.fontWeight = "500"; // Set the font weight
      cell.style.width = "431px"; // Set the width of the cells
      cell.style.height = "80px"; // Set the height of the cells
    });
  }
}
/**
 * Creates a Uint8Array from a set of parsed data values.
 *
 * This function extracts a specific number of parameters from the parsed data,
 * converts them into a Uint8Array, and returns the resulting array.
 * Each parameter is represented as a Float32 (4 bytes).
 *
 * @param {Array} parsedData - The array of parsed parameter data.
 * @param {number} start - The starting index in the parsedData array.
 * @param {number} count - The number of parameters to include in the Uint8Array.
 * @returns {Uint8Array} - A Uint8Array containing the concatenated byte values.
 */
function createUint8Array(parsedData, start, count) {
  // Calculate the length of the resulting Uint8Array, each float is 4 bytes
  const length = Math.min(count, parsedData.length - start) * 4;

  // Create a Uint8Array with the appropriate length to hold the data
  const uint8Array = new Uint8Array(length);
  let currentIndex = 0; // To track the current position in the resulting Uint8Array

  // Loop through the parsed data, starting from 'start' and adding 'count' elements
  for (let i = start; i < start + count && i < parsedData.length; i++) {
    const data = parsedData[i]; // Get the data at index i
    const uintArray = data.uint8Array; // Extract the uint8Array from the data

    // Copy each byte from the data's uint8Array to the new Uint8Array
    for (let j = 0; j < uintArray.length; j++) {
      uint8Array[currentIndex++] = uintArray[j]; // Assign the byte to the new array
    }
  }

  // Return the resulting Uint8Array containing the concatenated data
  return uint8Array;
}
/**
 * Concatenates a string and a Uint8Array into a new Uint8Array.
 *
 * The string is first encoded into a Uint8Array and then the given byte array
 * is appended after it to form a combined Uint8Array.
 *
 * @param {string} string - The string to be encoded and concatenated.
 * @param {Uint8Array} byteArray - The byte array to be appended.
 * @returns {Uint8Array} - A new Uint8Array containing the concatenated string and byte array.
 */
function concatenateStringAndUint8Array(string, byteArray) {
  // Encode the string to a Uint8Array
  const stringEncoded = new TextEncoder().encode(string);

  // Create a new Uint8Array to hold the concatenated result
  const combinedArray = new Uint8Array(stringEncoded.length + byteArray.length);

  // Set the encoded string in the new array
  combinedArray.set(stringEncoded, 0);

  // Set the byteArray after the encoded string
  combinedArray.set(byteArray, stringEncoded.length);

  return combinedArray;
}
/**
 * Converts a float value to a big-endian hexadecimal string.
 *
 * This function takes a float value, converts it into a Uint8Array, reverses the byte order
 * to convert it to big-endian format, and returns the result as a hexadecimal string.
 *
 * @param {number} value - The float value to be converted.
 * @returns {string} - The big-endian hexadecimal string representation of the float value.
 */
function floatToBigEndianHex(value) {
  // Create a Float32Array to hold the float value
  const floatArray = new Float32Array(1);
  floatArray[0] = value;

  // Convert the float value to a Uint8Array
  const uintArray = new Uint8Array(floatArray.buffer);

  // Reverse byte order to convert to big endian
  const reversedBytes = uintArray.reverse();

  // Convert the bytes to a hexadecimal string
  return Array.from(reversedBytes, (byte) => byte.toString(16).toUpperCase().padStart(2, "0")).join("");
}
/**
 * Fetches the default XML file, updates it with live parameter data,
 * and either copies or downloads the updated XML content.
 */
function fetchedit_defaultXML() {
  // Fetch the default XML file
  fetch("./xml/reflect-e_0.1.7_default.xml")
    .then((response) => response.text())
    .then((xmlText) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");

      const parametersList = xmlDoc.getElementsByTagName("Parameters");

      // Update existing parameters with values from liveParamDataView
      for (let i = 0; i < liveParamDataView.length; i++) {
        const { index, value } = liveParamDataView[i];
        const parameterNode = Array.from(parametersList).find((node) => node.getElementsByTagName("Index")[0].textContent === index.toString());

        if (parameterNode) {
          parameterNode.getElementsByTagName("Value")[0].textContent = formatValue(value);
        } else {
          console.warn(`Index ${index} not found in XML.`);
        }
      }

      // Convert the updated XML document back to a string
      const serializer = new XMLSerializer();
      const updatedXmlText = serializer.serializeToString(xmlDoc);

      // Display updated XML content in a textarea
      document.getElementById("xmlContent").value = updatedXmlText;

      // Copy or download the updated XML content based on device type
      if (deviceInfo.includes("Bluefy")) {
        document.getElementById("xmlContent").style.display = "block";
        // copyText(); // Copy XML content to clipboard
      } else {
        downloadFile(updatedXmlText, "reflect-e_0.1.7_live.xml", "text/xml"); // Download the XML file
      }
      hideLoadingScreen_succesful();
    })
    .catch((error) => {
      console.error("Error fetching XML:", error);
      alert(lang_map[282]);
      hideLoadingScreen_fail();
    });
}
/**
 * Downloads a file containing the provided data.
 *
 * @param {string} data - The data to be included in the file.
 * @param {string} filename - The name of the file to be downloaded.
 * @param {string} type - The MIME type of the file.
 */
function downloadFile(data, filename, type) {
  const blob = new Blob([data], { type: type });

  // Check if the browser supports the 'download' attribute
  if ("download" in document.createElement("a")) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
/**
 * Copies the content of the textarea with id "xmlContent" to the clipboard.
 */
function copyText() {
  var input = document.querySelector("#xmlContent");

  if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
    // handle iOS devices
    input.contenteditable = true;
    input.readonly = false;

    var range = document.createRange();
    range.selectNodeContents(input);

    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    input.setSelectionRange(0, 999999);
  } else {
    input.select(); // Select all text in the textarea
  }
  document.execCommand("copy"); // Execute the copy command to copy to clipboard
}
/**
 * Formats a value to ensure it's represented as a number with 3 decimal places,
 * or as an integer if there's no fractional part.
 *
 * @param {number} value - The value to be formatted.
 * @returns {string} - The formatted value as a string.
 */
function formatValue(value) {
  let floatValue = Number(value);
  let formattedValue;

  if (floatValue % 1 === 0) {
    // If the value is a whole number (no fractional part)
    formattedValue = Math.ceil(floatValue);
  } else {
    // If the value has a fractional part
    formattedValue = floatValue.toFixed(3).toString();
  }

  return formattedValue;
}
/**
 * Displays the copy button when the mouse enters the XML container.
 */
document.getElementById("xmlContainer").addEventListener("mouseenter", function () {
  // Show the copy button when the user hovers over the XML container
  document.getElementById("xmlCopyButton").style.display = "block";
});
/**
 * Hides the copy button when the mouse leaves the XML container.
 */
document.getElementById("xmlContainer").addEventListener("mouseleave", function () {
  // Hide the copy button when the user stops hovering over the XML container
  document.getElementById("xmlCopyButton").style.display = "none";
});
/**
 * Copies the content of the XML text area to the clipboard.
 */
function copyXML() {
  const xmlTextArea = document.getElementById("xmlContent");
  // Select the text inside the XML content text area
  xmlTextArea.select();
  // Execute the copy command to copy the selected text to the clipboard
  document.execCommand("copy");
}
/**
 * Sends the parameter set from the XML data.
 *
 * This function asynchronously sends the first parameter set, waits for the response,
 * and shows a loading screen while the data is being sent. In case of an error,
 * it logs the error message.
 */
async function send_paramset() {
  if (xml_loaded) {
    try {
      // Send the combined first parameter set using the sendTX function
      await sendTX(combined_firstSet, true);

      // Reset the CommandSent flag after sending
      CommandSent = "";

      // Show a loading screen while the data is being processed
      showLoadingScreen();
    } catch (error) {
      // If an error occurs during sending, log the error and display an appropriate message
      console.error("Error sending data:", error);
      log(lang_map[162]); // Log the error message from the language map
    }
  } else {
    send_param_button_press = 0;
  }
}
/**
 * Get all parameter sets if the login stage is not zero.
 *
 * This function executes when the user presses the Generate Param File
 * button. It checks the login stage and starts with the first parameter
 * set.
 */
function generateParamFile() {
  if (login_stage) {
    login_stage = 4;
    param_set1_start();
  }
}
/**
 * ================================================================
 * PREVIOUS IMPLEMENTATIONS
 * ================================================================
 * This section includes code or functionality that was implemented before
 * the current version or approach. It is preserved for reference or potential
 * future use, but may be commented out or replaced with newer implementations.
 */

// /**
//  * Updates the HTML table with parsed data.
//  *
//  * This function takes the parsed data, creates table rows dynamically,
//  * and populates them with parameter values. It also applies styles to
//  * the rows and cells programmatically.
//  *
//  * @param {Array} parsedData - The array of parsed parameter data to display in the table.
//  */
// function table_update(parsedData) {
//   // Display the table container and close button
//   document.getElementById("tableContainer").style.display = "block";
//   document.getElementById("close_button").style.display = "inline";

//   // Get the body of the table where the rows will be inserted
//   var tableBody = document.getElementById("tableBody");

//   // Clear existing rows in the table body before adding new ones
//   tableBody.innerHTML = "";

//   // Loop through the parsed data and create a row for each entry
//   for (var i = 0; i < parsedData.length; i++) {
//     var row = tableBody.insertRow(); // Insert a new row in the table body

//     var cell1 = row.insertCell(0); // Insert the first cell for parameter
//     var cell2 = row.insertCell(1); // Insert the second cell for value

//     // Set the text content of the cells
//     cell1.textContent = parsedData[i].parameter;
//     cell2.textContent = parsedData[i].value;

//     // Apply borders to the top and bottom of the row
//     row.style.borderTop = "1px solid black";
//     row.style.borderBottom = "1px solid black";

//     // Define an array of the cells for styling
//     const cells = [cell1, cell2];

//     // Apply styles to each cell in the row
//     cells.forEach((cell) => {
//       cell.style.borderRight = "1px solid black"; // Right border for each cell
//       cell.style.textAlign = "center"; // Center align the text in each cell
//       cell.style.fontFamily = "'Segoe UI SemiBold'"; // Set font family
//       cell.style.fontSize = "24pt"; // Set font size
//       cell.style.fontWeight = "500"; // Set font weight
//       cell.style.width = "431px"; // Set cell width
//       cell.style.height = "80px"; // Set cell height
//     });
//   }
// }

// /**
//  * Opens an XML file, parses the data, and prepares parameter sets for transmission.
//  *
//  * This function allows the user to select an XML file, read it, and parse the data.
//  * The parsed data is then used to create three sets of parameters (first 60, second 60,
//  * and remaining 38 parameters) which are concatenated with corresponding labels.
//  */
// async function openXML() {
//   // Create an input element to select a file
//   const fileInput = document.createElement("input");
//   fileInput.type = "file";
//   fileInput.accept = ".xml"; // Accept only XML files

//   // Event handler when a file is selected
//   fileInput.onchange = async function (e) {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Create a FileReader to read the file content
//     const filereader = new FileReader();

//     // Event handler when the file is successfully read
//     filereader.onload = async function (e) {
//       xml_loaded = true; // Mark that XML has been loaded
//       const xmlString = e.target.result; // Get the XML string from the file
//       const parsedData = parseXML(xmlString); // Parse the XML string
//       table_update(parsedData); // Update the table with parsed data

//       // Create Uint8Arrays for different sets of parameters from the parsed data
//       const firstSet = createUint8Array(parsedData, 0, 60); // First 60 parameters
//       const secondSet = createUint8Array(parsedData, 60, 60); // Next 60 parameters
//       const remainingSet = createUint8Array(parsedData, 120, 38); // Remaining parameters up to 158

//       // Combine the sets with their respective headers and parameter data
//       combined_firstSet = concatenateStringAndUint8Array("/SET1(60):", firstSet);
//       combined_secondSet = concatenateStringAndUint8Array("/SET2(60):", secondSet);
//       combined_remainingSet = concatenateStringAndUint8Array("/SET3(38):", remainingSet);
//     };

//     // Start reading the selected file as text
//     filereader.readAsText(file);
//   };

//   // Programmatically trigger a click on the file input to open the file dialog
//   fileInput.click();
// }

// /**
//  * Concatenates a string and a Uint8Array into a new Uint8Array.
//  *
//  * This function encodes the string into a Uint8Array and appends the given byte
//  * array after it to form a combined array, which is returned.
//  *
//  * @param {string} string - The string to concatenate with the byte array.
//  * @param {Uint8Array} byteArray - The byte array to concatenate with the string.
//  * @returns {Uint8Array} - The combined Uint8Array containing the string and byte array.
//  */
// function concatenateStringAndUint8Array(string, byteArray) {
//   // Encode the string to Uint8Array
//   const stringEncoded = new TextEncoder().encode(string);
//   // Create a new Uint8Array to hold the concatenated result
//   const combinedArray = new Uint8Array(stringEncoded.length + byteArray.length);
//   // Set the encoded string in the new array
//   combinedArray.set(stringEncoded, 0);
//   // Set the byteArray after the encoded string
//   combinedArray.set(byteArray, stringEncoded.length);
//   return combinedArray;
// }

// /**
//  * Sends the parameter set to the server or device.
//  *
//  * This function asynchronously sends the parameter set (`combined_firstSet`),
//  * waits for the response, and shows a loading screen while the data is being sent.
//  * If an error occurs during transmission, it logs the error message.
//  */
// async function send_paramset() {
//   try {
//     // Send the first parameter set using the sendTX function
//     await sendTX(combined_firstSet, true);

//     // Reset the CommandSent flag after sending
//     CommandSent = "";

//     // Show a loading screen while the data is being processed
//     showLoadingScreen();
//   } catch (error) {
//     // If an error occurs, log it and display an appropriate message
//     console.error("Error sending data:", error);
//     log(lang_map[162]); // Log the error message from the language map
//   }
// }

// /**
//  * Parses the XML string into a structured format and extracts relevant parameter data.
//  *
//  * This function processes the XML data, extracts the parameters, and converts
//  * them into a structured array that includes the parameter index, value,
//  * and other related information.
//  *
//  * @param {string} xmlString - The XML string to parse.
//  * @returns {Array} - The array of parsed parameter data.
//  */
// function parseXML(xmlString) {
//   // Create a new DOMParser instance to parse the XML string
//   const parser = new DOMParser();
//   const xmlDoc = parser.parseFromString(xmlString, "text/xml");
//   const parametersList = xmlDoc.getElementsByTagName("Parameters");

//   // Initialize an empty array to store the parsed data and a set to track unique indexes
//   parsedData = [];
//   const indexSet = new Set();

//   // Loop through each parameter in the XML and process it
//   for (let i = 0; i < parametersList.length; i++) {
//     const parameters = parametersList[i];
//     const index = parameters.getElementsByTagName("Index")[0].textContent;

//     // Skip if the index already exists (ensure uniqueness)
//     if (indexSet.has(index)) {
//       continue;
//     }

//     // Extract the parameter name, value, and convert to big-endian hexadecimal
//     const parameter = parameters.getElementsByTagName("Parameter")[0].textContent;
//     const value = parameters.getElementsByTagName("Value")[0].textContent;
//     const floatValueHex = floatToBigEndianHex(value);

//     // Convert the float value to a Uint8Array and reverse the byte order for big-endian
//     const floatArray = new Float32Array(1);
//     floatArray[0] = value;
//     const uintArray = new Uint8Array(floatArray.buffer).reverse();

//     // Push the parsed data into the array with the index, parameter, value, and uint8 array
//     parsedData.push({
//       index,
//       parameter,
//       value,
//       floatValueHex,
//       uint8Array: Array.from(uintArray), // Store the uint8 array as an array of bytes
//     });

//     // Add the index to the set to track its uniqueness
//     indexSet.add(index);
//   }

//   return parsedData;
// }

// /**
//  * Converts a float value to a big-endian hexadecimal string.
//  *
//  * This function takes a floating-point value, converts it to a `Float32Array`,
//  * then to a `Uint8Array`, and reverses the byte order to convert it into
//  * big-endian format. Finally, it returns the result as a hexadecimal string.
//  *
//  * @param {number} value - The float value to convert.
//  * @returns {string} - The big-endian hexadecimal string representation of the float value.
//  */
// function floatToBigEndianHex(value) {
//   // Create a Float32Array to store the float value
//   const floatArray = new Float32Array(1);
//   floatArray[0] = value;

//   // Convert the float value to a Uint8Array (byte representation)
//   const uintArray = new Uint8Array(floatArray.buffer);

//   // Reverse the byte order to convert to big-endian
//   const reversedBytes = uintArray.reverse();

//   // Convert each byte to a hexadecimal string and join them together
//   return Array.from(reversedBytes, (byte) => byte.toString(16).toUpperCase().padStart(2, "0")).join("");
// }

// /**
//  * Creates a Uint8Array from a set of values in the parsed data.
//  *
//  * This function extracts a specific range of parameters from the parsed
//  * data and converts them into a Uint8Array. Each parameter is represented
//  * as a 4-byte float.
//  *
//  * @param {Array} parsedData - The parsed parameter data.
//  * @param {number} start - The starting index of the data to include.
//  * @param {number} count - The number of parameters to include.
//  * @returns {Uint8Array} - The resulting Uint8Array containing the selected parameters.
//  */
// function createUint8Array(parsedData, start, count) {
//   // Calculate the length of the resulting Uint8Array (4 bytes per float)
//   const length = Math.min(count, parsedData.length - start) * 4;

//   // Create a Uint8Array with the appropriate length
//   const uint8Array = new Uint8Array(length);
//   let currentIndex = 0; // To track the current position in the array

//   // Loop through the parsed data and add the uint8 values to the array
//   for (let i = start; i < start + count && i < parsedData.length; i++) {
//     const data = parsedData[i];
//     const uintArray = data.uint8Array;

//     // Copy each byte from the uintArray to the resulting uint8Array
//     for (let j = 0; j < uintArray.length; j++) {
//       uint8Array[currentIndex++] = uintArray[j];
//     }
//   }

//   // Return the final Uint8Array
//   return uint8Array;
// }

// /**
//  * Converts parsed data back into an XML string.
//  *
//  * This function takes the parsed data and converts it into an XML string
//  * with the format `<Root><Parameters><Index>...</Index><Parameter>...</Parameter><Value>...</Value></Parameters></Root>`.
//  *
//  * @param {Array} parsedData - The array of parsed parameter data.
//  * @returns {string} - The XML string representation of the parsed data.
//  */
// function convertDataToXML(parsedData) {
//   // Start the XML string with the XML declaration and root element
//   let xmlString = '<?xml version="1.0" encoding="UTF-8"?><Root>';

//   // Loop through each parameter and append it to the XML string
//   parsedData.forEach((data) => {
//     xmlString += `
//                     <Parameters>
//                         <Index>${data.index}</Index>
//                         <Parameter>${data.parameter}</Parameter>
//                         <Value>${data.value}</Value>
//                     </Parameters>
//                 `;
//   });

//   // Close the root element and return the final XML string
//   xmlString += "</Root>";
//   return xmlString;
// }

// /**
//  * Saves the parsed data as an XML file.
//  *
//  * This function converts the parsed data to an XML string and creates a Blob
//  * representing the XML data. It then triggers a download of the XML file
//  * with the name "edited_data.xml".
//  */
// function saveXML() {
//   // Convert the parsed data to an XML string
//   xmlString = convertDataToXML(parsedData);

//   // Create a Blob from the XML string
//   const blob = new Blob([xmlString], { type: "application/xml" });

//   // Create a temporary link element to trigger the file download
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);
//   link.download = "edited_data.xml"; // Set the file name for download
//   document.body.appendChild(link);
//   link.click(); // Trigger the click to download the file
//   document.body.removeChild(link); // Remove the link after the download
// }

// /**
//  * Displays the content of a section by adding the 'accordion-active' class.
//  *
//  * This function hides all content sections and only displays the one specified
//  * by the `contentId`. It uses the 'accordion-active' class to manage visibility.
//  *
//  * @param {string} contentId - The ID of the content section to display.
//  */
// function displayContent(contentId) {
//   // Get all content sections and remove the 'accordion-active' class
//   const sections = document.querySelectorAll(".content-section");
//   sections.forEach((section) => {
//     section.classList.remove("accordion-active");
//   });

//   // Add the 'accordion-active' class to the specified section to display it
//   document.getElementById(contentId).classList.add("accordion-active");
// }

// /**
//  * Hides the table and the close button.
//  *
//  * This function hides the table and the close button, effectively removing
//  * them from the view.
//  */
// function hideTable() {
//   document.getElementById("table-div").style.display = "none"; // Hide the table
//   document.getElementById("close_button").style.display = "none"; // Hide the close button
// }

// /**
//  * Updates a specific parameter's value in an XML string.
//  *
//  * This function takes an XML string, finds the specified parameter by its index,
//  * and updates the value of the `<Value>` element to the new value provided.
//  *
//  * @param {string} xmlString - The XML string to update.
//  * @param {number} i - The index of the parameter to update.
//  * @param {string} newValue - The new value to set for the specified parameter.
//  * @returns {string} - The updated XML string with the new value.
//  */
// function update_liveXML(xmlString, i, newValue) {
//   // Parse the XML string into a DOM object
//   const parser = new DOMParser();
//   const xmlDoc = parser.parseFromString(xmlString, "application/xml");

//   // Get all the <Parameters> elements in the XML document
//   const parameters = xmlDoc.getElementsByTagName("Parameters")[0].children;

//   // If the index 'i' is within bounds, update the <Value> element of the parameter
//   if (i < parameters.length) {
//     const parameter = parameters[i];
//     const valueElement = parameter.getElementsByTagName("Value")[0];
//     valueElement.textContent = newValue; // Set the new value
//   }

//   // Serialize the updated XML document back into a string and return it
//   const serializer = new XMLSerializer();
//   return serializer.serializeToString(xmlDoc);
// }

// /**
//  * Updates a specific portion of an XML string by modifying multiple parameters.
//  *
//  * This function iterates over a range of parameters, updates each of them using
//  * the `update_liveXML` function, and returns the modified XML string.
//  *
//  * @param {string} xmlString - The original XML string to modify.
//  * @param {number} start - The starting index of the parameters to update.
//  * @param {number} count - The number of parameters to update.
//  * @returns {string} - The modified XML string with updated values.
//  */
// function updateXMLPart(xmlString, start, count) {
//   let modifiedXML = xmlString;

//   // Loop through the parameters in the specified range and update each one
//   for (let i = start; i < start + count; i++) {
//     const newValue = getVal(i); // Get the new value for the parameter at index 'i'
//     modifiedXML = update_liveXML(modifiedXML, i, newValue); // Update the XML string with the new value
//   }

//   // Return the updated XML string
//   return modifiedXML;
// }

// /**
//  * Downloads an XML string as a file.
//  *
//  * This function creates a Blob from the provided XML string, creates a temporary
//  * link element, and triggers the download of the XML file with a predefined filename.
//  *
//  * @param {string} xmlString - The XML string to be downloaded as a file.
//  */
// function downloadXML(xmlString) {
//   // Create a Blob from the XML string with the appropriate MIME type
//   const blob = new Blob([xmlString], { type: "application/xml" });

//   // Create an object URL for the Blob
//   const url = URL.createObjectURL(blob);

//   // Create a temporary anchor element to trigger the download
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "test1.xml"; // Set the filename for the downloaded file

//   // Simulate a click to trigger the download
//   a.click();

//   // Revoke the object URL to release memory
//   URL.revokeObjectURL(url);
// }
// Solve for execCommand deprecation:
// /**
//  * Copies the content of the textarea with id "xmlContent" to the clipboard.
//  *
//  * This function checks if the device is iOS or not. For iOS devices, it uses
//  * a workaround with contentEditable and selection ranges, as Clipboard API
//  * doesn't work on iOS devices. For non-iOS devices, it uses the modern
//  * Clipboard API to copy the text to the clipboard.
//  */
// function copyText() {
//   const input = document.querySelector("#xmlContent");
//   // Check if the device is iOS (iPhone, iPad, iPod)
//   if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
//     // Handle iOS devices with a workaround
//     input.contentEditable = true; // Make the input editable
//     input.readOnly = false; // Allow modifications
//     // Create a range and select the text in the input
//     const range = document.createRange();
//     range.selectNodeContents(input);
//     const selection = window.getSelection();
//     selection.removeAllRanges(); // Clear any previous selections
//     selection.addRange(range); // Add the new range for selection
//     input.setSelectionRange(0, 999999); // Ensure all content is selected
//   } else {
//     // Use the Clipboard API for non-iOS devices
//     navigator.clipboard.writeText(input.value)
//       .then(() => {
//         console.log("Text copied to clipboard"); // Successfully copied
//       })
//       .catch(err => {
//         console.error("Failed to copy text: ", err); // Handle any errors
//       });
//   }
// }

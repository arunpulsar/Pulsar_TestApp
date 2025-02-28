let BootLoader_launced = false; // Flag for modal launch
const BLOCK_SIZE = 128; // Size of each write
const ERASE_SIZE_DEFAULT = 512; // Default erase size in bytes
const ERASE_SIZE_12544 = 256; // Special case erase size for address 12544
let currentState = "IDLE"; // Current state of the process
let index = 0;
let init_erase_74240 = false;
let lastErasedAddress = null;
const INITIAL_ERASE_ADDRESS = 12544;
const INITIAL_ERASE_SIZE = 256;
const ERASE_SIZE = 512;
let startTimestamp;

// Lower Write Interval
let lower_writeIntervalId;
let lowerWriteCounter = 0;
// Higher Write Interval
let higher_writeIntervalId;
let higherWriteCounter = 0;
// BL Version Interval
let BLVersionintervalID;
let BLVersionCounter = 0;
// BL Connect Interval
let BLConnectintervalID;
let BLConnectCounter = 0;

// Connection and Version Command
const BLConn = new Uint8Array([0xff, 0xff, 0xff, 0xfc, 0xbe, 0xc7, 0xee, 0xee, 0xee, 0x01, 0x01, 0x00, 0x6b, 0xff]);
const BLVer = new Uint8Array([0xff, 0xff, 0xff, 0xfc, 0xbe, 0xc7, 0xee, 0xee, 0xee, 0x01, 0x02, 0x00, 0x68, 0xff]);

/**
 * Opens the Bootloader modal by displaying the necessary UI elements.
 * Initializes relevant global variables and resets UI components to their default state.
 */
function openBootLoaderModal() {
  // Display the bootloader modal overlay and setup window
  document.getElementById("modalOverlayBL").style.display = "block";
  document.getElementById("modal_BL_setup").style.display = "block";

  // Initialize global variables
  BootLoader_launced = true; // Flag to indicate the bootloader has been launched
  doc_value = ""; // Reset document value
  fwhex_loaded = false; // Flag to track firmware hex file loading status
  index = 0; // Reset index counter

  // Enable and style the "Start Update" button
  document.getElementById("blstart_button").disabled = false;
  document.getElementById("blstart_button").textContent = lang_map[210];
  document.getElementById("blstart_button").style.backgroundColor = "#F37021";

  // Enable and style the file input button for firmware upload
  document.getElementById("label-fileInputHex").style.backgroundColor = "#F37021";
  document.getElementById("fileInputHex").disabled = false;
  document.getElementById("label-fileInputHex").style.cursor = "pointer";
  document.getElementById("blstart_button").style.cursor = "pointer";

  // Reset the host environment for the bootloader process
  resetHost();
}
/**
 * Closes the Bootloader modal and resets all related variables and UI elements.
 * Ensures that the bootloader environment is properly cleared before exiting.
 */
function closeBootLoaderModal() {
  // Hide the bootloader modal overlay and setup window
  document.getElementById("modalOverlayBL").style.display = "none";
  document.getElementById("modal_BL_setup").style.display = "none";

  // Reset global variables
  BootLoader_launced = false; // Mark bootloader as not launched
  doc_value = ""; // Clear document value
  fwhex_loaded = false; // Reset firmware hex file loading status
  index = 0; // Reset index counter
  init_erase_74240 = false; // Reset erase flag
  lastErasedAddress = null; // Clear last erased memory address

  // Reset file input and UI elements
  document.getElementById("fileInputHex").value = "";
  document.getElementById("logSection").style.display = "none";
  document.getElementById("label-fileInputHex").style.backgroundColor = "#F37021"; // Restore Pulsar Orange theme

  // Clear displayed firmware information
  document.getElementById("hex_fwversion-box").textContent = "";
  document.getElementById("hex_size-box").textContent = "";

  // Stop and clear any running write intervals
  clearlower_WriteInterval();
  clearhigher_WriteInterval();

  // Clear log section and reset progress
  clearLogSection();
  updateProgress_bl(0);

  // Reset object memory
  for (let key in obj_memory) {
    delete obj_memory[key];
  }
  obj_memory = {};
  currentBaseAddress = 0; // Reset base address

  // Update firmware string
  fwStringUpdate();
}
/**
 * Initiates a connection to the Bootloader based on the selected connection type (Serial or Bluetooth).
 * Logs the connection attempt and updates the UI accordingly.
 */
function BLConnect() {
  // Log the connection attempt with a timestamp in yellow for visibility
  // console.log(
  //   `%c[${new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + new Date().getMilliseconds()}] -> Connecting to Bootloader...`,
  //   `color:yellow;`
  // );

  // Update the log section in the UI to indicate connection initiation
  updateLogSection("Connecting to Bootloader...", "yellow");

  // Determine connection type and send the appropriate command
  if (connectionType === "serial") {
    // Send bootloader connection command over serial
    sendTX(BLConn, true);
    CommandSent = "BLConnect"; // Track the last command sent
  } else if (connectionType === "bluetooth") {
    // Encode and send the bootloader connection command over Bluetooth
    const toSend_bluetooth = encodeDataWithEscape(BLConn);
    sendAT(toSend_bluetooth);
    CommandSent = "BLConnect"; // Track the last command sent
  }
}
/**
 * Requests the Bootloader version based on the selected connection type (Serial or Bluetooth).
 * Logs the request and updates the UI accordingly.
 */
function BLVersion() {
  // Log the Bootloader version request with a timestamp in yellow for visibility
  // console.log(
  //   `%c[${new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + new Date().getMilliseconds()}] -> Getting Bootloader version...`,
  //   `color:yellow;`
  // );

  // Update the log section in the UI to indicate the request
  updateLogSection("Getting Bootloader version...", "yellow");

  // Determine connection type and send the appropriate command
  if (connectionType === "serial") {
    // Send bootloader version request over serial
    sendTX(BLVer, true);
    CommandSent = "BLVersion"; // Track the last command sent
  } else if (connectionType === "bluetooth") {
    // Encode and send the bootloader version request over Bluetooth
    const toSend_bluetooth = encodeDataWithEscape(BLVer);
    sendAT(toSend_bluetooth);
    CommandSent = "BLVersion"; // Track the last command sent
  }
}
/**
 * Sends a command to erase the Bootloader memory at the specified address.
 * The address is encoded into a command and transmitted based on the selected connection type (Serial or Bluetooth).
 * The function also calculates and appends a checksum to the command.
 *
 * @param {number} address - The memory address to erase.
 */
function BLEraseAddr(address) {
  // Convert the provided address into a Uint8Array (3 bytes) for command packaging
  const addr = new Uint8Array([(address >> 16) & 0xff, (address >> 8) & 0xff, address & 0xff]);

  // Construct the base command for memory erasure (without checksum)
  const BLEraser_nochecksum_noff = new Uint8Array([
    0xff,
    0xff,
    0xff,
    0xfc,
    0xbe,
    0xc7,
    0xee,
    0xee,
    0xee,
    0x01,
    0x06,
    0x03,
    addr[0],
    addr[1],
    addr[2],
  ]);

  // Create the full command array with checksum space
  const BLEraser = new Uint8Array(BLEraser_nochecksum_noff.length + 2);
  BLEraser.set(BLEraser_nochecksum_noff, 0);

  // Calculate checksum for the command (starting from index 3 to skip header)
  const checksum = createChecksumFromArray(BLEraser, 3, BLEraser_nochecksum_noff.length - 1);

  // Append the calculated checksum and end byte (0xff) to the command
  BLEraser[BLEraser_nochecksum_noff.length] = checksum;
  BLEraser[BLEraser_nochecksum_noff.length + 1] = 0xff;

  // Determine connection type and send the appropriate command
  if (connectionType === "serial") {
    // Send the erase command over serial connection
    sendTX(BLEraser, true);
    CommandSent = "BLEraseAddr"; // Track the last command sent
  } else if (connectionType === "bluetooth") {
    // Encode and send the erase command over Bluetooth
    const toSend_bluetooth = encodeDataWithEscape(BLEraser);
    sendAT(toSend_bluetooth);
    CommandSent = "BLEraseAddr"; // Track the last command sent
  }
}
/**
 * Sends a command to write data to a specified Bootloader memory address.
 * The function constructs the command, appends the necessary data, and calculates the checksum.
 *
 * @param {number} address - The memory address to write to.
 * @param {Array|Uint8Array} data - The data to be written at the specified address.
 * @throws {TypeError} Throws if the provided data is not an array or Uint8Array.
 */
function BLWriteAddr_lowermemory(address, data) {
  // Log the data write attempt with the number of bytes and address
  // console.log(
  //   `%c[${new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + new Date().getMilliseconds()}] -> Writing ${
  //     data.length
  //   } bytes to address: ${address}...`,
  //   `color: yellow;`
  // );

  // Update the log section in the UI to indicate the write operation
  updateLogSection(`Writing ${data.length} bytes to address: ${address}...`, "yellow");

  // Ensure that the data is in array form (either native array or Uint8Array)
  if (!Array.isArray(data)) {
    throw new TypeError("Data must be an array");
  }
  data = new Uint8Array(data); // Convert array to Uint8Array if needed

  // Ensure data is a valid Uint8Array instance
  if (!(data instanceof Uint8Array)) {
    throw new TypeError("Data must be an instance of Uint8Array");
  }

  // Split the address into high and low byte (16-bit address)
  const addr = new Uint8Array([
    (address >> 8) & 0xff, // High byte (upper 8 bits)
    address & 0xff, // Low byte (lower 8 bits)
  ]);

  // Calculate the total length of the command (data length + 3 additional bytes for address, data length, and command identifier)
  const totalLength = data.length + 3;

  // Construct the base command without checksum (includes address, data length, and the data itself)
  const BLWriteAddr_lowermemory_nochecksum_noff = new Uint8Array([
    0xff,
    0xff,
    0xff,
    0xfc,
    0xbe,
    0xc7,
    0xee,
    0xee,
    0xee,
    0x01,
    0x07, // Header and command identifier
    totalLength & 0xff, // Total length byte (includes address and data length)
    addr[0], // Address byte 1
    addr[1], // Address byte 2
    data.length & 0xff, // Length of the data as byte
    ...data, // Append the data itself to the command
  ]);

  // Create the full command array and add checksum at the end
  const writeCommand = new Uint8Array(BLWriteAddr_lowermemory_nochecksum_noff.length + 2);
  writeCommand.set(BLWriteAddr_lowermemory_nochecksum_noff, 0); // Set the command header

  // Calculate the checksum for the command (from byte 3 to the second-to-last byte)
  const checksum = createChecksumFromArray(writeCommand, 3, writeCommand.length - 1);
  writeCommand[writeCommand.length - 2] = checksum; // Set the checksum byte
  writeCommand[writeCommand.length - 1] = 0xff; // Final 0xFF byte to indicate end of command

  // Depending on the connection type, send the write command
  if (connectionType === "serial") {
    // Send the write command over the serial connection
    sendTX(writeCommand, true);
    CommandSent = "BLWriteAddr_lowermemory"; // Track the last command sent
  } else if (connectionType === "bluetooth") {
    // Encode and send the write command over Bluetooth
    const toSend_bluetooth = encodeDataWithEscape(writeCommand);
    sendAT(toSend_bluetooth);
    CommandSent = "BLWriteAddr_lowermemory"; // Track the last command sent
  }
}

/**
 * Sends a command to write data to a specified Bootloader higher memory address.
 * This function constructs the write command, appends the necessary data, and calculates the checksum.
 *
 * @param {number} address - The higher memory address to write to.
 * @param {Array|Uint8Array} data - The data to be written to the specified address.
 * @throws {TypeError} Throws if the provided data is not an array or Uint8Array.
 */
function BLWriteAddr_highermemory(address, data) {
  // Log the data write attempt with the number of bytes and the address
  // console.log(
  //   `%c[${new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + new Date().getMilliseconds()}] -> Writing ${
  //     data.length
  //   } bytes to address: ${address}...`,
  //   `color: yellow;`
  // );

  // Update the log section to indicate the write operation
  updateLogSection(`Writing ${data.length} bytes to address: ${address}...`, "yellow");

  // Ensure that the incoming data is in array form (either native array or Uint8Array)
  if (!Array.isArray(data)) {
    throw new TypeError("Data must be an array");
  }
  data = new Uint8Array(data); // Convert the array to Uint8Array if needed

  // Ensure that the data is an instance of Uint8Array
  if (!(data instanceof Uint8Array)) {
    throw new TypeError("Data must be an instance of Uint8Array");
  }

  // Split the address into high and low byte (16-bit address)
  const addr = new Uint8Array([
    (address >> 8) & 0xff, // High byte (upper 8 bits)
    address & 0xff, // Low byte (lower 8 bits)
  ]);

  // Calculate the total length of the command (data length + 3 additional bytes for address, data length, and command identifier)
  const totalLength = data.length + 3;

  // Create the base command (without checksum), which includes the address, data length, and the data itself
  const BLWriteAddr_highermemory_nochecksum_noff = new Uint8Array([
    0xff,
    0xff,
    0xff,
    0xfc,
    0xbe,
    0xc7,
    0xee,
    0xee,
    0xee,
    0x01,
    0x08, // Header and command identifier for higher memory write
    totalLength & 0xff, // Total length byte (includes address and data length)
    addr[0], // Address byte 1 (high byte)
    addr[1], // Address byte 2 (low byte)
    data.length & 0xff, // Length of the data as a byte
    ...data, // Append the actual data to the command
  ]);

  // Create the full command array, and add the checksum at the end
  const writeCommand = new Uint8Array(BLWriteAddr_highermemory_nochecksum_noff.length + 2);
  writeCommand.set(BLWriteAddr_highermemory_nochecksum_noff, 0); // Set the command header

  // Calculate the checksum for the command (from byte 3 to the second-to-last byte)
  const checksum = createChecksumFromArray(writeCommand, 3, writeCommand.length - 1);
  writeCommand[writeCommand.length - 2] = checksum; // Set checksum byte
  writeCommand[writeCommand.length - 1] = 0xff; // Final 0xFF byte to indicate the end of the command

  // Send the write command depending on the connection type
  if (connectionType === "serial") {
    // Send the write command over the serial connection
    sendTX(writeCommand, true);
    CommandSent = "BLWriteAddr_highermemory"; // Track the last command sent
  } else if (connectionType === "bluetooth") {
    // Encode and send the write command over Bluetooth
    const toSend_bluetooth = encodeDataWithEscape(writeCommand);
    sendAT(toSend_bluetooth);
    CommandSent = "BLWriteAddr_highermemory"; // Track the last command sent
  }
}
/**
 * Listens for incoming data based on the command sent and interprets it.
 * The function handles both serial and Bluetooth connections and interprets
 * the received data buffer depending on the command and connection type.
 */
function listenRX_BL() {
  // Get the current command that was sent
  const doc_value = CommandSent;

  // Check if the sent command is one that requires receiving a response
  if (
    doc_value == "BLConnect" ||
    doc_value == "BLVersion" ||
    doc_value == "BLEraseAddr" ||
    doc_value == "BLWriteAddr_lowermemory" ||
    doc_value == "BLWriteAddr_highermemory"
  ) {
    // If the connection type is serial, interpret the hex data from the serial buffer
    if (connectionType === "serial") {
      interpretBLHex(receiveBufferHex, 1); // 1 indicates it's for serial communication
    }
    // If the connection type is Bluetooth, interpret the hex data from the Bluetooth buffer
    else if (connectionType === "bluetooth") {
      interpretBLHex(receiveBufferBT, 0); // 0 indicates it's for Bluetooth communication
    }
  }
}
/**
 * Interprets incoming bootloader data and processes it based on the command and received data.
 * It handles various responses like bootloader connection, version retrieval, erase and write responses.
 *
 * @param {string|ArrayBuffer} incoming_data - The incoming data (either ASCII hex string or ArrayBuffer).
 * @param {boolean} conv - A flag to indicate if the incoming data is in hex string format (true) or ArrayBuffer format (false).
 */
function interpretBLHex(incoming_data, conv) {
  // Convert the incoming ASCII hex string to a Uint8Array, if needed
  let hexArray;
  if (conv) {
    // Convert the hex string to a Uint8Array of bytes
    hexArray = new Uint8Array(incoming_data.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
  } else {
    // If it's already a buffer, directly convert it to a Uint8Array
    hexArray = new Uint8Array(incoming_data.buffer);
  }

  // Fixed header that should appear at the beginning of the packet
  const fixedHeader = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xfc, 0xff, 0xff, 0xff, 0xff, 0xff]);

  // Check if the fixed header matches the incoming data
  for (let i = 0; i < fixedHeader.length; i++) {
    if (hexArray[i] !== fixedHeader[i]) {
      console.error("Invalid header in incoming data");
      updateLogSection("Invalid header in incoming data", "red", "incoming");
      return; // Return early if the header is invalid
    }
  }

  // Extract the command, number of data bytes, data bytes, checksum, and end-of-packet byte
  const command = hexArray[11];
  const numDataBytes = hexArray[12];
  const dataBytes = hexArray.slice(13, 13 + numDataBytes);
  const checksum = hexArray[13 + numDataBytes];
  const endOfPacket = hexArray[14 + numDataBytes];

  // Check if the end of packet byte is valid (0xaa)
  if (endOfPacket !== 0xaa) {
    console.error("Invalid end of packet byte");
    updateLogSection("Invalid end of packet byte", "red", "incoming");
    return; // Return early if the end-of-packet byte is invalid
  }

  // Create a result object to hold the extracted data
  const result = {
    command: command,
    numDataBytes: numDataBytes,
    dataBytes: dataBytes,
    checksum: checksum,
  };

  // Handle the different commands based on the command received
  if (result.command == 1) {
    // BLConnect
    if (result.dataBytes[2] == 6) {
      ClearBLConnectInterval(); // Clear the connection interval
      // console.log(
      //   `%c[${new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + new Date().getMilliseconds()}] <- Bootloader connected successfully!`,
      //   `color:lime`
      // );
      updateLogSection(`Bootloader connected successfully!`, "lime", "incoming");

      // Start the BLVersion interval for version retrieval
      let interval = connectionType === "serial" ? 1250 : 3000; // Set interval dynamically
      startBLVersionInterval(interval);
    } else {
      // console.log(
      //   `%c[${new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + new Date().getMilliseconds()}] <- Bootloader connect fail!`,
      //   `color:red`
      // );
      updateLogSection(`Bootloader connect fail!`, "red", "incoming");
    }
  }

  if (result.command == 2) {
    // BLVersion
    ClearBLVersionInterval(); // Clear the version interval
    // console.log(
    //   `%c[${
    //     new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + new Date().getMilliseconds()
    //   }] <- Received Bootloader version successfully: ${result.dataBytes[2]}`,
    //   `color:lime`
    // );
    updateLogSection(`Received Bootloader version successfully: ${result.dataBytes[2]}`, "lime", "incoming");

    // Start erasing at the specified address (12544)
    BLEraseAddr(12544);
    // console.log(
    //   `%c[${new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + new Date().getMilliseconds()}] -> Erasing at address: 12544...`,
    //   `color:yellow;`
    // );
    updateLogSection(`Erasing at address: 12544...`, "yellow");
  }

  // Handle other responses based on command type
  if (result.command == 6) {
    // BLEraseAddr response
    handleEraseResponse(result); // Handle erase response
  }

  if (result.command == 7 || result.command == 8) {
    // BLWriteAddr response
    handleWriteResponse(result); // Handle write response
  }
}
/**
 * Encodes data, escaping null bytes and the escape character,
 * and ensures the encoded data ends with a null byte.
 *
 * @param {Uint8Array} data - The data to encode.
 * @param {number} escapeChar - The escape character (default: 0x7D).
 * @param {number} nullEscape - The escape marker for null bytes (default: 0x30).
 * @returns {Uint8Array} - Encoded data.
 */
function encodeDataWithEscape(data, escapeChar = 0x7d, nullEscape = 0x30) {
  const encoded = []; // Array to store the encoded result

  // Process each byte in the input data
  for (let i = 0; i < data.length; i++) {
    if (data[i] === 0x00) {
      // Escape null bytes by encoding 0x00 as the escape character followed by the nullEscape byte (0x30)
      encoded.push(escapeChar, nullEscape);
    } else if (data[i] === escapeChar) {
      // Escape the escape character itself by encoding it as the escape character followed by itself (0x7d 0x7d)
      encoded.push(escapeChar, escapeChar);
    } else {
      // If the byte is neither a null byte nor the escape character, add it directly to the encoded result
      encoded.push(data[i]);
    }
  }

  // Ensure the encoded data ends with a null byte (0x00) if the connection type is Bluetooth
  if (connectionType === "bluetooth") {
    encoded.push(0x00);
  }

  // Return the encoded data as a Uint8Array
  return new Uint8Array(encoded);
}
/**
 * Creates a checksum from a Uint8Array.
 * @param {Uint8Array} array - The array to create the checksum from.
 * @param {number} startPoint - The starting index.
 * @param {number} endPoint - The ending index.
 * @returns {number} - The calculated checksum.
 */
function createChecksumFromArray(array, startPoint, endPoint) {
  let total = 0;

  for (let i = startPoint; i <= endPoint; i++) {
    total ^= array[i];
  }

  return total;
}
/**
 * Converts three bytes into a single decimal value.
 *
 * @param {number} byte1 - The first byte (most significant byte).
 * @param {number} byte2 - The second byte.
 * @param {number} byte3 - The third byte (least significant byte, default is 0x00).
 * @returns {number} - The combined decimal value of the three bytes.
 */
function bytesToDecimal(byte1, byte2, byte3 = 0x00) {
  // Shift byte1 by 16 bits to the left, byte2 by 8 bits, and combine them with byte3
  // This creates a 24-bit integer by using bitwise OR to combine the shifted values.
  return (byte1 << 16) | (byte2 << 8) | byte3;
}
/**
 * Converts two bytes into a single decimal value.
 *
 * @param {number} byte1 - The first byte (most significant byte).
 * @param {number} byte2 - The second byte (least significant byte).
 * @returns {number} - The combined decimal value of the two bytes.
 */
function bytesToDecimal_2(byte1, byte2) {
  // Shift byte1 by 8 bits to the left (equivalent to multiplying by 256)
  // Then combine it with byte2 using bitwise OR
  return (byte1 << 8) | byte2;
}
/**
 * Handles the response for write commands (command 7 and command 8).
 *
 * @param {object} result - The result object containing the response data.
 */
function handleWriteResponse(result) {
  const writeStatus = result.dataBytes[0]; // Get the write status from the response
  const writeAddress = bytesToDecimal_2(result.dataBytes[2], result.dataBytes[3]); // Convert the address bytes to decimal

  // Check if the write was successful based on the status
  if ((writeStatus === 0 || writeStatus === 2) && result.dataBytes[1] === 0) {
    // If it's the first erase operation, adjust address by adding 65536
    if (init_erase_74240 == true) {
      // console.log(
      //   `%c[${new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + new Date().getMilliseconds()}] <- ${
      //     result.dataBytes[4]
      //   } bytes written successfully at address: ${writeAddress + 65536} ✓`, // Log success message
      //   `color:lime;`
      // );
      updateLogSection(`${result.dataBytes[4]} bytes written successfully at address: ${writeAddress + 65536} ✓`, "lime", "incoming");
      clearhigher_WriteInterval(); // Clear higher write interval after success
    } else {
      // If it's not the erase operation, log success with the original address
      // console.log(
      //   `%c[${new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + new Date().getMilliseconds()}] <- ${
      //     result.dataBytes[4]
      //   } bytes written successfully at address: ${writeAddress} ✓`, // Log success message
      //   `color:lime;`
      // );
      updateLogSection(`${result.dataBytes[4]} bytes written successfully at address: ${writeAddress} ✓`, "lime", "incoming");
      clearlower_WriteInterval(); // Clear lower write interval after success
    }

    // Calculate and update the completion percentage based on the index and memory size
    let percent = (((index + 1) / (Object.keys(obj_memory).length + 1)) * 100).toFixed(2);
    updateProgress_bl(percent); // Update progress bar with the calculated percentage

    sendNextWrite(); // Trigger the next write operation
  } else {
    // If the write fails, log the error
    console.error("Write failed");
    updateLogSection("Write failed", "red", "incoming");
  }
}
/**
 * Handles the response for erase commands (command 6).
 *
 * @param {object} result - The result object containing the erase command response data.
 */
function handleEraseResponse(result) {
  const eraseStatus = result.dataBytes[0]; // Get the erase status from the response
  const eraseAddress = bytesToDecimal(result.dataBytes[2], result.dataBytes[3], result.dataBytes[4]); // Convert the erase address from the response bytes

  // Check if the erase operation was successful (status 0 or 2, data byte 1 equals 0)
  if ((eraseStatus === 0 || eraseStatus === 2) && result.dataBytes[1] === 0) {
    // console.log(
    //   `%c[${
    //     new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + new Date().getMilliseconds()
    //   }] <- Erase successful at address: ${eraseAddress} ✓`, // Log success message
    //   `color:lime`
    // );
    updateLogSection(`Erase successful at address: ${eraseAddress} ✓`, "lime", "incoming"); // Update the log section

    lastErasedAddress = eraseAddress; // Update the last erased address
    if (lastErasedAddress == 74240) {
      index++; // Increment the index if the erased address is 74240
    }
    currentState = "WRITING"; // Transition to the writing state after successful erase
    sendNextWrite(); // Trigger the first write operation
  } else if (eraseStatus === 1 && result.dataBytes[1] === 0) {
    // If erase failed (status 1, data byte 1 equals 0)
    console.error("%cErase failed", "color:red;");
    updateLogSection("Erase failed", "red", "incoming"); // Log the failure
  }
}
/**
 * Sends the next write command based on the current index.
 * This includes handling erases and writes for different memory sections.
 *
 * @param {number} index - The index of the memory chunk to write.
 */
async function sendNextWrite() {
  if (currentState === "WRITING") {
    // Find the address of the memory chunk to write using the current index
    const address = Object.keys(obj_memory).find((key) => obj_memory[key].index === index);

    // If we're erasing at address 74240 and not already erasing it, initiate erase and decrement index
    if (address == 74240 && init_erase_74240 == false) {
      init_erase_74240 = true;
      index--; // Decrement index before erase operation
      // console.log(
      //   `%c[${new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + new Date().getMilliseconds()}] -> Erasing at address: 74240...`,
      //   `color:yellow;`
      // );
      updateLogSection(`Erasing at address: 74240...`, "yellow");
      BLEraseAddr(74240); // Trigger the erase at address 74240
    } else {
      // If address is not 74240, get the memory chunk by index
      const memoryChunk = getDataByIndex(index);
      if (memoryChunk) {
        const writeAddress = parseInt(address); // Parse the address as an integer
        const dataLength = memoryChunk.data.length; // Get the length of the data to write
        const nextEraseBoundary = lastErasedAddress + (lastErasedAddress === INITIAL_ERASE_ADDRESS ? INITIAL_ERASE_SIZE : ERASE_SIZE);

        // If it's the first erase operation, erase the initial address (12544)
        if (lastErasedAddress === null) {
          // console.log(
          //   `%c[${
          //     new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + new Date().getMilliseconds()
          //   }] -> Erasing at address: ${INITIAL_ERASE_ADDRESS} for ${INITIAL_ERASE_SIZE} bytes...`,
          //   `color:yellow;`
          // );
          updateLogSection(`Erasing at address: ${INITIAL_ERASE_ADDRESS} for ${INITIAL_ERASE_SIZE} bytes...`, "yellow");
          BLEraseAddr(INITIAL_ERASE_ADDRESS); // Trigger erase at the initial address
          lastErasedAddress = INITIAL_ERASE_ADDRESS;
        } else if (writeAddress >= nextEraseBoundary || writeAddress + dataLength > nextEraseBoundary) {
          // If write address crosses erase boundary, trigger another erase
          const nextEraseAddress = lastErasedAddress + (lastErasedAddress === INITIAL_ERASE_ADDRESS ? INITIAL_ERASE_SIZE : ERASE_SIZE);
          // console.log(
          //   `%c[${
          //     new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + new Date().getMilliseconds()
          //   }] -> Erasing at address: ${nextEraseAddress} for ${ERASE_SIZE} bytes...`,
          //   `color:yellow;`
          // );
          updateLogSection(`Erasing at address: ${nextEraseAddress} for ${ERASE_SIZE} bytes...`, "yellow");
          BLEraseAddr(nextEraseAddress); // Trigger erase at the next address boundary
          lastErasedAddress = nextEraseAddress;
        } else {
          // If the address does not require an erase, set interval and trigger write operation
          let interval = connectionType === "serial" ? 1250 : 3000; // Dynamically set the interval
          if (init_erase_74240 == true) {
            starthigher_WriteInterval(writeAddress, memoryChunk.data, interval); // Start higher memory write
          } else {
            startlower_WriteInterval(writeAddress, memoryChunk.data, interval); // Start lower memory write
          }
          index++; // Increment the index to trigger the next write
        }
      } else {
        // If no more memory chunks to write, log the completion time and reset the UI
        let endTimestamp = Date.now();
        const elapsedTimeMs = endTimestamp - startTimestamp;
        const minutes = Math.floor(elapsedTimeMs / 60000);
        const seconds = ((elapsedTimeMs % 60000) / 1000).toFixed(2);
        // console.log(`Elapsed Time for firmware upgrade (mm:ss): ${minutes}:${seconds}`);
        updateLogSection(`Elapsed Time for firmware upgrade (mm:ss): ${minutes}:${seconds}`, "orange");
        updateLogSection(`*********** Completed Successfully ✓ ***********`, "orange");

        // Re-enable the start button and reset the UI
        document.getElementById("blstart_button").disabled = false;
        document.getElementById("blstart_button").textContent = lang_map[210];
        document.getElementById("blstart_button").style.backgroundColor = "#F37021";
        document.getElementById("fileInputHex").disabled = false;
        document.getElementById("label-fileInputHex").style.cursor = "pointer";
        document.getElementById("blstart_button").style.cursor = "pointer";

        // Send a success message based on connection type (serial or bluetooth)
        if (connectionType === "serial") {
          sendTX("Reflect_fw_success");
        } else if (connectionType === "bluetooth") {
          sendAT("Reflect_fw_success");
        }

        // Delay before clearing metrics and resetting the state
        await delay(2000);
        clearMetrics();
      }
    }
  }
}
/**
 * Retrieves data at a specific index in memory.
 * @param {number} index - The index of the memory chunk.
 * @returns {Object|null} - The data object at the index, or null if not found.
 */
function getDataByIndex(index) {
  const address = Object.keys(obj_memory).find((key) => obj_memory[key].index === index);
  return address ? obj_memory[address] : null;
}

/**
 * Starts the firmware update process.
 * This function handles setup, progress updates, and communication to start the firmware update.
 * It also handles the user interface (UI) changes during the update.
 */
async function BLStart() {
  // Clear any ongoing write intervals and reset UI
  clearlower_WriteInterval();
  clearhigher_WriteInterval();
  clearLogSection();
  updateProgress_bl(0); // Reset progress bar to 0
  doc_value = ""; // Reset doc value
  index = 0; // Reset index to start from the first memory chunk
  init_erase_74240 = false; // Reset the erase flag for address 74240
  lastErasedAddress = null; // Reset the last erased address

  // Check if firmware hex file is loaded, otherwise exit early with error message
  if (!fwhex_loaded) {
    console.error("No file loaded!"); // Log error in console
    updateLogSection("No file loaded!", "red"); // Display error in log section
    return;
  }

  // Disable the file input and start button to prevent further actions during the update
  document.getElementById("fileInputHex").disabled = true;
  document.getElementById("label-fileInputHex").style.cursor = "default";
  document.getElementById("blstart_button").disabled = true;
  document.getElementById("blstart_button").style.cursor = "default";

  // Change start button text and color to indicate the update has started
  document.getElementById("blstart_button").textContent = lang_map[279];
  document.getElementById("blstart_button").style.backgroundColor = "#33B34A"; // Change to Pulsar Green

  // Send start command depending on the connection type
  if (connectionType === "serial") {
    sendTX("Reflect_fw_start"); // Send start signal via serial
  } else if (connectionType === "bluetooth") {
    sendAT("Reflect_fw_start"); // Send start signal via Bluetooth
  }

  // Wait for 2 seconds before continuing with the update process
  await delay(2000);

  // Set interval dynamically based on connection type
  let interval = connectionType === "serial" ? 1250 : 3000;

  // Start the connection interval for the update process
  startBLConnectInterval(interval);

  // Capture the current timestamp to track the update duration
  startTimestamp = Date.now();
}
/**
 * Updates the progress bar and progress text based on the given percentage.
 * @param {number} percent - The percentage to update the progress bar to (0-100).
 */
function updateProgress_bl(percent) {
  // Set the width of the progress bar based on the percentage
  document.getElementById("progressBar").style.width = percent + "%";

  // Update the progress text to display the percentage
  document.getElementById("progressText").textContent = percent + "%";
}
/**
 * Toggles the visibility of the log section.
 * If the log section is currently visible, it hides it.
 * If the log section is currently hidden, it shows it.
 */
function showLogs() {
  // Check if the log section is currently displayed as a block
  if (document.getElementById("logSection").style.display == "block") {
    // If visible, hide the log section
    document.getElementById("logSection").style.display = "none";
  } else {
    // If hidden, show the log section
    document.getElementById("logSection").style.display = "block";
  }
}
/**
 * Clears all the log entries in the log section.
 * If the log section is not found, an error is logged to the console.
 */
function clearLogSection() {
  // Get the log section element by its ID
  const logSection = document.getElementById("blTextBox");

  // Check if the log section exists
  if (logSection) {
    // Clear the inner content of the log section (all log entries)
    logSection.innerHTML = "";
  } else {
    // If the log section is not found, log an error
    console.error("Log section not found!");
  }
}
/**
 * Updates the log section with a new message.
 * It includes a timestamp, direction indicator (incoming or outgoing), and applies a specific color to the message.
 * It also auto-scrolls the log section if the user is at the bottom.
 *
 * @param {string} message - The message to display in the log.
 * @param {string} color - The color to apply to the message text.
 * @param {string} [direction="outgoing"] - The direction of the message ("incoming" or "outgoing").
 */
function updateLogSection(message, color, direction = "outgoing") {
  // Get the log section element by its ID
  const logSection = document.getElementById("blTextBox");

  // If the log section is not found, log an error and exit the function
  if (!logSection) {
    console.error("Log section not found!");
    return;
  }

  // Create a timestamp in the format [hh:mm:ss.xx]
  const timestamp = `[${
    new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + String(Math.floor(new Date().getMilliseconds() / 10)).padStart(2, "0")
  }]`;

  // Determine the arrow based on the message direction ("incoming" gets "<-", "outgoing" gets "->")
  const arrow = direction === "incoming" ? "<-" : "->";

  // Create a new div element to display the log entry
  const newLog = document.createElement("div");
  newLog.textContent = `${timestamp} ${arrow} ${message}`; // Set the log message text
  newLog.style.color = color; // Set the color of the log message

  // Check if the log section is currently scrolled to the bottom
  const isAtBottom = logSection.scrollHeight - logSection.clientHeight <= logSection.scrollTop + 10;

  // Append the new log entry to the log section
  logSection.appendChild(newLog);

  // If the user is at the bottom, scroll the log section to the new bottom
  if (isAtBottom) {
    logSection.scrollTop = logSection.scrollHeight;
  }
}
/**
 * Event listener to track if the user scrolls manually.
 * If the user is at the bottom of the log section, auto-scroll is enabled.
 * If the user scrolls up, auto-scroll is disabled.
 */
document.getElementById("blTextBox").addEventListener("scroll", function () {
  const logSection = this; // Get the log section (blTextBox)

  // Check if the user is at the bottom of the log section
  const isUserAtBottom = logSection.scrollHeight - logSection.clientHeight <= logSection.scrollTop + 10;

  if (isUserAtBottom) {
    // Enable auto-scroll if user is at the bottom
    logSection.dataset.autoScroll = "true";
  } else {
    // Disable auto-scroll if user has scrolled up
    logSection.dataset.autoScroll = "false";
  }
});
/**
 * Sends a command to update the firmware string depending on the connection type.
 * It sends a different command based on whether the connection is via serial or Bluetooth.
 */
function fwStringUpdate() {
  // If the connection type is serial, send a serial command "/P926"
  if (connectionType === "serial") {
    sendTX("/P926");
    CommandSent = "fwStringUpdate"; // Mark the command sent as "fwStringUpdate"
  }
  // If the connection type is Bluetooth, send a Bluetooth command "/P926"
  else if (connectionType === "bluetooth") {
    sendAT("/P926");
    CommandSent = "fwStringUpdate"; // Mark the command sent as "fwStringUpdate"
  }
}
/**
 * Formats the given input number as a firmware version string.
 * The formatting depends on the number of digits in the input.
 *
 * @param {number} input - The input number to format as a version.
 * @returns {string} - The formatted firmware version string.
 */
function formatFwVersion(input) {
  if (input < 10) {
    // If the input is a single digit (0-9), format as "0.0.x"
    return `0.0.${input}`;
  } else if (input < 100) {
    // If the input is a two-digit number (10-99), format as "0.x.y"
    return `0.${Math.floor(input / 10)}.${input % 10}`;
  } else {
    // If the input is a three-digit number (100+), format as "x.y.z"
    return `${Math.floor((input / 100) % 10)}.${Math.floor((input / 10) % 10)}.${input % 10}`;
  }
}
/**
 * Extracts the firmware version from the input string and formats it.
 * The function looks for a pattern like ":x.x" (e.g., ":1.0", ":12.34").
 *
 * @param {string} input - The input string containing the version information.
 * @returns {string|null} - The formatted firmware version string or null if no version is found.
 */
function extractFwVersion(input) {
  // Match a pattern that looks like ":x.x" (e.g., ":1.0", ":12.34")
  const match = input.match(/:(\d+\.\d+)/);

  // If the version pattern is found in the input
  if (match) {
    // Extract the numeric version as a float (e.g., "12.34" becomes 12.34)
    const extractedFloat = parseFloat(match[1]);

    // Convert the float to an integer (removes decimal part)
    const versionInt = Math.floor(extractedFloat);

    // Format the extracted integer as a firmware version string and return it
    return formatFwVersion(versionInt);
  }

  // Return null if no match is found
  return null;
}
/**
 * Clears the metrics after a successful firmware update.
 * This function is called to reset or clear any metrics that may have been updated
 * during the firmware update process, ensuring they don't interfere with subsequent updates.
 */
function clearMetrics() {
  // Check if the connection type is "serial"
  if (connectionType === "serial") {
    // Send the "clear_metrics" command over the serial connection
    sendTX("clear_metrics");
    CommandSent = "clear_metrics"; // Update the last command sent
  }
  // Check if the connection type is "bluetooth"
  else if (connectionType === "bluetooth") {
    // Send the "clear_metrics" command over the Bluetooth connection
    sendAT("clear_metrics");
    CommandSent = "clear_metrics"; // Update the last command sent
  }
}
/**
 * Resets the host after completing a firmware update.
 * This function sends a "Reflect_fw_end" command to indicate the end of the update process
 * and to reset the host, ensuring that it is ready for any further actions.
 */
function resetHost() {
  // Check if the connection type is "serial"
  if (connectionType === "serial") {
    // Send the "Reflect_fw_end" command over the serial connection
    sendTX("Reflect_fw_end");
    CommandSent = "Reflect_fw_end"; // Update the last command sent
  }
  // Check if the connection type is "bluetooth"
  else if (connectionType === "bluetooth") {
    // Send the "Reflect_fw_end" command over the Bluetooth connection
    sendAT("Reflect_fw_end");
    CommandSent = "Reflect_fw_end"; // Update the last command sent
  }
}

/**
 * Starts an interval to repeatedly check the firmware version during the bootloader process.
 * This function calls `BLVersion()` at regular intervals and checks if the maximum number of attempts has been reached.
 * If the maximum attempts are reached, an alert is displayed, and the interval is cleared.
 *
 * @param {number} intervalDuration - The duration (in milliseconds) between each check for the firmware version.
 */
function startBLVersionInterval(intervalDuration) {
  // Call BLVersion() to check the firmware version initially
  BLVersion();
  BLVersionCounter = 1; // Initialize the counter to track the number of version checks

  // Set up an interval to repeatedly call BLVersion() at the specified duration
  BLVersionintervalID = setInterval(() => {
    // If the counter reaches 5, alert the user and stop further checks
    if (BLVersionCounter >= 5) {
      alert(lang_map[291]);
      ClearBLVersionInterval(); // Clear the interval to stop further checks
      return;
    }
    // Call BLVersion() to check the firmware version again
    BLVersion();
    BLVersionCounter++; // Increment the counter
  }, intervalDuration);
}
/**
 * Clears the interval that repeatedly checks the firmware version during the bootloader process.
 * Resets the BLVersionCounter to 0 to track the version checks.
 */
function ClearBLVersionInterval() {
  // If the interval ID exists, clear the interval to stop further version checks
  if (BLVersionintervalID) {
    clearInterval(BLVersionintervalID); // Stops the interval
    BLVersionCounter = 0; // Reset the version check counter
  }
}

/**
 * Starts an interval that repeatedly attempts to establish a connection during the bootloader process.
 * If the connection fails after a set number of attempts, it triggers an alert and stops further attempts.
 *
 * @param {number} intervalDuration - The duration (in milliseconds) between each connection attempt.
 */
function startBLConnectInterval(intervalDuration) {
  // Attempt to establish connection immediately on start
  BLConnect();
  BLConnectCounter = 1; // Initialize the connection attempt counter

  // Set an interval to repeatedly attempt connection at specified duration
  BLConnectintervalID = setInterval(() => {
    // If 5 attempts are reached without success, alert the user and stop further attempts
    if (BLConnectCounter >= 5) {
      alert(lang_map[291]);
      ClearBLConnectInterval(); // Clear the interval and stop attempts
      return;
    }
    // Otherwise, attempt to connect again
    BLConnect();
    BLConnectCounter++; // Increment the connection attempt counter
  }, intervalDuration); // Set interval between attempts
}
/**
 * Clears the interval for connection attempts and resets the connection counter.
 */
function ClearBLConnectInterval() {
  // Check if the interval ID exists before attempting to clear it
  if (BLConnectintervalID) {
    clearInterval(BLConnectintervalID); // Stop the repeated connection attempts
    BLConnectCounter = 0; // Reset the connection attempt counter to 0
  }
}
/**
 * Starts an interval for writing data to lower memory with a specified interval duration.
 * The function will attempt to write 5 times before alerting the user and stopping the interval.
 * @param {number} address - The address to write to.
 * @param {Array} memoryChunk - The data chunk to write.
 * @param {number} intervalDuration - The interval duration in milliseconds between write attempts.
 */
function startlower_WriteInterval(address, memoryChunk, intervalDuration) {
  // Write the first chunk of data to the specified address
  BLWriteAddr_lowermemory(parseInt(address), memoryChunk);
  lowerWriteCounter = 1; // Initialize the write attempt counter

  // Set up an interval for repeated write attempts
  lower_writeIntervalId = setInterval(() => {
    // Check if the write attempts have exceeded the limit (5 attempts)
    if (lowerWriteCounter >= 5) {
      alert(lang_map[291]); // Show failure alert
      clearlower_WriteInterval(); // Clear the write interval
      return; // Stop further attempts
    }

    // Perform the write to the memory address again
    BLWriteAddr_lowermemory(parseInt(address), memoryChunk);
    lowerWriteCounter++; // Increment the write attempt counter
  }, intervalDuration); // Execute the write attempts at the specified interval duration
}
/**
 * Clears the interval for writing to the lower memory and resets the write attempt counter.
 * This function stops the repeated write attempts and prevents further actions.
 */
function clearlower_WriteInterval() {
  // Check if the interval ID is defined (indicating the interval is active)
  if (lower_writeIntervalId) {
    clearInterval(lower_writeIntervalId); // Clear the active interval
    lowerWriteCounter = 0; // Reset the write attempt counter
  }
}

/**
 * Starts an interval for writing to higher memory. The function will attempt to write data multiple times.
 * If the maximum retry count is reached, it will display an alert and stop further attempts.
 * @param {number} address - The memory address to write data to.
 * @param {Object} memoryChunk - The data chunk to be written.
 * @param {number} intervalDuration - The interval duration in milliseconds between each write attempt.
 */
function starthigher_WriteInterval(address, memoryChunk, intervalDuration) {
  // Perform the first write operation to the specified higher memory address
  BLWriteAddr_highermemory(parseInt(address), memoryChunk);
  higherWriteCounter = 1; // Initialize the counter for retry attempts

  // Start an interval to retry the write operation if it fails
  higher_writeIntervalId = setInterval(() => {
    // If the number of retry attempts reaches 5, stop the operation and alert the user
    if (higherWriteCounter >= 5) {
      alert(lang_map[291]);
      clearhigher_WriteInterval(); // Clear the interval and stop further retries
      return;
    }
    // Retry the write operation if it hasn't succeeded yet
    BLWriteAddr_highermemory(parseInt(address), memoryChunk);
    higherWriteCounter++; // Increment the retry counter
  }, intervalDuration); // Set the interval duration between retries
}
/**
 * Clears the interval for higher memory write operations.
 * This stops any ongoing retries and resets the retry counter.
 */
function clearhigher_WriteInterval() {
  // If the interval for writing to higher memory exists, clear it
  if (higher_writeIntervalId) {
    clearInterval(higher_writeIntervalId); // Stop the retry interval
    higherWriteCounter = 0; // Reset the retry counter to 0
  }
}
/**
 * Displays the copy button when the mouse enters the "blTextBox" container.
 */
document.getElementById("blTextBox_container").addEventListener("mouseenter", function () {
  // Show the copy button when the user hovers over the "blTextBox" container
  document.getElementById("blTextBox_copyButton").style.display = "block";
});
/**
 * Hides the copy button when the mouse leaves the "blTextBox" container.
 */
document.getElementById("blTextBox_container").addEventListener("mouseleave", function () {
  // Hide the copy button when the user stops hovering over the "blTextBox" container
  document.getElementById("blTextBox_copyButton").style.display = "none";
});
/**
 * Copies the text content of the "blTextBox" to the clipboard.
 */
function blTextBox_copyText() {
  const textBox = document.getElementById("blTextBox");
  // Get the text content of the "blTextBox" element (either innerText or textContent)
  const text = textBox.innerText || textBox.textContent;
  // Create a temporary text area to hold the text to be copied
  const textArea = document.createElement("textarea");
  textArea.value = text;
  // Append the text area to the document body to make it selectable
  document.body.appendChild(textArea);
  // Select the content inside the text area
  textArea.select();
  // Execute the copy command to copy the selected text to the clipboard
  document.execCommand("copy");
  // Remove the temporary text area after copying
  document.body.removeChild(textArea);
}

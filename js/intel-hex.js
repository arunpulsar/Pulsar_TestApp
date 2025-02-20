// Initialize global variables
let currentBaseAddress = 0; // Store the current base address for records
let obj_memory = {}; // Memory object to store parsed data
let fwhex_loaded = false;

/**
 * Parses the Intel HEX file content and returns parsed records.
 * @param {string} hexFileContent - The content of the HEX file to parse.
 * @returns {Array} - Array of parsed records.
 */
function parseIntelHex(hexFileContent) {
  const lines = hexFileContent.split(/\r?\n/); // Split file content into lines
  const parsedData = []; // Array to store parsed records

  lines.forEach((line) => {
    if (!line.startsWith(":") || line.trim() === "") return; // Skip invalid or empty lines

    // Parse the record
    const byteCount = parseInt(line.slice(1, 3), 16); // Byte count of the record
    const address = parseInt(line.slice(3, 7), 16); // Starting address of the data
    const recordType = parseInt(line.slice(7, 9), 16); // Record type
    const data = line.slice(9, 9 + byteCount * 2); // Data field of the record
    const checksum = parseInt(line.slice(9 + byteCount * 2, 9 + byteCount * 2 + 2), 16); // Checksum value

    // Handle extended linear address records (Type 02 and Type 04)
    if (recordType === 0x02 || recordType === 0x04) {
      currentBaseAddress = parseInt(data, 16) << 16;
      return;
    }

    // Handle data records (Type 00)
    if (recordType === 0x00) {
      const fullAddress = currentBaseAddress + address;
      const computedChecksum = calculateChecksum(line.slice(1, 9 + byteCount * 2));
      if (computedChecksum !== checksum) {
        throw new Error(`Checksum mismatch on line: ${line}`);
      }

      // This can be used to test empty NULLs being written to the flash
      // const zeroedData = new Array(byteCount).fill(0);
      // parsedData.push({ byteCount, address: fullAddress, recordType, data: zeroedData });
      parsedData.push({ byteCount, address: fullAddress, recordType, data: hexToBytes(data) });
    }
  });
  return parsedData;
}
/**
 * Calculates the checksum for a given hex record (without colon).
 * The checksum is the 2's complement of the sum of bytes modulo 256.
 *
 * @param {string} recordWithoutColon - The hex record (string) without colon separators.
 * @returns {number} - The calculated checksum.
 */
function calculateChecksum(recordWithoutColon) {
  // Convert the hex string (without colons) to an array of bytes
  const bytes = hexToBytes(recordWithoutColon);

  // Sum all bytes
  const sum = bytes.reduce((acc, byte) => acc + byte, 0);

  // Return the 2's complement of the sum, and mask to get the result within a byte range (0-255)
  return (~sum + 1) & 0xff;
}
/**
 * Converts a hex string (without colons) to an array of bytes.
 * Each pair of hex characters is converted into a single byte.
 *
 * @param {string} hexString - The hex string to convert (should not contain colons).
 * @returns {Array<number>} - An array of byte values (numbers).
 */
function hexToBytes(hexString) {
  const bytes = [];

  // Iterate over the hex string in steps of 2 characters
  for (let i = 0; i < hexString.length; i += 2) {
    // Extract the two characters (pair of hex digits), convert to a byte and add to the array
    bytes.push(parseInt(hexString.substr(i, 2), 16));
  }

  return bytes;
}
/**
 * Splits the data of a memory object into smaller chunks if the number of null bytes exceeds the threshold.
 * It will split the data into two halves and renumber the indices accordingly.
 *
 * @param {Object} memoryObject - The memory object to check and split.
 * @returns {Object} - A new memory object with potentially split data and updated indices.
 */
function splitArrayIfNeeded(memoryObject) {
  const MAX_NULLS = 64; // Threshold for the maximum number of null bytes allowed in a chunk
  const SPLIT_SIZE = 64; // Size to split the chunk into if the null bytes exceed the threshold

  const newMemoryObject = {}; // New object to store the possibly split data

  // Iterate over each address in the memory object
  for (const address in memoryObject) {
    const data = memoryObject[address].data; // Data for the current memory address
    const nullCount = data.filter((byte) => byte === 0).length; // Count how many null bytes (0) exist in the data

    // If the number of null bytes exceeds the threshold, split the data
    if (nullCount > MAX_NULLS) {
      // Split the data into two halves
      const firstHalf = data.slice(0, SPLIT_SIZE); // First 64 bytes
      const secondHalf = data.slice(SPLIT_SIZE); // Remaining bytes after the first 64

      const currentIndex = memoryObject[address].index; // The current index of the memory chunk

      // Add the first half to the new memory object with the same index
      newMemoryObject[address] = { data: firstHalf, index: currentIndex };
      // Add the second half with the same index incremented by 1
      newMemoryObject[parseInt(address) + SPLIT_SIZE] = { data: secondHalf, index: currentIndex + 1 };

      // Logging statements (commented out)
      // console.log(`Now splitting it into two with addresses ${address} and ${parseInt(address) + SPLIT_SIZE}, indices ${currentIndex} and ${currentIndex + 1}`);
    } else {
      // If null count doesn't exceed the threshold, retain the original memory chunk
      newMemoryObject[address] = memoryObject[address];
    }
  }

  // Renumber the indices in a sorted order of addresses
  const sortedAddresses = Object.keys(newMemoryObject).sort((a, b) => parseInt(a) - parseInt(b));
  sortedAddresses.forEach((address, index) => {
    newMemoryObject[address].index = index; // Update the index for each chunk
  });

  return newMemoryObject; // Return the updated memory object
}
/**
 * Writes parsed data to memory, handling chunks and addresses.
 * If the chunk size exceeds 128 bytes, it splits them and stores them with consecutive addresses.
 *
 * @param {Array} parsedData - The parsed data to write to memory, each item having a record type and address.
 * @returns {Object} - The memory object with addresses as keys and the corresponding data.
 */
function writeToMemory(parsedData) {
  const memory = {}; // The object where memory will be stored, with address as keys
  let currentChunk = { start: null, data: [] }; // The current memory chunk, with a starting address and data array

  // Iterate over each record in the parsed data
  parsedData.forEach((record) => {
    // If the record type is 0x00, process it
    if (record.recordType === 0x00) {
      // If this is the first record in a chunk, initialize the chunk start address
      if (currentChunk.start === null) {
        currentChunk.start = record.address;
      }

      // Check if the current address is contiguous with the previous address and if the chunk is less than 128 bytes
      if (record.address === currentChunk.start + currentChunk.data.length && currentChunk.data.length < 128) {
        currentChunk.data = currentChunk.data.concat(record.data); // Add the record's data to the chunk
      } else {
        // Split the chunk if it exceeds 128 bytes
        while (currentChunk.data.length >= 128) {
          memory[currentChunk.start] = { data: currentChunk.data.slice(0, 128) }; // Store the first 128 bytes
          currentChunk.data = currentChunk.data.slice(128); // Remove the first 128 bytes from the chunk
          currentChunk.start += 128; // Move the start address forward by 128
        }

        // If the current record's address doesn't match the expected contiguous address
        if (record.address !== currentChunk.start + currentChunk.data.length) {
          // If there's data left in the current chunk, save it before moving to the next address
          if (currentChunk.data.length > 0) {
            memory[currentChunk.start] = { data: currentChunk.data };
          }
          // Reset the chunk to start with the current record's address and data
          currentChunk.start = record.address;
          currentChunk.data = [...record.data];
        } else {
          // Otherwise, append the current record's data to the chunk
          currentChunk.data = currentChunk.data.concat(record.data);
        }
      }
    }
  });

  // After processing all records, store any remaining data in the current chunk
  if (currentChunk.data.length > 0) {
    memory[currentChunk.start] = { data: currentChunk.data };
  }

  // Sort memory by address and renumber the indices
  const sortedAddresses = Object.keys(memory).sort((a, b) => parseInt(a) - parseInt(b));
  sortedAddresses.forEach((address, index) => {
    memory[address].index = index; // Assign a new index based on the sorted order of addresses
  });

  return memory; // Return the populated memory object
}
/**
 * Handles the file upload process for a firmware HEX file.
 * This function performs the following steps:
 * 1. Validates the uploaded file to ensure it has a .hex extension.
 * 2. Extracts the firmware version from the file name.
 * 3. Displays the firmware version and file size in designated elements.
 * 4. Resets global variables and memory before processing the new file.
 * 5. Reads the file's contents and parses it into a memory structure.
 * 6. Logs success or failure during the parsing process and updates the UI accordingly.
 *
 * @param {Event} event - The file input change event triggered by the user uploading a file.
 */
function handleFileUpload(event) {
  const file = event.target.files[0]; // Get the uploaded file
  const firmwareVersionElement = document.getElementById("hex_fwversion-box"); // DOM element to display the firmware version
  const fileSizeElement = document.getElementById("hex_size-box"); // DOM element to display the file size

  // Validate the file extension to ensure it's a .hex file
  if (file) {
    if (!file.name.endsWith(".hex")) {
      alert("Error: Only .hex files are allowed!"); // Alert the user if the file is not a .hex file
      return;
    }

    // Extract firmware version from the file name using regex
    const versionMatch = file.name.match(/_(\d+\.\d+\.\d+)_/);
    const firmwareVersion = versionMatch ? versionMatch[1] : "Unknown"; // Default to "Unknown" if version is not found

    // Display the extracted firmware version and file size in the UI
    firmwareVersionElement.textContent = firmwareVersion;
    fileSizeElement.textContent = file.size + " bytes";
  }

  // Reset global variables for a fresh start with new file
  for (let key in obj_memory) {
    delete obj_memory[key]; // Clear any existing memory data
  }
  obj_memory = {}; // Reinitialize the memory object
  currentBaseAddress = 0; // Reset base address for parsing

  const reader = new FileReader(); // Create a new FileReader to read the file content

  // Define the onload function to parse the file content after it's read
  reader.onload = function (e) {
    const hexFileContent = e.target.result; // Get the content of the uploaded HEX file
    try {
      // Parse the HEX file content and process it into memory
      const parsedData = parseIntelHex(hexFileContent);
      obj_memory = writeToMemory(parsedData); // Store parsed data into memory
      obj_memory = splitArrayIfNeeded(obj_memory); // Split large memory chunks if needed
      // console.log(obj_memory);

      // Log success with timestamp and update UI to indicate file has been successfully parsed
      // console.log(
      //   `%c[${
      //     new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + String(Math.floor(new Date().getMilliseconds() / 10)).padStart(2, "0")
      //   }] ** Firmware HEX file successfully parsed! **`,
      //   "color:lime"
      // );
      fwhex_loaded = true; // Set the flag indicating HEX file is loaded
      document.getElementById("label-fileInputHex").style.backgroundColor = "#33B34A"; // Change button color to Pulsar green
    } catch (error) {
      fwhex_loaded = false; // Set flag to false if error occurs
      updateLogSection(error.message, "red", "incoming"); // Update the log with error details
      console.error(error.message); // Log the error to the console
      alert(`Error parsing Intel HEX file.`); // Alert the user of the error
    }
  };

  // Read the uploaded file as text
  reader.readAsText(file);
}

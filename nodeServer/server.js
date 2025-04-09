const WebSocket = require('ws');
const nodeHid = require('node-hid');

// Connect to remote WebSocket server
const ws = new WebSocket('ws://192.168.0.6:3000');

// global led state tracking
const ledStates = [false, false, false, false];

// Function to find the buzzer device
function findDeviceByName() {
  const buzzDevice = nodeHid.devices().find(d => d.product.match(/Buzz/));
  return new nodeHid.HID(buzzDevice.vendorId, buzzDevice.productId);
}

// Connect to the device
function connectToDevice() {
  try {
    return findDeviceByName();
  } catch (e) {
    console.error('Error connecting to device:', e);
    return null;
  }
}

// Set the LED states on the buzzer device
function setLeds(data) {
  if (device && data.controller < 4) {
    ledStates[data.controller] = data.led;
    try {
      const ledData = [0x00, 0x00].concat(
          ledStates.map(state => (state ? 0xFF : 0x00))
      );
      device.write(ledData);
    } catch (error) {
      console.error('Error setting LEDs:', error);
    }
  }
}

// Map device binary data to button states
function mapDeviceDataToPressedButtons(data) {
  let input = toBinary(data).split('');
  return [
    input[23] === "1",
    input[19] === "1",
    input[20] === "1",
    input[21] === "1",
    input[22] === "1",
    input[18] === "1",
    input[30] === "1",
    input[31] === "1",
    input[16] === "1",
    input[17] === "1",
    input[29] === "1",
    input[25] === "1",
    input[26] === "1",
    input[27] === "1",
    input[28] === "1",
    input[24] === "1",
    input[36] === "1",
    input[37] === "1",
    input[38] === "1",
    input[39] === "1"
  ];
}

// Convert device buffer to binary string
function toBinary(data) {
  let binarystring = '';
  for (let i = 0; i < data.length; i++) {
    binarystring += data[i].toString(2).padStart(8, '0');
  }
  return binarystring !== '0000000000000000000000000000000011110000' ? binarystring : "";
}

let device = connectToDevice();

if (device) {
  device.on('data', data => {
    const states = mapDeviceDataToPressedButtons(data);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: 'buttonChange', states }));
    }
  });

  device.on('error', err => {
    console.error('Device error:', err);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: 'error', error: err.message }));
    }
  });
}

// Listen to messages from server (e.g., to set LEDs)
ws.on('message', message => {
  const data = JSON.parse(message);
  if (data.event === 'ledUpdate') {
    setLeds(data);
  }
});

ws.on('open', () => {
  console.log('Connected to WebSocket server at 192.168.0.6:3000');
});

ws.on('close', () => {
  console.log('Disconnected from WebSocket server.');
});

ws.on('error', (err) => {
  console.error('WebSocket error:', err);
});

const express = require('express');
const WebSocket = require('ws');
const nodeHid = require('node-hid');

// Initialize the Express server
const app = express();
const port = 3000;

// Set up WebSocket server
const wss = new WebSocket.Server({ noServer: true });

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
function setLeds(states) {
  if (device) {
    try {
      const ledData = [0x00, 0x00].concat(
        states.map(state => (state ? 0xFF : 0x00))
      );
      device.write(ledData);
    } catch (error) {
      console.error('Error setting LEDs:', error);
    }
  }
}

let device = connectToDevice();

// WebSocket connection handler
wss.on('connection', ws => {
  console.log('New WebSocket connection');

  ws.on('message', message => {
    const data = JSON.parse(message);

    if (data.event === 'setLeds') {
      setLeds(data.states);
    }
  });

  // Send data to frontend on device state change
  if (device) {
    device.on('data', data => {
      const states = mapDeviceDataToPressedButtons(data);
      ws.send(JSON.stringify({ event: 'buttonChange', states }));
    });

    device.on('error', err => {
      console.error('Device error:', err);
      ws.send(JSON.stringify({ event: 'error', error: err.message }));
    });
  }
});

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


function toBinary(data) {
  let binarystring = '';
  for (let i = 0; i < data.length; i++) {
    binarystring += data[i].toString(2).padStart(8, '0'); // Convert each byte to an 8-bit binary string
  }
  if (binarystring !== '0000000000000000000000000000000011110000') return  binarystring; else return "";
}


// Handle HTTP requests to upgrade to WebSocket
app.server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, ws => {
    wss.emit('connection', ws, request);
  });
});

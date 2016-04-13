var serialport = require('serialport')
SerialPort = serialport.SerialPort;

portName = "/dev/ttyACM0"
baud = 230400

var myPort = new SerialPort(portName, {
  baudRate: baud
});

myPort.on('open', showPortOpen);
myPort.on('data', sendSerialData);
myPort.on('error', showError);

function showPortOpen() {
  console.log('port open. Data rate: ' + myPort.options.baudRate);
}

function sendSerialData(data){
  console.log('sending to: ' + myPort.options + ' data: ' + data);
  myPort.write(data);
}

function showError(error){
  console.log('Serial port error: ' + error);
}

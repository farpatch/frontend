import { Request, Application, Response } from 'express';

var CONNECTED: boolean = false;
var SSID: string = '';
var TASKS = [
  { 'id': 1, 'name': "ipc0", 'prio': 24, 'state': 'eSuspended', 'stack_hwm': 1244, 'core': '0', 'cpu': 0, 'pc': 0x400559e0 },
  { 'id': 2, 'name': "ipc1", 'prio': 24, 'state': 'eSuspended', 'stack_hwm': 1236, 'core': '1', 'cpu': 0, 'pc': 0x400559e0 },
  { 'id': 3, 'name': "esp_timer", 'prio': 22, 'state': 'eSuspended', 'stack_hwm': 2572, 'core': '0', 'cpu': 0, 'pc': 0x400559e0 },
  { 'id': 5, 'name': "IDLE0", 'prio': 0, 'state': 'eReady', 'stack_hwm': 2340, 'core': '0', 'cpu': 98, 'pc': 0x400559e0 },
  { 'id': 6, 'name': "IDLE1", 'prio': 0, 'state': 'eReady', 'stack_hwm': 2336, 'core': '1', 'cpu': 99, 'pc': 0x4037d30a },
  { 'id': 7, 'name': "Tmr Svc", 'prio': 1, 'state': 'eBlocked', 'stack_hwm': 1164, 'core': '0', 'cpu': 0, 'pc': 0x40380e79 },
  { 'id': 8, 'name': "dbg_log_main", 'prio': 4, 'state': 'eBlocked', 'stack_hwm': 1296, 'core': 'ANY', 'cpu': 0, 'pc': 0x400559e0 },
  { 'id': 9, 'name': "wifi_manager", 'prio': 5, 'state': 'eBlocked', 'stack_hwm': 1400, 'core': 'ANY', 'cpu': 0, 'pc': 0x400559e0 },
  { 'id': 10, 'name': "tiT", 'prio': 18, 'state': 'eBlocked', 'stack_hwm': 844, 'core': 'ANY', 'cpu': 0, 'pc': 0x400559e0 },
  { 'id': 11, 'name': "sys_evt", 'prio': 20, 'state': 'eBlocked', 'stack_hwm': 760, 'core': '0', 'cpu': 0, 'pc': 0x400559e0 },
  { 'id': 12, 'name': "wifi", 'prio': 23, 'state': 'eBlocked', 'stack_hwm': 3484, 'core': '0', 'cpu': 0, 'pc': 0x400559e0 },
  { 'id': 13, 'name': "httpd", 'prio': 5, 'state': 'eRunning', 'stack_hwm': 1392, 'core': 'ANY', 'cpu': 0, 'pc': 0x400559e0 },
  { 'id': 14, 'name': "mdns", 'prio': 1, 'state': 'eBlocked', 'stack_hwm': 2108, 'core': '0', 'cpu': 0, 'pc': 0x400559e0 },
  { 'id': 15, 'name': "uart_rx_task", 'prio': 1, 'state': 'eBlocked', 'stack_hwm': 1456, 'core': '1', 'cpu': 0, 'pc': 0x400559e0 },
  { 'id': 16, 'name': "net_uart_task", 'prio': 1, 'state': 'eBlocked', 'stack_hwm': 3848, 'core': 'ANY', 'cpu': 0, 'pc': 0x400559e0 },
  { 'id': 17, 'name': "gdb_net", 'prio': 1, 'state': 'eBlocked', 'stack_hwm': 592, 'core': 'ANY', 'cpu': 0, 'pc': 0x400559e0 },
  { 'id': 18, 'name': "tftpOTATask", 'prio': 4, 'state': 'eBlocked', 'stack_hwm': 1520, 'core': 'ANY', 'cpu': 0, 'pc': 0x400559e0 },
];

const GET_ENDPOINTS: { [key: string]: (request: Request, response: Response) => any } = {
  'voltages': getVoltages,
  'target': getTarget,
  'version': getVersion,
  'network': getNetworkStatus,
  'tasks': getTasks,
  'serial': getSerialPort,
  'update': getUpdate,
  'system': getSystem,
  'ap': getAccessPoints,
};

const POST_ENDPOINTS: { [key: string]: (request: Request, response: Response) => any } = {
  'connect': postConnect,
};

const DELETE_ENDPOINTS: { [key: string]: (request: Request, response: Response) => any } = {
  'connect': deleteConnect,
};

function getTasks(_request: Request, response: Response) {
  response.send(TASKS);
}

function getVoltages(_request: Request, response: Response) {
  var voltages: { [key: string]: number } = {
    '3.3V': 3.3,
    'Target': 1.8,
    'USB': 5.02,
    'Debug': 5.01,
    'EXT': 3.7,
  };
  response.send(voltages);
}

function getTarget(_request: Request, response: Response) {
  var target = {
    'name': 'nrf52840',
    'ram': 256 * 1024,
    'flash': 1024 * 1024,
    'cpu': 'ARM Cortex-M4F',
  }
  var targets = [
    'nrf52840',
    'mdf',
  ];
  response.send({
    'current': target,
    'available': targets,
  });
}


function getSerialPort(request: Request, response: Response) {
  var serialPorts = {
    'uart': {
      'name': 'serial',
      'baud_rate': 115200,
      'parity': 'none',
      'stop_bits': 1,
      'data_bits': 8,
      'flow_control': 'none',
    },
    'swo': {
      'name': 'swo',
      'baud_rate': 0,
      'parity': 'none',
      'stop_bits': 1,
      'data_bits': 8,
      'flow_control': 'none',
    },
    'uuart': {
      'name': 'uuart',
      'baud_rate': 0,
      'parity': 'none',
      'stop_bits': 1,
      'data_bits': 8,
      'flow_control': 'none',
    },
  }
  response.send(serialPorts);
}

function getUpdate(request: Request, response: Response) {
  response.send({
    'current_partition': {
      'addr': 0x00010000,
      'index': 2,
    },
    'next_partition': {
      'addr': 0x00380000,
      'index': -1,
    },
  });
}

function getSystem(request: Request, response: Response) {
  response.send({
    'heap': 149552,
    'uptime': 1551000,
  });
}

function getVersion(_request: Request, response: Response) {
  response.send({
    'farpatch': '0.1.0',
    'bmp': '0.1.0',
    'hardware': 'DVT5',
  });
}

function getNetworkStatus(request: Request, response: Response) {
  if (CONNECTED) {
    response.send({ "ssid": SSID, "ip": "10.0.237.133", "netmask": "255.255.255.0", "gw": "10.0.237.1", "urc": 0 });
  } else {
    response.send({ "ssid": "", "ip": "0", "netmask": "0", "gw": "0", "urc": 2 });
  }
}

function getAccessPoints(_request: Request, response: Response) {
  response.send([{ "ssid": "Omicron Persei 8", "chan": 6, "rssi": -50, "auth": 3 },
  { "ssid": "Parelivingroom", "chan": 1, "rssi": -71, "auth": 4 },
  { "ssid": "HappyWifiHappyLife", "chan": 8, "rssi": -71, "auth": 3 },
  { "ssid": "SINGTEL-AV4U", "chan": 1, "rssi": -77, "auth": 3 },
  { "ssid": "TP Living Room", "chan": 9, "rssi": -77, "auth": 3 },
  { "ssid": "Brett_Home", "chan": 1, "rssi": -80, "auth": 3 },
  { "ssid": "黄 Fam", "chan": 6, "rssi": -80, "auth": 3 }]);
}

function postConnect(request: Request, response: Response) {
  var ssid = request.headers['x-custom-ssid'];
  var password = request.headers['x-custom-pwd'];

  if (!ssid || !password) {
    response.status(400).send({ 'error': 'Missing SSID or password' });
    return;
  }
  response.send('{}');
  CONNECTED = true;
  if (typeof ssid === 'string') {
    SSID = ssid;
  } else {
    SSID = ssid[0];
  }
}

function deleteConnect(_request: Request, response: Response) {
  console.log("Deleting connection");
  response.send('{}');
  CONNECTED = false;
  SSID = '';
}

function reportEndpoints(_request: Request, response: Response) {
  var getEndpointsArray = [];
  for (var endpoint in GET_ENDPOINTS) {
    getEndpointsArray.push('/fp/' + endpoint);
  }

  var postEndpointsArray = [];
  for (var endpoint in POST_ENDPOINTS) {
    postEndpointsArray.push('/fp/' + endpoint);
  }
  response.send({
    'endpoints': {
      'get': getEndpointsArray,
      'post': postEndpointsArray,
    }
  });
}

export function installMiddlewares(app: Application) {
  app.get('/fp/', reportEndpoints);
  for (var endpoint in GET_ENDPOINTS) {
    app.get('/fp/' + endpoint, GET_ENDPOINTS[endpoint]);
  }
  for (var endpoint in POST_ENDPOINTS) {
    app.post('/fp/' + endpoint, POST_ENDPOINTS[endpoint]);
  }
  for (var endpoint in DELETE_ENDPOINTS) {
    app.delete('/fp/' + endpoint, DELETE_ENDPOINTS[endpoint]);
  }
}

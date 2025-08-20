if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js")
    .then(function (registration) {
      console.log("ServiceWorker registration successful with scope: ", registration.scope);
    })
    .catch(function (err) {
      //registration failed :(
      console.log("ServiceWorker registration failed: ", err);
    });
} else {
  console.log("No service-worker on this browser");
}
var sysState = 0; // 0- Trace on state,
var presysState = 0; // Previous state
var c_state = 0;
var inboundChar;
var outboundChar;
var device;
var isIgnore = 0;
var isIgnore_2 = 0;

// Define the CodeLess UUIDs
var CODELESS_SVC_UUID = "866d3b04-e674-40dc-9c05-b7f91bec6e83";
var INBOUND_CHAR_UUID = "914f8fb9-e8cd-411d-b7d1-14594de45425";
var OUTBOUND_CHAR_UUID = "3bb535aa-50b2-4fbe-aa09-6b06dc59a404";
var CNTRL_CHAR_UUID = "e2048b39-d4f9-4a45-9f25-1856c10d5639";

var temp_string = "";

let options = {
  filters: [
    { name: "PULS" },
    { name: "PULS-BT" },
    { name: "CLv2" },
    { name: "ABCa" },
    { name: "ABC1" },
    { name: "PMBT" },
    { name: "ABC1" },
    { name: "PULSARBT" },
    { name: "PULSAR-BT" },
    { name: "CodeLess" },
    { name: "Example1" },
    { name: "Example2" },
    { name: "Example3" },
    { name: "Example4" },
    { name: "Example5" },
    { name: "Example6" },
    { name: "Example7" },
    { name: "Example8" },
    { name: "Example9" },
    { name: "CodeLess" },
    { services: [CODELESS_SVC_UUID] },
  ],
  optionalServices: [CODELESS_SVC_UUID],
};

// Global variables
var button_press = 0;
var isTraceOn = 0;
var level_var,
  distance_var,
  volume_var,
  compensated_var,
  compensated_var_m,
  mA_output_var,
  temperature_var,
  date_var,
  time_var,
  gate_start,
  gate_stop,
  echo_var,
  noise_var,
  status_var,
  near_blanking_var,
  far_blanking_var,
  empty_distance,
  //mode_var,  // not used
  bit0,
  bit1,
  bit2,
  bit3,
  bit4,
  bit5,
  bit6,
  bit7;
var p104_units_val,
  p605_units_val,
  p104_units,
  p605_units,
  p104_rx_status,
  p605_rx_status,
  cmd_sent,
  param_init_query,
  power_init_query,
  p104_param_update,
  span_val;
var start_point, width_val;
let a = [];
var s, offset;
level_var = 0.0; //4.346;
distance_var = 0.0; //1.654;
volume_var = 0.0; //2.370;
compensated_var = 7.2;
compensated_var_m = 7.2;
mA_output_var = 0.0; //20.000;
temperature_var = 0.0; //20.000;
date_var = 190100.0;
time_var = 2210.0;
gate_start = 0; //202;
gate_stop = 0; //258;
echo_var = 0; //45;
noise_var = 0; //30;
status_var = 999;
near_blanking_var = 0.3;
far_blanking_var = 20.0; //6.0;
far_blanking_dist = 7.2;
empty_distance = 6.0;
//mode_var = 6.0;  // not used
p104_units_val = 1;
p605_units_val = 3;
p104_units = "m";
p605_units = "m³";
p104_rx_status = 0;
p605_rx_status = 0;
cmd_sent = "";
param_init_query = 0;
power_init_query = 0;
p104_param_update = 0;
span_val = 5.7;

// set interval
var echo_tid;
var datem_tid;
//var p104_tid;
//var p605_tid;
var param_set1_tid;
var param_set2_tid;
var param_set3_tid;
var param_tid;
var param_query = 0;
var isDisconnecting = 0;
var isTerminated = 0;
var param_start_val = 0;

var login_stage = 0; // Login status

var currentlang = localStorage.getItem("lang_select_List");
var lang_map = lang_array.map((a) => a.English);
var param_num = param_info.map((a) => a.pnum);
var param_val = param_info.map((a) => a.pvalue);

//Test
let connectionType = "";
let receivedDataArray = [];
let receiveBufferHex = "";
let receiveBufferASCII = "";
let receiveTimeout;
let CommandSent = "";
let commandboxsend = false;
let param_update_flag = false;
let reader;
let combined_firstSet;
let combined_secondSet;
let combined_remainingSet;
let parsedData = [];
let xml_loaded = false;
let local_xml_livedata = "";
let liveParamDataView = [];
let deviceInfo;
let send_param_button_press = 0;
let gen_param_button_press = 0;
let set1 = 0;
let set2 = 0;
let reset_breakpoints_var = 0;
let temp_set2_storage = "";
let volume_sent = 0;
let circular_responseTimeout;
let bar_responseTimeout;

let prevSelectedRadioMode = null;
let prevNodeName = null;
let prevReportInterval = null;
let prevApnstring = null;
let report_interval_min = null;
let prevSelectedeDRX = null;
let prevrebootDelay = null;
let prevOpSelect = null;
let prevgnssInterval = null;
let prevMQTTstate = null;
let prevMQTTBrokerHostname = null;
let prevMQTTBrokerPort = null;
let prevMQTTBrokerUsername = null;
let prevMQTTTLS = null;
let prevMQTTTLSSec_tag = null;
let reboot_flag = 0;
// let save_settings = 0;

let cloudModal_open = 0;
let shell_open = 0;

// GLOBAL LOADING VARS:
let currentProgress;
let targetProgress;
let totalSteps;

let isReflectE = 0;

let receiveBufferBT = "";

let shouldEncode = true; // Flag to determine if encoding is needed for BT commands

// Resetting all the variables
function reset_params() {
  button_press = 0;
  isTraceOn = 0;
  level_var = 0.0;
  distance_var = 0.0;
  volume_var = 0.0;
  compensated_var = 7.2;
  compensated_var_m = 7.2;
  mA_output_var = 0.0;
  temperature_var = 0.0;
  date_var = 190100.0;
  time_var = 2210.0;
  gate_start = 0;
  gate_stop = 0;
  echo_var = 0;
  noise_var = 0;
  status_var = 999;
  near_blanking_var = 0.3;
  far_blanking_var = 20.0;
  far_blanking_dist = 7.2;
  empty_distance = 6.0;
  //mode_var = 6.0; // not used
  p104_units_val = 1;
  p605_units_val = 3;
  p104_units = "m";
  p605_units = "m³";
  p104_rx_status = 0;
  p605_rx_status = 0;
  cmd_sent = "";
  param_query = 0;
  isDisconnecting = 0;
  isTerminated = 0;
  param_start_val = 0;
  power_lvl = 0;
  new_power_lvl = 0;
  param_init_query = 0;
  power_init_query = 0;
  p104_param_update = 0;
  span_val = 5.7;
}
// Function to select the volume units to be displayed depending on p605 value
function p605_volume_units() {
  switch (p605_units_val) {
    default:
      p605_units = lang_map[126]; //"m³";
      break;
    case 0:
      p605_units = lang_map[127]; //"None";
      break;
    case 1:
      p605_units = lang_map[128]; //"Tons";
      break;
    case 2:
      p605_units = lang_map[129]; //"Tonnes";
      break;
    case 3:
      p605_units = lang_map[126]; //"m³";
      break;
    case 4:
      p605_units = lang_map[130]; //"Litres";
      break;
    case 5:
      p605_units = lang_map[131]; //"Imp Gal";
      break;
    case 6:
      p605_units = lang_map[132]; //"US Gal";
      break;
    case 7:
      p605_units = lang_map[133]; //"ft³";
      break;
    case 8:
      p605_units = lang_map[134]; //"Barrels";
      break;
  }
}

// Function to select the measurement units to be displayed depending on p104 value
function p104_measurement_units() {
  switch (p104_units_val) {
    default:
    case 1:
      p104_units = "m";
      break;
    case 2:
      p104_units = "cm";
      break;
    case 3:
      p104_units = "mm";
      break;
    case 4:
      p104_units = "ft";
      break;
    case 5:
      p104_units = "ins";
      break;
  }
}

function convert_to_measurement_units(val_to_convert) {
  switch (p104_units_val) {
    default:
    case 1:
      break;
    case 2:
      val_to_convert *= 100.0;
      break;
    case 3:
      val_to_convert *= 1000.0;
      break;
    case 4:
      val_to_convert *= 3.28084;
      break;
    case 5:
      val_to_convert *= 39.3701;
      break;
  }
  return val_to_convert;
}

function convert_to_mtrs(val_to_convert) {
  switch (p104_units_val) {
    default:
    case 1:
      break;
    case 2:
      val_to_convert /= 100.0;
      break;
    case 3:
      val_to_convert /= 1000.0;
      break;
    case 4:
      val_to_convert /= 3.28084;
      break;
    case 5:
      val_to_convert /= 39.3701;
      break;
  }
  return val_to_convert;
}

function settings_clear() {
  document.getElementById("p100-box").value = "";
  document.getElementById("p104-box").value = "";
  document.getElementById("p105-box").value = "";
  document.getElementById("p106-box").value = "";
  document.getElementById("p808-box").value = "";
  document.getElementById("p605-box").value = "";
  document.getElementById("p21-box").value = "";
}

function trace_start() {
  if (login_stage == 3 && isDisconnecting == 0 && isTraceOn == 0 && (presysState == 2 || presysState == 3 || presysState == 4)) {
    //need some changes here
    tids_trace_reset();
    // settings_clear();
    document.getElementById("btn_trace").innerHTML = lang_map[8]; //'TRACE OFF';
    //setTimeout(trace_button_check, 2000);

    //log(' → Getting trace data');//log(' <- TRACE ON');
    login_stage = 4; // TRACE ON state
    isTraceOn = 1;
    document.getElementById("trace-message").innerHTML = lang_map[104]; //"Acquiring trace data. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[104]; //"Acquiring trace data. Please wait...";
    isIgnore_2 = 2; // NEED TO CHECK
    //clearTimeout(p605_tid);
    clearTimeout(echo_tid);
    clearTimeout(datem_tid);
    clearTimeout(param_tid);
    //p104_tid = setInterval(p104_start, 1000);//5000);
    //param_set1_tid = setInterval(param_set1_start, 5000);
    param_set1_start();
    //button_press = 14;
  }
}

function p104_update() {
  if (login_stage >= 3 && isDisconnecting == 0) {
    tids_trace_reset();
    // settings_clear();
    settings_msg_clear();
    param_start_val = 1;
    param_query = 3;
    param_tid = setInterval(param_start, 1000);
  }
}

function accordion_shift_trace_off() {
  if (login_stage >= 3 && isDisconnecting == 0) {
    tids_trace_reset();
  }
}

function param_update() {
  if (login_stage >= 3 && isDisconnecting == 0) {
    tids_trace_reset();
    // settings_clear();
    settings_msg_clear();
    /*if(param_init_query == 0) {
          param_start_val = 1;
          param_query = 0;
          param_tid = setInterval(param_start, 1000);
        }*/
  }
}

function param_start() {
  if (login_stage >= 3 && isDisconnecting == 0) {
    switch (param_query) {
      case 0:
        button_press = 19;
        document.getElementById("btnp241").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P241");
        } else if (connectionType === "bluetooth") {
          sendAT("/P241");
        }
        document.getElementById("settings-message").innerHTML = lang_map[105]; //"Querying P241. Please wait...";
        break;
      case 1:
        button_press = 20;
        document.getElementById("btnp100").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P100");
        } else if (connectionType === "bluetooth") {
          sendAT("/P100");
        }
        document.getElementById("settings-message").innerHTML = lang_map[106]; //"Querying P100. Please wait...";
        break;
      case 2:
        button_press = 21;
        document.getElementById("btnp104").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P104");
        } else if (connectionType === "bluetooth") {
          sendAT("/P104");
        }
        document.getElementById("settings-message").innerHTML = lang_map[107]; //"Querying P104. Please wait...";
        break;
      case 3:
        button_press = 22;
        document.getElementById("btnp105").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P105");
        } else if (connectionType === "bluetooth") {
          sendAT("/P105");
        }
        document.getElementById("settings-message").innerHTML = lang_map[108]; //"Querying P105. Please wait...";
        break;
      case 4:
        button_press = 23;
        document.getElementById("btnp106").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P106");
        } else if (connectionType === "bluetooth") {
          sendAT("/P106");
        }
        document.getElementById("settings-message").innerHTML = lang_map[109]; //"Querying P106. Please wait...";
        break;
      case 5:
        button_press = 24;
        document.getElementById("btnp808").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P808");
        } else if (connectionType === "bluetooth") {
          sendAT("/P808");
        }
        document.getElementById("settings-message").innerHTML = lang_map[110]; //"Querying P808. Please wait...";
        break;
      case 6:
        button_press = 25;
        document.getElementById("btnp605").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P605");
        } else if (connectionType === "bluetooth") {
          sendAT("/P605");
        }
        document.getElementById("settings-message").innerHTML = lang_map[111]; //"Querying P605. Please wait...";
        break;
      case 7:
        button_press = 26;
        document.getElementById("btnp21").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P21");
        } else if (connectionType === "bluetooth") {
          sendAT("/P21");
        }
        document.getElementById("settings-message").innerHTML = lang_map[112]; //"Querying P21. Please wait...";
        break;
      case 8:
        button_press = 0;
        clearTimeout(param_tid);
        param_start_val = 0;
        param_init_query = 1;
        settings_msg_clear();
        break;
    }
  }
}

function echo_start() {
  // do some stuff...
  // no need to recall the function (it's an interval, it'll loop forever)
  if (login_stage == 4 && c_state != 3 && c_state != 4) {
    // TRACE ON state
    clearTimeout(echo_tid);
    //clearTimeout(p104_tid);
    //clearTimeout(p605_tid);
    clearTimeout(param_set1_tid);
    clearTimeout(param_set2_tid);
    clearTimeout(param_set3_tid);
    clearTimeout(param_tid);
    if (connectionType === "serial") {
      sendTX("GET ECHO");
      CommandSent = "GET ECHO";
    } else if (connectionType === "bluetooth") {
      sendAT("GET ECHO");
      CommandSent = "GET ECHO";
    }
    document.getElementById("trace-message").innerHTML = lang_map[113]; //"Acquiring ECHO data. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[113]; //"Acquiring ECHO data. Please wait...";
    // alert("sendAT('GET ECHO') : 1");
    button_press = 10;
    datem_tid = setInterval(datem_start, 5000);
  } else {
    // clearTimeout(p104_tid);
    // clearTimeout(p605_tid);
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
  }
}
function datem_start() {
  if (login_stage == 4 && c_state != 3 && c_state != 4) {
    // TRACE ON state
    clearTimeout(datem_tid);
    //clearTimeout(p104_tid);
    //clearTimeout(p605_tid);
    clearTimeout(param_set1_tid);
    clearTimeout(param_set2_tid);
    clearTimeout(param_set3_tid);
    clearTimeout(param_tid);
    if (connectionType === "serial") {
      sendTX("GET DATEM");
      CommandSent = "GET DATEM";
    } else if (connectionType === "bluetooth") {
      sendAT("GET DATEM");
      CommandSent = "GET DATEM";
    }
    document.getElementById("trace-message").innerHTML = lang_map[114]; //"Acquiring DATEM data. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[114]; //"Acquiring DATEM data. Please wait...";
    button_press = 11;
    echo_tid = setInterval(echo_start, 5000);
  } else {
    // clearTimeout(p104_tid);
    // clearTimeout(p605_tid);
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
  }
}

function p104_start() {
  if (login_stage == 4) {
    clearTimeout(p605_tid);
    clearTimeout(echo_tid);
    clearTimeout(datem_tid);
    clearTimeout(param_tid);
    if (connectionType === "serial") {
      sendTX("/P104");
    } else if (connectionType === "bluetooth") {
      sendAT("/P104");
    }
    document.getElementById("trace-message").innerHTML = lang_map[107]; //"Querying P104. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[107]; //"Querying P104. Please wait...";
    button_press = 14;
    // p104_tid = setInterval(p104_start, 5000);
  } else {
    // clearTimeout(p104_tid);
    // clearTimeout(p605_tid);
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
  }
}

function p605_start() {
  if (login_stage == 4) {
    // TRACE ON state
    clearTimeout(p104_tid);
    clearTimeout(echo_tid);
    clearTimeout(datem_tid);
    clearTimeout(param_tid);
    if (connectionType === "serial") {
      sendTX("/P605");
    } else if (connectionType === "bluetooth") {
      sendAT("/P605");
    }
    document.getElementById("trace-message").innerHTML = lang_map[111]; //"Querying P605. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[111]; //"Querying P605. Please wait...";
    button_press = 15;
    // p605_tid = setInterval(p605_start, 5000);
  } else {
    // clearTimeout(p104_tid);
    // clearTimeout(p605_tid);
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
  }
}
function param_set1_start() {
  if (login_stage == 4 && c_state != 3) {
    //clearTimeout(p605_tid);
    clearTimeout(param_set1_tid);
    clearTimeout(param_set2_tid);
    clearTimeout(param_set3_tid);
    clearTimeout(echo_tid);
    clearTimeout(datem_tid);
    clearTimeout(param_tid);
    if (connectionType === "serial") {
      sendTX("SENDPART1");
      CommandSent = "SENDPART1";
    } else if (connectionType === "bluetooth") {
      sendAT("SENDPART1");
      CommandSent = "SENDPART1";
    }

    document.getElementById("trace-message").innerHTML = lang_map[146]; //"Querying P104. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[146]; //"Querying P104. Please wait...";
    button_press = 16;
    // p104_tid = setInterval(p104_start, 5000);
    param_set1_tid = setInterval(param_set1_start, 5000);
  } else {
    // clearTimeout(p104_tid);
    // clearTimeout(p605_tid);
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
  }
}

function param_set2_start() {
  if (login_stage == 4 && c_state != 3) {
    //clearTimeout(p605_tid);
    clearTimeout(param_set1_tid);
    clearTimeout(param_set3_tid);
    clearTimeout(echo_tid);
    clearTimeout(datem_tid);
    clearTimeout(param_tid);
    if (connectionType === "serial") {
      sendTX("SENDPART2");
      CommandSent = "SENDPART2";
    } else if (connectionType === "bluetooth") {
      sendAT("SENDPART2");
      CommandSent = "SENDPART2";
    }
    document.getElementById("trace-message").innerHTML = lang_map[147]; //"Querying P104. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[147]; //"Querying P104. Please wait...";
    button_press = 17;
    // p104_tid = setInterval(p104_start, 5000);
  } else {
    // clearTimeout(p104_tid);
    // clearTimeout(p605_tid);
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
  }
}

function param_set3_start() {
  if (login_stage == 4 && c_state != 3) {
    //clearTimeout(p605_tid);
    clearTimeout(param_set1_tid);
    clearTimeout(param_set2_tid);
    clearTimeout(echo_tid);
    clearTimeout(datem_tid);
    clearTimeout(param_tid);
    if (connectionType === "serial") {
      sendTX("SENDPART3");
      CommandSent = "SENDPART3";
    } else if (connectionType === "bluetooth") {
      sendAT("SENDPART3");
      CommandSent = "SENDPART3";
    }
    document.getElementById("trace-message").innerHTML = lang_map[148]; //"Querying P104. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[148]; //"Querying P104. Please wait...";
    button_press = 18;
    // p104_tid = setInterval(p104_start, 5000);
  } else {
    // clearTimeout(p104_tid);
    // clearTimeout(p605_tid);
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
  }
}
let who_timeout;
function trace_button_check() {
  //log("trace_button_check :"+login_stage);
  if (login_stage == 3 || login_stage == 2) {
    if (isDisconnecting == 0) {
      //log(' → Getting trace data');//log(' <- TRACE ON');
      // sendAT('GET ECHO');
      if (login_stage == 2) document.getElementById("id_trace").click();
      // button_press = 10;
      // datem_tid = setInterval(datem_start, 5000);
      // clearTimeout(echo_tid);

      //sendAT('/P104');
      login_stage = 4; // TRACE ON state
      isTraceOn = 1;
      document.getElementById("trace-message").innerHTML = lang_map[104]; //"Acquiring trace data. Please wait...";
      document.getElementById("home-message").innerHTML = lang_map[104]; //"Acquiring trace data. Please wait...";
      isIgnore_2 = 2; // NEED TO CHECK
      //clearTimeout(p605_tid);
      //clearTimeout(param_set1_tid);
      clearTimeout(param_set2_tid);
      clearTimeout(param_set3_tid);
      clearTimeout(echo_tid);
      clearTimeout(datem_tid);
      clearTimeout(param_tid);
      if (connectionType === "serial") {
        contSensorMode_bt();
        param_set1_tid = setInterval(param_set1_start, 1500);
      } else if (connectionType === "bluetooth") {
        delay(1000);
        sendAT("/WHO");
        CommandSent = "/WHO";
        isIgnore = 0;
        who_timeout = setTimeout(function () {
          isReflectE = 0;
          param_set1_tid = setInterval(param_set1_start, 1500);
        }, 2000);
      }
    }
  } else {
    log(lang_map[64]); //log('Device not in Normal mode!');//log('Device not in passthrough mode!');
  }
}
function Normal_mode() {
  if (login_stage >= 3 && isDisconnecting == 0) {
    // currently in PT mode
    sendAT("AT+PT=0");
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
    // log(' <- AT+PT=0');
    login_stage = 2; //3; // back to the PT mode
    document.getElementById("btn_mode").innerHTML = "NORMAL MODE";
    // isIgnore=0;
    // isTraceOn=1;
    isIgnore = 1;
  } else if (login_stage == 2) {
    // currently in AT mode
    login_stage = 3;
    //clearTimeout(p104_tid);
    //clearTimeout(p605_tid);
    clearTimeout(param_set1_tid);
    clearTimeout(param_set2_tid);
    clearTimeout(param_set3_tid);
    clearTimeout(echo_tid);
    clearTimeout(datem_tid);
    clearTimeout(param_tid);
    document.getElementById("btn_trace").innerHTML = lang_map[9]; //'TRACE ON';
    sendATL("AT+PT=1");
    //setTimeout(trace_button_check, 1000);
    //log(' <- AT+PT=1');
    document.getElementById("btn_mode").innerHTML = "ADVANCED MODE";
  } else {
    log(lang_map[65]); //log('No device connected!');
  }
}

function tids_trace_reset() {
  login_stage = 3; // back to the PT mode
  document.getElementById("btn_trace").innerHTML = lang_map[9]; //'TRACE ON';
  //clearTimeout(p104_tid);
  //clearTimeout(p605_tid);
  clearTimeout(param_set1_tid);
  clearTimeout(param_set2_tid);
  clearTimeout(param_set3_tid);
  clearTimeout(echo_tid);
  clearTimeout(datem_tid);
  clearTimeout(param_tid);
  //p104_tid = false;
  //p605_tid = false;
  param_set1_tid = false;
  param_set2_tid = false;
  param_set3_tid = false;
  echo_tid = false;
  datem_tid = false;
  param_tid = false;
  isTraceOn = 0;
  document.getElementById("trace-message").innerHTML = "";
  document.getElementById("home-message").innerHTML = "";
}

function trace_off() {
  //alert("trace_off: isTraceOn="+isTraceOn);
  if (login_stage >= 3 && isDisconnecting == 0) {
    if (isTraceOn == 1) {
      // sendAT('TRACE OFF');
      // document.getElementById('btn_trace').innerHTML ='TRACE ON';
      // clearTimeout(echo_tid);
      // clearTimeout(datem_tid);
      tids_trace_reset();
      //log(' → Stopping trace data');//log(' <- TRACE OFF');
      login_stage = 3; // back to the PT mode
      isTraceOn = 0;
      document.getElementById("trace-message").innerHTML = "";
      document.getElementById("home-message").innerHTML = "";
      isIgnore = 1;
    } else {
      // start the static timers
      document.getElementById("btn_trace").innerHTML = lang_map[8]; //'TRACE OFF';
      login_stage = 3;
      //clearTimeout(p104_tid);
      //clearTimeout(p605_tid);
      clearTimeout(param_set1_tid);
      clearTimeout(param_set2_tid);
      clearTimeout(param_set3_tid);
      clearTimeout(echo_tid);
      clearTimeout(datem_tid);
      clearTimeout(param_tid);
      // sendAT('TRACE ON');
      isTraceOn = 1;
      document.getElementById("trace-message").innerHTML = lang_map[104]; //"Acquiring trace data. Please wait...";
      document.getElementById("home-message").innerHTML = lang_map[104]; //"Acquiring trace data. Please wait...";
      trace_button_check();
      //        isTraceOn=0;
    }
  } else {
    alert(lang_map[64]); //alert('Device not in Normal mode!');//log('Device not in passthrough mode!');
  }
}

function send_command() {
  // alert("send_command :"+login_stage);
  // log("send_command:: login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isDisconnecting="+isDisconnecting+" button_press="+button_press);

  if (document.getElementById("cmd").value == "") {
    log(lang_map[66]); //log(" → Invalid param request");
    return;
  }

  if (login_stage >= 1) {
    isIgnore = 0;
    if (login_stage == 4) {
      // log(" → Press Trace OFF to get params");
      // return;
      send_command_check();
    } else if (
      login_stage == 3 &&
      document.getElementById("cmd").value.startsWith("AT") &&
      document.getElementById("cmd").value != "AT+PT=0" &&
      document.getElementById("cmd").value != "AT+PT=1"
    ) {
      setTimeout(ptModeOFF1, 1000);
      setTimeout(sendcommand, 2000);
      setTimeout(ptModeON1, 3000);
    } else {
      if (connectionType === "serial") {
        sendTX(document.getElementById("cmd").value);
        commandboxsend = true;
      } else if (connectionType === "bluetooth") {
        sendAT(document.getElementById("cmd").value);
      }
      button_press = 8;
    }
  } else {
    log(lang_map[65]); //log('No device connected!');
  }
}

function stringToArrayBuffer(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let j = 0, strLen = str.length; j < strLen; j++) {
    bufView[j] = str.charCodeAt(j);
  }
  return buf;
}

function getVal(i) {
  //param_val[i] = parseInt(hexToFloat('0x' + ('00' + s.getUint8(4*i).toString(16)).slice(-2) + ('00' + s.getUint8(4*i + 1).toString(16)).slice(-2) + ('00' + s.getUint8(4*i + 2).toString(16)).slice(-2) + ('00' + s.getUint8(4*i + 3).toString(16)).slice(-2)));
  //return (param_val[i]);
  if (connectionType === "serial") {
    // Convert hex string to array of bytes
    const byteArray = receiveBufferHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16));

    // Extract four bytes at a time and convert to float
    const startIndex = i * 4;
    const hexValue = byteArray
      .slice(startIndex, startIndex + 4)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    //console.log(i, hexToFloat("0x" + hexValue));
    return hexToFloat("0x" + hexValue);
  } else if (connectionType === "bluetooth") {
    if (4 * i + 3 >= s.byteLength) {
      return 0;
    }
    return hexToFloat(
      "0x" +
        ("00" + s.getUint8(4 * i).toString(16)).slice(-2) +
        ("00" + s.getUint8(4 * i + 1).toString(16)).slice(-2) +
        ("00" + s.getUint8(4 * i + 2).toString(16)).slice(-2) +
        ("00" + s.getUint8(4 * i + 3).toString(16)).slice(-2)
    );
  }
}

function param_verify(i) {
  let calculatedIndex = offset * 60 + i;
  liveParamDataView.push({ index: calculatedIndex, value: getVal(i) });
  switch (param_num[calculatedIndex]) {
    case 241:
      document.getElementById("p241List").value = parseInt(getVal(i) + 1);
      //console.log(document.getElementById('p241List').value);
      if (document.getElementById("p241List").value >= 2 && document.getElementById("p241List").value <= 4) alert(lang_map[85]);
      break;
    case 100:
      document.getElementById("p100List").value = parseInt(getVal(i));
      break;
    case 101:
      break;
    case 104:
      document.getElementById("p104List").value = parseInt(getVal(i));
      p104_units_val = parseInt(document.getElementById("p104List").value);
      p104_measurement_units(); // Update the measurement units to be displayed
      break;
    case 105:
      document.getElementById("p105-box").value = getVal(i).toFixed(3);
      break;
    case 106:
      document.getElementById("p106-box").value = getVal(i).toFixed(3);
      span_val = document.getElementById("p106-box").value;
      break;
    case 107:
      near_blanking_var = getVal(i).toFixed(3);
      break;
    case 108:
      far_blanking_var = getVal(i).toFixed(3);
      break;
    case 808:
      document.getElementById("p808List").value = parseInt(getVal(i));
      break;
    case 605:
      document.getElementById("p605List").value = parseInt(getVal(i) + 1);
      p605_units_val = parseInt(document.getElementById("p605List").value) - 1;
      p605_volume_units(); // Update the volume units to be displayed
      break;
    case 600:
      document.getElementById("p600List").value = parseInt(getVal(i) + 1);
      displayVesselShape(0);
      break;
    case 601:
      document.getElementById("p601-box").value = getVal(i).toFixed(3);
      break;
    case 602:
      document.getElementById("p602-box").value = getVal(i).toFixed(3);
      break;
    case 603:
      document.getElementById("p603-box").value = getVal(i).toFixed(3);
      break;
    case 606:
      document.getElementById("p606-box").value = getVal(i).toFixed(3);
      break;
    case 604:
      document.getElementById("p604-box").innerHTML = Number(getVal(i).toFixed(3));
      break;
    case 607:
      document.getElementById("p607-box").innerHTML = Number(getVal(i).toFixed(3));
      break;
    case 697:
      document.getElementById("p697-box").innerHTML = Number(getVal(i).toFixed(3));
      break;
    case 610:
      document.getElementById("p610-box").value = getVal(i).toFixed(3);
      break;
    case 611:
      document.getElementById("p611-box").value = getVal(i).toFixed(3);
      break;
    case 612:
      document.getElementById("p612-box").value = getVal(i).toFixed(3);
      break;
    case 613:
      document.getElementById("p613-box").value = getVal(i).toFixed(3);
      break;
    case 614:
      document.getElementById("p614-box").value = getVal(i).toFixed(3);
      break;
    case 615:
      document.getElementById("p615-box").value = getVal(i).toFixed(3);
      break;
    case 616:
      document.getElementById("p616-box").value = getVal(i).toFixed(3);
      break;
    case 617:
      document.getElementById("p617-box").value = getVal(i).toFixed(3);
      break;
    case 618:
      document.getElementById("p618-box").value = getVal(i).toFixed(3);
      break;
    case 619:
      document.getElementById("p619-box").value = getVal(i).toFixed(3);
      break;
    case 620:
      document.getElementById("p620-box").value = getVal(i).toFixed(3);
      break;
    case 621:
      document.getElementById("p621-box").value = getVal(i).toFixed(3);
      break;
    case 622:
      document.getElementById("p622-box").value = getVal(i).toFixed(3);
      break;
    case 623:
      document.getElementById("p623-box").value = getVal(i).toFixed(3);
      break;
    case 624:
      document.getElementById("p624-box").value = getVal(i).toFixed(3);
      break;
    case 625:
      document.getElementById("p625-box").value = getVal(i).toFixed(3);
      break;
    case 626:
      document.getElementById("p626-box").value = getVal(i).toFixed(3);
      break;
    case 627:
      document.getElementById("p627-box").value = getVal(i).toFixed(3);
      break;
    case 628:
      document.getElementById("p628-box").value = getVal(i).toFixed(3);
      break;
    case 629:
      document.getElementById("p629-box").value = getVal(i).toFixed(3);
      break;
    case 630:
      document.getElementById("p630-box").value = getVal(i).toFixed(3);
      break;
    case 631:
      document.getElementById("p631-box").value = getVal(i).toFixed(3);
      break;
    case 632:
      document.getElementById("p632-box").value = getVal(i).toFixed(3);
      break;
    case 633:
      document.getElementById("p633-box").value = getVal(i).toFixed(3);
      break;
    case 634:
      document.getElementById("p634-box").value = getVal(i).toFixed(3);
      break;
    case 635:
      document.getElementById("p635-box").value = getVal(i).toFixed(3);
      break;
    case 636:
      document.getElementById("p636-box").value = getVal(i).toFixed(3);
      break;
    case 637:
      document.getElementById("p637-box").value = getVal(i).toFixed(3);
      break;
    case 638:
      document.getElementById("p638-box").value = getVal(i).toFixed(3);
      break;
    case 639:
      document.getElementById("p639-box").value = getVal(i).toFixed(3);
      break;
    case 640:
      document.getElementById("p640-box").value = getVal(i).toFixed(3);
      break;
    case 641:
      document.getElementById("p641-box").value = getVal(i).toFixed(3);
      break;
    case 21:
      document.getElementById("p21-box").value = getVal(i).toFixed(3);
      break;
    case 586:
      temperature_var = getVal(i);
      break;
    default:
      break;
  }
}

const utf8encoder = new TextEncoder();
const windows1251 = new TextEncoder();
var deviceName; //='REFLECT';
function utf8ToHex(s) {
  const rb = utf8encoder.encode(s);
  //const rb = windows1251.encode(s);
  let r = "";
  for (const b of rb) {
    r += ("0" + b.toString(16)).slice(-2);
    r += " ";
  }
  return r;
}

// Function to flip the hex string (if needed)
function flipHexString(hexValue, hexDigits) {
  var h = hexValue.substr(0, 2);
  for (var i = 0; i < hexDigits; ++i) {
    h += hexValue.substr(2 + (hexDigits - 1 - i) * 2, 2);
  }
  return h;
}

// Function to convert Hex values to float (Need Hex string to start with 0x)
function hexToFloat(hex) {
  var s = hex >> 31 ? -1 : 1;
  var e = (hex >> 23) & 0xff;
  return ((s * ((hex & 0x7fffff) | 0x800000) * 1.0) / Math.pow(2, 23)) * Math.pow(2, e - 127);
}

// For decode BT data
// Function to convert unsigned int 8 bit format to hex and relevant functions within it
function Uint8tohex(incoming_data) {
  a = [];
  s = incoming_data;
  var check;
  var floatval;
  const doc_value = CommandSent; //document.getElementById('cmd').value;
  for (let i = 0; i < s.byteLength; i++) {
    check = s.getUint8(i);
    // Only do update echo/datem if the recevied correct byte length
    if (s.byteLength == 247) {
      if (i >= 46 && i <= 246 && doc_value == "GET ECHO") {
        //(((doc_value == "GET ECHO") && (button_press == 8)) || (button_press == 10))) // Changed from (i >= 42) && (i < 242)
        echo[i - 46] = (check * 1000) / 255; // Changed from echo[i-42]
      } else if (i >= 46 && i <= 246 && doc_value == "GET DATEM") {
        //(((doc_value == "GET DATEM") && (button_press == 8)) || (button_press == 11)))  // Changed from (i >= 42) && (i < 242)
        datem[i - 46] = (check * 1000) / 255; // Changed from datem[i-42]
      }
    }
    // a.push(s.getUint8(i));
    a.push("0x" + ("00" + s.getUint8(i).toString(16)).slice(-2));
  }

  if ((doc_value == "GET ECHO" || doc_value == "GET DATEM") && s.byteLength == 247) {
    // Populate the dynamic variables
    level_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(0).toString(16)).slice(-2) +
        ("00" + s.getUint8(1).toString(16)).slice(-2) +
        ("00" + s.getUint8(2).toString(16)).slice(-2) +
        ("00" + s.getUint8(3).toString(16)).slice(-2)
    );
    distance_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(4).toString(16)).slice(-2) +
        ("00" + s.getUint8(5).toString(16)).slice(-2) +
        ("00" + s.getUint8(6).toString(16)).slice(-2) +
        ("00" + s.getUint8(7).toString(16)).slice(-2)
    );
    volume_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(8).toString(16)).slice(-2) +
        ("00" + s.getUint8(9).toString(16)).slice(-2) +
        ("00" + s.getUint8(10).toString(16)).slice(-2) +
        ("00" + s.getUint8(11).toString(16)).slice(-2)
    );
    compensated_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(12).toString(16)).slice(-2) +
        ("00" + s.getUint8(13).toString(16)).slice(-2) +
        ("00" + s.getUint8(14).toString(16)).slice(-2) +
        ("00" + s.getUint8(15).toString(16)).slice(-2)
    );
    mA_output_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(16).toString(16)).slice(-2) +
        ("00" + s.getUint8(17).toString(16)).slice(-2) +
        ("00" + s.getUint8(18).toString(16)).slice(-2) +
        ("00" + s.getUint8(19).toString(16)).slice(-2)
    );
    temperature_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(20).toString(16)).slice(-2) +
        ("00" + s.getUint8(21).toString(16)).slice(-2) +
        ("00" + s.getUint8(22).toString(16)).slice(-2) +
        ("00" + s.getUint8(23).toString(16)).slice(-2)
    );
    gate_start = s.getUint8(24) * 256 + s.getUint8(25); //s.getUint8(32)*256 + s.getUint8(33);
    gate_stop = s.getUint8(26) * 256 + s.getUint8(27); //s.getUint8(34)*256 + s.getUint8(35);
    echo_var = s.getUint8(28) * 256 + s.getUint8(29); //s.getUint8(36)*256 + s.getUint8(37);
    noise_var = s.getUint8(30) * 256 + s.getUint8(31); //s.getUint8(38)*256 + s.getUint8(39);
    status_var = s.getUint8(32) * 256 + s.getUint8(33); //s.getUint8(40)*256 + s.getUint8(41);

    near_blanking_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(34).toString(16)).slice(-2) +
        ("00" + s.getUint8(35).toString(16)).slice(-2) +
        ("00" + s.getUint8(36).toString(16)).slice(-2) +
        ("00" + s.getUint8(37).toString(16)).slice(-2)
    ); //hexToFloat('0x' + ('00' + s.getUint8(42).toString(16)).slice(-2) + ('00' + s.getUint8(43).toString(16)).slice(-2) + ('00' + s.getUint8(44).toString(16)).slice(-2) + ('00' + s.getUint8(45).toString(16)).slice(-2));
    far_blanking_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(38).toString(16)).slice(-2) +
        ("00" + s.getUint8(39).toString(16)).slice(-2) +
        ("00" + s.getUint8(40).toString(16)).slice(-2) +
        ("00" + s.getUint8(41).toString(16)).slice(-2)
    ); //hexToFloat('0x' + ('00' + s.getUint8(46).toString(16)).slice(-2) + ('00' + s.getUint8(47).toString(16)).slice(-2) + ('00' + s.getUint8(48).toString(16)).slice(-2) + ('00' + s.getUint8(49).toString(16)).slice(-2));
    empty_distance = hexToFloat(
      "0x" +
        ("00" + s.getUint8(42).toString(16)).slice(-2) +
        ("00" + s.getUint8(43).toString(16)).slice(-2) +
        ("00" + s.getUint8(44).toString(16)).slice(-2) +
        ("00" + s.getUint8(45).toString(16)).slice(-2)
    ); //hexToFloat('0x' + ('00' + s.getUint8(50).toString(16)).slice(-2) + ('00' + s.getUint8(51).toString(16)).slice(-2) + ('00' + s.getUint8(52).toString(16)).slice(-2) + ('00' + s.getUint8(53).toString(16)).slice(-2));
    compensated_var_m = convert_to_mtrs(compensated_var);
    /* 
    // Not used mode_var any more.
    if (Math.round(compensated_var_m) == 24.0) {
      mode_var = 20.0;
    } else if (compensated_var_m.toFixed(1) == 9.6) {
      mode_var = 8.0;
    } else {
      mode_var = 40.0;
    }
*/
    far_blanking_dist = (empty_distance * (100.0 + far_blanking_var)) / 100.0;
    near_blanking_var = convert_to_measurement_units(near_blanking_var);
    far_blanking_dist = convert_to_measurement_units(far_blanking_dist);
    empty_distance = convert_to_measurement_units(empty_distance);
    //mode_var = convert_to_measurement_units(mode_var); // not used

    var xdata = [];
    xdata[0] = 0.0;
    for (let i = 1; i <= 200; i++) {
      xdata[i] = Math.round((xdata[i - 1] + compensated_var / 200) * 1000) / 1000;
    }
    // Zooming out does not work if labels are numbers
    for (let i = 0; i <= 200; i++) {
      xdata[i] = xdata[i].toString();
    }
    myChart.data.labels = xdata;
    myChart.config.options.scales.x.title.text = p104_units;
    myChart.update();
  } else if (doc_value == "SENDPART1" && s.byteLength == 241) {
    // 241 = 60 * 4 + 1
    offset = 0;
    for (let i = 0; i < 60; i++) {
      param_verify(i);
      //param_verify(i);
    }
    //console.log("Got Part1");
    param_set2_start();
    param_set2_tid = setInterval(param_set2_start, 5000);
  } else if (doc_value == "SENDPART2" && s.byteLength == 241) {
    // 241 = 60 * 4 + 1
    offset = 1;
    for (let i = 0; i < 60; i++) {
      param_verify(i);
    }
    //console.log("Got Part2");
    param_set3_start();
    param_set3_tid = setInterval(param_set3_start, 5000);
  } else if (doc_value == "SENDPART3" && s.byteLength == 153) {
    // (param_info.length - offset * 60) * 4 + 1
    // = (158 - 2*60) * 4 + 1
    // = 153
    offset = 2;
    for (let i = 0; i < param_info.length - offset * 60; i++) {
      param_verify(i);
    }
    //console.log("Got Part3");
    // if (c_state == 3 && login_stage >= 3 && isDisconnecting == 0) {
    //   tids_trace_reset();
    // } else {
    //   echo_start();
    // }
    if ((c_state == 3 || c_state == 4) && login_stage >= 3 && isDisconnecting == 0) {
      //then reset the state over here
      tids_trace_reset();
      if (!send_param_button_press && gen_param_button_press) {
        fetchedit_defaultXML();
        gen_param_button_press = 0;
      }
    } else {
      echo_start();
    }
  }
  return a;
}

function data_log_update() {
  var status_str = "";
  var level_str = "";
  var dist_str = "";

  var textarea = document.getElementById("data-log");
  textarea.value = "";

  // var textarea2 = document.getElementById('main-params-log');
  // textarea2.value = "";

  var textarea2 = document.getElementById("level-log");
  textarea2.value = "";

  // var textarea3 = document.getElementById('main-params-log-t');
  // textarea3.value = "";

  var textarea3 = document.getElementById("level-log-t");
  textarea3.value = "";

  var lvlval = parseFloat(level_var);
  var dstval = parseFloat(distance_var);

  if (lvlval != 0.0 && dstval != 0.0) {
    //  if(parseFloat(level_var) > 0){
    level_str = "Lvl: " + level_var.toFixed(3) + " " + p104_units + "\n";
    //  }

    //  if(parseFloat(distance_var) >= 0){
    dist_str = "Dist: " + distance_var.toFixed(3) + " " + p104_units + "\n";
    //  }
    // textarea2.value += level_str + dist_str;
    textarea2.value = level_var.toFixed(3) + " " + p104_units;
    textarea2 = document.getElementById("distance-log");
    textarea2.value = distance_var.toFixed(3) + " " + p104_units;
    // textarea3.value += level_str + dist_str;
    textarea3.value = level_var.toFixed(3) + " " + p104_units;
    textarea3 = document.getElementById("distance-log-t");
    textarea3.value = distance_var.toFixed(3) + " " + p104_units;
  }
  if (status_var != 999) {
    bit0 = status_var & 1;
    bit1 = status_var & 2;
    bit2 = status_var & 4;
    bit3 = status_var & 8;
    bit4 = status_var & 16;
    bit5 = status_var & 32;
    bit6 = status_var & 64;
    bit7 = status_var & 128;

    if (status_var == 0) status_str = lang_map[92]; //"OK";
    else {
      if (bit4 == 16) {
        if (bit5 == 32) status_str = lang_map[93]; //"LOE fail high";
        else if (bit6 == 64) status_str = lang_map[94]; //"LOE fail low";
        else status_str = lang_map[95]; //"LOE fail";
      } else if (bit3 == 8) status_str = lang_map[96]; //"LOE";
      else if (bit2 == 4) status_str = lang_map[97]; //"Temp";
      else if (bit1 == 2) status_str = lang_map[98]; //"Voltage";
      else if (bit7 == 128) status_str = lang_map[99]; //"Alarm";
      else status_str = status_var; // + "\n\n";
    }
    // document.getElementById("sensor_status").innerHTML = "<span style='font-sze:12px; color: black; '>"+status_str+"</span>";
    // document.getElementById("sensor_status_t").innerHTML = "<span style='font-sze:12px; color: black; '>"+status_str+"</span>";
    // textarea2.value += status_str;
    textarea2 = document.getElementById("status-log");
    textarea2.value = status_str;
    // textarea3.value += "Status: " + status_str;
    textarea3 = document.getElementById("status-log-t");
    textarea3.value = status_str;
  }

  // document.getElementById("lvl").innerHTML = "<span style='font-sze:12px; color: black; '>"+level_str+"</span>";
  // document.getElementById("dist").innerHTML = "<span style='font-sze:12px;color: black;  '>"+dist_str+"</span>";

  textarea.value += lang_map[100] + /*"Volume\t= "*/ +volume_var.toFixed(3) + " " + p605_units + "\n";
  textarea.value += lang_map[101] + /*"Temp\t= "*/ +temperature_var.toFixed(1) + " °C" + "\n";
  // textarea.value += "Noise\t\t= " + noise_var.toFixed(0) + " mV" + "\n";
  textarea.value += lang_map[102] + /*"Output\t= "*/ +mA_output_var.toFixed(2) + " mA";

  // on the trace tab
  // document.getElementById("lvl_t").innerHTML = "<span style='font-sze:12px; color: black; '>"+level_str+"</span>";
  // document.getElementById("dist_t").innerHTML = "<span style='font-sze:12px;color: black;  '>"+dist_str+"</span>";
  var textarea1 = document.getElementById("data-log_t");
  textarea1.value = "";
  textarea1.value = textarea.value;
  textarea1.scrollTop = textarea.scrollHeight;
}

function populate_params(string_val) {
  if (string_val.includes("/P241:")) {
    document.getElementById("p241List").value = parseInt(string_val.slice(string_val.lastIndexOf(":") + 1)) + 1;
    param_query = 1;
    if (param_start_val == 0 || param_tid == false) settings_msg_clear();
    if (document.getElementById("p241List").value >= 2 && document.getElementById("p241List").value <= 4) alert(lang_map[85]); //alert('Warning: Indicator (P241) is set to installation mode. Switch to Health mode (P241 = 7) after installation!');
    document.getElementById("btnp241").style.background = "#33B34A"; //PULSAR GREEN
  } else if (string_val.includes("/P100:")) {
    //document.getElementById('p100-box').value = string_val.slice(string_val.lastIndexOf(':') + 1);//string_val.substring(string_val.indexOf(':') + 1);
    document.getElementById("p100List").value = parseInt(string_val.slice(string_val.lastIndexOf(":") + 1));
    param_query = 2;
    if (param_start_val == 0 || param_tid == false) settings_msg_clear();
    document.getElementById("btnp100").style.background = "#33B34A"; //PULSAR GREEN
  } else if (string_val.includes("/P104:")) {
    //document.getElementById('p104-box').value = string_val.slice(string_val.lastIndexOf(':') + 1);//string_val.substring(string_val.indexOf(':') + 1);
    //p104_units_val = parseInt(document.getElementById('p104-box').value);
    document.getElementById("p104List").value = parseInt(string_val.slice(string_val.lastIndexOf(":") + 1));
    p104_units_val = parseInt(document.getElementById("p104List").value);
    p104_measurement_units(); // Update the measurement units to be displayed
    if (param_start_val == 0 || param_tid == false) settings_msg_clear();
    if (p104_param_update == 1) p104_update();
    param_query = 3;
    document.getElementById("btnp104").style.background = "#33B34A"; //PULSAR GREEN
  } else if (string_val.includes("/P105:")) {
    document.getElementById("p105-box").value = string_val.slice(string_val.lastIndexOf(":") + 1); //string_val.substring(string_val.indexOf(':') + 1);
    param_query = 4;
    if (param_start_val == 0 || param_tid == false) settings_msg_clear();
    document.getElementById("btnp105").style.background = "#33B34A"; //PULSAR GREEN
  } else if (string_val.includes("/P106:")) {
    document.getElementById("p106-box").value = string_val.slice(string_val.lastIndexOf(":") + 1); //string_val.substring(string_val.indexOf(':') + 1);
    span_val = document.getElementById("p106-box").value;
    param_query = 5;
    if (param_start_val == 0 || param_tid == false) settings_msg_clear();
    if (p104_param_update == 1) {
      p104_param_update = 0;
      param_query = 8;
    }
    document.getElementById("btnp106").style.background = "#33B34A"; //PULSAR GREEN
  } else if (string_val.includes("/P808:")) {
    //document.getElementById('p808-box').value = string_val.slice(string_val.lastIndexOf(':') + 1);//string_val.substring(string_val.indexOf(':') + 1);
    document.getElementById("p808List").value = parseInt(string_val.slice(string_val.lastIndexOf(":") + 1));
    param_query = 6;
    if (param_start_val == 0 || param_tid == false) settings_msg_clear();
    document.getElementById("btnp808").style.background = "#33B34A"; //PULSAR GREEN
  }
  // else if (string_val.includes("/P605:")) {
  //   //document.getElementById('p605-box').value = string_val.slice(string_val.lastIndexOf(':') + 1);//string_val.substring(string_val.indexOf(':') + 1);
  //   //p605_units_val = parseInt(document.getElementById('p605-box').value);
  //   document.getElementById("p605List").value = parseInt(string_val.slice(string_val.lastIndexOf(":") + 1)) + 1;
  //   p605_units_val = parseInt(document.getElementById("p605List").value) - 1;
  //   p605_volume_units(); // Update the volume units to be displayed
  //   if (param_start_val == 0 || param_tid == false) settings_msg_clear();
  //   param_query = 7;
  //   document.getElementById("btnp605").style.background = "#33B34A"; //PULSAR GREEN
  // }
  else if (string_val.includes("/P21:")) {
    document.getElementById("p21-box").value = string_val.slice(string_val.lastIndexOf(":") + 1); //string_val.substring(string_val.indexOf(':') + 1);
    param_query = 8;
    param_start_val = 0;
    settings_msg_clear();
    document.getElementById("btnp21").style.background = "#33B34A"; //PULSAR GREEN
  }
}
/**
 * Parses the UART output for various metrics related to the device.
 *
 * This function extracts data for `reflect`, `fwversion`, and `access` from
 * the UART output using regular expressions, and returns the parsed metrics
 * in an object.
 *
 * @param {string} uartOutput - The raw UART output string.
 * @returns {Object} - An object containing the parsed metrics.
 */
function parseMetrics(uartOutput) {
  const patterns = {
    reflect: /REFLECT-E\((\d+)\),/,
    fwversion: /fwversion\(([^)]+)\),/,
    access: /access\((\d+)\),/,
  };

  const metrics = {};

  // Iterate through the defined patterns and extract matching data
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = uartOutput.match(pattern);
    if (match) {
      // If the match is a number, parse it as a float, otherwise keep it as a string
      metrics[key] = isNaN(match[1]) ? match[1].trim() : parseFloat(match[1]);
    } else {
      // If no match, assign null for that metric
      metrics[key] = null;
    }
  }

  return metrics;
}

/**
 * Parses the UART output for modem-related metrics.
 *
 * This function extracts data such as modem manufacturer, model, state, temperature,
 * and other relevant modem information from the UART output using regular expressions.
 *
 * @param {string} uartOutput - The raw UART output string.
 * @returns {Object} - An object containing the parsed modem metrics.
 */
function modem_parser(uartOutput) {
  const patterns = {
    modemManufacturer: /Modem Manufacturer:\s+(.+)/,
    modemModel: /Modem Model:\s+(.+)/,
    modemRevision: /Modem Revision:\s+(.+)/,
    modemDFUID: /Modem DFU ID:\s+(.+)/,
    modemIMEI: /Modem IMEI:\s+(.+)/,
    simIMSI: /SIM IMSI:\s+(.+)/,
    simICCID: /SIM ICCID:\s+(.+)/,
    simMSISDN: /SIM MSISDN:\s+(.+)/,
    modemState: /Modem State:\s+(.+)/,
    modemStateElapsed: /Modem State Elapsed:\s+([\d:]+)/,
    modemActiveElapsed: /Modem Active Elapsed:\s+([\d:]+)/,
    modemDutyCycle: /Modem Duty Cycle %:\s+([\d.]+)/,
    modemRadioMode: /Modem Radio Mode:\s+(.+)/,
    modemCellUTCTime: /Modem Cell UTC Time:\s+(.+)/,
    modemCellUTCOffset: /Modem Cell UTC Offset:\s+(\d+)\s+minutes/,
    modemTemperature: /Modem Temperature:\s+(\d+)\s+C/,
    modemSIMState: /Modem SIM State:\s+(.+)/,
    modemSIMOperatorID: /Modem SIM Operator ID:\s+(.+)/,
    modemOperatorSelect: /Modem Operator Select:\s+(.+)/,
    modemProvidedDNS1: /Modem Provided DNS1:\s+(.+)/,
    modemProvidedDNS2: /Modem Provided DNS2:\s+(.+)/,
    modemProvidedMTU: /Modem Provided MTU:\s+(\d+)/,
    modemSecondaryDNS: /Modem Secondary DNS:\s+(.+)/,
    modemOperatorMCCMNC: /Modem Operator MCCMNC:\s+(.+)/,
    modemOperatorName: /Modem Operator Name:\s+(.+)/,
    modemSTAT: /Modem STAT:\s+(\d+)/,
    modemACT: /Modem ACT:\s+(\d+)/,
    modemTAC: /Modem TAC:\s+(.+)/,
    modemCI: /Modem CI:\s+(.+)/,
    modemBand: /Modem Band:\s+(\d+)/,
    modemRSRP: /Modem RSRP:\s+(-?\d+)\s+dBm/,
    modemRSRQ: /Modem RSRQ:\s+(-?\d+.\d+)\s+dB/,
    modemPSM: /Modem PSM:\s+(.+)/,
    modemPSMTAUReq: /Modem PSM TAU req:\s+([\d:]+)/,
    modemPSMActiveReq: /Modem PSM Active req:\s+([\d:]+)/,
    modemEDRX: /Modem eDRX:\s+(.+)/,
    modemEDRXValueReq: /Modem eDRX value req:\s+([\d.]+)\s+sec/,
    modemEDRXPTWReq: /Modem eDRX PTW req:\s+([\d.]+)\s+sec/,
    modemEDRXValue: /Modem eDRX value:\s+(.+)/,
    modemEDRXPTW: /Modem eDRX PTW:\s+(.+)/,
  };

  const metrics = {};

  // Extract each pattern from the uartOutput
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = uartOutput.match(pattern);
    if (match) {
      metrics[key] = isNaN(match[1]) ? match[1].trim() : parseFloat(match[1]);
    } else {
      metrics[key] = null;
    }
  }

  return metrics;
}

/**
 * Parses the UART output for MQTT-related metrics.
 *
 * This function extracts data such as MQTT state, connection details,
 * QoS, keepalive time, and other relevant MQTT information from the UART output.
 *
 * @param {string} uartOutput - The raw UART output string.
 * @returns {Object} - An object containing the parsed MQTT metrics.
 */

function mqtt_parser(uartOutput) {
  const patterns = {
    mqttState: /MQTT State:\s+(.+)/,
    mqttStateElapsed: /MQTT State Elapsed:\s+([\d:]+)/,
    mqttLastConnectTime: /MQTT Last Connect Time:\s+(.+)/,
    mqttBrokerHostname: /MQTT Broker Hostname:\s+(.+)/,
    mqttBrokerIP: /MQTT Broker IP Address:\s+(.+)/,
    mqttBrokerPort: /MQTT Broker Port:\s+(\d+)/,
    mqttClientID: /MQTT Client ID:\s+(.+)/,
    mqttQoS: /MQTT QoS:\s+(\d+)/,
    mqttKeepalive: /MQTT Keepalive:\s+(\d+)\s+sec/,
    mqttTLSLevel: /MQTT TLS Level:\s+(.+)/,
    mqttTLSSecurityTag: /MQTT TLS Security Tag:\s+(.+)/,
    mqttUnackedPublish: /MQTT Unacked PUBLISH:\s+(\d+)/,
    mqttUnackedSubscribe: /MQTT Unacked SUBSCRIBE:\s+(\d+)/,
    mqttUnackedPing: /MQTT Unacked PING:\s+(\d+)/,
    mqttBacklog: /MQTT Backlog:\s+(\d+)/,
  };

  const metrics = {};

  // Extract each pattern from the uartOutput
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = uartOutput.match(pattern);
    if (match) {
      metrics[key] = isNaN(match[1]) ? match[1].trim() : parseFloat(match[1]);
    } else {
      metrics[key] = null;
    }
  }

  return metrics;
}

/**
 * Parses the UART output for MQTT credentials.
 *
 * This function extracts MQTT credentials such as broker hostname, port, client ID,
 * QoS, keepalive, username, TLS level, and TLS security tag from the given UART output.
 *
 * @param {string} uartOutput - The raw UART output string containing MQTT credentials.
 * @returns {Object} - An object containing the parsed MQTT credentials.
 */
function mqtt_cred_parser(uartOutput) {
  const patterns = {
    mqttBrokerHostname: /MQTT Broker Hostname:\s+(.+)/,
    mqttBrokerPort: /MQTT Broker Port:\s+(\d+)/,
    mqttClientID: /MQTT Client ID:\s+(.+)/,
    mqttQoS: /MQTT QoS:\s+(\d+)/,
    mqttKeepalive: /MQTT Keepalive:\s+(\d+)\s+sec/,
    // mqttUsername: /MQTT Username:\s+(.+)/,
    mqttUsername: /MQTT Username:\s+([^\r\n]+)/, // this is put to ensure that if the Username is empty, then the MQTT password is not put as a username
    mqttTLSLevel: /MQTT TLS Level:\s+(.+)/,
    mqttTLSSecurityTag: /MQTT TLS Security Tag:\s+(.+)/,
  };
  const metrics = {};
  //extract each pattern from the uartOutput
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = uartOutput.match(pattern);
    if (match) {
      metrics[key] = isNaN(match[1]) ? match[1].trim() : parseFloat(match[1]);
    } else {
      metrics[key] = null;
    }
  }
  return metrics;
}
/**
 * Parses the UART output for node-related metrics.
 *
 * This function extracts data such as hardware revision, software revision,
 * node name, report interval, and other relevant node information from
 * the UART output.
 *
 * @param {string} uartOutput - The raw UART output string.
 * @returns {Object} - An object containing the parsed node metrics.
 */
function node_parser(uartOutput) {
  const patterns = {
    hwRev: /HW Rev:\s+(.+)/,
    hwConfig: /HW Config:\s+(.+)/,
    swRev: /SW Rev:\s+(.+)/,
    nodeName: /Node Name:\s+(.+)/,
    reportInterval: /Report Interval:\s+(\d+)\s+sec/,
    rebootDelay: /Reboot Delay:\s+(\d+)\s+\w+/,
    nodeFeatures: /Node Features:\s+(0x[0-9A-Fa-f]+)/,
    subscription: /Subscription:\s+(.+)/,
    temperature: /Temperature:\s+(\d+)\s+C/,
    battery: /Battery:\s+([\d.]+)\s+V/,
  };

  const metrics = {};

  // Extract each pattern from the uartOutput
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = uartOutput.match(pattern);
    if (match) {
      metrics[key] = isNaN(match[1]) ? match[1].trim() : parseFloat(match[1]);
    } else {
      metrics[key] = null;
    }
  }

  return metrics;
}

/**
 * Parses the UART output for APN-related metrics.
 *
 * This function extracts data such as APN, IP address, and number of PDP contexts
 * defined from the UART output.
 *
 * @param {string} uartOutput - The raw UART output string.
 * @returns {Object} - An object containing the parsed APN metrics.
 */
function apn_parser(uartOutput) {
  const patterns = {
    apn: /APN\d+:\s+"([^"]+)"/,
    ipAddress: /IP address\s+([\d.]+)/,
    pdpContextsDefined: /PDP Contexts Defined:\s+(\d+)/,
  };

  const metrics = {};

  // Extract each pattern from the uartOutput
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = uartOutput.match(pattern);
    if (match) {
      metrics[key] = isNaN(match[1]) ? match[1].trim() : parseInt(match[1], 10);
    } else {
      metrics[key] = null;
    }
  }

  return metrics;
}

/**
 * Listens for incoming data from the UART port, processes it, and updates the UI.
 *
 * This function continuously reads data from the UART port, converting the data to ASCII,
 * and processing it based on the content. Specific keywords in the data trigger actions
 * such as logging, updating UI elements, or handling commands.
 */
async function listenRX() {
  reader = port.readable.getReader(); // Initialize a reader to listen to the UART port
  try {
    while (true) {
      const { value, done } = await reader.read(); // Await data from the UART port
      if (done) {
        // console.log("[readLoop] DONE"); // Log when the reading loop is complete
        break;
      }
      if (value) {
        // Convert the received bytes to a hex string
        const receivedHex = Array.from(value)
          .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
          .join("");

        receiveBufferHex += receivedHex; // Append received hex data to the buffer

        // Clear any previous timeouts
        clearTimeout(receiveTimeout);
        clearTimeout(noResponseTimeout);

        // Set a timeout to process the data after 50 ms
        receiveTimeout = setTimeout(async () => {
          // Ensure data exists in the buffer
          if (receiveBufferHex && receiveBufferHex.length > 0) {
            const matches = receiveBufferHex.match(/.{1,2}/g); // Split hex string into pairs
            if (matches) {
              // Convert hex pairs into ASCII characters and add to ASCII buffer
              receiveBufferASCII += matches.reduce((acc, char) => acc + String.fromCharCode(parseInt(char, 16)), "");
            } else {
              console.error("No matches found in receiveBufferHex");
            }
          }
          // dump_log();
          if (BootLoader_launced) {
            listenRX_BL();
          }

          // Check for specific messages or commands in the ASCII buffer
          if (receiveBufferASCII.includes("success") && CommandSent == "/DEVINFO") {
            // Handle a "success" message by updating the UI and logging messages
            log(lang_map[150]);
            log(lang_map[151]);
            document.getElementById("connectionImage").src = "img/usb-connected.svg";

            // Change button colors to indicate successful connection
            const elements = document.querySelectorAll("button[type=button]");
            elements.forEach((element) => (element.style.background = "#33B34A")); // Set to "PULSAR GREEN"
            login_stage = 2;
            button_press = 3;
            setTimeout(trace_button_check, 1000); // Check for button trace
          }

          // Handle reboot success
          if (receiveBufferASCII.includes("Marking firmware image good...") && reboot_flag === 1) {
            reboot_flag = 0;
            // console.log("Rebooting done!");
            // clear fields for mqtt and gnss and node settings
            document.getElementById("mqttState").value = "";
            document.getElementById("mqttBrokerHostname").value = "";
            document.getElementById("mqttBrokerPort").value = "";
            document.getElementById("mqttUsername").value = "";
            document.getElementById("mqttPassword").value = "";
            document.getElementById("mqttTLS").value = "";
            document.getElementById("mqttTLSSecTag").value = "";
            document.getElementById("nodeName").value = "";
            document.getElementById("reportInterval").value = "";
            document.getElementById("rebootDelay").value = "";
            document.getElementById("temperature").value = "";
            document.getElementById("battery").value = "";
            document.getElementById("GNSSinterval").value = "";
            hideLoadingScreen_succesful(); // Hide loading screen on successful reboot
            clearTimeout(rebootTimeout); // Clear the reboot timeout
          } else if (receiveBufferASCII.includes("Marking firmware image good...")) {
            alert(lang_map[292]);
            setTimeout(reload_webpage, 1000);
          }
          // Process device information if "REFLECT-E" is in the data
          if (hexToAscii(receiveBufferHex).includes("REFLECT-E") && CommandSent === "/DEVINFO") {
            const metrics = parseMetrics(receiveBufferASCII); // Parse the metrics from data
            // Extract specific device information
            const reflecte_name = metrics.reflect;
            const reflecte_fwversion = metrics.fwversion;
            const reflecte_access = metrics.access;

            // Update UI elements with the received device information
            document.querySelector(".static_image img").src = "img/Picture1.png";
            document.getElementById("id_title").textContent = "REFLECT-E";
            document.getElementById("reflecte_devinfo-label").textContent = lang_map[152];
            document.getElementById("device_title").innerHTML = reflecte_name;
            document.getElementById("deviceInfo-box").innerText = `REFLECT-E: ${reflecte_name}`;
            document.getElementById("reflecte_fwversion-box").innerText = `version ${reflecte_fwversion}`;

            // Map reflecte access level to a descriptive string
            let access_string = "";
            switch (reflecte_access) {
              case 1:
                access_string = lang_map[153];
                break;
              case 2:
                access_string = lang_map[154];
                break;
              case 3:
                access_string = lang_map[155];
                break;
              case 4:
                access_string = lang_map[156];
                break;
              default:
                access_string = lang_map[153];
                break;
            }
            document.getElementById("reflecte_access-box").innerText = access_string;
          } else {
            // Process any remaining data asynchronously
            // could log dump here
            // dump_log();
            if (CommandSent == "log_read" && stop_accum == 0) {
              store_to_log(receiveBufferASCII);
            } else {
              appendShell(receiveBufferASCII);
            }
            if (!BootLoader_launced) {
              //console.log("USB<-" + receiveBufferHex); // debug only
              await processReceivedData();
            }
          }
          // Clear buffers after processing
          receiveBufferHex = "";
          receiveBufferASCII = "";
        }, 50); // Process after a delay of 50 ms
      }
    }
  } catch (error) {
    console.error("[readLoop] ERROR", error); // Log any errors encountered during reading
    log(lang_map[157]);
    setTimeout(reload_webpage, 1000); // Reloads the web-app after a second to ensure that an
    // error on the read loop can be resolved
  } finally {
    reader.releaseLock(); // Release the reader lock when done
  }
}

function dump_log() {
  console.log(`Data received (ASCII): ${receiveBufferASCII}`);
}

/**
 * Converts a hexadecimal string to an ASCII string.
 *
 * This function takes a hex string (e.g., "48656c6c6f") and converts it into an ASCII string
 * by parsing each pair of hex characters into their respective ASCII characters.
 *
 * @param {string} hexString - The hex string to be converted.
 * @returns {string} - The resulting ASCII string, or an empty string if hexString is falsy.
 */
function hexToAscii(hexString) {
  if (!hexString) return ""; // Return an empty string if hexString is falsy (null, undefined, empty string, etc.)

  // Split hexString into pairs of two characters, convert each pair from hex to ASCII, and concatenate into a single string
  return hexString
    .match(/.{1,2}/g) // Match pairs of two hex characters
    .reduce((acc, char) => acc + String.fromCharCode(parseInt(char, 16)), ""); // Convert each hex pair to ASCII and accumulate
}

async function processReceivedData() {
  const doc_value = CommandSent;
  if (
    (doc_value == "GET ECHO" ||
      doc_value == "GET DATEM" ||
      doc_value == "SENDPART1" ||
      doc_value == "SENDPART2" ||
      doc_value == "SENDPART3" ||
      doc_value == "REFRESH ACCEL" ||
      doc_value == "REFRESH LIVE") &&
    !hexToAscii(receiveBufferHex).includes("/ACCESS")
  ) {
    var hex = interpretHex(receiveBufferHex); //create a test function for this to emulate how this is working as well, what will be the parameter here
  } else {
    //these checks are all ascii related and hence will use the ascii conversion of data
    if (hexToAscii(receiveBufferHex).includes("/SET")) {
      let afterColon = hexToAscii(receiveBufferHex).split("T")[1];
      if (afterColon.includes("1:DONE")) {
        await sendTX(combined_secondSet, true);
        CommandSent = "";
        clearTimeout(circular_responseTimeout);
      } else if (afterColon.includes("2:DONE")) {
        // if (volume_sent) {
        //   volume_sent = 0;
        //   hideLoadingScreen_succesful();
        // } else {
        await sendTX(combined_remainingSet, true);
        CommandSent = "";
        // }
        clearTimeout(circular_responseTimeout);
      } else if (afterColon.includes("3:DONE")) {
        hideLoadingScreen_succesful();
        if (send_param_button_press) {
          login_stage = 4;
          send_param_button_press = 0;
        }
        param_set1_start();
      }
    }
    if (hexToAscii(receiveBufferHex).includes("/P")) {
      populate_params(hexToAscii(receiveBufferHex));
    }
    if (hexToAscii(receiveBufferHex).includes("/P") || hexToAscii(receiveBufferHex).includes("/ACCESS")) {
      if (!(isTraceOn == 1 && (hexToAscii(receiveBufferHex).includes("/P104") || hexToAscii(receiveBufferHex).includes("/P605")))) {
        // if (!prodModal_open) {
        log(" ← " + hexToAscii(receiveBufferHex).slice(hexToAscii(receiveBufferHex).lastIndexOf("/")));
        // }
      } else {
        log(" ← " + hexToAscii(receiveBufferHex));
      }
      if (hexToAscii(receiveBufferHex).includes("/ACCESS:")) {
        let afterColon = hexToAscii(receiveBufferHex).split(":")[1];
        document.getElementById("reflecte_access-box").innerText = "ACCESS: " + afterColon;
        if (afterColon.includes("PRODUCTION")) {
          document.getElementById("btnprod").style.display = "";
          // start timer to revert the access level after 10 minutes
          setTimeout(() => {
            document.getElementById("cmd").value = "/ACCESS:" + 0;
            document.getElementById("cmd").type = "password";
            send_command();
          }, 10 * 60 * 1000); // 10 minutes in milliseconds
        } else {
          document.getElementById("btnprod").style.display = "none";
        }
      }
    }
    if (
      hexToAscii(receiveBufferHex).includes("Restricted") ||
      hexToAscii(receiveBufferHex).includes("Same") ||
      hexToAscii(receiveBufferHex).includes("range") ||
      hexToAscii(receiveBufferHex).includes("Read-Only")
    ) {
      log(" ← " + hexToAscii(receiveBufferHex));
    }
    if (hexToAscii(receiveBufferHex).includes("/P600") && c_state == 3) {
      clearTimeout(bar_responseTimeout);
      updateProgress();
      await delay(100);
      clearInterval(p_tid[`p600_tid`]); // Clear interval once response is received
      volume_param("p601-box");
    }
    if (hexToAscii(receiveBufferHex).includes("/P601") && c_state == 3) {
      clearTimeout(bar_responseTimeout);
      updateProgress();
      await delay(100);
      clearInterval(p_tid[`p601_tid`]);
      volume_param("p602-box");
    }
    if (hexToAscii(receiveBufferHex).includes("/P602") && c_state == 3) {
      clearTimeout(bar_responseTimeout);
      updateProgress();
      await delay(100);
      clearInterval(p_tid[`p602_tid`]);
      volume_param("p603-box");
    }
    if (hexToAscii(receiveBufferHex).includes("/P603") && c_state == 3) {
      clearTimeout(bar_responseTimeout);
      updateProgress();
      await delay(100);
      clearInterval(p_tid[`p603_tid`]);
      var select = document.getElementById("p605List");
      var selectedValue = select.value;
      if (selectedValue != 0) {
        p_tid[`p${605}_tid`] = setInterval(function () {
          sendTX("/P605:" + (selectedValue - 1));
        }, 500);
        CommandSent = "";
      }
    }
    if (hexToAscii(receiveBufferHex).includes("/P605") && c_state == 3) {
      clearTimeout(bar_responseTimeout);
      updateProgress();
      await delay(100);
      clearInterval(p_tid[`p605_tid`]);
      volume_param("p606-box");
    }
    if (hexToAscii(receiveBufferHex).includes("/P606") && c_state == 3) {
      clearTimeout(bar_responseTimeout);
      updateProgress();
      await delay(100);
      clearInterval(p_tid[`p606_tid`]);
      p_tid[`p${604}_tid`] = setInterval(function () {
        sendTX("/P604");
      }, 500);
      CommandSent = "";
    }
    if (hexToAscii(receiveBufferHex).includes("/P604") && c_state == 3) {
      clearTimeout(bar_responseTimeout);
      updateProgress();
      await delay(100);
      clearInterval(p_tid[`p604_tid`]);
      document.getElementById("p604-box").innerHTML = Number(hexToAscii(receiveBufferHex).slice(hexToAscii(receiveBufferHex).lastIndexOf(":") + 1));
      p_tid[`p${607}_tid`] = setInterval(function () {
        sendTX("/P607");
      }, 500);
      CommandSent = "";
    }
    if (hexToAscii(receiveBufferHex).includes("/P607") && c_state == 3) {
      clearTimeout(bar_responseTimeout);
      updateProgress();
      await delay(100);
      clearInterval(p_tid[`p607_tid`]);
      document.getElementById("p607-box").innerHTML = Number(hexToAscii(receiveBufferHex).slice(hexToAscii(receiveBufferHex).lastIndexOf(":") + 1));
      p_tid[`p${697}_tid`] = setInterval(function () {
        sendTX("/P697");
      }, 500);
      CommandSent = "";
    }
    if (hexToAscii(receiveBufferHex).includes("/P697") && c_state == 3) {
      clearTimeout(bar_responseTimeout);
      updateProgress();
      await delay(100);
      clearInterval(p_tid[`p697_tid`]);
      document.getElementById("p697-box").innerHTML = Number(hexToAscii(receiveBufferHex).slice(hexToAscii(receiveBufferHex).lastIndexOf(":") + 1));
      hideLoadingScreen_succesful();
    }
    if (
      !hexToAscii(receiveBufferHex).includes("/P600") &&
      !hexToAscii(receiveBufferHex).includes("/P601") &&
      !hexToAscii(receiveBufferHex).includes("/P602") &&
      !hexToAscii(receiveBufferHex).includes("/P603") &&
      !hexToAscii(receiveBufferHex).includes("/P605") &&
      !hexToAscii(receiveBufferHex).includes("/P606") &&
      !hexToAscii(receiveBufferHex).includes("/P604") &&
      !hexToAscii(receiveBufferHex).includes("/P607") &&
      !hexToAscii(receiveBufferHex).includes("/P697") &&
      c_state == 3
    ) {
      if (hexToAscii(receiveBufferHex).includes("/P641")) {
        hideLoadingScreen_succesful();
      }
      await delay(100);
      handle_breakpoint_update(hexToAscii(receiveBufferHex));
    }
    if (hexToAscii(receiveBufferHex).includes("/P926") && CommandSent == "fwStringUpdate") {
      const extracted_fwversion = extractFwVersion(hexToAscii(receiveBufferHex));
      document.getElementById("reflecte_fwversion-box").innerText = `version ${extracted_fwversion}`;
    }
    if (hexToAscii(receiveBufferHex).includes("Shell is unlocked") && CommandSent == "+++") {
      sendTX("sleep disable");
      CommandSent = "sleep disable";
      openCloudModal();
      cloudModal_open = 1;
    }
    if (hexToAscii(receiveBufferHex).includes("Shell is awake") && doc_value == "sleep disable") {
      sendTX("sleep disable");
      CommandSent = "sleep disable";
    }
    if (hexToAscii(receiveBufferHex).includes("Shell activity timeout disabled") && doc_value == "sleep disable") {
      sendTX("uptime");
      CommandSent = "uptime";
    }
    if (hexToAscii(receiveBufferHex).includes("Uptime") && doc_value == "uptime") {
      const uptime = receiveBufferASCII.match(/Uptime:\s+(?:(\d+)\.)?(\d{2}:\d{2}:\d{2})/);
      const formattedUptime = uptime ? (uptime[1] ? uptime[1] + "." : "") + uptime[2] : null;
      document.getElementById("uptime").value = formattedUptime;
      sendTX("modem apn");
      CommandSent = "modem apn";
    }
    if (hexToAscii(receiveBufferHex).includes("PDP Contexts Defined:") && doc_value == "modem apn") {
      const apnMetrics = apn_parser(hexToAscii(receiveBufferHex));
      document.getElementById("modemAPN").value = apnMetrics.apn;
      // Store the previous APN string
      prevApnstring = apnMetrics.apn;
      sendTX("modem show");
      CommandSent = "modem show";
    }
    if (hexToAscii(receiveBufferHex).includes("Modem eDRX PTW") && doc_value == "modem show") {
      const modemMetrics = modem_parser(hexToAscii(receiveBufferHex));
      document.getElementById("modemIMEI").value = modemMetrics.modemIMEI;
      document.getElementById("modemState").value = modemMetrics.modemState;
      if (modemMetrics.modemState == null) {
        await sendTX("modem show");
        CommandSent = "modem show";
      } else if (!modemMetrics.modemState.includes("CONNECTING") && !modemMetrics.modemState.includes("OFFLINE")) {
        if (modemMetrics.modemOperatorName.includes("Modem STAT:")) {
          // Show MCCMNC container
          document.getElementById("operator-mccmnc-container").classList.remove("hidden");
          // Hide Operator Name container
          document.getElementById("operator-name-container").classList.add("hidden");
          // Set the value for MCCMNC
          document.getElementById("modemOperatorMCCMNC").value = modemMetrics.modemOperatorMCCMNC;
        } else {
          // Show Operator Name container
          document.getElementById("operator-name-container").classList.remove("hidden");
          // Hide MCCMNC container
          document.getElementById("operator-mccmnc-container").classList.add("hidden");
          // Set the value for Operator Name
          document.getElementById("modemOperatorName").value = modemMetrics.modemOperatorName;
        }
        document.getElementById("modeOperatorSelect").value = modemMetrics.modemOperatorSelect;
        document.getElementById("modemRadioMode").value = modemMetrics.modemRadioMode;
        if (modemMetrics.modemEDRX.includes("Enabled")) {
          document.getElementById("modemeDRX").value = "factory_reset";
        } else {
          document.getElementById("modemeDRX").value = "disable";
        }
        document.getElementById("modemACT").value = modemMetrics.modemACT;
        document.getElementById("modemRSRP").value = modemMetrics.modemRSRP + " dB";
        if (modemMetrics.modemRSRP > -90) {
          document.getElementById("modemRSRP").style = "background-color:green"; // Excellent
        } else if (modemMetrics.modemRSRP >= -105) {
          document.getElementById("modemRSRP").style = "background-color:yellow"; // Good
        } else if (modemMetrics.modemRSRP >= -120) {
          document.getElementById("modemRSRP").style = "background-color:orange"; // Fair
        } else {
          document.getElementById("modemRSRP").style = "background-color:red"; // Poor
        }
        document.getElementById("modemRSRQ").value = modemMetrics.modemRSRQ + " dB";
        if (modemMetrics.modemRSRQ > -9) {
          document.getElementById("modemRSRQ").style = "background-color:green"; // Excellent
        } else if (modemMetrics.modemRSRQ >= -12) {
          document.getElementById("modemRSRQ").style = "background-color:orange"; // Good
        } else {
          document.getElementById("modemRSRQ").style = "background-color:red"; // Fair to Poor
        }
        // Store the previous selected radio mode
        prevOpSelect = modemMetrics.modemOperatorSelect;
        prevSelectedRadioMode = modemMetrics.modemRadioMode;
        prevSelectedeDRX = modemMetrics.modemEDRX;

        sendTX("mqtt status");
        CommandSent = "mqtt status";
      } else {
        document.getElementById("modemRadioMode").value = "";
        document.getElementById("modemACT").value = "";
        document.getElementById("modemRSRP").value = "";
        document.getElementById("modemRSRQ").value = "";
      }
    }
    if (hexToAscii(receiveBufferHex).includes("MQTT Backlog:") && doc_value == "mqtt status") {
      const mqttMetrics = mqtt_parser(hexToAscii(receiveBufferHex));
      document.getElementById("mqttState").value = mqttMetrics.mqttState;
      if (!hexToAscii(receiveBufferHex).includes("MQTT State:")) {
        document.getElementById("mqttState").value = prevMQTTstate;
        await sendTX("mqtt status");
        CommandSent = "mqtt status";
      } else {
        prevMQTTstate = mqttMetrics.mqttState;
        sendTX("mqtt credentials");
        CommandSent = "mqtt credentials";
      }
    }
    if (hexToAscii(receiveBufferHex).includes("MQTT TLS Security Tag:") && doc_value == "mqtt credentials") {
      const mqttMetrics = mqtt_cred_parser(hexToAscii(receiveBufferHex));
      document.getElementById("mqttBrokerHostname").value = mqttMetrics.mqttBrokerHostname;
      document.getElementById("mqttBrokerPort").value = mqttMetrics.mqttBrokerPort;
      document.getElementById("mqttUsername").value = mqttMetrics.mqttUsername;
      document.getElementById("mqttTLS").value = mqttMetrics.mqttTLSLevel;
      document.getElementById("mqttTLSSecTag").value = mqttMetrics.mqttTLSSecurityTag;
      prevMQTTBrokerHostname = mqttMetrics.mqttBrokerHostname;
      prevMQTTBrokerPort = mqttMetrics.mqttBrokerPort;
      prevMQTTBrokerUsername = mqttMetrics.mqttUsername;
      prevMQTTTLS = mqttMetrics.mqttTLSLevel;
      prevMQTTTLSSec_tag = mqttMetrics.mqttTLSSecurityTag;
      sendTX("node show");
      CommandSent = "node show";
    }
    if (hexToAscii(receiveBufferHex).includes("Battery:") && doc_value == "node show") {
      const nodeMetrics = node_parser(hexToAscii(receiveBufferHex));
      document.getElementById("nodeName").value = nodeMetrics.nodeName;
      // This extracts the minimum time for the reporting interval based on the type of subscription
      report_interval_min = nodeMetrics.subscription.match(/RPT+(\d+)$/)[1];
      document.getElementById("reportInterval").min = report_interval_min;
      document.getElementById("reportInterval").value = nodeMetrics.reportInterval;
      document.getElementById("temperature").value = nodeMetrics.temperature + " °C";
      document.getElementById("battery").value = nodeMetrics.battery + " V";
      if (nodeMetrics.rebootDelay == null) {
        nodeMetrics.rebootDelay = 0;
      }
      document.getElementById("rebootDelay").value = nodeMetrics.rebootDelay;

      prevNodeName = nodeMetrics.nodeName;
      prevReportInterval = nodeMetrics.reportInterval;
      prevrebootDelay = nodeMetrics.rebootDelay;
      sendTX("gnss status");
      CommandSent = "gnss status";
    }
    if (hexToAscii(receiveBufferHex).includes("GNSS Auto-update") && doc_value == "gnss status") {
      const autoUpdateMatch = hexToAscii(receiveBufferHex).match(/GNSS Auto-update (disabled|interval:\s+(\d+)\s+sec)/i);
      const autoUpdateInterval = autoUpdateMatch ? (autoUpdateMatch[1] === "disabled" ? 0 : parseFloat(autoUpdateMatch[2])) : null;
      document.getElementById("GNSSinterval").value = autoUpdateInterval;
      prevgnssInterval = autoUpdateInterval;
    }
    if (hexToAscii(receiveBufferHex).includes("ACCEL CAL DONE") && doc_value == "ACCEL CAL") {
      hideLoadingScreen_succesful();
      clearTimeout(timeoutID_accel_cal);
    }
    if (hexToAscii(receiveBufferHex).includes("ACCEL CAL FAIL") && doc_value == "ACCEL CAL") {
      hideLoadingScreen_fail();
      clearTimeout(timeoutID_accel_cal);
    }
    if (hexToAscii(receiveBufferHex).includes("/P586") && doc_value == "temp_query") {
      document.getElementById("transducerTemp").value = Number(hexToAscii(receiveBufferHex).slice(hexToAscii(receiveBufferHex).lastIndexOf(":") + 1));
    }
    if (hexToAscii(receiveBufferHex).includes("/P101") && doc_value == "transducertype_query") {
      document.getElementById("transducerType").value = Number(hexToAscii(receiveBufferHex).slice(hexToAscii(receiveBufferHex).lastIndexOf(":") + 1));
    }
    if (hexToAscii(receiveBufferHex).includes("/P104") && doc_value == "measurementunits_query") {
      document.getElementById("measurementUnits").value = Number(
        hexToAscii(receiveBufferHex).slice(hexToAscii(receiveBufferHex).lastIndexOf(":") + 1)
      );
    }
    if (hexToAscii(receiveBufferHex).includes("/P92") && doc_value == "serialnumber_query") {
      document.getElementById("serialNumber").value = Number(hexToAscii(receiveBufferHex).slice(hexToAscii(receiveBufferHex).lastIndexOf(":") + 1));
    }
    if (hexToAscii(receiveBufferHex).includes("/P88") && doc_value == "DEFAULT UNIT") {
      document.getElementById("defaultUnit_button").style.backgroundColor = "#F37021";
    }
    if (hexToAscii(receiveBufferHex).includes("SAVE OK") && doc_value == "FACTORY CAL") {
      document.getElementById("saveProdSettings-button").style.backgroundColor = "#F37021";
    }
    if (doc_value == "GET DIST") {
      const receivedData = hexToAscii(receiveBufferHex).trim();
      document.getElementById("distGet").value = receivedData;
    }
    if (hexToAscii(receiveBufferHex).includes("Date:") && doc_value === "GET TIME") {
      const data = hexToAscii(receiveBufferHex);

      const dateMatch = data.match(/Date:\s(\d{2}-\d{2}-\d{3})/);
      const timeMatch = data.match(/Time:\s(\d{2}:\d{2}:\d{3})/);
      const lastSetDateMatch = data.match(/Last Set Date:\s(\d{2}-\d{2}-\d{2})/);
      const lastSetTimeMatch = data.match(/Last Set Time:\s(\d{2}:\d{2}:\d{2}:\d{2})/);

      if (dateMatch && timeMatch) {
        const formattedDateTime = `${dateMatch[1].slice(0, 2)}-${dateMatch[1].slice(3, 5)}-${dateMatch[1].slice(-2)} ${timeMatch[1].slice(
          0,
          2
        )}:${timeMatch[1].slice(3, 5)}:${timeMatch[1].slice(-3)}`;
        document.getElementById("getTime").value = formattedDateTime;
      }

      if (lastSetDateMatch && lastSetTimeMatch) {
        const formattedLastSetDateTime = `${lastSetDateMatch[1].slice(0, 2)}-${lastSetDateMatch[1].slice(3, 5)}-${lastSetDateMatch[1].slice(
          -2
        )} ${lastSetTimeMatch[1].slice(0, 2)}:${lastSetTimeMatch[1].slice(3, 5)}:${lastSetTimeMatch[1].slice(-3)}`;
        document.getElementById("lastSet").value = formattedLastSetDateTime;
      }
    }
  }
}
function hexToInt16(hex1, hex2) {
  return (parseInt(hex1, 16) << 8) + parseInt(hex2, 16);
}

// For decode USB data
// Function to convert unsigned int 8 bit format to hex and relevant functions within it
function interpretHex(incoming_data) {
  a = [];
  s = incoming_data;
  var check;
  var floatval;
  const doc_value = CommandSent;
  const byteArray = receiveBufferHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16));
  for (let i = 0; i < byteArray.length; i++) {
    check = byteArray[i];
    if (i >= 46 && i < 246 && doc_value == "GET ECHO") {
      // Changed from (i >= 42) && (i < 242)
      echo[i - 46] = (check * 1000) / 255; // Changed from echo[i-42]
    } else if (i >= 46 && i < 246 && doc_value == "GET DATEM") {
      // Changed from (i >= 42) && (i < 242)
      datem[i - 46] = (check * 1000) / 255; // Changed from datem[i-42]
    }
    // a.push(s.getUint8(i));
    a.push("0x" + check.toString(16).padStart(2, "0"));
  }

  if (doc_value == "GET ECHO" || doc_value == "GET DATEM") {
    // Populate the dynamic variables
    //these are wrong calculations
    level_var = getVal(0);
    distance_var = getVal(1);
    volume_var = getVal(2);
    compensated_var = getVal(3);
    mA_output_var = getVal(4);
    temperature_var = getVal(5);
    gate_start = hexToInt16(receiveBufferHex.slice(48, 50), receiveBufferHex.slice(50, 52));
    gate_stop = hexToInt16(receiveBufferHex.slice(52, 54), receiveBufferHex.slice(54, 56));
    echo_var = hexToInt16(receiveBufferHex.slice(56, 58), receiveBufferHex.slice(58, 60));
    noise_var = hexToInt16(receiveBufferHex.slice(60, 62), receiveBufferHex.slice(62, 64));
    status_var = hexToInt16(receiveBufferHex.slice(64, 66), receiveBufferHex.slice(66, 68));

    near_blanking_var = getVal(8.5);
    far_blanking_var = getVal(9.5);
    empty_distance = getVal(10.5);
    compensated_var_m = convert_to_mtrs(compensated_var);
    /*
    // Not use mode_var any more.
    if (Math.round(compensated_var_m) == 24.0) {
      mode_var = 20.0;
    } else if (compensated_var_m.toFixed(1) == 9.6) {
      mode_var = 8.0;
    } else {
      mode_var = 40.0;
    }
*/
    far_blanking_dist = (empty_distance * (100.0 + far_blanking_var)) / 100.0;
    near_blanking_var = convert_to_measurement_units(near_blanking_var);
    far_blanking_dist = convert_to_measurement_units(far_blanking_dist);
    empty_distance = convert_to_measurement_units(empty_distance);
    //mode_var = convert_to_measurement_units(mode_var); // not used

    var xdata = [];
    xdata[0] = 0.0;
    for (let i = 1; i <= 200; i++) {
      xdata[i] = Math.round((xdata[i - 1] + compensated_var / 200) * 1000) / 1000;
    }
    // Zooming out does not work if labels are numbers
    for (let i = 0; i <= 200; i++) {
      xdata[i] = xdata[i].toString();
    }
    myChart.data.labels = xdata;
    myChart.config.options.scales.x.title.text = p104_units;
    myChart.update();
  } else if (doc_value == "SENDPART1") {
    offset = 0;
    for (let i = 0; i < 60; i++) {
      param_verify(i);
    }
    param_set2_start();
    param_set2_tid = setInterval(param_set2_start, 5000);
  } else if (doc_value == "SENDPART2") {
    temp_set2_storage = receiveBufferHex;
    offset = 1;
    for (let i = 0; i < 60; i++) {
      //21-52 is the volume stuff
      param_verify(i);
    }
    param_set3_start();
    param_set3_tid = setInterval(param_set3_start, 5000);
  } else if (doc_value == "SENDPART3") {
    offset = 2;
    for (let i = 0; i < param_info.length - offset * 60; i++) {
      param_verify(i);
    }
    if ((c_state == 3 || c_state == 4) && login_stage >= 3 && isDisconnecting == 0) {
      //then reset the state over here
      tids_trace_reset();
      if (!send_param_button_press && gen_param_button_press) {
        fetchedit_defaultXML();
        gen_param_button_press = 0;
      }
    } else {
      // This can be added here to avoid the Unite TXRX issue
      // await delay(500); // Remember for this the function needs to be async
      echo_start();
    }
  } else if (doc_value == "REFRESH ACCEL") {
    document.getElementById("xAxis").value = getVal(0).toFixed(2) + "°";
    document.getElementById("yAxis").value = getVal(1).toFixed(2) + "°";
    document.getElementById("zAxis").value = getVal(2).toFixed(2) + "°";
    document.getElementById("xMid").value = getVal(3).toFixed(2);
    document.getElementById("yMid").value = getVal(4).toFixed(2);
    document.getElementById("zMid").value = getVal(5).toFixed(2);
    document.getElementById("calStat").value = getVal(6).toFixed(2);
    document.getElementById("tiltEnable").value = getVal(7).toFixed(2);
    // console.log(receiveBufferHex);
  } else if (doc_value == "REFRESH LIVE") {
    document.getElementById("upTime").value = getVal(0).toFixed(2);
    document.getElementById("coreTemp").value = getVal(1).toFixed(2) + "°";
    document.getElementById("coreMin").value = getVal(2).toFixed(2) + "°";
    document.getElementById("coreMax").value = getVal(3).toFixed(2) + "°";
    document.getElementById("avgSig").value = getVal(4).toFixed(2);
    document.getElementById("capSupply").value = getVal(5).toFixed(2);
    // console.log(receiveBufferHex);
  }
  return a;
}
// Incoming GATT notification was received
async function incomingData(event) {
  try {
    // Read data from BLE CodeLess peer
    let readInValue = await outboundChar.readValue();
    // console.log(readInValue);
    let decoder = new TextDecoder("utf-8");
    // var checkBox = document.getElementById("myCheck");
    const doc_value = CommandSent; //document.getElementById('cmd').value;
    const string_check = decoder.decode(readInValue).replace("\r", "\r ← ").replace("\n", "").replace("\0", "");
    receiveBufferBT = readInValue;
    //alert("button_press="+button_press+" readInValue="+readInValue+"login_stage="+login_stage+" string_check="+string_check);
    //alert(login_stage + " " +isIgnore);
    // alert(string_check + "1");
    //log("login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isDisconnecting="+isDisconnecting+" button_press="+button_press);
    // console.log(`Data received (ASCII): ${string_check}`);
    if (BootLoader_launced) {
      listenRX_BL();
    }
    if (isIgnore_2 === 2) {
      //NEED TO CHECK
      isIgnore_2 = 0;
      //await delay(2 * 1000);
      //return;
    }

    if (isIgnore == 1) {
      isIgnore = 0;
      return; //--> need to check
    }

    if (!BootLoader_launced) {
      if (
        /*(button_press == 10) || (button_press == 11) || (button_press == 16) || (button_press == 17) || (button_press == 18) ||*/ /*(button_press == 8) &&*/ doc_value ==
          "GET ECHO" ||
        doc_value == "GET DATEM" ||
        doc_value == "SENDPART1" ||
        doc_value == "SENDPART2" ||
        doc_value == "SENDPART3"
      ) {
/*
        // --------------------------------------------------------------------------
        // For debug in console only
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const seconds = now.getSeconds().toString().padStart(2, "0");
        const milliseconds = now.getMilliseconds().toString().padStart(3, "0");
        const localTimeWithMs = `${hours}:${minutes}:${seconds}.${milliseconds}`;
        console.log(localTimeWithMs + " - BT2<-" + string_check);
        // -------------------------------------------------------------------------
*/

        var hex = Uint8tohex(readInValue);
        // if((button_press == 10) || ((button_press == 8) && (doc_value == "GET ECHO")))
        //   log(" ← ECHO Received");
        // else if ((button_press == 11) || ((button_press == 8) && (doc_value == "GET DATEM")))
        //   log(" ← DATEM Received");
      } else {
        //alert(string_check + "3");
        if (string_check.includes("Entered PASSTHROUGH mode")) {
          login_stage = 3; // Entered PT mode
          log(lang_map[67]); //log(" ← Log in Success");
        } else if (string_check.includes("Exit PASSTHROUGH mode")) {
          //alert("Exit : isIgnore="+isIgnore+" login_stage="+login_stage+" isDisconnecting="+isDisconnecting+" string_check="+string_check);
          login_stage = 2; // moving to AT mode
        } else if (string_check.includes("PASSTHROUGH failed")) {
          login_stage = 2;
          log(lang_map[68]); //log(" ← Normal mode failed");
        } else if (string_check.includes("Logged In Success") || (string_check.includes("OK") && login_stage == 1)) {
          login_stage = 2; // Logged in success mode
          closeForm();
          if (isDisconnecting == 0) {
            log(lang_map[69]); //log(" ← Connected");
            document.getElementById("connectionImage").src = "img/new_bt_connected-cropped.svg";
            var elements = document.querySelectorAll("button[type=button]");
            for (var i = 0, len = elements.length; i < len; i++) document.getElementById(elements[i].id).style.background = "#33B34A"; //PULSAR GREEN

            //sendATL('AT+PT=1');
            await sendAT("AT+PWRLVL");
            setTimeout(ptLModeON, 1000);
            // FOR BT DEMO COMMENT THE FOLLOWING
            setTimeout(trace_button_check, 5000); //2000); // UNDER TEST 1
          } else {
            // alert(isDisconnecting+" ::"+string_check);
            log(lang_map[70]); //log(" ← Disconnecting");
          }
        } else if ((string_check.includes("ERROR") || string_check.includes("Logged In failed")) && login_stage == 1) {
          document.getElementById("lblpsw").innerHTML = lang_map[125]; //'Login failed';
          document.getElementById("lblpsw").style.color = "red";
          document.getElementById("pswbox").value = "";
          openForm();
        } else {
          var disp = 0;
          if ((button_press >= 20 && button_press <= 26) || string_check.includes("/P")) populate_params(string_check);
          //alert(string_check+"st");
          if (isTerminated === 1 || isDisconnecting === 1 || isDisconnecting === 2) {
            disp = 1;
            await delay(2 * 1000);
          }

          if (disp == 0) {
            if (sysState == 2 && string_check.length > 12) {
              //log(" ← param state" + sysState );
            } else if (string_check.includes("/P")) {
              if (!(isTraceOn == 1 && (string_check.includes("/P104") || string_check.includes("/P605"))))
                log(" ← " + string_check.slice(string_check.lastIndexOf("/"))); //   alert(string_check.slice(string_check.lastIndexOf('/')));
            } else {
              if (cmd_sent == "AT+PWRLVL") {
                update_range(parseInt(string_check));
                // Add a send for "Reflect_fw_end" here to ensure that at the
                // beginning of bt comms, the Unite keeps the bootload pin low and resets the host
                await sendAT("Reflect_fw_end");
                await delay(1000);
              } else if (cmd_sent == "AT+PWRLVL=") {
                if (string_check.includes("ERROR")) update_range(power_lvl);
                else if (string_check.includes("OK")) update_range(new_power_lvl);
              }

              if (shell_open == 1 || cloudModal_open == 1) {
                // Dont log the command in the DATA LOG
              } else {
                log(" ← " + string_check);
              }
            }
          }
          if (string_check.includes("REFLECT-E") && doc_value == "/WHO") {
            document.getElementById("reflecte_devinfo").style.display = "block";
            document.querySelector(".static_image img").src = "img/Picture1.png";
            document.getElementById("btngenfile").style.display = "";
            document.getElementById("btnbl").style.display = "";
            document.getElementById("btncloudsetup").style.display = ""; // Show Cloud setting

            const reflecte_metrics = parseMetrics(string_check); // Parse the metrics from data
            // Extract specific device information
            const reflecte_name = reflecte_metrics.reflect;
            const reflecte_fwversion = reflecte_metrics.fwversion;
            const reflecte_access = reflecte_metrics.access;

            // Update UI elements with the received device information
            document.getElementById("id_title").textContent = "REFLECT-E";
            document.getElementById("reflecte_devinfo-label").textContent = lang_map[152];
            document.getElementById("device_title").innerHTML = device.name;
            document.getElementById("deviceInfo-box").innerText = `REFLECT-E: ${reflecte_name}`;
            document.getElementById("reflecte_fwversion-box").innerText = `version ${reflecte_fwversion}`;

            // Map reflecte access level to a descriptive string
            let access_string = "";
            switch (reflecte_access) {
              case 1:
                access_string = lang_map[153];
                break;
              case 2:
                access_string = lang_map[154];
                break;
              case 3:
                access_string = lang_map[155];
                break;
              case 4:
                access_string = lang_map[156];
                break;
              default:
                access_string = lang_map[153];
                break;
            }
            document.getElementById("reflecte_access-box").innerText = access_string;
            clearTimeout(who_timeout);
            contSensorMode_bt();
            param_set1_tid = setInterval(param_set1_start, 3000);
            isReflectE = 1;
            // console.log("isReflectE = " + isReflectE);
          }

          if (string_check.includes("/P600") && c_state == 3) {
            clearTimeout(bar_responseTimeout);
            updateProgress();
            clearInterval(p_tid[`p600_tid`]); // Clear interval once response is received
            await delay(1000);
            volume_param("p601-box");
          }

          if (string_check.includes("/P601") && c_state == 3) {
            clearTimeout(bar_responseTimeout);
            updateProgress();
            clearInterval(p_tid[`p601_tid`]);
            await delay(1000);
            volume_param("p602-box");
          }

          if (string_check.includes("/P602") && c_state == 3) {
            clearTimeout(bar_responseTimeout);
            updateProgress();
            clearInterval(p_tid[`p602_tid`]);
            await delay(1000);
            volume_param("p603-box");
          }

          if (string_check.includes("/P603") && c_state == 3) {
            clearTimeout(bar_responseTimeout);
            updateProgress();
            clearInterval(p_tid[`p603_tid`]);
            await delay(1000);
            var select = document.getElementById("p605List");
            var selectedValue = select.value;
            if (selectedValue != 0) {
              p_tid[`p${605}_tid`] = setInterval(function () {
                sendAT("/P605:" + (selectedValue - 1));
              }, 1500);
              CommandSent = "";
            }
          }

          if (string_check.includes("/P605") && c_state == 3) {
            clearTimeout(bar_responseTimeout);
            updateProgress();
            clearInterval(p_tid[`p605_tid`]);
            await delay(1000);
            volume_param("p606-box");
          }

          if (string_check.includes("/P606") && c_state == 3) {
            clearTimeout(bar_responseTimeout);
            updateProgress();
            clearInterval(p_tid[`p606_tid`]);
            await delay(1000);
            p_tid[`p${604}_tid`] = setInterval(function () {
              sendAT("/P604");
            }, 1500);
            CommandSent = "";
          }

          if (string_check.includes("/P604") && c_state == 3) {
            clearTimeout(bar_responseTimeout);
            updateProgress();
            clearInterval(p_tid[`p604_tid`]);
            await delay(1000);
            document.getElementById("p604-box").innerHTML = Number(
              string_check
                .slice(string_check.lastIndexOf(":") + 1)
                .split("\r")[0]
                .trim()
            );
            p_tid[`p${607}_tid`] = setInterval(function () {
              sendAT("/P607");
            }, 1500);
            CommandSent = "";
          }

          if (string_check.includes("/P607") && c_state == 3) {
            clearTimeout(bar_responseTimeout);
            updateProgress();
            clearInterval(p_tid[`p607_tid`]);
            await delay(1000);
            document.getElementById("p607-box").innerHTML = Number(
              string_check
                .slice(string_check.lastIndexOf(":") + 1)
                .split("\r")[0]
                .trim()
            );
            p_tid[`p${697}_tid`] = setInterval(function () {
              sendAT("/P697");
            }, 1500);
            CommandSent = "";
          }

          if (string_check.includes("/P697") && c_state == 3) {
            clearTimeout(bar_responseTimeout);
            updateProgress();
            clearInterval(p_tid[`p697_tid`]);
            await delay(1000);
            document.getElementById("p697-box").innerHTML = Number(
              string_check
                .slice(string_check.lastIndexOf(":") + 1)
                .split("\r")[0]
                .trim()
            );
            hideLoadingScreen_succesful();
          }
          if (
            !string_check.includes("/P600") &&
            !string_check.includes("/P601") &&
            !string_check.includes("/P602") &&
            !string_check.includes("/P603") &&
            !string_check.includes("/P605") &&
            !string_check.includes("/P606") &&
            !string_check.includes("/P604") &&
            !string_check.includes("/P607") &&
            !string_check.includes("/P697") &&
            c_state == 3
          ) {
            if (string_check.includes("/P641")) {
              hideLoadingScreen_succesful();
            }

            handle_breakpoint_update(string_check);
          }

          // =================================================================================
          // This part handle BT shell reply

          // ------------------------------------------------------------------------------
          // For debug in console only
          const now = new Date();
          const hours = now.getHours().toString().padStart(2, "0");
          const minutes = now.getMinutes().toString().padStart(2, "0");
          const seconds = now.getSeconds().toString().padStart(2, "0");
          const milliseconds = now.getMilliseconds().toString().padStart(3, "0");
          const localTimeWithMs = `${hours}:${minutes}:${seconds}.${milliseconds}`;
          console.log(localTimeWithMs + " - BT<-" + string_check);
          // -----------------------------------------------------------------------------

          // For showing reply to shell
          if (doc_value == "shell_command") {
            lastreceiveTime = Date.now();
            appendShell(string_check);
          }

          // For logging log_read to shell
          if (doc_value == "log_read" && stop_accum == 0) {
            store_to_log(string_check);
          }

          //================================
          /*
          uart:~$ sleep disable
          Shell activity timeout disabled
          */
          //================================
          // Handling "sleep disable" reply
          if (doc_value == "sleep disable") {
            if (string_check.includes("Shell activity timeout disabled")) {
              // Set all to yellow first ---------------------------------------------------
              document.getElementById("uptime-label").style.backgroundColor = "yellow";
              document.getElementById("modemAPN-label").style.backgroundColor = "yellow";

              document.getElementById("modemIMEI-label").style.backgroundColor = "yellow";
              document.getElementById("modemState-label").style.backgroundColor = "yellow";
              document.getElementById("modemOperatorMCCMNC-label").style.backgroundColor = "yellow";
              document.getElementById("modemOperatorName-label").style.backgroundColor = "yellow";
              document.getElementById("modeOperatorSelect-label").style.backgroundColor = "yellow";
              document.getElementById("modemRadioMode-label").style.backgroundColor = "yellow";
              document.getElementById("modemeDRX-label").style.backgroundColor = "yellow";
              document.getElementById("modemACT-label").style.backgroundColor = "yellow";
              document.getElementById("modemRSRP-label").style.backgroundColor = "yellow";
              document.getElementById("modemRSRQ-label").style.backgroundColor = "yellow";
              document.getElementById("modemRadioMode-label").style.backgroundColor = "yellow";
              document.getElementById("modemACT-label").style.backgroundColor = "yellow";
              document.getElementById("modemRSRP-label").style.backgroundColor = "yellow";
              document.getElementById("modemRSRQ-label").style.backgroundColor = "yellow";

              document.getElementById("mqttState-label").style.backgroundColor = "yellow";
              document.getElementById("mqttBrokerHostname-label").style.backgroundColor = "yellow";
              document.getElementById("mqttBrokerPort-label").style.backgroundColor = "yellow";
              document.getElementById("mqttUsername-label").style.backgroundColor = "yellow";
              document.getElementById("mqttTLS-label").style.backgroundColor = "yellow";
              document.getElementById("mqttTLSSecTag-label").style.backgroundColor = "yellow";
              document.getElementById("nodeName-label").style.backgroundColor = "yellow";
              document.getElementById("reportInterval-label").style.backgroundColor = "yellow";
              document.getElementById("rebootDelay-label").style.backgroundColor = "yellow";
              document.getElementById("temperature-label").style.backgroundColor = "yellow";
              document.getElementById("battery-label").style.backgroundColor = "yellow";
              document.getElementById("GNSSinterval-label").style.backgroundColor = "yellow";
              // ----------------------------------------------------------------------------

              // Disable the SHELL button
              //document.getElementById("shell_button").disabled = true;
              //document.getElementById("shell_button").style.cursor = "none";
              //document.getElementById("shell_button").style.backgroundColor = "#F37021"; // OFF state (Pulsar Orange)

              // Send next command
              sendAT("uptime", true);
              CommandSent = "uptime";
              temp_string = ""; // Reset temp string
            }
          }

          //================
          /*
          uart:~$ uptime
          Uptime: 02:05:52
          */
          //================
          // Handling "uptime" reply
          if (doc_value == "uptime") {
            if (string_check.includes("Uptime:")) {
              const uptime = string_check.match(/Uptime:\s+(?:(\d+)\.)?(\d{2}:\d{2}:\d{2})/);
              const formattedUptime = uptime ? (uptime[1] ? uptime[1] + "." : "") + uptime[2] : null;
              document.getElementById("uptime").value = formattedUptime;
              document.getElementById("uptime-label").style.backgroundColor = "white";

              // Send next command
              sendAT("modem apn", true);
              CommandSent = "modem apn";
              temp_string = ""; // Reset temp string
            }
          }

          //========================================
          /*
          uart:~$ modem apn
          APN0: "wlapn.com", IP address 10.74.30.54
          PDP Contexts Defined: 1
          */
          //========================================
          // Handling "modem apn" reply
          if (doc_value == "modem apn") {
            temp_string += string_check + "\r\n";

            // Get the APN name and IP address
            if (string_check.includes("APN")) {
              const apnMetrics = apn_parser(temp_string);
              document.getElementById("modemAPN").value = apnMetrics.apn;
              // Store the previous APN string
              prevApnstring = apnMetrics.apn;
            }

            // Last reply string
            if (string_check.includes("PDP Contexts Defined:")) {
              document.getElementById("modemAPN-label").style.backgroundColor = "white";

              await delay(1000);
              // Send next command
              sendAT("modem show", true);
              CommandSent = "modem show";
              temp_string = ""; // Reset temp string
            }
          }

          //=================================================================
          /*
          uart:~$ modem show
          Modem Manufacturer:    Nordic Semiconductor ASA
          Modem Model:           nRF9160-SICA
          Modem Revision:        mfw_nrf9160_1.3.7
          Modem DFU ID:          e7a1c54a-b07c-4512-9c3e-8ecbbfe2641d
          Modem IMEI:            358447177552586
          SIM IMSI:              234107683717334
          SIM ICCID:             8944110068455792619
          SIM MSISDN:            (none)
          Modem State:           ONLINE
          Modem State Elapsed:   02:07:42
          Modem Active Elapsed:  00:20:14
          Modem Duty Cycle %:    15.77
          Modem Radio Mode:      Dual
          Modem Cell UTC Time:   (no service since reboot)
          Modem Cell UTC Offset: (no service since reboot)
          Modem Temperature:     22 C
          Modem SIM State:       Initialization OK
          Modem SIM Operator ID: Unidentified
          Modem Operator Select: Auto
          Modem Provided DNS1:   10.4.0.240
          Modem Provided DNS2:   10.4.0.230
          Modem Provided MTU:    1500
          Modem Secondary DNS:   Not Set
          Modem Operator MCCMNC: 23410
          Modem Operator Name:
          Modem STAT:            1
          Modem ACT:             7
          Modem TAC:             C290
          Modem CI:              000FCC6E
          Modem Band:            20
          Modem RSRP:            -107 dBm
          Modem RSRQ:            -16.5 dB
          Modem PSM:             Disabled
          Modem PSM TAU req:     08:00:00
          Modem PSM Active req:  00:01:00
          Modem eDRX:            Enabled
          Modem eDRX value req:  10.24 sec
          Modem eDRX value:      Current cell not using eDRX
          Modem eDRX PTW req:    1.28 sec
          Modem eDRX PTW:        Current cell not using eDRX
          */
          //==============================================================
          // Handling "modem show" reply
          if (doc_value == "modem show") {
            temp_string += string_check + "\r\n";

            const modemMetrics = modem_parser(temp_string);

            if (string_check.includes("Modem IMEI:")) {
              document.getElementById("modemIMEI").value = modemMetrics.modemIMEI;
              document.getElementById("modemIMEI-label").style.backgroundColor = "white";
            }

            if (string_check.includes("Modem State:")) {
              document.getElementById("modemState").value = modemMetrics.modemState;
              document.getElementById("modemState-label").style.backgroundColor = "white";

              if (modemMetrics.modemState == null) {
                // Do nothing here
              } else if (modemMetrics.modemState.includes("CONNECTING") || modemMetrics.modemState.includes("OFFLINE")) {
                // Case 3: "Connecting" or "Offline"
                // Modem state is "Connecting" or "offline"
                document.getElementById("modemRadioMode").value = "";
                document.getElementById("modemRadioMode-label").style.backgroundColor = "white";

                document.getElementById("modemACT").value = "";
                document.getElementById("modemACT-label").style.backgroundColor = "white";

                document.getElementById("modemRSRP").value = "";
                document.getElementById("modemRSRP-label").style.backgroundColor = "white";

                document.getElementById("modemRSRQ").value = "";
                document.getElementById("modemRSRQ-label").style.backgroundColor = "white";
              }
            }

            if (string_check.includes("Modem Radio Mode:")) {
              if (modemMetrics.modemState.includes("ONLINE")) {
                // Show Radio Mode
                document.getElementById("modemRadioMode").value = modemMetrics.modemRadioMode;
                document.getElementById("modemRadioMode-label").style.backgroundColor = "white";
                // Store the previous selected radio mode
                prevSelectedRadioMode = modemMetrics.modemRadioMode;
              }
            }

            if (string_check.includes("Modem Operator Select:")) {
              if (modemMetrics.modemState.includes("ONLINE")) {
                // Show Operator Select
                document.getElementById("modeOperatorSelect").value = modemMetrics.modemOperatorSelect;
                document.getElementById("modeOperatorSelect-label").style.backgroundColor = "white";
                // Store the previous selected Operator
                prevOpSelect = modemMetrics.modemOperatorSelect;
              }
            }

            if (string_check.includes("Modem Operator Name:")) {
              if (modemMetrics.modemState.includes("ONLINE")) {
                if (isNaN(modemMetrics.modemOperatorName)) {
                  // Show MCCMNC container
                  document.getElementById("operator-mccmnc-container").classList.remove("hidden");
                  // Hide Operator Name container
                  document.getElementById("operator-name-container").classList.add("hidden");
                  // Set the value for MCCMNC
                  document.getElementById("modemOperatorMCCMNC").value = modemMetrics.modemOperatorMCCMNC;
                  document.getElementById("modemOperatorMCCMNC-label").style.backgroundColor = "white";
                } else {
                  // Show Operator Name container
                  document.getElementById("operator-name-container").classList.remove("hidden");
                  // Hide MCCMNC container
                  document.getElementById("operator-mccmnc-container").classList.add("hidden");
                  // Set the value for Operator Name
                  document.getElementById("modemOperatorName").value = modemMetrics.modemOperatorName;
                  document.getElementById("modemOperatorName-label").style.backgroundColor = "white";
                }
              }
            }

            if (string_check.includes("Modem ACT:")) {
              if (modemMetrics.modemState.includes("ONLINE")) {
                // Show Modem ACT
                document.getElementById("modemACT").value = modemMetrics.modemACT;
                document.getElementById("modemACT-label").style.backgroundColor = "white";
              }
            }

            if (string_check.includes("Modem RSRP:")) {
              if (modemMetrics.modemState.includes("ONLINE")) {
                // Show Modem RSRP in dBm
                document.getElementById("modemRSRP").value = modemMetrics.modemRSRP + " dBm";
                document.getElementById("modemRSRP-label").style.backgroundColor = "white";
                if (modemMetrics.modemRSRP > -90) {
                  document.getElementById("modemRSRP").style = "background-color:green"; // Excellent
                } else if (modemMetrics.modemRSRP >= -105) {
                  document.getElementById("modemRSRP").style = "background-color:yellow"; // Good
                } else if (modemMetrics.modemRSRP >= -120) {
                  document.getElementById("modemRSRP").style = "background-color:orange"; // Fair
                } else {
                  document.getElementById("modemRSRP").style = "background-color:red"; // Poor
                }
              }
            }

            if (string_check.includes("Modem RSRQ:")) {
              if (modemMetrics.modemState.includes("ONLINE")) {
                // Show Modem RSRQ in dB
                document.getElementById("modemRSRQ").value = modemMetrics.modemRSRQ + " dB";
                document.getElementById("modemRSRQ-label").style.backgroundColor = "white";
                if (modemMetrics.modemRSRQ > -9) {
                  document.getElementById("modemRSRQ").style = "background-color:green"; // Excellent
                } else if (modemMetrics.modemRSRQ >= -12) {
                  document.getElementById("modemRSRQ").style = "background-color:orange"; // Good
                } else {
                  document.getElementById("modemRSRQ").style = "background-color:red"; // Fair to Poor
                }
              }
            }

            if (string_check.includes("Modem eDRX:")) {
              if (modemMetrics.modemState.includes("ONLINE")) {
                // Show Modem eDRX
                if (modemMetrics.modemEDRX.includes("Enabled")) {
                  document.getElementById("modemeDRX").value = "factory_reset";
                } else {
                  document.getElementById("modemeDRX").value = "disable";
                }
                document.getElementById("modemeDRX-label").style.backgroundColor = "white";
                // Store the previous setting
                prevSelectedeDRX = modemMetrics.modemEDRX;
              }
            }

            // Last reply string
            if (string_check.includes("Modem eDRX PTW:")) {
              //document.getElementById("modemIMEI").value = modemMetrics.modemIMEI;
              //document.getElementById("modemState").value = modemMetrics.modemState;

              // Check the modemState
              if (modemMetrics.modemState == null) {
                // Case 1: no modem State return
                document.getElementById("modemIMEI-label").style.backgroundColor = "yellow";
                document.getElementById("modemState-label").style.backgroundColor = "yellow";
                document.getElementById("modemOperatorMCCMNC-label").style.backgroundColor = "yellow";
                document.getElementById("modemOperatorName-label").style.backgroundColor = "yellow";
                document.getElementById("modeOperatorSelect-label").style.backgroundColor = "yellow";
                document.getElementById("modemRadioMode-label").style.backgroundColor = "yellow";
                document.getElementById("modemeDRX-label").style.backgroundColor = "yellow";
                document.getElementById("modemACT-label").style.backgroundColor = "yellow";
                document.getElementById("modemRSRP-label").style.backgroundColor = "yellow";
                document.getElementById("modemRSRQ-label").style.backgroundColor = "yellow";
                document.getElementById("modemRadioMode-label").style.backgroundColor = "yellow";
                document.getElementById("modemACT-label").style.backgroundColor = "yellow";
                document.getElementById("modemRSRP-label").style.backgroundColor = "yellow";
                document.getElementById("modemRSRQ-label").style.backgroundColor = "yellow";

                // Retry "modem show" command
                await sendAT("modem show", true);
                CommandSent = "modem show";
                temp_string = ""; // Reset temp string
              } else if (!modemMetrics.modemState.includes("CONNECTING") && !modemMetrics.modemState.includes("OFFLINE")) {
                // Case 2: modemState = Online
                /*
                if (modemMetrics.modemOperatorName.includes("Modem STAT:")) {
                  // Show MCCMNC container
                  document.getElementById("operator-mccmnc-container").classList.remove("hidden");
                  // Hide Operator Name container
                  document.getElementById("operator-name-container").classList.add("hidden");
                  // Set the value for MCCMNC
                  document.getElementById("modemOperatorMCCMNC").value = modemMetrics.modemOperatorMCCMNC;
                  document.getElementById("modemOperatorMCCMNC-label").style.backgroundColor = "white";
                } else {
                  // Show Operator Name container
                  document.getElementById("operator-name-container").classList.remove("hidden");
                  // Hide MCCMNC container
                  document.getElementById("operator-mccmnc-container").classList.add("hidden");
                  // Set the value for Operator Name
                  document.getElementById("modemOperatorName").value = modemMetrics.modemOperatorName;
                  document.getElementById("modemOperatorName-label").style.backgroundColor = "white";
                }
                */
                // Send next command
                sendAT("mqtt status", true);
                CommandSent = "mqtt status";
                temp_string = ""; // Reset temp string
              } else {
                // Case 3: Modem state is "Connecting" or "Offline"
                document.getElementById("modemRadioMode").value = "";
                document.getElementById("modemRadioMode-label").style.backgroundColor = "white";

                document.getElementById("modemACT").value = "";
                document.getElementById("modemACT-label").style.backgroundColor = "white";

                document.getElementById("modemRSRP").value = "";
                document.getElementById("modemRSRP-label").style.backgroundColor = "white";

                document.getElementById("modemRSRQ").value = "";
                document.getElementById("modemRSRQ-label").style.backgroundColor = "white";
              }
            }
          }

          //==========================================================
          /*
          uart:~$ mqtt status
          MQTT State:             CONNECTED
          MQTT State Elapsed:     01:56:08
          MQTT Last Connect Time: Jun 24 07:56:21 2025
          MQTT Broker Hostname:   mosquitto.signal-fire.cloud
          MQTT Broker IP Address: 18.223.231.28
          MQTT Broker Port:       1883
          MQTT Client ID:         358447177552586
          MQTT QoS:               1
          MQTT Keepalive:         450 sec
          MQTT TLS Level:         0 - Disabled
          MQTT TLS Security Tag:  1 - Factory Certificate
          MQTT Unacked PUBLISH:   0
          MQTT Unacked SUBSCRIBE: 0
          MQTT Unacked PING:      0
          MQTT Backlog:           0
          */
          //==========================================================
          // Handling "mqtt status" reply
          if (doc_value == "mqtt status") {
            temp_string += string_check + "\r\n";

            const mqttMetrics = mqtt_parser(temp_string);

            if (string_check.includes("MQTT State:")) {
              document.getElementById("mqttState").value = mqttMetrics.mqttState;
              // Store previous state
              prevMQTTstate = mqttMetrics.mqttState;
              document.getElementById("mqttState-label").style.backgroundColor = "white";
            }

            // Last reply string
            if (string_check.includes("MQTT Backlog:")) {
              if (!temp_string.includes("MQTT State:")) {
                // If not get the MQTT State, retry this command
                document.getElementById("mqttState").value = prevMQTTstate;

                document.getElementById("mqttState-label").style.backgroundColor = "yellow";
                // Retry current command
                await sendAT("mqtt status", true);
                CommandSent = "mqtt status";
                temp_string = "";
              } else {
                // Send next command
                sendAT("mqtt credentials", true);
                CommandSent = "mqtt credentials";
                temp_string = "";
              }
            }
          }

          //=====================================================
          /* 
          // Sample Data
          uart:~$ mqtt credentials
          MQTT Broker Hostname:   mosquitto.signal-fire.cloud
          MQTT Broker Port:       1883
          MQTT Client ID:         358447177552586
          MQTT QoS:               1
          MQTT Keepalive:         450 sec (Auto)
          MQTT Username:          pulsar
          MQTT Password:          **********
          MQTT TLS Level:         0 - Disabled
          MQTT TLS Security Tag:  1 - Factory Certificate
          */
          //=======================================================
          // Handling "mqtt credentials" reply
          if (doc_value == "mqtt credentials") {
            temp_string += string_check + "\r\n";

            const mqttMetrics = mqtt_cred_parser(temp_string);

            if (string_check.includes("MQTT Broker Hostname:")) {
              document.getElementById("mqttBrokerHostname").value = mqttMetrics.mqttBrokerHostname;
              prevMQTTBrokerHostname = mqttMetrics.mqttBrokerHostname;
              document.getElementById("mqttBrokerHostname-label").style.backgroundColor = "white";
            }

            if (string_check.includes("MQTT Broker Port:")) {
              document.getElementById("mqttBrokerPort").value = mqttMetrics.mqttBrokerPort;
              prevMQTTBrokerPort = mqttMetrics.mqttBrokerPort;
              document.getElementById("mqttBrokerPort-label").style.backgroundColor = "white";
            }

            if (string_check.includes("MQTT Username:")) {
              document.getElementById("mqttUsername").value = mqttMetrics.mqttUsername;
              prevMQTTBrokerUsername = mqttMetrics.mqttUsername;
              document.getElementById("mqttUsername-label").style.backgroundColor = "white";
            }

            if (string_check.includes("MQTT TLS Level:")) {
              document.getElementById("mqttTLS").value = mqttMetrics.mqttTLSLevel;
              prevMQTTTLS = mqttMetrics.mqttTLSLevel;
              document.getElementById("mqttTLS-label").style.backgroundColor = "white";
            }

            // Last reply string
            if (string_check.includes("MQTT TLS Security Tag:")) {
              document.getElementById("mqttTLSSecTag").value = mqttMetrics.mqttTLSSecurityTag;
              prevMQTTTLSSec_tag = mqttMetrics.mqttTLSSecurityTag;
              document.getElementById("mqttTLSSecTag-label").style.backgroundColor = "white";

              // Send next command
              sendAT("node show", true);
              CommandSent = "node show";
              temp_string = "";
            }
          }

          //==================================================
          /*
          uart:~$ node show
          HW Rev:          Pulsar Unite (v2)
          HW Config:       REFLECT
          SW Rev:          v0.1.1-v2
          Node Name:       358447177552586
          Report Interval: 300 sec
          Reboot Delay:    Default
          Node Features:   0x00000000
          Subscription:    RPT60
          Temperature:     23 C
          Battery:         5.940 V
          */
          //=================================================
          // Handling "node show" reply
          if (doc_value == "node show") {
            temp_string += string_check + "\r\n";

            const nodeMetrics = node_parser(temp_string);

            if (string_check.includes("Node Name:")) {
              document.getElementById("nodeName").value = nodeMetrics.nodeName;
              prevNodeName = nodeMetrics.nodeName;
              document.getElementById("nodeName-label").style.backgroundColor = "white";
            }

            if (string_check.includes("Report Interval:")) {
              document.getElementById("reportInterval").value = nodeMetrics.reportInterval;
              prevReportInterval = nodeMetrics.reportInterval;
              document.getElementById("reportInterval-label").style.backgroundColor = "white";
            }

            if (string_check.includes("Reboot Delay:")) {
              if (nodeMetrics.rebootDelay == null) {
                nodeMetrics.rebootDelay = 0;
              }
              document.getElementById("rebootDelay").value = nodeMetrics.rebootDelay;
              prevrebootDelay = nodeMetrics.rebootDelay;
              document.getElementById("rebootDelay-label").style.backgroundColor = "white";
            }

            if (string_check.includes("Subscription:")) {
              // This extracts the minimum time for the reporting interval based on the type of subscription
              report_interval_min = nodeMetrics.subscription.match(/RPT+(\d+)$/)[1];
              document.getElementById("reportInterval").min = report_interval_min;
            }

            if (string_check.includes("Temperature:")) {
              document.getElementById("temperature").value = nodeMetrics.temperature + " °C";
              document.getElementById("temperature-label").style.backgroundColor = "white";
            }

            // Last reply string
            if (string_check.includes("Battery:")) {
              document.getElementById("battery").value = nodeMetrics.battery + " V";
              document.getElementById("battery-label").style.backgroundColor = "white";

              // Send next command
              sendAT("gnss status", true);
              CommandSent = "gnss status";
              temp_string = "";
            }
          }

          //===========================================
          /*
          GNSS Currently:            Inactive
          GNSS Priority:             Enabled
          GNSS State Elapsed:        2360 sec
          GNSS Accuracy Target:      50
          GNSS Fix Target:           10
          GNSS Max Fix Duration:     300 sec
          GNSS Last Fix Duration:    0 sec
          GNSS Auto-update disabled
          No GNSS fix in history
          */
          //===========================================
          // Handling "gnss status" reply
          if (doc_value == "gnss status") {
            temp_string += string_check + "\r\n";

            // Last reply string
            if (string_check.includes("GNSS Auto-update")) {
              document.getElementById("GNSSinterval-label").style.backgroundColor = "white";

              const autoUpdateMatch = temp_string.match(/GNSS Auto-update (disabled|interval:\s+(\d+)\s+sec)/i);
              const autoUpdateInterval = autoUpdateMatch ? (autoUpdateMatch[1] === "disabled" ? 0 : parseFloat(autoUpdateMatch[2])) : null;
              document.getElementById("GNSSinterval").value = autoUpdateInterval;
              prevgnssInterval = autoUpdateInterval;
              temp_string = "";

              // Enable the SHELL button
              //document.getElementById("shell_button").disabled = false;
              //document.getElementById("shell_button").style.cursor = "pointer";
              //document.getElementById("shell_button").style.backgroundColor = "#33B34A"; // ON state (Pulsar Green)
            }
          }
          // -----------------------------------------
        }
      }
    }
  } catch (error) {
    console.error("line 3229: Error in incomingData:", error);
    setTimeout(reload_webpage);
  }
}

async function contSensorMode_bt() {
  if (connectionType === "serial") {
    sendTX("/P239:5");
    CommandSent = "/P239:5";
  } else if (connectionType === "bluetooth") {
    await delay(1000);
    await sendAT("/P239:5");
    CommandSent = "/P239:5";
  }
}

function reload_webpage() {
  // window.location = window.location.href; //window.location.reload();
  window.location.reload(true);
}

async function onDisconnected() {
  tids_trace_reset();
  reset_params();
  document.getElementById("btn_trace").innerHTML = lang_map[8]; //'TRACE OFF';
  log(lang_map[71]); //log(" → Bluetooth connection terminated!");
  button_press = 0;
  login_stage = 0;
  isDisconnecting = 0; // completed
  isTerminated = 1;
  var elements = document.querySelectorAll("button[type=button]");
  for (var i = 0, len = elements.length; i < len; i++) document.getElementById(elements[i].id).style.background = "#F37021";
  /*The below mentioned experimental functionality currently available in Chrome 101 works fine. 
        But requires the user to enable the chrome://flags/#enable-web-bluetooth-new-permissions-backend flag.
        This functionality is ideal and it does not requires the page to reload*/
  //await device.forget();

  setTimeout(reload_webpage, 1000);
}

async function bleTDisconnect() {
  try {
    //log("login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isDisconnecting="+isDisconnecting+" button_press="+button_press);
    if (device == null) log(lang_map[73]);
    else if (device.gatt.connected) {
      device.gatt.disconnect();
      log(lang_map[72]); //log(" → Disconnected");
    } else {
      log(lang_map[73]); //log(' → Bluetooth Device is already disconnected');
    }
    var elements = document.querySelectorAll("button[type=button]");
    for (var i = 0, len = elements.length; i < len; i++) document.getElementById(elements[i].id).style.background = "#F37021";
    button_press = 0;
    login_stage = 0;
    isDisconnecting = 0; // completed

    /*The below mentioned experimental functionality currently available in Chrome 101 works fine. 
          But requires the user to enable the chrome://flags/#enable-web-bluetooth-new-permissions-backend flag.
          This functionality is ideal and it does not requires the page to reload*/
    //await device.forget();

    setTimeout(reload_webpage, 1000);
    // isTerminated=0;
    //await delay(3 * 1000);  // NOT NECESSARY
  } catch (error) {
    console.error(error);
  }
}

async function bleT1Disconnect() {
  if (login_stage >= 2) {
    sendATL("AT+PT=0"); //--> BB: commented
    await delay(3 * 1000);
    isDisconnecting = 1;
    // log("login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isDisconnecting="+isDisconnecting+" button_press="+button_press);
    bleTDisconnect(); //setTimeout(bleTDisconnect,1000);
  } else if (login_stage == 1) {
    bleTDisconnect(); //setTimeout(bleTDisconnect,1000);
  } else {
    log(lang_map[65]); //log('No device connected!');
  }
}
async function appDisconnect() {
  if (connectionType === "serial") {
    serialDisconnect();
  } else if (connectionType === "bluetooth") {
    bleDisconnect();
  }
}
async function serialDisconnect() {
  if (reader) {
    sendTX("+++");
    await reader.cancel();
    await reader.releaseLock();
    reader = null;
    // console.log("Reader cancelled and released.");
    // Reload Webpage is not working for some reason
    // setTimeout(reload_webpage, 1000);
  }
  setTimeout(reload_webpage, 1000);
  if (port) {
    await port.close();
    port = null;
    // console.log("Serial port closed.");
  }
}
async function bleDisconnect() {
  isIgnore_2 = 1;
  isDisconnecting = 2;
  //log("login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isDisconnecting="+isDisconnecting+" button_press="+button_press);

  // if(login_stage == 4){
  //   sendAT('TRACE OFF');
  // }
  // clearTimeout(echo_tid);
  // clearTimeout(datem_tid);
  tids_trace_reset();
  document.getElementById("btn_trace").innerHTML = lang_map[8]; //'TRACE OFF';
  // document.getElementById('btn_mode').innerHTML ='ADVANCED MODE';

  log(lang_map[74]); //log(" → Disconnecting");
  bleT1Disconnect(); //setTimeout(bleT1Disconnect,1000);
}

// go to the reflect manual page
async function bleExit1Page() {
  if (login_stage > 0) {
    bleDisconnect();
  }
  login_stage = 0;
  window.open("https://pulsarmeasurement.com/reflect", "_blank").focus;
}

// go to Pulsar home page
async function bleExitPage() {
  if (login_stage > 0) {
    bleDisconnect();
  }
  login_stage = 0;
  window.open("https://pulsarmeasurement.com", "_blank").focus;
}

async function bleExitPage2() {
  if (login_stage > 0) {
    bleDisconnect();
    login_stage = 0;
  }
}

/*
    sendATL commandto be used for only the AT+PT or AT+AUTH
    rest, use the sendAT command
*/
// Send an AT command to the CodeLess BLE peer
async function sendATL(cmd) {
  //log("ww"+cmd);
  //log("sendATL:: login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isTerminated="+isTerminated+" isDisconnecting="+isDisconnecting);

  if (isIgnore_2 == 1 || isDisconnecting == 2) {
    return;
  }

  if (cmd === "AT+PT=1") {
    log(lang_map[75]); //log(' → Logging ...'   );
    await delay(2 * 1000); // needed
    isIgnore = 1;
  } else if (cmd.includes("AT+AUTH=")) {
  } else if (cmd === "AT+PT=0") {
    //log(' → Connecting ...'   );
  } else if (isDisconnecting == 2) {
    log(lang_map[76]); //log(' → Disconnecting ...'   );
    isDisconnecting = 0;
  } else {
    log(lang_map[77]); //log(' → Connecting ...'   );
  }

  // Append an extra character as expected by CodeLess
  var commandToSend = cmd + "\0";
  try {
    let encoder = new TextEncoder("utf-8");
    // Send command via GATT Write request
    await inboundChar.writeValue(encoder.encode(commandToSend));
  } catch (error) {
    log(lang_map[78] + error); //log('Failed: ' + error);
  }
}

async function appConnect() {
  if (connectionType === "serial") {
    if (navigator.serial) {
      await connectToSerialPort();
    } else if (connectionType === "bluetooth") {
      await ble_connect();
    }
  } else if (connectionType === "bluetooth") {
    await ble_connect();
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectToSerialPort() {
  try {
    log(lang_map[158]);
    port = await navigator.serial.requestPort();
    const baudRate = 115200; // Set baud rate to 115200
    const bufferSize = 16384; // increased buffer size here
    await port.open({ baudRate: baudRate, bufferSize: bufferSize });
    await sendTX("");
    await delay(1000); // Delay for 2 second
    log(lang_map[159]);
    await sendTX("host tunnel");
    await delay(1000); // Delay for 1 second
    await sendTX("host tunnel");
    await delay(1000); // Delay for 1 second
    await sendTX("Reflect_fw_end");
    await delay(1000); // Delay for 1 second
    await sendTX("/DEVINFO");
    CommandSent = "/DEVINFO";
    await delay(1000); // Delay for 1 second
    noResponseTimeout = setTimeout(() => {
      log(lang_map[160]);
    }, 2000);
    await listenRX();
  } catch (err) {
    console.error("Error connecting to serial port:", err);
    log(err + "\n");
  }
}
async function sendTX(data, isHex = false) {
  //console.log("USB->" + data); // For debug only
  try {
    if (!port) {
      log(lang_map[161]);
      return;
    }

    const writer = port.writable.getWriter();
    let encodedData;

    if (isHex) {
      // Data is already a Uint8Array, no need to encode further
      encodedData = new Uint8Array(data);
      // console.log("Data sent (binary):", encodedData);
    } else {
      // Treat data as ASCII string
      let stringToSend = data;
      if (
        stringToSend !== "+++" &&
        stringToSend !== "Reflect_fw_start" &&
        stringToSend !== "Reflect_fw_end" &&
        stringToSend !== "clear_metrics" &&
        stringToSend !== "Reflect_fw_success"
      ) {
        stringToSend += "\r\n";
      }
      if (stringToSend.includes("/ACCESS:")) {
        let afterColon = stringToSend.split(":")[1];
        // Replace the actual password with a placeholder
        let obfuscatedValue = stringToSend.replace(afterColon, "****");
        log(" → " + obfuscatedValue);
      }

      // Log only if it's not one of the excluded strings
      if (
        !stringToSend.includes("GET ECHO") &&
        !stringToSend.includes("GET DATEM") &&
        !stringToSend.includes("SENDPART1") &&
        !stringToSend.includes("SENDPART2") &&
        !stringToSend.includes("SENDPART3") &&
        !stringToSend.includes("host tunnel") &&
        !stringToSend.includes("/ACCESS") &&
        !stringToSend.includes("Reflect_fw_start") &&
        !stringToSend.includes("Reflect_fw_end") &&
        !stringToSend.includes("clear_metrics") &&
        !stringToSend.includes("Reflect_fw_success") &&
        !stringToSend.includes("sleep disable") &&
        cloudModal_open == 0 &&
        // prodModal_open == 0 &&
        BootLoader_launced == 0 &&
        stringToSend !== "+++" &&
        stringToSend !== "\r\n" &&
        !(isTraceOn === 1) // && (stringToSend.includes("/P104") || stringToSend.includes("/P605")))
      ) {
        log(" → " + stringToSend);
      }

      // Encode ASCII string to send
      encodedData = new TextEncoder().encode(stringToSend);
      // console.log("Data sent (ASCII):", stringToSend);
    }

    // Write the encoded data to the port
    await writer.write(encodedData);
    writer.releaseLock();
  } catch (error) {
    console.error("line 3563: Error sending data:", error);
    log(lang_map[162]);
  }
}

// Function to toggle connection type
function toggle_connection_type() {
  if (connectionType === "serial") {
    connectionType = "bluetooth";
    document.getElementById("connectionImage").src = "img/new_bt_disconnected-cropped.svg";
    //document.querySelector('.static_image img').src = "img/tank1.png";
    document.getElementById("bt_range").style.display = "block";
    document.getElementById("reflecte_devinfo").style.display = "none";
    document.getElementById("btnopenfile").style.display = "none";
    document.getElementById("btngenfile").style.display = "none";
    document.getElementById("btnsendfile").style.display = "none";
    document.getElementById("btnbl").style.display = "none";
    document.getElementById("btncloudsetup").style.display = "none";
    document.getElementById("btnprod").style.display = "none";
    document.getElementById("cloudTunnelImg").src = "img/cloud-tunneling-off.svg";
    document.getElementById("cloudTunnelImg").style.display = "none";
    sendTX("+++");
    setTimeout(reload_webpage, 1000);
  } else if (connectionType === "bluetooth") {
    if (navigator.serial) {
      connectionType = "serial";
      document.getElementById("connectionImage").src = "img/usb-disconnected.svg";
      document.getElementById("cloudTunnelImg").src = "img/cloud-tunneling-off.svg";
      //document.querySelector('.static_image img').src = "img/Picture1.png";
      document.getElementById("bt_range").style.display = "none";
      document.getElementById("reflecte_devinfo").style.display = "block";
      document.getElementById("cloudTunnelImg").src = "img/cloud-tunneling-off.svg";
      document.getElementById("cloudTunnelImg").style.display = "block";
      setTimeout(reload_webpage, 1000);
    }
  }

  // Save the updated connection type to local storage
  localStorage.setItem("connectionType", connectionType);
}
async function ble_connect() {
  isIgnore_2 = 0;
  isDisconnecting = 0;
  isTerminated = 0;

  try {
    // Define a scan filter and prepare for interaction with Codeless Service
    log("");
    log(lang_map[79]); ////log('Requesting Bluetooth Device...');
    device = await navigator.bluetooth.requestDevice(options);
    log(lang_map[80] + device.name); ////log('Name: ' + device.name);
    deviceName = lang_map[0]; /*'REFLECT: '+ '\n' + device.name;*/
    document.getElementById("id_title").innerHTML = deviceName;
    document.getElementById("device_title").innerHTML = device.name;
    document.getElementById("deviceName-box").value = device.name;

    device.addEventListener("gattserverdisconnected", onDisconnected);
    // Connect to device GATT and perform attribute discovery
    server = await device.gatt.connect();
    const service = await server.getPrimaryService(CODELESS_SVC_UUID);
    inboundChar = await service.getCharacteristic(INBOUND_CHAR_UUID);
    outboundChar = await service.getCharacteristic(OUTBOUND_CHAR_UUID);
    const flowcontrolChar = await service.getCharacteristic(CNTRL_CHAR_UUID);
    await flowcontrolChar.startNotifications();
    flowcontrolChar.addEventListener("characteristicvaluechanged", incomingData);
    log(lang_map[81]); //log('Ready to communicate!\n');
    login_stage = 1;
    // sendATL('AT+AUTH=123321'); //--> BB: commented
    //sendATL('AT+AUTH=123654'); //--> BB: commented
    sendATL("AT+AUTH=000000"); //--> BB: commented
    button_press = 3;
  } catch (error) {
    log(lang_map[78] + error); //log('Failed: ' + error);
  }
}

// // Send an AT command to the CodeLess BLE peer
// async function sendAT(cmd) {
//   CommandSent = cmd;
//   if (cmd === "AT+PWRLVL") cmd_sent = "AT+PWRLVL";
//   else if (cmd.includes("AT+PWRLVL=")) {
//     cmd_sent = "AT+PWRLVL=";
//     new_power_lvl = parseInt(cmd.slice(cmd.lastIndexOf("=") + 1));
//   }
//   // Display the command in the log
//   if (cmd.includes("AT+SETA=")) {
//     let pwd = cmd.substring(cmd.indexOf("=") + 1);
//     let cmd1 = pwd.replace(/[0-9]/g, "*");
//     log(" → AT+SETA=" + cmd1);
//   } else if (cmd.includes("/ACCESS:")) {
//     let pwd = cmd.substring(cmd.indexOf(":") + 1);
//     let cmd1 = pwd.replace(/[0-9]/g, "*");
//     log(" → /ACCESS:" + cmd1);
//   } else if (
//     cmd != "GET ECHO" &&
//     cmd != "GET DATEM" &&
//     cmd != "SENDPART1" &&
//     cmd != "SENDPART2" &&
//     cmd != "SENDPART3" &&
//     !(isTraceOn == 1 && (cmd == "/P104" || cmd == "/P605"))
//   ) {
//     if (cmd_sent == "AT+PWRLVL" && power_init_query == 0) log(lang_map[82]); //log(' → Checking bluetooth power level');
//     else log(" → " + cmd);
//   }
//   // Append an extra character as expected by CodeLess
//   var commandToSend = cmd + "\0";
//   console.log("Sending command:", commandToSend); // Log the command being sent
//   try {
//     let encoder = new TextEncoder("utf-8");
//     // Send command via GATT Write request
//     await inboundChar.writeValue(encoder.encode(commandToSend));
//   } catch (error) {
//     log(lang_map[78] + error); //log('Failed: ' + error);
//   }
// }

// Function to send cmd to
// Input: cmd - command to send
//        IsShell - Is sending in BT Shell? [default = false]
async function sendAT(cmd, IsShell = false) {
  // If it is send in Shell, need to append "bt_shell,"
  if (IsShell == true) {
    cmd = "bt_shell," + cmd;
  }
/*
  // ----------------------------------------------------------------------
  // For debug in console only
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const milliseconds = now.getMilliseconds().toString().padStart(3, "0");
  const localTimeWithMs = `${hours}:${minutes}:${seconds}.${milliseconds}`;
  console.log(localTimeWithMs + " - BT->" + cmd);
  // -----------------------------------------------------------------------
*/
  CommandSent = cmd;
  if (cmd === "AT+PWRLVL") {
    cmd_sent = "AT+PWRLVL";
  } else if (cmd.includes("AT+PWRLVL=")) {
    cmd_sent = "AT+PWRLVL=";
    new_power_lvl = parseInt(cmd.slice(cmd.lastIndexOf("=") + 1));
  }
  // Display the command in the log
  if (cmd.includes("AT+SETA=")) {
    let pwd = cmd.substring(cmd.indexOf("=") + 1);
    let cmd1 = pwd.replace(/[0-9]/g, "*");
    log(" → AT+SETA=" + cmd1);
  } else if (cmd.includes("/ACCESS:")) {
    let pwd = cmd.substring(cmd.indexOf(":") + 1);
    let cmd1 = pwd.replace(/[0-9]/g, "*");
    log(" → /ACCESS:" + cmd1);
  } else if (
    cmd != "GET ECHO" &&
    cmd != "GET DATEM" &&
    cmd != "SENDPART1" &&
    cmd != "SENDPART2" &&
    cmd != "SENDPART3" &&
    cmd != "Reflect_fw_end" &&
    cmd != "Reflect_fw_start" &&
    cmd != "Reflect_fw_success" &&
    cmd != "clear_metrics" &&
    !BootLoader_launced &&
    !(isTraceOn == 1 && (cmd == "/P104" || cmd == "/P605"))
  ) {
    if (cmd_sent == "AT+PWRLVL" && power_init_query == 0) {
      log(lang_map[82]); //log(' → Checking bluetooth power level');
    } else {
      if (shell_open == 1 || cloudModal_open == 1) {
        // Dont log bt shell cmd in DATA LOG for cloud setting page
      } else {
        log(" → " + cmd);
      }
    }
  }

  // Append an extra character as expected by CodeLess
  var commandToSend = cmd instanceof Uint8Array ? cmd : cmd + "\0";

  // Log the command in different formats
  // if (commandToSend instanceof Uint8Array) {
  //   console.log("Sending as Uint8Array (hex):", [...commandToSend].map((b) => b.toString(16).padStart(2, "0")).join(" "));
  // } else {
  //   console.log("Data Sent (ASCII):", commandToSend);
  // }

  try {
    let encoder = new TextEncoder("utf-8");
    // Encode and send the command
    const encodedCommand = cmd instanceof Uint8Array ? cmd : encoder.encode(commandToSend);
    await inboundChar.writeValue(encodedCommand);
    // await inboundChar.writeValueWithResponse(encodedCommand);
  } catch (error) {
    log(lang_map[78] + error); // log('Failed: ' + error);
  }
}

function send_command_check() {
  tids_trace_reset();
  log(lang_map[83]); //log(' → Sending command. Please wait...');
  if (document.getElementById("cmd").value == "AT+PT=0") {
    setTimeout(ptModeOFF1, 3000);
  } else if (document.getElementById("cmd").value.startsWith("AT")) {
    setTimeout(ptModeOFF1, 3000);
    setTimeout(sendcommand, 5000);
    setTimeout(ptModeON1, 7000);
    setTimeout(restart_trace_after_send, 9000);
  } else {
    setTimeout(sendcommand, 3000);
    setTimeout(restart_trace_after_send, 5000);
  }
}
// If enter key was pressed by user while editing, send command immediately
function wasEnter(elem) {
  if (event.key == "Enter") {
    if (login_stage >= 1) {
      isIgnore = 0;

      if (document.getElementById("cmd").value == "") {
        log(lang_map[66]); //log(" → Invalid param request");
        return;
      }

      if (login_stage == 4) {
        // log(" → Press Trace OFF to get params");
        // return;
        send_command_check();
      } else if (
        login_stage == 3 &&
        document.getElementById("cmd").value.startsWith("AT") &&
        document.getElementById("cmd").value != "AT+PT=0" &&
        document.getElementById("cmd").value != "AT+PT=1"
      ) {
        setTimeout(ptModeOFF1, 1000);
        setTimeout(sendcommand, 2000);
        setTimeout(ptModeON1, 3000);
      } else {
        if (connectionType === "serial") {
          sendTX(document.getElementById("cmd").value);
          CommandSent = "";
        } else if (connectionType === "bluetooth") {
          sendAT(document.getElementById("cmd").value);
        }
        button_press = 8;
      }
    } else {
      log(lang_map[65]); //log('No device connected!');
    }
  } else if (document.getElementById("cmd").value.includes("/ACCESS:") || document.getElementById("cmd").value.includes("AT+SETA=")) {
    document.getElementById("cmd").type = "password";
  } else {
    document.getElementById("cmd").type = "text";
  }
}

function writeBTrange() {
  sendAT("AT+PWRLVL=" + new_power_lvl);
}

function writedeviceName() {
  sendAT("AT+NAME=" + document.getElementById("deviceName-box").value);
}

function writePassword() {
  sendAT("AT+SETA=" + document.getElementById("pWord-box").value);
}

function ptLModeON() {
  sendATL("AT+PT=1");
}

function ptModeON() {
  sendAT("AT+PT=1");
  settings_msg_clear();
  if (button_press == 28) {
    document.getElementById("btndeviceName").style.background = "#33B34A"; //PULSAR GREEN
    button_press = 0;
  } else if (button_press == 29) {
    document.getElementById("btnpWord").style.background = "#33B34A"; //PULSAR GREEN
    button_press = 0;
  }
}

function ptModeON1() {
  sendAT("AT+PT=1");
  button_press = 8;
}

function sendcommand() {
  if (connectionType === "serial") {
    sendTX(document.getElementById("cmd").value);
    CommandSent = "";
  } else if (connectionType === "bluetooth") {
    sendAT(document.getElementById("cmd").value);
  }
  button_press = 8;
}

function restart_trace_after_send() {
  button_press = 10;
  trace_off();
}

function ptModeOFF() {
  sendAT("AT+PT=0");
  login_stage = 2;
}

function ptModeOFF1() {
  sendAT("AT+PT=0");
  login_stage = 2;
  button_press = 8;
}

// Function to set Bluetooth password
function set_bt_pwd() {
  document.getElementById("settings-message").innerHTML = lang_map[115]; //"Setting new Bluetooth password. Please wait...";
  document.getElementById("btnpWord").style.background = "#FFCE34"; //PULSAR YELLOW
  if (login_stage >= 3 && isDisconnecting == 0) {
    setTimeout(ptModeOFF, 1000); //sendAT('AT+PT=0');
    login_stage = 2; // back to the PT mode
    //document.getElementById('btn_mode').innerHTML ='NORMAL MODE';
  }
  setTimeout(writePassword, 2000);
  setTimeout(ptModeON, 3000);
}

// Creates an impromptu dialog with input request
var recon_pwd = {
  recon_pwd0: {
    title: lang_map[135], //"RECONFIRM PASSWORD",
    modal: true,
    html:
      '<label id="recon_msg1" name="recon_msg1">' +
      lang_map[136] +
      '</label> <input type="password" id="password" name="password" autocomplete="off" value="" style="font-size: 24pt; font-weight: 500; width:220px; height:65px;"><br />' +
      '<label id="recon_msg2" name="recon_msg2" span class="emphasized">' +
      lang_map[137] +
      "</label> <br />",
    buttons: { OK: 1 },
    //position: { container: 'h1', x: 200, y: 60, height: 400, width: 1000, arrow: 'tc' },
    position: { height: 400, width: 900 },
    submit: function (e, v, m, f) {
      if (v) {
        // console.log($("#password").val()); // Value entered in the password box
        if (document.getElementById("pWord-box").value == $("#password").val())
          // Password match
          set_bt_pwd();
        else alert(lang_map[86]); //alert("Passwords do not match!");
      }
    },
  },
};

function reconfirm_password() {
  // let reconfirm_pwd = prompt('Please reconfirm the password!');
  // if(reconfirm_pwd == document.getElementById("pWord-box").value)
  //   set_bt_pwd();
  // else
  //   alert('The passwords do not match!');
  // Added jquery-impromptu plugin
  //$.prompt(recon_pwd); // Disabled due to the reinitialisation required for language parameters (lang_map[135], lang_map[136] and lang_map[137]).
  // The below method requires the html to be info to be added before the impromptu element.
  $.prompt(
    '<label id="recon_msg1" name="recon_msg1">' +
      lang_map[136] +
      '</label> <input type="password" id="password" name="password" autocomplete="off" value="" style="font-size: 24pt; font-weight: 500; width:220px; height:65px;"><br />' +
      '<label id="recon_msg2" name="recon_msg2" span class="emphasized">' +
      lang_map[137] +
      "</label> <br />",
    {
      title: lang_map[135], //"RECONFIRM PASSWORD",
      modal: true,
      // html:'<label id="recon_msg1" name="recon_msg1">' + lang_map[136] + '</label> <input type="password" id="password" name="password" autocomplete="off" value="" style="font-size: 24pt; font-weight: 500; width:220px; height:65px;"><br />' +
      //     '<label id="recon_msg2" name="recon_msg2" span class="emphasized">' + lang_map[137] + '</label> <br />',
      buttons: { OK: 1 },
      //position: { container: 'h1', x: 200, y: 60, height: 400, width: 1000, arrow: 'tc' },
      position: { height: 400, width: 900 },
      submit: function (e, v, m, f) {
        if (v) {
          // console.log($("#password").val()); // Value entered in the password box
          if (document.getElementById("pWord-box").value == $("#password").val())
            // Password match
            set_bt_pwd();
          else alert(lang_map[86]); //alert("Passwords do not match!");
        }
      },
    }
  );
}

function bluetooth_param_check() {
  if (login_stage >= 2 && isDisconnecting == 0) {
    tids_trace_reset();
    isIgnore = 0;
    var alphanumericPattern = /^[A-za-z0-9]+$/; // alphanumericPattern to poll the Input String
    switch (button_press) {
      case 28:
        if (document.getElementById("deviceName-box").value == "") {
          alert(lang_map[87]); //alert('Device Name is empty!');
          settings_msg_clear();
        } else {
          if (document.getElementById("deviceName-box").value.length > 4) {
            alert(lang_map[88]); //alert('Device Name can only have a maximum of 4 alphanumeric characters!');
            settings_msg_clear();
          } else if (!alphanumericPattern.test(document.getElementById("deviceName-box").value)) {
            alert(lang_map[145]); // alert(Please enter A-Z,a-z,0-9! Device Name can not contain special characters!)
            settings_msg_clear();
          } else {
            document.getElementById("settings-message").innerHTML = lang_map[144]; //"Setting new Bluetooth device name. Please wait...";
            document.getElementById("btndeviceName").style.background = "#FFCE34"; //PULSAR YELLOW
            if (login_stage >= 3 && isDisconnecting == 0) {
              setTimeout(ptModeOFF, 1000); //sendAT('AT+PT=0');
              login_stage = 2; // back to the PT mode
              //document.getElementById('btn_mode').innerHTML ='NORMAL MODE';
            }
            setTimeout(writedeviceName, 2000);
            setTimeout(ptModeON, 3000);
          }
        }
        break;
      case 29:
        if (document.getElementById("pWord-box").value == "") {
          alert(lang_map[89]); //alert('Password is empty');
          settings_msg_clear();
        } else {
          if (/^\d+$/.test(document.getElementById("pWord-box").value)) {
            if (document.getElementById("pWord-box").value.length > 6) {
              alert(lang_map[90]); //alert('Password can only have a maximum of 6 numeric characters!');
              settings_msg_clear();
            } else {
              reconfirm_password();
              // document.getElementById("settings-message").innerHTML = "Setting new Bluetooth password. Please wait...";
              // document.getElementById("btnpWord").style.background = '#FFCE34';   //PULSAR YELLOW
              // if((login_stage >= 3) && (isDisconnecting == 0)) {
              //   setTimeout(ptModeOFF, 1000);//sendAT('AT+PT=0');
              //   login_stage = 2; // back to the PT mode
              //   //document.getElementById('btn_mode').innerHTML ='NORMAL MODE';
              // }
              // setTimeout(writePassword, 2000);
              // setTimeout(ptModeON, 3000);
            }
          } else {
            alert(lang_map[91]); //alert('Password should only contain numeric characters!');
            settings_msg_clear();
          }
        }
        break;
      default:
        break;
    }
  } else {
    //log('No device connected!');
    alert(lang_map[65]); //alert('No device connected!');
  }
}

// If enter key was pressed by user while editing the bluetooth parameters, send command immediately
function wasEnter3(elem) {
  if (event.key == "Enter") {
    bluetooth_param_check();
  }
}

function wasEnter4(id) {
  if (event.key == "Enter") {
    volume_param(id);
  }
}

function settings_msg_clear() {
  document.getElementById("settings-message").innerHTML = "";
}

function trace_msg_clear() {
  document.getElementById("trace-message").innerHTML = "";
  document.getElementById("home-message").innerHTML = "";
}

// Check and decide the parameter recall for selected number of parameters
function param_check() {
  let list_value;
  if (login_stage >= 3 && isDisconnecting == 0) {
    tids_trace_reset();
    isIgnore = 0;
    document.getElementById("settings-message").innerHTML = lang_map[116]; //"Acquiring RADAR Parameters. Please wait...";
    switch (button_press) {
      case 19:
        document.getElementById("btnp241").style.background = "#FFCE34"; //PULSAR YELLOW
        list_value = document.getElementById("p241List").value; // Checking list value rather than list selected index
        if (list_value == 0) {
          if (connectionType === "serial") {
            sendTX("/P241");
          } else if (connectionType === "bluetooth") {
            sendAT("/P241");
          }
          document.getElementById("settings-message").innerHTML = lang_map[105]; //"Querying P241. Please wait...";
          CommandSent = "";
        } else {
          list_value--;
          if (connectionType === "serial") {
            sendTX("/P241:" + list_value.toString());
          } else if (connectionType === "bluetooth") {
            sendAT("/P241:" + list_value.toString());
          }
          document.getElementById("settings-message").innerHTML = lang_map[117]; //"Updating P241. Please wait...";
          CommandSent = "";
        }
        break;
      case 20:
        document.getElementById("btnp100").style.background = "#FFCE34"; //PULSAR YELLOW
        //if(document.getElementById("p100-box").value == "")
        list_value = document.getElementById("p100List").value;
        if (list_value == 0) {
          if (connectionType === "serial") {
            sendTX("/P100");
          } else if (connectionType === "bluetooth") {
            sendAT("/P100");
          }
          document.getElementById("settings-message").innerHTML = lang_map[106]; //"Querying P100. Please wait...";
        } else {
          //sendAT('/P100:'+ document.getElementById("p100-box").value);
          if (connectionType === "serial") {
            sendTX("/P100:" + list_value.toString());
          } else if (connectionType === "bluetooth") {
            sendAT("/P100:" + list_value.toString());
          }
          document.getElementById("settings-message").innerHTML = lang_map[118]; //"Updating P100. Please wait...";
          CommandSent = "";
        }
        //document.getElementById("p100-box").value = "";
        break;
      case 21:
        document.getElementById("btnp104").style.background = "#FFCE34"; //PULSAR YELLOW
        //if(document.getElementById("p104-box").value == "")
        list_value = document.getElementById("p104List").value;
        if (list_value == 0) {
          if (connectionType === "serial") {
            sendTX("/P104");
          } else if (connectionType === "bluetooth") {
            sendAT("/P104");
          }
          document.getElementById("settings-message").innerHTML = lang_map[107]; //"Querying P104. Please wait...";
        } else {
          //sendAT('/P104:'+ document.getElementById("p104-box").value);
          if (connectionType === "serial") {
            sendTX("/P104:" + list_value.toString());
          } else if (connectionType === "bluetooth") {
            sendAT("/P104:" + list_value.toString());
          }
          document.getElementById("settings-message").innerHTML = lang_map[119]; //"Updating P104. Please wait...";
          CommandSent = "";
          p104_param_update = 1;
        }
        //document.getElementById("p104-box").value = "";
        break;
      case 22:
        document.getElementById("btnp105").style.background = "#FFCE34"; //PULSAR YELLOW
        if (document.getElementById("p105-box").value == "") {
          if (connectionType === "serial") {
            sendTX("/P105");
          } else if (connectionType === "bluetooth") {
            sendAT("/P105");
          }
          document.getElementById("settings-message").innerHTML = lang_map[108]; //"Querying P105. Please wait...";
        } else {
          if (connectionType === "serial") {
            sendTX("/P105:" + document.getElementById("p105-box").value);
          } else if (connectionType === "bluetooth") {
            sendAT("/P105:" + document.getElementById("p105-box").value);
          }
          document.getElementById("settings-message").innerHTML = lang_map[120]; //"Updating P105. Please wait...";
          CommandSent = "";
        }
        document.getElementById("p105-box").value = "";
        break;
      case 23:
        document.getElementById("btnp106").style.background = "#FFCE34"; //PULSAR YELLOW
        if (document.getElementById("p106-box").value == "") {
          if (connectionType === "serial") {
            sendTX("/P106");
          } else if (connectionType === "bluetooth") {
            sendAT("/P106");
          }
          document.getElementById("settings-message").innerHTML = lang_map[109]; //"Querying P106. Please wait...";
        } else {
          if (connectionType === "serial") {
            sendTX("/P106:" + document.getElementById("p106-box").value);
          } else if (connectionType === "bluetooth") {
            sendAT("/P106:" + document.getElementById("p106-box").value);
          }
          document.getElementById("settings-message").innerHTML = lang_map[121]; //"Updating P106. Please wait...";
          CommandSent = "";
        }
        document.getElementById("p106-box").value = "";
        break;
      case 24:
        document.getElementById("btnp808").style.background = "#FFCE34"; //PULSAR YELLOW
        //if(document.getElementById("p808-box").value == "")
        list_value = document.getElementById("p808List").value;
        if (list_value == 0) {
          if (connectionType === "serial") {
            sendTX("/P808");
          } else if (connectionType === "bluetooth") {
            sendAT("/P808");
          }
          document.getElementById("settings-message").innerHTML = lang_map[110]; //"Querying P808. Please wait...";
        } else {
          //sendAT('/P808:'+ document.getElementById("p808-box").value);
          if (connectionType === "serial") {
            sendTX("/P808:" + list_value.toString());
          } else if (connectionType === "bluetooth") {
            sendAT("/P808:" + list_value.toString());
          }
          document.getElementById("settings-message").innerHTML = lang_map[122]; //"Updating P808. Please wait...";
          CommandSent = "";
        }
        //document.getElementById("p808-box").value = "";
        break;
      case 25:
        document.getElementById("btnp605").style.background = "#FFCE34"; //PULSAR YELLOW
        //if(document.getElementById("p605-box").value == "")
        list_value = document.getElementById("p605List").value;
        if (list_value == 0) {
          if (connectionType === "serial") {
            sendTX("/P605");
          } else if (connectionType === "bluetooth") {
            sendAT("/P605");
          }
          document.getElementById("settings-message").innerHTML = lang_map[111]; //"Querying P605. Please wait...";
        } else {
          //sendAT('/P605:'+ document.getElementById("p605-box").value);
          list_value--;
          if (connectionType === "serial") {
            sendTX("/P605:" + list_value.toString());
          } else if (connectionType === "bluetooth") {
            sendAT("/P605:" + list_value.toString());
          }
          document.getElementById("settings-message").innerHTML = lang_map[123]; //"Updating P605. Please wait...";
          CommandSent = "";
        }
        //document.getElementById("p605-box").value = "";
        break;
      case 26:
        document.getElementById("btnp21").style.background = "#FFCE34"; //PULSAR YELLOW
        if (document.getElementById("p21-box").value == "") {
          if (connectionType === "serial") {
            sendTX("/P21");
          } else if (connectionType === "bluetooth") {
            sendAT("/P21");
          }
          document.getElementById("settings-message").innerHTML = lang_map[112]; //"Querying P21. Please wait...";
        } else {
          if (connectionType === "serial") {
            sendTX("/P21:" + document.getElementById("p21-box").value);
          } else if (connectionType === "bluetooth") {
            sendAT("/P21:" + document.getElementById("p21-box").value);
          }
          document.getElementById("settings-message").innerHTML = lang_map[124]; //"Updating P21. Please wait...";
          CommandSent = "";
        }
        document.getElementById("p21-box").value = "";
        break;
      default:
        break;
    }
  } else {
    //log('Device not in Normal mode!');
    alert(lang_map[64]); //alert('Device not in Normal mode!');
  }
}

// If enter key was pressed by user while editing the parameters, send command immediately
function wasEnter2(elem) {
  if (event.key == "Enter") {
    param_check();
  }
}

function log_2(text) {
  //log("log:: login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isDisconnecting="+isDisconnecting);

  var textarea = document.getElementById("log");
  if (textarea.value == "") textarea.value = text;
  else textarea.value += "\n" + text;
  textarea.scrollTop = textarea.scrollHeight;
}

// Display text in log field text area
function log(text) {
  // log_2("log:: login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isDisconnecting="+isDisconnecting+" isTerminated="+isTerminated);
  // log_2("");
  if (isIgnore_2 == 1 || isDisconnecting == 1 || isDisconnecting == 2 || isTerminated == 1) {
    if (isIgnore_2 == 1) isIgnore_2 = 0;
    // if(isTerminated==1) isTerminated=0;
    //log_2("log::size "+sizeof(text));
    // if(sizeof(text) > 100)  return;
  }

  var textarea = document.getElementById("log");
  if (textarea.value == "") textarea.value = text;
  else textarea.value += "\n" + text;
  textarea.scrollTop = textarea.scrollHeight;
}

// Clears text in log field text area
function clearlog() {
  var textarea = document.getElementById("log");
  textarea.value = "";
  textarea.scrollTop = textarea.scrollHeight;
}

function page_lang_switch() {
  var textarea1 = document.getElementById("data-log");
  textarea1.value = "";
  textarea1 = document.getElementById("data-log_t");
  textarea1.value = "";
  document.getElementById("id_title").innerHTML = lang_map[0];
  document.getElementById("id_home").innerHTML = lang_map[1];
  document.getElementById("id_trace").innerHTML = lang_map[2];
  document.getElementById("id_parameters").innerHTML = lang_map[3];
  document.getElementById("id_volume").innerHTML = lang_map[165];
  document.getElementById("id_advanced").innerHTML = lang_map[166];
  document.getElementById("btnScan").innerHTML = lang_map[4];
  document.getElementById("btnEnd").innerHTML = lang_map[5];
  document.getElementById("data-log-label").innerHTML = lang_map[11];
  document.getElementById("parameters-label").innerHTML = lang_map[12];
  document.getElementById("level-label").innerHTML = lang_map[13];
  document.getElementById("distance-label").innerHTML = lang_map[14];
  document.getElementById("status-label").innerHTML = lang_map[15];
  document.getElementById("command-box-label").innerHTML = lang_map[16];
  document.getElementsByName("command-box")[0].placeholder = lang_map[103];
  document.getElementById("btnSend").innerHTML = lang_map[6];
  // document.getElementById("btnClear").innerHTML = lang_map[7];
  document.getElementById("lang_select").innerHTML = lang_map[138];
  document.getElementsByName("lang_select_dropdown")[0].options[0].innerHTML = lang_map[139];
  document.getElementsByName("lang_select_dropdown")[0].options[1].innerHTML = lang_map[140];
  document.getElementsByName("lang_select_dropdown")[0].options[2].innerHTML = lang_map[141];
  document.getElementById("btn_trace").innerHTML = lang_map[8];
  document.getElementById("parameters-label-t").innerHTML = lang_map[12];
  document.getElementById("level-label-t").innerHTML = lang_map[13];
  document.getElementById("distance-label-t").innerHTML = lang_map[14];
  document.getElementById("status-label-t").innerHTML = lang_map[15];
  document.getElementById("btndeviceName").innerHTML = lang_map[10];
  document.getElementById("btnpWord").innerHTML = lang_map[10];
  document.getElementById("btnp241").innerHTML = lang_map[10];
  document.getElementById("btnp100").innerHTML = lang_map[10];
  document.getElementById("btnp104").innerHTML = lang_map[10];
  document.getElementById("btnp105").innerHTML = lang_map[10];
  document.getElementById("btnp106").innerHTML = lang_map[10];
  document.getElementById("btnp808").innerHTML = lang_map[10];
  document.getElementById("bluetooth-parameters-label").innerHTML = lang_map[17];
  document.getElementById("bt-range-label1").innerHTML = lang_map[18];
  document.getElementById("deviceName").innerHTML = lang_map[19];
  document.getElementById("pWord").innerHTML = lang_map[20];
  document.getElementById("btnp21").innerHTML = lang_map[10];
  document.getElementById("radar-parameters-label").innerHTML = lang_map[21];
  document.getElementById("p241").innerHTML = lang_map[22];
  document.getElementById("p100").innerHTML = lang_map[23];
  document.getElementById("p104").innerHTML = lang_map[24];
  document.getElementById("p105").innerHTML = lang_map[25];
  document.getElementById("p106").innerHTML = lang_map[26];
  document.getElementById("p808").innerHTML = lang_map[27];
  document.getElementById("p605").innerHTML = lang_map[28];
  document.getElementById("p21").innerHTML = lang_map[29];
  document.getElementsByName("p241dropdown")[0].options[0].innerHTML = lang_map[30];
  document.getElementsByName("p241dropdown")[0].options[1].innerHTML = lang_map[31];
  document.getElementsByName("p241dropdown")[0].options[2].innerHTML = lang_map[32];
  document.getElementsByName("p241dropdown")[0].options[3].innerHTML = lang_map[33];
  // document.getElementsByName('p241dropdown')[0].options[4].innerHTML = lang.p241_dropdown_4;
  document.getElementsByName("p241dropdown")[0].options[4].innerHTML = lang_map[34];
  document.getElementsByName("p241dropdown")[0].options[5].innerHTML = lang_map[35];
  // document.getElementsByName('p241dropdown')[0].options[7].innerHTML = lang.p241_dropdown_7;
  document.getElementsByName("p241dropdown")[0].options[6].innerHTML = lang_map[36];
  document.getElementsByName("p100dropdown")[0].options[0].innerHTML = lang_map[37];
  document.getElementsByName("p100dropdown")[0].options[1].innerHTML = lang_map[38];
  document.getElementsByName("p100dropdown")[0].options[2].innerHTML = lang_map[39];
  document.getElementsByName("p100dropdown")[0].options[3].innerHTML = lang_map[40];
  document.getElementsByName("p100dropdown")[0].options[4].innerHTML = lang_map[41];
  document.getElementsByName("p104dropdown")[0].options[0].innerHTML = lang_map[42];
  document.getElementsByName("p104dropdown")[0].options[1].innerHTML = lang_map[43];
  document.getElementsByName("p104dropdown")[0].options[2].innerHTML = lang_map[44];
  document.getElementsByName("p104dropdown")[0].options[3].innerHTML = lang_map[45];
  document.getElementsByName("p104dropdown")[0].options[4].innerHTML = lang_map[46];
  document.getElementsByName("p104dropdown")[0].options[5].innerHTML = lang_map[47];
  document.getElementsByName("p808dropdown")[0].options[0].innerHTML = lang_map[48];
  document.getElementsByName("p808dropdown")[0].options[1].innerHTML = lang_map[49];
  document.getElementsByName("p808dropdown")[0].options[2].innerHTML = lang_map[50];
  document.getElementsByName("p808dropdown")[0].options[3].innerHTML = lang_map[51];
  document.getElementsByName("p808dropdown")[0].options[4].innerHTML = lang_map[52];
  document.getElementsByName("p808dropdown")[0].options[5].innerHTML = lang_map[53];
  document.getElementsByName("p605dropdown")[0].options[0].innerHTML = lang_map[54];
  document.getElementsByName("p605dropdown")[0].options[1].innerHTML = lang_map[55];
  document.getElementsByName("p605dropdown")[0].options[2].innerHTML = lang_map[56];
  document.getElementsByName("p605dropdown")[0].options[3].innerHTML = lang_map[57];
  document.getElementsByName("p605dropdown")[0].options[4].innerHTML = lang_map[58];
  document.getElementsByName("p605dropdown")[0].options[5].innerHTML = lang_map[59];
  document.getElementsByName("p605dropdown")[0].options[6].innerHTML = lang_map[60];
  document.getElementsByName("p605dropdown")[0].options[7].innerHTML = lang_map[61];
  document.getElementsByName("p605dropdown")[0].options[8].innerHTML = lang_map[62];
  document.getElementsByName("p605dropdown")[0].options[9].innerHTML = lang_map[63];
  document.getElementById("log").value = lang_map[84];
  document.getElementsByName("pswbox")[0].placeholder = lang_map[142];
  document.getElementById("connectionImage").title = lang_map[149];
  document.getElementById("tabsetup").innerHTML = lang_map[167];
  document.getElementById("tabpoints0_8").innerHTML = lang_map[168];
  document.getElementById("tabpoints9_16").innerHTML = lang_map[169];
  document.getElementById("volume-parameters-label").innerHTML = lang_map[205];
  document.getElementById("p600").innerHTML = lang_map[170];
  document.getElementById("p601").innerHTML = lang_map[184];
  document.getElementById("p602").innerHTML = lang_map[185];
  document.getElementById("p603").innerHTML = lang_map[186];
  document.getElementById("p606").innerHTML = lang_map[187];
  document.getElementById("p604").innerHTML = lang_map[188];
  document.getElementById("p607").innerHTML = lang_map[189];
  document.getElementById("p697").innerHTML = lang_map[190];
  document.getElementsByName("p600dropdown")[0].options[0].innerHTML = lang_map[206];
  document.getElementsByName("p600dropdown")[0].options[1].innerHTML = lang_map[171];
  document.getElementsByName("p600dropdown")[0].options[2].innerHTML = lang_map[172];
  document.getElementsByName("p600dropdown")[0].options[3].innerHTML = lang_map[173];
  document.getElementsByName("p600dropdown")[0].options[4].innerHTML = lang_map[174];
  document.getElementsByName("p600dropdown")[0].options[5].innerHTML = lang_map[175];
  document.getElementsByName("p600dropdown")[0].options[6].innerHTML = lang_map[176];
  document.getElementsByName("p600dropdown")[0].options[7].innerHTML = lang_map[177];
  document.getElementsByName("p600dropdown")[0].options[8].innerHTML = lang_map[178];
  document.getElementsByName("p600dropdown")[0].options[9].innerHTML = lang_map[179];
  document.getElementsByName("p600dropdown")[0].options[10].innerHTML = lang_map[180];
  document.getElementsByName("p600dropdown")[0].options[11].innerHTML = lang_map[181];
  document.getElementsByName("p600dropdown")[0].options[12].innerHTML = lang_map[182];
  document.getElementsByName("p600dropdown")[0].options[13].innerHTML = lang_map[183];
  document.getElementById("btnsetvolume").innerHTML = lang_map[191];
  document.getElementById("vol1-parameters-label").innerHTML = lang_map[192];
  document.getElementById("p610").innerHTML = lang_map[13].replace(":", "") + " 1";
  document.getElementById("p611").innerHTML = lang_map[165] + " 1";
  document.getElementById("p612").innerHTML = lang_map[13].replace(":", "") + " 2";
  document.getElementById("p613").innerHTML = lang_map[165] + " 2";
  document.getElementById("p614").innerHTML = lang_map[13].replace(":", "") + " 3";
  document.getElementById("p615").innerHTML = lang_map[165] + " 3";
  document.getElementById("p616").innerHTML = lang_map[13].replace(":", "") + " 4";
  document.getElementById("p617").innerHTML = lang_map[165] + " 4";
  document.getElementById("p618").innerHTML = lang_map[13].replace(":", "") + " 5";
  document.getElementById("p619").innerHTML = lang_map[165] + " 5";
  document.getElementById("p620").innerHTML = lang_map[13].replace(":", "") + " 6";
  document.getElementById("p621").innerHTML = lang_map[165] + " 6";
  document.getElementById("p622").innerHTML = lang_map[13].replace(":", "") + " 7";
  document.getElementById("p623").innerHTML = lang_map[165] + " 7";
  document.getElementById("p624").innerHTML = lang_map[13].replace(":", "") + " 8";
  document.getElementById("p625").innerHTML = lang_map[165] + " 8";
  document.getElementById("vol2-parameters-label").innerHTML = lang_map[193];
  document.getElementById("p626").innerHTML = lang_map[13].replace(":", "") + " 9";
  document.getElementById("p627").innerHTML = lang_map[165] + " 9";
  document.getElementById("p628").innerHTML = lang_map[13].replace(":", "") + " 10";
  document.getElementById("p629").innerHTML = lang_map[165] + " 10";
  document.getElementById("p630").innerHTML = lang_map[13].replace(":", "") + " 11";
  document.getElementById("p631").innerHTML = lang_map[165] + " 11";
  document.getElementById("p632").innerHTML = lang_map[13].replace(":", "") + " 12";
  document.getElementById("p633").innerHTML = lang_map[165] + " 12";
  document.getElementById("p634").innerHTML = lang_map[13].replace(":", "") + " 13";
  document.getElementById("p635").innerHTML = lang_map[165] + " 13";
  document.getElementById("p636").innerHTML = lang_map[13].replace(":", "") + " 14";
  document.getElementById("p637").innerHTML = lang_map[165] + " 14";
  document.getElementById("p638").innerHTML = lang_map[13].replace(":", "") + " 15";
  document.getElementById("p639").innerHTML = lang_map[165] + " 15";
  document.getElementById("p640").innerHTML = lang_map[13].replace(":", "") + " 16";
  document.getElementById("p641").innerHTML = lang_map[165] + " 16";
  document.getElementById("btnsetvolumevalues").innerHTML = lang_map[194];
  document.getElementById("btnresetbreakpoints").innerHTML = lang_map[195];
  document.getElementById("reflecte_devinfo-label").innerHTML = lang_map[196];
  document.getElementById("deviceInfo").innerHTML = lang_map[197];
  document.getElementById("reflecte_fwversion").innerHTML = lang_map[198];
  document.getElementById("reflecte_access").innerHTML = lang_map[199];
  // document.getElementById("unite_info").innerHTML = lang_map[200];
  document.getElementById("btnopenfile").innerHTML = lang_map[201];
  document.getElementById("btngenfile").innerHTML = lang_map[202];
  document.getElementById("btnsendfile").innerHTML = lang_map[203];
  document.getElementById("btnprod").innerHTML = lang_map[204];

  document.getElementById("btnbl").innerHTML = lang_map[207] + "⇑";
  document.getElementById("btncloudsetup").innerHTML = lang_map[208] + "⚙";
  document.getElementById("UploadFirmwareFile").innerHTML = lang_map[209];
  document.getElementById("blstart_button").innerHTML = lang_map[210];
  document.getElementById("hex_fwversion").innerHTML = lang_map[211];
  document.getElementById("hex_size").innerHTML = lang_map[212];
  document.getElementById("FirmwareProgress").innerHTML = lang_map[213];
  document.getElementById("showLogs_button").innerHTML = lang_map[214];
  document.getElementById("LiveData_prod").innerHTML = lang_map[215];
  document.getElementById("upTime-label").innerHTML = lang_map[216];
  document.getElementById("coreTemp-label").innerHTML = lang_map[217];
  document.getElementById("coreMin-label").innerHTML = lang_map[218];
  document.getElementById("coreMax-label").innerHTML = lang_map[219];
  document.getElementById("avgSig-label").innerHTML = lang_map[220];
  document.getElementById("capSupply-label").innerHTML = lang_map[221];
  document.getElementById("AccelerometerSettings_prod").innerHTML = lang_map[222];
  document.getElementById("Calibrate_prod").innerHTML = lang_map[223];
  document.getElementById("calStat-label").innerHTML = lang_map[224];
  document.getElementById("tiltEnable-label").innerHTML = lang_map[225];
  document.getElementById("xMid-label").innerHTML = lang_map[226];
  document.getElementById("xAxis-label").innerHTML = lang_map[227];
  document.getElementById("yMid-label").innerHTML = lang_map[228];
  document.getElementById("yAxis-label").innerHTML = lang_map[229];
  document.getElementById("zMid-label").innerHTML = lang_map[230];
  document.getElementById("zAxis-label").innerHTML = lang_map[231];
  document.getElementById("TransducerSettings_prod").innerHTML = lang_map[232];
  document.getElementById("transducerTemp-label").innerHTML = lang_map[233];
  document.getElementById("transducerType-label").innerHTML = lang_map[234];
  document.getElementById("measurementUnits-label").innerHTML = lang_map[235];
  document.getElementById("ResetUnit_prod").innerHTML = lang_map[236];
  document.getElementById("resetUnit-button").innerHTML = lang_map[236];
  document.getElementById("Distributor_prod").innerHTML = lang_map[237];
  document.getElementById("getDistributor-label").innerHTML = lang_map[237];
  document.getElementById("setDistributor-label").innerHTML = lang_map[237];
  document.getElementById("DefaultUnit_prod").innerHTML = lang_map[238];
  document.getElementById("defaultUnit_button").innerHTML = lang_map[238];
  document.getElementById("SerialNumber_prod").innerHTML = lang_map[239];
  document.getElementById("serialNumber-label").innerHTML = lang_map[239];
  document.getElementById("setTransducerTemp-button").innerHTML = lang_map[240];
  document.getElementById("getTransducerTemp-button").innerHTML = lang_map[241];
  document.getElementById("setTransducerType-button").innerHTML = lang_map[240];
  document.getElementById("getTransducerType-button").innerHTML = lang_map[241];
  document.getElementById("setMeasurementUnits-label").innerHTML = lang_map[240];
  document.getElementById("getMeasurementUnits-label").innerHTML = lang_map[241];
  document.getElementById("setdistSelect-button").innerHTML = lang_map[240];
  document.getElementById("getdistSelect-button").innerHTML = lang_map[241];
  document.getElementById("setSerialNumber-label").innerHTML = lang_map[240];
  document.getElementById("getSerialNumber-label").innerHTML = lang_map[241];
  document.getElementById("saveProdSettings-button").innerHTML = lang_map[242];
  document.getElementById("ProductionSetup_label").innerHTML = lang_map[243];
  document.getElementById("SystemSetup_unite").innerHTML = lang_map[244];
  document.getElementById("uptime-label").innerHTML = lang_map[245] + ":";
  document.getElementById("ModemStatus_unite").innerHTML = lang_map[246];
  document.getElementById("modemIMEI-label").innerHTML = lang_map[247] + ":";
  document.getElementById("modemState-label").innerHTML = lang_map[248] + ":";
  document.getElementById("modeOperatorSelect-label").innerHTML = lang_map[249] + ":";
  document.getElementById("modemRadioMode-label").innerHTML = lang_map[250] + ":";
  document.getElementById("modemeDRX-label").innerHTML = lang_map[251] + ":";
  document.getElementById("modemOperatorName-label").innerHTML = lang_map[252] + ":";
  document.getElementById("modemAPN-label").innerHTML = lang_map[253] + ":";
  document.getElementById("modemACT-label").innerHTML = lang_map[254] + ":";
  document.getElementById("modemRSRP-label").innerHTML = lang_map[255] + ":";
  document.getElementById("modemRSRQ-label").innerHTML = lang_map[256] + ":";
  document.getElementById("MQTTStatus_unite").innerHTML = lang_map[257];
  document.getElementById("mqttState-label").innerHTML = lang_map[258] + ":";
  document.getElementById("mqttBrokerHostname-label").innerHTML = lang_map[259] + ":";
  document.getElementById("mqttBrokerPort-label").innerHTML = lang_map[260] + ":";
  document.getElementById("mqttUsername-label").innerHTML = lang_map[261] + ":";
  document.getElementById("mqttTLS-label").innerHTML = lang_map[262] + ":";
  document.getElementById("mqttTLSSecTag-label").innerHTML = lang_map[263] + ":";
  document.getElementById("mqttPassword-label").innerHTML = lang_map[264] + ":";
  document.getElementById("NodeSettings_unite").innerHTML = lang_map[265];
  document.getElementById("nodeName-label").innerHTML = lang_map[266] + ":";
  document.getElementById("reportInterval-label").innerHTML = lang_map[267] + ":";
  document.getElementById("rebootDelay-label").innerHTML = lang_map[268] + ":";
  document.getElementById("temperature-label").innerHTML = lang_map[269] + ":";
  document.getElementById("battery-label").innerHTML = lang_map[270] + ":";
  document.getElementById("GNSSSettings_unite").innerHTML = lang_map[271];
  document.getElementById("GNSSinterval-label").innerHTML = lang_map[272] + ":";
  document.getElementById("saveSettings_unite").innerHTML = lang_map[273];
  document.getElementById("SendingCommands_label").innerHTML = lang_map[276];
  document.getElementById("SendingCommandsBar_label").innerHTML = lang_map[276];
  document.getElementById("failed_label").innerHTML = lang_map[277] + " ❌";
  document.getElementById("Successful_label").innerHTML = lang_map[278] + " ✔";
  document.getElementById("SystemUptime_unite").innerHTML = lang_map[280];
  document.getElementById("modemOperatorMCCMNC-label").innerHTML = lang_map[281];
  document.getElementById("UpdateFirmware_head").innerHTML = lang_map[207] + " ⇑";
  // label titles
  document.getElementById("modeOperatorSelect-label").title = lang_map[300];
  document.getElementById("modemAPN-label").title = lang_map[299];
  document.getElementById("mqttTLS-label").title = lang_map[297];
  document.getElementById("mqttTLSSecTag-label").title = lang_map[298];
  document.getElementById("nodeName-label").title = lang_map[293];
  document.getElementById("reportInterval-label").title = lang_map[294];
  document.getElementById("rebootDelay-label").title = lang_map[295];
  document.getElementById("GNSSinterval-label").title = lang_map[296];
  document.getElementById("modemACT-label").title = lang_map[301];
  document.getElementById("modemRSRP-label").title = lang_map[302];
  document.getElementById("modemRSRQ-label").title = lang_map[303];
  document.getElementById("modemOperatorMCCMNC-label").title = lang_map[304];
  document.getElementById("battery-label").title = lang_map[305];
  clearlog();
  save_curr_lang();
}

addLanguageScript = function (lang) {
  var head = document.getElementsByTagName("head")[0],
    script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "js/lang." + lang + ".js";
  head.appendChild(script);
};

function save_curr_lang() {
  localStorage.setItem("lang_select_List", document.getElementById("lang_select_List").value);
  // console.log(document.getElementById('lang_select_List').value);
}

function lang_switch() {
  let list_value;
  var scriptTag;
  var head;
  var script;
  var el = document.createElement("script");
  list_value = document.getElementById("lang_select_List").value; // Checking list value rather than list selected index
  if (list_value == 1) {
    // $("script[src='js/lang.de.js']").remove();
    // addLanguageScript('en');

    // alert("English");

    // scriptTag = document.createElement('script');
    // scriptTag.setAttribute('src','js/lang.en.js');
    // document.head.appendChild(scriptTag);

    // head= document.getElementsByTagName('head')[0];
    // script= document.createElement('script');
    // script.src= 'js/lang.en.js';
    // head.appendChild(script);

    // el.src = "js/lang.en.js";
    // document.body.appendChild(el);

    el.setAttribute("src", "js/lang.en.js");
    document.head.appendChild(el);

    page_lang_switch();
    //alert(list_value);
  } else if (list_value == 2) {
    // $("script[src='js/lang.en.js']").remove();
    // addLanguageScript('de');

    // alert("German");

    // scriptTag = document.createElement('script');
    // scriptTag.setAttribute('src','js/lang.de.js');
    // document.head.appendChild(scriptTag);

    // head= document.getElementsByTagName('head')[0];
    // script= document.createElement('script');
    // script.src= 'js/lang.de.js';
    // head.appendChild(script);

    // el.src = "js/lang.de.js";
    // document.body.appendChild(el);

    el.setAttribute("src", "js/lang.de.js");
    document.head.appendChild(el);

    page_lang_switch();
    //alert(list_value);
  }
}

function lang_array_switch() {
  let list_value;
  list_value = document.getElementById("lang_select_List").value; // Checking list value rather than list selected index
  if (list_value == 2) lang_map = lang_array.map((a) => a.German);
  // Default selection
  else lang_map = lang_array.map((a) => a.English);
  page_lang_switch();
  // console.log(lang_map[1]);
}
function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  let os = "Unknown OS";
  if (userAgent.indexOf("Win") != -1) os = "Windows";
  if (userAgent.indexOf("Mac") != -1) os = "MacOS";
  if (userAgent.indexOf("X11") != -1) os = "UNIX";
  if (userAgent.indexOf("Linux") != -1) os = "Linux";
  const browser = navigator.userAgent;
  deviceInfo = `OS: ${os}, Browser: ${browser}`;
  //alert(deviceInfo);
}
function showLoadingScreen() {
  document.getElementById("loadingModal").style.display = "block";
  circular_responseTimeout = setTimeout(() => {
    hideLoadingScreen_fail();
  }, 30000); // previous value was 10 seconds
}
function showLoadingScreen_bar(startValue, endValue) {
  currentProgress = startValue;
  targetProgress = endValue;
  totalSteps = targetProgress - currentProgress;
  document.getElementById("loadingModal_bar").style.display = "block";
  bar_responseTimeout = setTimeout(() => {
    hideLoadingScreen_fail();
  }, 10000); // previous value was 10 seconds
  document.querySelector(".progress-bar-fill").style.width = "0%";
}
function updateProgress() {
  // Calculate the percentage complete based on the dynamic range
  // var timeperstep;
  currentProgress++;
  const percentComplete = ((currentProgress - (targetProgress - totalSteps)) / totalSteps) * 100;

  // Update the progress bar width
  document.querySelector(".progress-bar-fill").style.width = `${percentComplete}%`;

  // Estimate the remaining time based on current rate
  // const remainingSteps = targetProgress - currentProgress;
  // if (connectionType === "serial") {
  //   timeperstep = 1.6;
  // } else if (connectionType === "bluetooth") {
  //   timeperstep = 2.5;
  // }
  // const estimatedTimeLeft = (remainingSteps * timeperstep).toFixed(0); // Estimated time left in seconds

  // Update the timer display
  // document.getElementById("timer").textContent = estimatedTimeLeft;
}
async function hideLoadingScreen_succesful() {
  clearTimeout(circular_responseTimeout);
  clearTimeout(bar_responseTimeout);
  document.getElementById("loadingModal").style.display = "none";
  document.getElementById("loadingModal_bar").style.display = "none";
  document.getElementById("loadingModal_success").style.display = "block";
  await delay(1000);
  document.getElementById("loadingModal_success").style.display = "none";
  currentProgress = 0;
}
async function hideLoadingScreen_fail() {
  clearTimeout(circular_responseTimeout);
  clearTimeout(bar_responseTimeout);
  document.getElementById("loadingModal").style.display = "none";
  document.getElementById("loadingModal_bar").style.display = "none";
  document.getElementById("loadingModal_fail").style.display = "block";
  await delay(1000);
  document.getElementById("loadingModal_fail").style.display = "none";
  currentProgress = 0;
}
function checkSerialSupport() {
  if (!("serial" in navigator)) {
    //document.getElementById("connectionImage").style.visibility = "hidden";
    //document.getElementById("connectionImage").style.visibility = "hidden";
    //var tab = document.querySelector('.accordion-item[data-actab-group="0"][data-actab-id="1"]');
    //tab.style.display = 'none';
    document.getElementById("connectionImage").style.cursor = "default"; //set the toggle button to be default cursor
    document.getElementById("connectionImage").onmouseover = "default";
    document.getElementById("connectionImage").onmouseleave = "default";
    document.getElementById("connectionImage").title = "";
    // alert(lang_map[163]);
  }
}

document.addEventListener("DOMContentLoaded", function () //this is what happens as soon as the page loads
{
  getDeviceInfo();
  checkSerialSupport();
  document.getElementById("tableContainer").style.display = "none";
  document.getElementById("btnprod").style.display = "none";
  connectionType = localStorage.getItem("connectionType");
  if ("serial" in navigator && connectionType === "serial") {
    document.getElementById("connectionImage").src = "img/usb-disconnected.svg";
    document.getElementById("connectionImage").style.display = "block";
    document.getElementById("cloudTunnelImg").src = "img/cloud-tunneling-off.svg";
    document.getElementById("cloudTunnelImg").style.display = "block";
    document.getElementById("bt_range").style.display = "none";
    document.getElementById("reflecte_devinfo").style.display = "block";
  } else {
    connectionType = "bluetooth";
    document.getElementById("connectionImage").src = "img/new_bt_disconnected-cropped.svg";
    document.getElementById("connectionImage").style.display = "block";
    document.getElementById("bt_range").style.display = "block";
    document.getElementById("reflecte_devinfo").style.display = "none";
    document.getElementById("btnprod").style.display = "none";
    document.getElementById("btncloudsetup").style.display = "none";
    document.getElementById("btnopenfile").style.display = "none";
    document.getElementById("btnsendfile").style.display = "none";
    document.getElementById("btngenfile").style.display = "none";
    document.getElementById("btnbl").style.display = "none";
    document.getElementById("cloudTunnelImg").style.display = "none";
  }
});

function myLoadFunction() {
  var textarea = document.getElementById("log");
  textarea.value = lang_map[84];
}

function search(ele) {
  if (event.key === "Enter") {
    //alert(ele.value);
    event.preventDefault();
    document.getElementById("btnLogin").click();
  }
}

function openForm() {
  document.getElementById("myForm").style.display = "block";
}

function sendLoginCmd() {
  //alert("sendLoginCmd"+'AT+AUTH='+document.getElementById("pswbox").value);
  sendATL("AT+AUTH=" + document.getElementById("pswbox").value);
}
function closeForm2() {
  document.getElementById("lblpsw").innerHTML = "";
  document.getElementById("lblpsw").style.color = "black";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}
function updateState(cur_state) {
  // log(cur_state);
  presysState = sysState;
  sysState = cur_state;
}

currentlang = localStorage.getItem("lang_select_List");
if (currentlang == 2) lang_map = lang_array.map((a) => a.German);
// Default selection
else lang_map = lang_array.map((a) => a.English);

document.getElementById("id_home").innerHTML = lang_map[1];
document.getElementById("id_trace").innerHTML = lang_map[2];
document.getElementById("id_parameters").innerHTML = lang_map[3];
document.getElementById("id_volume").innerHTML = lang_map[165];
document.getElementById("id_advanced").innerHTML = lang_map[166];
document.getElementById("btnScan").innerHTML = lang_map[4];
document.getElementById("btnEnd").innerHTML = lang_map[5];
document.getElementById("data-log-label").innerHTML = lang_map[11];
document.getElementById("parameters-label").innerHTML = lang_map[12];
document.getElementById("level-label").innerHTML = lang_map[13];
document.getElementById("distance-label").innerHTML = lang_map[14];
document.getElementById("status-label").innerHTML = lang_map[15];
document.getElementById("command-box-label").innerHTML = lang_map[16];
document.getElementsByName("command-box")[0].placeholder = lang_map[103];
document.getElementById("btnSend").innerHTML = lang_map[6];
// document.getElementById("btnClear").innerHTML = lang_map[7];
document.getElementById("lang_select").innerHTML = lang_map[138];
document.getElementsByName("lang_select_dropdown")[0].options[0].innerHTML = lang_map[139];
document.getElementsByName("lang_select_dropdown")[0].options[1].innerHTML = lang_map[140];
document.getElementsByName("lang_select_dropdown")[0].options[2].innerHTML = lang_map[141];
if (currentlang != null) document.getElementById("lang_select_List").value = currentlang;

// X points/labels
var xdata = [];
var pts = 0.5; //0.036;//7.2/200;
xdata[0] = 0.0;
for (let i = 1; i <= 200; i++) {
  xdata[i] = Math.round((xdata[i - 1] + 0.036) * 1000) / 1000;
}
// Zooming out does not work if labels are numbers
for (let i = 0; i <= 200; i++) {
  xdata[i] = xdata[i].toString();
}

// Echo variables
var echo = [];

// Datem variables
var datem = [];
for (let i = 0; i < 200; i++) {
  echo[i] = 0;
  datem[i] = 0;
}
// setup block
var data = {
  labels: xdata,
  datasets: [
    {
      type: "line",
      label: "DATEM", // Datem array
      data: datem,
      radius: 1,
      pointRadius: 1,
      borderWidth: 2,
      backgroundColor: "rgba(75, 119, 190, 1)",
      borderColor: "rgba(75, 119, 190, 1)",
    },
    {
      type: "line",
      label: "Echo", // Echo array
      data: echo,
      radius: 1,
      pointRadius: 1,
      borderWidth: 2,
      backgroundColor: "rgba(255, 0, 0, 1)",
      borderColor: "rgba(255, 0, 0, 1)",
    },
  ],
};

// arbitraryLine Plugin
var arbitraryLine = {
  // Fills near & far blanking areas, Plots Distance, gate start and stop. Shows dynamic variables
  id: "arbitraryLine",
  beforeDraw(chart, args, options) {
    const ctx = chart.canvas.getContext("2d");
    var {
      ctr,
      chartArea: { top, right, bottom, left, width, height },
      scales: { x, y },
    } = chart;
    ctx.save();
    //alert("Near = " + near_blanking_var + ", Far = " + far_blanking_dist + ", Empty = " + empty_distance + ", Compensated = " + compensated_var + ", Mode = " + mode_var);
    ctx.fillStyle = "yellow";
    //ctx.fillRect(x.getPixelForValue(0), top, near_blanking_var*width/compensated_var, height); // Near blanking area (x.getPixelForValue(0), top, 0.3*width/7.2, height)
    start_point = Math.max(x.getPixelForValue(0), left);
    //width_val = Math.max(x.getPixelForValue((near_blanking_var * width) / compensated_var), left) - start_point;

    // Show Near blanking area from left to P107
    width_val = Math.max(x.getPixelForValue((near_blanking_var * 200) / compensated_var), left) - start_point;
    ctx.fillRect(start_point, top, width_val, height); // Near blanking area

    //console.log(start_point + ", " + near_blanking_var*width/compensated_var + ", " + width_val);

    ctx.fillStyle = "#EFFFE8";
    //ctx.fillRect(x.getPixelForValue((200.0/1.2)*(empty_distance - span_val)/mode_var), top, span_val*width/compensated_var, height); // Span
    //start_point = Math.max(x.getPixelForValue(((200.0 / ((100.0 + far_blanking_var) / 100.0)) * (empty_distance - span_val)) / mode_var), left);
    //width_val = Math.max(x.getPixelForValue(((200.0 / ((100.0 + far_blanking_var) / 100.0)) * empty_distance) / mode_var), left) - start_point;

    // Show Span area from Empty distance back to near blanking or P106
    if (span_val > empty_distance - near_blanking_var) {
      // Case 1:
      // If SPAN value is greater than the measuring region.
      // From Near blanking (P107) to Empty distance (P105)
      start_point = Math.max(x.getPixelForValue((near_blanking_var * 200) / compensated_var), left);
    } else {
      // Case 2:
      // If SPAN value is smaller than or equal to the measuring region.
      // On the Trace, it will show a white region between near blanking and span.
      // Calculate from (Empty distance (P105) - SPAN (P106)) to Empty distance (P105)
      start_point = Math.max(x.getPixelForValue(((empty_distance - span_val) * 200) / compensated_var), left);
    }
    width_val = Math.max(x.getPixelForValue((empty_distance * 200) / compensated_var), left) - start_point;
    ctx.fillRect(start_point, top, width_val, height); // Span

    ctx.fillStyle = "yellow";
    //start_point = Math.max(x.getPixelForValue(((200.0 / ((100.0 + far_blanking_var) / 100.0)) * empty_distance) / mode_var), left);
    //width_val = Math.max(x.getPixelForValue(((200.0 / ((100.0 + far_blanking_var) / 100.0)) * far_blanking_dist) / mode_var), left) - start_point;

    // Show Far blanking area from Empty distance (P105) to Far blanking % (P108)
    start_point = Math.max(x.getPixelForValue((empty_distance * 200) / compensated_var), left);
    width_val = Math.max(x.getPixelForValue((((empty_distance * (100 + far_blanking_var)) / 100) * 200) / compensated_var), left) - start_point;
    ctx.fillRect(start_point, top, width_val, height); // Far blanking area

    if (Math.max(x.getPixelForValue((distance_var * 200) / compensated_var), left) <= x.getPixelForValue((distance_var * 200) / compensated_var)) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(x.getPixelForValue((distance_var * 200) / compensated_var), top, 0, height); // Distance//(x0, y0, x1, y1); (x.getPixelForValue(distance_var*200/7.2), top, 0, height)
    }
    if (Math.max(x.getPixelForValue(gate_start / 5), left) <= x.getPixelForValue(gate_start / 5)) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(x.getPixelForValue(gate_start / 5), top, 0, height); // Gate start (x.getPixelForValue((distance_var - 0.20)*200/7.2), top, 0, height)
    }
    if (Math.max(x.getPixelForValue(gate_stop / 5), left) <= x.getPixelForValue(gate_stop / 5)) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(x.getPixelForValue(gate_stop / 5), top, 0, height); // Gate stop (x.getPixelForValue((distance_var + 0.20)*200/7.2), top, 0, height)
    }
    data_log_update();
    ctx.restore();
  },
};

const plugin = {
  // For white background plot
  id: "custom_canvas_background_color",
  beforeDraw: (chart) => {
    const ctx = chart.canvas.getContext("2d");
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "White"; //'Transparent';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

var valtest = Math.round((0.5 * 200) / compensated_var_m); //7.2);
var rounding;

// config block
var config = {
  type: "line",
  data: data,
  options: {
    plugins: {
      legend: {
        labels: {
          // This more specific font property overrides the global property
          font: {
            size: 24,
          },
        },
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
            mode: "xy",
          },
          pinch: {
            enabled: true,
            mode: "xy",
          },
          drag: {
            enabled: true,
            mode: "y",
          },
          // mode: "x",
          speed: 0.1,
          threshold: 10,
          sensitivity: 3,
        },
        pan: {
          enabled: true,
          mode: "xy",
        },
        limits: {
          y: { minRange: 200, min: 0, max: 1000 /*, minRange: 100*/ },
          x: { minRange: 20, min: 0, max: xdata.length /*, minRange: 1000*/ },
        },
      },
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        //type: 'linear',
        title: {
          display: true,
          text: p104_units, //'mtrs',
          font: {
            size: 24,
          },
        },
        grid: {},
        ticks: {
          maxTicksLimit: xdata.length,
          // For a category axis, the val is the index so the lookup via getLabelForValue is needed
          callback: function (val, index) {
            // Hide the label of every 14th dataset
            rounding = Math.round(this.getLabelForValue(val) * 100) / 100; // Rounded precision
            if (index == 0) return index % valtest === 0 ? rounding.toFixed(1) : undefined;
            else return (index + 1) % valtest === 0 ? rounding.toFixed(1) : undefined; // Shows rounded value in Xaxis aling with gridline,
          }, // undefined don't shows gridlines
          maxRotation: 90, // Rotate the tick labels to show horizontally
          font: {
            size: 24,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "mV",
          font: {
            size: 24,
          },
        },
        max: 1000,
        min: 0,
        ticks: {
          callback: function (value) {
            // if (Math.floor(value) === value) {
            //   return value
            // }
            return Math.floor(value);
          },
          stepSize: 100,
          font: {
            size: 24,
          },
        },
        beginAtZero: true,
      },
    },
  },
  plugins: [plugin, arbitraryLine], // Uses both plugins
};

var myChart = new Chart(document.getElementById("myChart"), config);
document.getElementById("btn_trace").innerHTML = lang_map[8];
document.getElementById("parameters-label-t").innerHTML = lang_map[12];
document.getElementById("level-label-t").innerHTML = lang_map[13];
document.getElementById("distance-label-t").innerHTML = lang_map[14];
document.getElementById("status-label-t").innerHTML = lang_map[15];
document.getElementById("btndeviceName").innerHTML = lang_map[10];
document.getElementById("btnpWord").innerHTML = lang_map[10];
document.getElementById("btnp241").innerHTML = lang_map[10];
document.getElementById("btnp100").innerHTML = lang_map[10];
document.getElementById("btnp104").innerHTML = lang_map[10];
document.getElementById("btnp105").innerHTML = lang_map[10];
document.getElementById("btnp106").innerHTML = lang_map[10];
document.getElementById("btnp808").innerHTML = lang_map[10];
//document.getElementById("btnp605").innerHTML = lang_map[10];
document.getElementById("btnp21").innerHTML = lang_map[10];
document.getElementById("bluetooth-parameters-label").innerHTML = lang_map[17];
document.getElementById("bt-range-label1").innerHTML = lang_map[18];
document.getElementById("deviceName").innerHTML = lang_map[19];
document.getElementById("pWord").innerHTML = lang_map[20];
document.getElementById("radar-parameters-label").innerHTML = lang_map[21];
document.getElementById("p241").innerHTML = lang_map[22];
document.getElementById("p100").innerHTML = lang_map[23];
document.getElementById("p104").innerHTML = lang_map[24];
document.getElementById("p105").innerHTML = lang_map[25];
document.getElementById("p106").innerHTML = lang_map[26];
document.getElementById("p808").innerHTML = lang_map[27];
document.getElementById("p605").innerHTML = lang_map[28];
document.getElementById("p21").innerHTML = lang_map[29];
document.getElementsByName("p241dropdown")[0].options[0].innerHTML = lang_map[30];
document.getElementsByName("p241dropdown")[0].options[1].innerHTML = lang_map[31];
document.getElementsByName("p241dropdown")[0].options[2].innerHTML = lang_map[32];
document.getElementsByName("p241dropdown")[0].options[3].innerHTML = lang_map[33];
document.getElementsByName("p241dropdown")[0].options[4].innerHTML = lang_map[34];
document.getElementsByName("p241dropdown")[0].options[5].innerHTML = lang_map[35];
document.getElementsByName("p241dropdown")[0].options[6].innerHTML = lang_map[36];
document.getElementsByName("p100dropdown")[0].options[0].innerHTML = lang_map[37];
document.getElementsByName("p100dropdown")[0].options[1].innerHTML = lang_map[38];
document.getElementsByName("p100dropdown")[0].options[2].innerHTML = lang_map[39];
document.getElementsByName("p100dropdown")[0].options[3].innerHTML = lang_map[40];
document.getElementsByName("p100dropdown")[0].options[4].innerHTML = lang_map[41];
document.getElementsByName("p104dropdown")[0].options[0].innerHTML = lang_map[42];
document.getElementsByName("p104dropdown")[0].options[1].innerHTML = lang_map[43];
document.getElementsByName("p104dropdown")[0].options[2].innerHTML = lang_map[44];
document.getElementsByName("p104dropdown")[0].options[3].innerHTML = lang_map[45];
document.getElementsByName("p104dropdown")[0].options[4].innerHTML = lang_map[46];
document.getElementsByName("p104dropdown")[0].options[5].innerHTML = lang_map[47];
document.getElementsByName("p808dropdown")[0].options[0].innerHTML = lang_map[48];
document.getElementsByName("p808dropdown")[0].options[1].innerHTML = lang_map[49];
document.getElementsByName("p808dropdown")[0].options[2].innerHTML = lang_map[50];
document.getElementsByName("p808dropdown")[0].options[3].innerHTML = lang_map[51];
document.getElementsByName("p808dropdown")[0].options[4].innerHTML = lang_map[52];
document.getElementsByName("p808dropdown")[0].options[5].innerHTML = lang_map[53];
document.getElementsByName("p605dropdown")[0].options[0].innerHTML = lang_map[54];
document.getElementsByName("p605dropdown")[0].options[1].innerHTML = lang_map[55];
document.getElementsByName("p605dropdown")[0].options[2].innerHTML = lang_map[56];
document.getElementsByName("p605dropdown")[0].options[3].innerHTML = lang_map[57];
document.getElementsByName("p605dropdown")[0].options[4].innerHTML = lang_map[58];
document.getElementsByName("p605dropdown")[0].options[5].innerHTML = lang_map[59];
document.getElementsByName("p605dropdown")[0].options[6].innerHTML = lang_map[60];
document.getElementsByName("p605dropdown")[0].options[7].innerHTML = lang_map[61];
document.getElementsByName("p605dropdown")[0].options[8].innerHTML = lang_map[62];
document.getElementsByName("p605dropdown")[0].options[9].innerHTML = lang_map[63];
document.getElementById("connectionImage").title = lang_map[149];
document.getElementById("tabsetup").innerHTML = lang_map[167];
document.getElementById("tabpoints0_8").innerHTML = lang_map[168];
document.getElementById("tabpoints9_16").innerHTML = lang_map[169];
document.getElementById("volume-parameters-label").innerHTML = lang_map[205];
document.getElementById("p600").innerHTML = lang_map[170];
document.getElementById("p601").innerHTML = lang_map[184];
document.getElementById("p602").innerHTML = lang_map[185];
document.getElementById("p603").innerHTML = lang_map[186];
document.getElementById("p606").innerHTML = lang_map[187];
document.getElementById("p604").innerHTML = lang_map[188];
document.getElementById("p607").innerHTML = lang_map[189];
document.getElementById("p697").innerHTML = lang_map[190];
document.getElementsByName("p600dropdown")[0].options[0].innerHTML = lang_map[206];
document.getElementsByName("p600dropdown")[0].options[1].innerHTML = lang_map[171];
document.getElementsByName("p600dropdown")[0].options[2].innerHTML = lang_map[172];
document.getElementsByName("p600dropdown")[0].options[3].innerHTML = lang_map[173];
document.getElementsByName("p600dropdown")[0].options[4].innerHTML = lang_map[174];
document.getElementsByName("p600dropdown")[0].options[5].innerHTML = lang_map[175];
document.getElementsByName("p600dropdown")[0].options[6].innerHTML = lang_map[176];
document.getElementsByName("p600dropdown")[0].options[7].innerHTML = lang_map[177];
document.getElementsByName("p600dropdown")[0].options[8].innerHTML = lang_map[178];
document.getElementsByName("p600dropdown")[0].options[9].innerHTML = lang_map[179];
document.getElementsByName("p600dropdown")[0].options[10].innerHTML = lang_map[180];
document.getElementsByName("p600dropdown")[0].options[11].innerHTML = lang_map[181];
document.getElementsByName("p600dropdown")[0].options[12].innerHTML = lang_map[182];
document.getElementsByName("p600dropdown")[0].options[13].innerHTML = lang_map[183];
document.getElementById("btnsetvolume").innerHTML = lang_map[191];
document.getElementById("vol1-parameters-label").innerHTML = lang_map[192];
document.getElementById("p610").innerHTML = lang_map[13].replace(":", "") + " 1";
document.getElementById("p611").innerHTML = lang_map[165] + " 1";
document.getElementById("p612").innerHTML = lang_map[13].replace(":", "") + " 2";
document.getElementById("p613").innerHTML = lang_map[165] + " 2";
document.getElementById("p614").innerHTML = lang_map[13].replace(":", "") + " 3";
document.getElementById("p615").innerHTML = lang_map[165] + " 3";
document.getElementById("p616").innerHTML = lang_map[13].replace(":", "") + " 4";
document.getElementById("p617").innerHTML = lang_map[165] + " 4";
document.getElementById("p618").innerHTML = lang_map[13].replace(":", "") + " 5";
document.getElementById("p619").innerHTML = lang_map[165] + " 5";
document.getElementById("p620").innerHTML = lang_map[13].replace(":", "") + " 6";
document.getElementById("p621").innerHTML = lang_map[165] + " 6";
document.getElementById("p622").innerHTML = lang_map[13].replace(":", "") + " 7";
document.getElementById("p623").innerHTML = lang_map[165] + " 7";
document.getElementById("p624").innerHTML = lang_map[13].replace(":", "") + " 8";
document.getElementById("p625").innerHTML = lang_map[165] + " 8";
document.getElementById("vol2-parameters-label").innerHTML = lang_map[193];
document.getElementById("p626").innerHTML = lang_map[13].replace(":", "") + " 9";
document.getElementById("p627").innerHTML = lang_map[165] + " 9";
document.getElementById("p628").innerHTML = lang_map[13].replace(":", "") + " 10";
document.getElementById("p629").innerHTML = lang_map[165] + " 10";
document.getElementById("p630").innerHTML = lang_map[13].replace(":", "") + " 11";
document.getElementById("p631").innerHTML = lang_map[165] + " 11";
document.getElementById("p632").innerHTML = lang_map[13].replace(":", "") + " 12";
document.getElementById("p633").innerHTML = lang_map[165] + " 12";
document.getElementById("p634").innerHTML = lang_map[13].replace(":", "") + " 13";
document.getElementById("p635").innerHTML = lang_map[165] + " 13";
document.getElementById("p636").innerHTML = lang_map[13].replace(":", "") + " 14";
document.getElementById("p637").innerHTML = lang_map[165] + " 14";
document.getElementById("p638").innerHTML = lang_map[13].replace(":", "") + " 15";
document.getElementById("p639").innerHTML = lang_map[165] + " 15";
document.getElementById("p640").innerHTML = lang_map[13].replace(":", "") + " 16";
document.getElementById("p641").innerHTML = lang_map[165] + " 16";
document.getElementById("btnsetvolumevalues").innerHTML = lang_map[194];
document.getElementById("btnresetbreakpoints").innerHTML = lang_map[195];
document.getElementById("reflecte_devinfo-label").innerHTML = lang_map[196];
document.getElementById("deviceInfo").innerHTML = lang_map[197];
document.getElementById("reflecte_fwversion").innerHTML = lang_map[198];
document.getElementById("reflecte_access").innerHTML = lang_map[199];
// document.getElementById("unite_info").innerHTML = lang_map[200];
document.getElementById("btnopenfile").innerHTML = lang_map[201];
document.getElementById("btngenfile").innerHTML = lang_map[202];
document.getElementById("btnsendfile").innerHTML = lang_map[203];
document.getElementById("btnprod").innerHTML = lang_map[204];

document.getElementById("btnbl").innerHTML = lang_map[207] + "⇑";
document.getElementById("btncloudsetup").innerHTML = lang_map[208] + "⚙";
document.getElementById("UploadFirmwareFile").innerHTML = lang_map[209];
document.getElementById("blstart_button").innerHTML = lang_map[210];
document.getElementById("hex_fwversion").innerHTML = lang_map[211];
document.getElementById("hex_size").innerHTML = lang_map[212];
document.getElementById("FirmwareProgress").innerHTML = lang_map[213];
document.getElementById("showLogs_button").innerHTML = lang_map[214];
document.getElementById("LiveData_prod").innerHTML = lang_map[215];
document.getElementById("upTime-label").innerHTML = lang_map[216];
document.getElementById("coreTemp-label").innerHTML = lang_map[217];
document.getElementById("coreMin-label").innerHTML = lang_map[218];
document.getElementById("coreMax-label").innerHTML = lang_map[219];
document.getElementById("avgSig-label").innerHTML = lang_map[220];
document.getElementById("capSupply-label").innerHTML = lang_map[221];
document.getElementById("AccelerometerSettings_prod").innerHTML = lang_map[222];
document.getElementById("Calibrate_prod").innerHTML = lang_map[223];
document.getElementById("calStat-label").innerHTML = lang_map[224];
document.getElementById("tiltEnable-label").innerHTML = lang_map[225];
document.getElementById("xMid-label").innerHTML = lang_map[226];
document.getElementById("xAxis-label").innerHTML = lang_map[227];
document.getElementById("yMid-label").innerHTML = lang_map[228];
document.getElementById("yAxis-label").innerHTML = lang_map[229];
document.getElementById("zMid-label").innerHTML = lang_map[230];
document.getElementById("zAxis-label").innerHTML = lang_map[231];
document.getElementById("TransducerSettings_prod").innerHTML = lang_map[232];
document.getElementById("transducerTemp-label").innerHTML = lang_map[233];
document.getElementById("transducerType-label").innerHTML = lang_map[234];
document.getElementById("measurementUnits-label").innerHTML = lang_map[235];
document.getElementById("ResetUnit_prod").innerHTML = lang_map[236];
document.getElementById("resetUnit-button").innerHTML = lang_map[236];
document.getElementById("Distributor_prod").innerHTML = lang_map[237];
document.getElementById("getDistributor-label").innerHTML = lang_map[237];
document.getElementById("setDistributor-label").innerHTML = lang_map[237];
document.getElementById("DefaultUnit_prod").innerHTML = lang_map[238];
document.getElementById("defaultUnit_button").innerHTML = lang_map[238];
document.getElementById("SerialNumber_prod").innerHTML = lang_map[239];
document.getElementById("serialNumber-label").innerHTML = lang_map[239];
document.getElementById("setTransducerTemp-button").innerHTML = lang_map[240];
document.getElementById("getTransducerTemp-button").innerHTML = lang_map[241];
document.getElementById("setTransducerType-button").innerHTML = lang_map[240];
document.getElementById("getTransducerType-button").innerHTML = lang_map[241];
document.getElementById("setMeasurementUnits-label").innerHTML = lang_map[240];
document.getElementById("getMeasurementUnits-label").innerHTML = lang_map[241];
document.getElementById("setdistSelect-button").innerHTML = lang_map[240];
document.getElementById("getdistSelect-button").innerHTML = lang_map[241];
document.getElementById("setSerialNumber-label").innerHTML = lang_map[240];
document.getElementById("getSerialNumber-label").innerHTML = lang_map[241];
document.getElementById("saveProdSettings-button").innerHTML = lang_map[242];
document.getElementById("ProductionSetup_label").innerHTML = lang_map[243];
document.getElementById("SystemSetup_unite").innerHTML = lang_map[244];
document.getElementById("uptime-label").innerHTML = lang_map[245] + ":";
document.getElementById("ModemStatus_unite").innerHTML = lang_map[246];
document.getElementById("modemIMEI-label").innerHTML = lang_map[247] + ":";
document.getElementById("modemState-label").innerHTML = lang_map[248] + ":";
document.getElementById("modeOperatorSelect-label").innerHTML = lang_map[249] + ":";
document.getElementById("modemRadioMode-label").innerHTML = lang_map[250] + ":";
document.getElementById("modemeDRX-label").innerHTML = lang_map[251] + ":";
document.getElementById("modemOperatorName-label").innerHTML = lang_map[252] + ":";
document.getElementById("modemAPN-label").innerHTML = lang_map[253] + ":";
document.getElementById("modemACT-label").innerHTML = lang_map[254] + ":";
document.getElementById("modemRSRP-label").innerHTML = lang_map[255] + ":";
document.getElementById("modemRSRQ-label").innerHTML = lang_map[256] + ":";
document.getElementById("MQTTStatus_unite").innerHTML = lang_map[257];
document.getElementById("mqttState-label").innerHTML = lang_map[258] + ":";
document.getElementById("mqttBrokerHostname-label").innerHTML = lang_map[259] + ":";
document.getElementById("mqttBrokerPort-label").innerHTML = lang_map[260] + ":";
document.getElementById("mqttUsername-label").innerHTML = lang_map[261] + ":";
document.getElementById("mqttTLS-label").innerHTML = lang_map[262] + ":";
document.getElementById("mqttTLSSecTag-label").innerHTML = lang_map[263] + ":";
document.getElementById("mqttPassword-label").innerHTML = lang_map[264] + ":";
document.getElementById("NodeSettings_unite").innerHTML = lang_map[265];
document.getElementById("nodeName-label").innerHTML = lang_map[266] + ":";
document.getElementById("reportInterval-label").innerHTML = lang_map[267] + ":";
document.getElementById("rebootDelay-label").innerHTML = lang_map[268] + ":";
document.getElementById("temperature-label").innerHTML = lang_map[269] + ":";
document.getElementById("battery-label").innerHTML = lang_map[270] + ":";
document.getElementById("GNSSSettings_unite").innerHTML = lang_map[271];
document.getElementById("GNSSinterval-label").innerHTML = lang_map[272] + ":";
document.getElementById("saveSettings_unite").innerHTML = lang_map[273];
document.getElementById("SendingCommands_label").innerHTML = lang_map[276];
document.getElementById("SendingCommandsBar_label").innerHTML = lang_map[276];
document.getElementById("failed_label").innerHTML = lang_map[277] + " ❌";
document.getElementById("Successful_label").innerHTML = lang_map[278] + " ✔";
document.getElementById("SystemUptime_unite").innerHTML = lang_map[280];
document.getElementById("modemOperatorMCCMNC-label").innerHTML = lang_map[281];
document.getElementById("UpdateFirmware_head").innerHTML = lang_map[207] + " ⇑";

// label titles
document.getElementById("modeOperatorSelect-label").title = lang_map[300];
document.getElementById("modemAPN-label").title = lang_map[299];
document.getElementById("mqttTLS-label").title = lang_map[297];
document.getElementById("mqttTLSSecTag-label").title = lang_map[298];
document.getElementById("nodeName-label").title = lang_map[293];
document.getElementById("reportInterval-label").title = lang_map[294];
document.getElementById("rebootDelay-label").title = lang_map[295];
document.getElementById("GNSSinterval-label").title = lang_map[296];
document.getElementById("modemACT-label").title = lang_map[301];
document.getElementById("modemRSRP-label").title = lang_map[302];
document.getElementById("modemRSRQ-label").title = lang_map[303];
document.getElementById("modemOperatorMCCMNC-label").title = lang_map[304];
document.getElementById("battery-label").title = lang_map[305];

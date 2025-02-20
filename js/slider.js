var range_el = document.querySelector("input");
var power_lvl = 0;
var new_power_lvl = 0;

function update_range(val) {
  if (val > 0 && val <= 4) {
    // 3m  // Previous check was up to 3 for 3m
    document.getElementById("rangevalue1").innerHTML = "4m";
    document.getElementById("myRange").value = 8;
  } else if (val > 4 && val <= 5) {
    // 5m // Previous check was between 3 and 5
    document.getElementById("rangevalue1").innerHTML = "5m";
    document.getElementById("myRange").value = 13;
  } else if (val > 5 && val <= 6) {
    // 10m
    document.getElementById("rangevalue1").innerHTML = "10m";
    document.getElementById("myRange").value = 25;
  } else if (val > 6 && val <= 8) {
    // 20
    document.getElementById("rangevalue1").innerHTML = "20m";
    document.getElementById("myRange").value = 50;
  } else if (val > 8 && val <= 10) {
    // 30m
    document.getElementById("rangevalue1").innerHTML = "30m";
    document.getElementById("myRange").value = 75;
  } else {
    document.getElementById("rangevalue1").innerHTML = "40m";
    document.getElementById("myRange").value = 100;
  }
  cmd_sent = "";
  power_lvl = val;
  power_init_query = 1;
}

function testtest(e) {
  // document.getElementById("rangevalue1").innerHTML= e;
  // set the progress bar at the certain %
  if (e > 0 && e <= 8) {
    // 3m
    // send the PWRLVL - 3;
    new_power_lvl = 4; // Previous value was 3 for 30m
    document.getElementById("rangevalue1").innerHTML = "4m";
  } else if (e > 8 && e <= 13) {
    // 5m
    // send the PWRLVL - 5;
    new_power_lvl = 5;
    document.getElementById("rangevalue1").innerHTML = "5m";
  } else if (e > 13 && e <= 25) {
    // 10m
    // send the PWRLVL - 6;
    new_power_lvl = 6;
    document.getElementById("rangevalue1").innerHTML = "10m";
  } else if (e > 25 && e <= 50) {
    // 20
    // send the PWRLVL - 8;
    new_power_lvl = 8;
    document.getElementById("rangevalue1").innerHTML = "20m";
  } else if (e > 50 && e <= 75) {
    // 30m
    // send the PWRLVL - 10;
    new_power_lvl = 10;
    document.getElementById("rangevalue1").innerHTML = "30m";
  } else {
    // send the PWRLVL - 12;
    new_power_lvl = 12;
    document.getElementById("rangevalue1").innerHTML = "40m";
  }
  if (login_stage >= 2 && isDisconnecting == 0) {
    tids_trace_reset();
    isIgnore = 0;
    document.getElementById("settings-message").innerHTML = lang_map[143]; //"Setting new Bluetooth range. Please wait...";
    if (login_stage >= 3 && isDisconnecting == 0) {
      setTimeout(ptModeOFF, 1000); //sendAT('AT+PT=0');
      login_stage = 2; // back to the PT mode
      //document.getElementById('btn_mode').innerHTML ='NORMAL MODE';
    }
    setTimeout(writeBTrange, 2000);
    setTimeout(ptModeON, 3000);
  }
}

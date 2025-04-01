let batteryModalopen = 0;
let sensorAlwaysOn = false;
function openBatteryModal() {
  document.getElementById("modal_batt").style.display = "block";
  document.getElementById("modalOverlaybatt").style.display = "block";
  batteryModalopen = 1;
}
function closeBatteryModal() {
  document.getElementById("modal_batt").style.display = "none";
  document.getElementById("modalOverlaybatt").style.display = "none";
  batteryModalopen = 0;
}
function calculateBatt() {
  let CellType = document.getElementById("CellType").value;
  let modemRadioMode_batt = document.getElementById("modemRadioMode_batt").value;
  let reportInterval_batt = document.getElementById("reportInterval_batt").value;
  let SensorSampleInterval = document.getElementById("SensorSampleInterval").value;
  let GPSUpdateInterval = document.getElementById("GPSUpdateInterval").value;
  let AvgSensorCurrent = document.getElementById("AvgSensorCurrent").value;
  let BattEst = document.getElementById("BattEst").value;
  let AvgCurrent = document.getElementById("AvgCurrent").value;
  let SensorOnTime;
  if (sensorAlwaysOn) {
    SensorOnTime = -1;
  } else {
    SensorOnTime = document.getElementById("SensorOnTime").value;
  }

  alert(
    `Cell Type: ${CellType}\n` +
      `Modem Radio Mode: ${modemRadioMode_batt}\n` +
      `Report Interval: ${reportInterval_batt}\n` +
      `Sensor Sample Interval: ${SensorSampleInterval}\n` +
      `Sensor On Time: ${SensorOnTime}\n` +
      `GPS Update Interval: ${GPSUpdateInterval}\n` +
      `Average Sensor Current: ${AvgSensorCurrent}\n` +
      `Battery Estimate: ${BattEst}\n` +
      `Average Current: ${AvgCurrent}`
  );
}

document.getElementById("SensorOnTime-checkbox").addEventListener("change", function () {
  if (this.checked) {
    document.getElementById("SensorOnTime").readOnly = true;
    sensorAlwaysOn = true;
  } else {
    document.getElementById("SensorOnTime").readOnly = false;
    sensorAlwaysOn = false;
  }
});

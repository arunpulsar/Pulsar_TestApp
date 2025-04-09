let isCloudTunnel = 0;
let universalTXTimeoutInterval = 10000;
function openCloudTunnelSettings() {
  document.getElementById("modal_cloudTunnel").style.display = "block";
  document.getElementById("modalCloudTunnel").style.display = "block";
}
function closeCloudTunnelModal() {
  document.getElementById("modal_cloudTunnel").style.display = "none";
  document.getElementById("modalCloudTunnel").style.display = "none";
}

document.getElementById("toggleSwitch").addEventListener("change", function () {
  let slider = document.getElementById("slider");
  let circle = document.getElementById("circle");

  if (this.checked) {
    slider.style.backgroundColor = "#33B34A"; // ON state (Pulsar Green)
    circle.style.transform = "translateX(36px)";
    document.getElementById("cloudTunnelImg").src = "img/cloud-tunneling-on.svg";
    document.getElementById("cloudTunnelImg").style.display = "block";
    document.getElementById("TXTimeoutInterval").disabled = true;
    isCloudTunnel = 1;
  } else {
    slider.style.backgroundColor = "#F37021"; // OFF state (Pulsar Orange)
    circle.style.transform = "translateX(0)";
    document.getElementById("cloudTunnelImg").src = "img/cloud-tunneling-off.svg";
    document.getElementById("cloudTunnelImg").style.display = "block";
    document.getElementById("TXTimeoutInterval").disabled = false;
    isCloudTunnel = 0;
  }
});
document.getElementById("TXTimeoutInterval").addEventListener("change", function () {
  universalTXTimeoutInterval = Number(this.value) * 1000; // Convert seconds to milliseconds
});
// This
// The web-app will use the MQTT.js library to connect to the MQTT broker and publish and subscribe to topics

let isCloudTunnel = 0;
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
    isCloudTunnel = 1;
  } else {
    slider.style.backgroundColor = "#F37021"; // OFF state (Pulsar Orange)
    circle.style.transform = "translateX(0)";
    document.getElementById("cloudTunnelImg").src = "img/cloud-tunneling-off.svg";
    document.getElementById("cloudTunnelImg").style.display = "block";
    isCloudTunnel = 0;
  }
});

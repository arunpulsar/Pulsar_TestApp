self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("web-app-offline").then(function (cache) {
      return cache.addAll([
        "./index.html",
        "./sw.js",
        "./css/element.css",
        "./css/font-awesome.min.css",
        "./css/jquery-impromptu.css",
        "./css/jura.css",
        "./css/normalize.min.css",
        "./css/skel-noscript.css",
        "./css/slider.css",
        "./css/style.css",
        "./css/style-desktop.css",
        "./css/style-lr.css",
        "./css/appstyle.css",
        "./fonts/fontawesome-webfont.eot",
        "./fonts/fontawesome-webfont.svg",
        "./fonts/fontawesome-webfont.ttf",
        "./fonts/fontawesome-webfont.woff",
        "./fonts/fontawesome-webfont.woff2",
        "./fonts/segoeui.ttf",
        "./fonts/segoeui.woff",
        "./fonts/segoeui.woff2",
        "./fonts/segoeuibold.ttf",
        "./fonts/segoeuibold.woff",
        "./fonts/segoeuibold.woff2",
        "./fonts/segoeuisemibold.ttf",
        "./fonts/segoeuisemibold.woff",
        "./fonts/segoeuisemibold.woff2",
        "./js/bootstrap.min.js",
        "./js/chart.js",
        "./js/chartjs-plugin-zoom.min.js",
        "./js/ekko-lightbox.js",
        "./js/hammer.min.js",
        "./js/jquery-2.1.1.min.js",
        "./js/jquery-impromptu.js",
        "./js/lang.js",
        "./js/script-lr2.js",
        "./js/slider.js",
        "./js/mainscript.js",
        "./js/xmlops.js",
        "./js/slidetabs.js",
        "./js/param.js",
        "./js/volume.js",
        "./js/production_tests.js",
        "./js/unite_setup.js",
        "./js/bootloader.js",
        "./js/intel-hex.js",
        "./img/pulsarlogo.svg",
        "./img/Icon256Reflect_new.png",
        "./img/Picture1.png",
        "./img/pulsaricon-rgb64_2.png",
        "./img/usb-connected.svg",
        "./img/usb-disconnected.svg",
        "./img/new_bt_disconnected-cropped.svg",
        "./img/new_bt_connected-cropped.svg",
        "./img/tank1.png",
        "./xml/reflect-e_0.1.7_default.xml",
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  // console.log(e.request.url);
  e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
});

self.addEventListener("activate", () => {
  // self.console.log("sw activate");
  clients.claim();
});

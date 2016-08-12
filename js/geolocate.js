// function prompt(window, pref, message, callback) {
//     let branch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
//
//     if (branch.getPrefType(pref) === branch.PREF_STRING) {
//         switch (branch.getCharPref(pref)) {
//         case "always":
//             return callback(true);
//         case "never":
//             return callback(false);
//         }
//     }
//
//     let done = false;
//
//     function remember(value, result) {
//         return function() {
//             done = true;
//             branch.setCharPref(pref, value);
//             callback(result);
//         }
//     }
//
//     let self = window.PopupNotifications.show(
//         window.gBrowser.selectedBrowser,
//         "geolocation",
//         message,
//         "geo-notification-icon",
//         {
//             label: "Share Location",
//             accessKey: "S",
//             callback: function(notification) {
//                 done = true;
//                 callback(true);
//             }
//         }, [
//             {
//                 label: "Always Share",
//                 accessKey: "A",
//                 callback: remember("always", true)
//             },
//             {
//                 label: "Never Share",
//                 accessKey: "N",
//                 callback: remember("never", false)
//             }
//         ], {
//             eventCallback: function(event) {
//                 if (event === "dismissed") {
//                     if (!done) callback(false);
//                     done = true;
//                     window.PopupNotifications.remove(self);
//                 }
//             },
//             persistWhileVisible: true
//         });
// }
//
// prompt(window,
//        "extensions.foo-addon.allowGeolocation",
//        "Foo Add-on wants to know your location.",
//        function callback(allowed) { alert(allowed); });
//
//        function geoFindMe() {
//   var output = document.getElementById("out");
//
//   if (!navigator.geolocation){
//     output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
//     return;
//   }
//
//   function success(position) {
//     var latitude  = position.coords.latitude;
//     var longitude = position.coords.longitude;
//
//     output.innerHTML = '<p>Latitude is ' + latitude + '° <br>Longitude is ' + longitude + '°</p>';
//
//     var img = new Image();
//     img.src = "https://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=13&size=300x300&sensor=false";
//
//     output.appendChild(img);
//   };
//
//   function error() {
//     output.innerHTML = "Unable to retrieve your location";
//   };
//
//   output.innerHTML = "<p>Locating…</p>";
//
//   navigator.geolocation.getCurrentPosition(success, error);
// }

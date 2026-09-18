// ==========================================
// SOSync - LIVE DISASTER MAP
// ==========================================

const map = L.map("map").setView([12.9698, 79.1559], 15);


// ==========================================
// MAP
// ==========================================

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// ==========================================
// PHONE ICON
// ==========================================

function createPhoneIcon(id, rssi, status) {

    return L.divIcon({

        className: "phone-marker",

        html: `
            <div class="phone-wrapper">

                <div class="phone-glow"></div>

                <div class="phone-device">

                    <div class="phone-speaker"></div>

                    <div class="phone-screen">
                        <div class="screen-sos">SOS</div>
                        <div class="screen-id">${id}</div>
                    </div>

                    <div class="phone-button"></div>

                </div>

                <div class="phone-label">

                    <strong>${id}</strong>

                    <span>${rssi} dBm</span>

                    <small>${status}</small>

                </div>

            </div>
        `,

        iconSize: [100, 120],
        iconAnchor: [50, 60]

    });
}


// ==========================================
// DRONE ICON
// ==========================================

const droneIcon = L.divIcon({

    className: "drone-marker",

    html: `
        <div class="drone-wrapper">

            <div class="drone-ring"></div>

            <div class="drone-body">
                ✦
            </div>

            <div class="drone-label">
                DRONE-01
                <span>SCANNING</span>
            </div>

        </div>
    `,

    iconSize: [110, 100],
    iconAnchor: [55, 50]

});


// ==========================================
// PHONE LOCATIONS
// ==========================================

const victim1Location = [12.9698, 79.1559];

const victim2Location = [12.9715, 79.1585];

const victim3Location = [12.9685, 79.1565];

const droneLocation = [12.9705, 79.1570];


// ==========================================
// SOS-07 PHONE
// ==========================================

const victim1 = L.marker(

    victim1Location,

    {
        icon: createPhoneIcon(
            "SOS-07",
            "-41",
            "DETECTED"
        ),
        zIndexOffset: 1000
    }

).addTo(map);


victim1.bindPopup(`
    <b>SOS-07</b><br><br>

    Device: Smartphone<br>
    Status: Possible Survivor<br>
    Activity: Detected<br>
    RSSI: -41 dBm<br>
    Relay: DRONE-01
`);


// ==========================================
// SOS-04 PHONE
// ==========================================

const victim2 = L.marker(

    victim2Location,

    {
        icon: createPhoneIcon(
            "SOS-04",
            "-63",
            "RELAYED"
        )
    }

).addTo(map);


victim2.bindPopup(`
    <b>SOS-04</b><br><br>

    Device: Smartphone<br>
    Status: SOS Detected<br>
    RSSI: -63 dBm<br>
    Relay: MESH NODE
`);


// ==========================================
// SOS-02 PHONE
// ==========================================

const victim3 = L.marker(

    victim3Location,

    {
        icon: createPhoneIcon(
            "SOS-02",
            "-76",
            "WEAK SIGNAL"
        )
    }

).addTo(map);


victim3.bindPopup(`
    <b>SOS-02</b><br><br>

    Device: Smartphone<br>
    Status: Signal Detected<br>
    RSSI: -76 dBm<br>
    Relay: MESH NODE
`);


// ==========================================
// DRONE
// ==========================================

const drone = L.marker(

    droneLocation,

    {
        icon: droneIcon,
        zIndexOffset: 1200
    }

).addTo(map);


drone.bindPopup(`
    <b>DRONE-01</b><br><br>

    Status: Scanning<br>
    Signals Detected: 03<br>
    Network: LoRa
`);


// ==========================================
// SIGNAL DETECTION AREA
// ==========================================

const signalRadius = L.circle(

    victim1Location,

    {
        radius: 300,

        color: "#ff4f9a",

        fillColor: "#ff4f9a",

        fillOpacity: 0.06,

        weight: 2
    }

).addTo(map);


// ==========================================
// PHONE → DRONE CONNECTION
// ==========================================

const phoneDroneLine = L.polyline(

    [
        victim1Location,
        droneLocation
    ],

    {
        color: "#7fffd4",

        weight: 3,

        dashArray: "6, 8",

        opacity: 0.9
    }

).addTo(map);


// ==========================================
// PHONE → PHONE MESH CONNECTIONS
// ==========================================

const meshLine1 = L.polyline(

    [
        victim2Location,
        droneLocation
    ],

    {
        color: "#a56cff",

        weight: 2,

        dashArray: "4, 8",

        opacity: 0.7
    }

).addTo(map);


const meshLine2 = L.polyline(

    [
        victim3Location,
        victim1Location
    ],

    {
        color: "#a56cff",

        weight: 2,

        dashArray: "4, 8",

        opacity: 0.7
    }

).addTo(map);


// ==========================================
// MESH NODE MARKERS
// ==========================================

const meshNode1 = L.circleMarker(

    [12.9709, 79.1578],

    {
        radius: 5,

        color: "#a56cff",

        fillColor: "#a56cff",

        fillOpacity: 1
    }

).addTo(map);


meshNode1.bindTooltip(
    "MESH NODE • RELAY",
    {
        direction: "top"
    }
);


// ==========================================
// LIVE RSSI
// ==========================================

let currentRSSI = -41;


function getSignalStatus(rssi) {

    if (rssi >= -50) {
        return "STRONG";
    }

    if (rssi >= -70) {
        return "MEDIUM";
    }

    return "WEAK";
}


function updateRSSI() {

    const rssiElement =
        document.getElementById("rssiValue");

    if (!rssiElement) {
        return;
    }


    const change =
        Math.floor(Math.random() * 7) - 3;


    currentRSSI += change;


    if (currentRSSI > -35) {
        currentRSSI = -35;
    }


    if (currentRSSI < -75) {
        currentRSSI = -75;
    }


    rssiElement.textContent = currentRSSI;


    const status =
        getSignalStatus(currentRSSI);


    const signalText =
        document.querySelector(".signal-text");


    if (signalText) {
        signalText.textContent = status;
    }


    // Update SOS-07 map marker

    victim1.setIcon(

        createPhoneIcon(
            "SOS-07",
            currentRSSI,
            "DETECTED"
        )

    );

}


// ==========================================
// START LIVE RSSI
// ==========================================

setInterval(
    updateRSSI,
    1500
);
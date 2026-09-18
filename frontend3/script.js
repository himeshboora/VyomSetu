// ==========================================
// SOSync - RESCUE COMMAND CENTER
// ==========================================


// ==========================================
// MAP
// ==========================================

const map = L.map("map").setView(
    [12.9698, 79.1559],
    15
);


// ==========================================
// MAP TILE
// ==========================================

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// ==========================================
// DEFAULT MAP THEME
// ==========================================

map.getContainer().classList.add(
    "map-dark"
);


// ==========================================
// DEVICE DATA
// ==========================================

const devices = {

    "SOS-07": {

        id: "SOS-07",

        type: "Victim Phone",

        connection: "CONNECTED",

        distance:
            "65 m from DRONE-01",

        coordinates:
            [12.9698, 79.1559],

        rssi: -47

    },


    "SOS-04": {

        id: "SOS-04",

        type: "Victim Phone",

        connection: "CONNECTED",

        distance:
            "82 m from MESH-NODE-04",

        coordinates:
            [12.9715, 79.1585],

        rssi: -63

    },


    "SOS-02": {

        id: "SOS-02",

        type: "Victim Phone",

        connection: "CONNECTED",

        distance:
            "140 m from MESH-NODE-02",

        coordinates:
            [12.9685, 79.1565],

        rssi: -76

    }

};


// ==========================================
// DRONE DATA
// ==========================================

const droneData = {

    id:
        "DRONE-01",

    type:
        "LoRa Gateway (Drone)",

    connection:
        "ONLINE",

    quality:
        "EXCELLENT",

    altitude:
        "120 m",

    range:
        500,

    rssi:
        -38

};


// ==========================================
// PHONE ICON
// ==========================================

function createPhoneIcon(
    id,
    rssi,
    status,
    selected = false
) {

    return L.divIcon({

        className:
            "phone-marker",

        html: `

            <div class="
                phone-wrapper
                ${selected ? "selected-phone" : ""}
            ">

                <div class="phone-glow"></div>


                <div class="phone-device">

                    <div class="phone-speaker"></div>


                    <div class="phone-screen">

                        <div class="screen-sos">
                            SOS
                        </div>

                        <div class="screen-id">
                            ${id}
                        </div>

                    </div>


                    <div class="phone-button"></div>

                </div>


                <div class="phone-label">

                    <strong>
                        ${id}
                    </strong>

                    <span>
                        ${rssi} dBm
                    </span>

                    <small>
                        ${status}
                    </small>

                </div>

            </div>

        `,

        iconSize:
            [100, 120],

        iconAnchor:
            [50, 60]

    });

}


// ==========================================
// DRONE ICON
// ==========================================

const droneIcon = L.divIcon({

    className:
        "drone-marker",

    html: `

        <div class="drone-wrapper">

            <div class="drone-ring"></div>

            <div class="drone-body">
                ✦
            </div>

            <div class="drone-label">

                DRONE-01

                <span>
                    SCANNING
                </span>

            </div>

        </div>

    `,

    iconSize:
        [110, 100],

    iconAnchor:
        [55, 50]

});


// ==========================================
// PHONE MARKERS
// ==========================================

const victim1 = L.marker(

    devices["SOS-07"].coordinates,

    {

        icon:
            createPhoneIcon(
                "SOS-07",
                devices["SOS-07"].rssi,
                "DETECTED"
            ),

        zIndexOffset:
            1000

    }

).addTo(map);


const victim2 = L.marker(

    devices["SOS-04"].coordinates,

    {

        icon:
            createPhoneIcon(
                "SOS-04",
                devices["SOS-04"].rssi,
                "RELAYED"
            )

    }

).addTo(map);


const victim3 = L.marker(

    devices["SOS-02"].coordinates,

    {

        icon:
            createPhoneIcon(
                "SOS-02",
                devices["SOS-02"].rssi,
                "WEAK SIGNAL"
            )

    }

).addTo(map);


// ==========================================
// DRONE
// ==========================================

const droneLocation =
    [12.9705, 79.1570];


const drone = L.marker(

    droneLocation,

    {

        icon:
            droneIcon,

        zIndexOffset:
            1200

    }

).addTo(map);


// ==========================================
// DRONE RANGE
// ==========================================

let droneRangeCircle =
    null;


function showDroneRange() {

    // Remove old range if present

    if (droneRangeCircle) {

        map.removeLayer(
            droneRangeCircle
        );

    }


    droneRangeCircle =
        L.circle(

            droneLocation,

            {

                radius:
                    droneData.range,

                color:
                    "#7fffd4",

                fillColor:
                    "#7fffd4",

                fillOpacity:
                    0.10,

                weight:
                    2,

                dashArray:
                    "8, 7",

                className:
                    "drone-range-circle"

            }

        ).addTo(map);


    droneRangeCircle.bringToBack();

}


// ==========================================
// REMOVE DRONE RANGE
// ==========================================

function hideDroneRange() {

    if (droneRangeCircle) {

        map.removeLayer(
            droneRangeCircle
        );

        droneRangeCircle =
            null;

    }

}


// ==========================================
// COUNT DEVICES UNDER DRONE RANGE
// ==========================================

function countDevicesUnderDroneRange() {

    let count =
        0;


    Object.values(
        devices
    ).forEach(

        function(device) {

            const distance =
                map.distance(
                    droneLocation,
                    device.coordinates
                );


            if (
                distance <=
                droneData.range
            ) {

                count++;

            }

        }

    );


    return count;

}


// ==========================================
// SIGNAL AREA
// ==========================================

const signalRadius =
    L.circle(

        devices["SOS-07"].coordinates,

        {

            radius:
                300,

            color:
                "#ff4f9a",

            fillColor:
                "#ff4f9a",

            fillOpacity:
                .06,

            weight:
                2

        }

    ).addTo(map);


// ==========================================
// MESH CONNECTIONS
// ==========================================

// SOS-07 → DRONE

L.polyline(

    [

        devices["SOS-07"].coordinates,

        droneLocation

    ],

    {

        color:
            "#7fffd4",

        weight:
            3,

        dashArray:
            "6, 8",

        opacity:
            .9

    }

).addTo(map);


// SOS-04 → DRONE

L.polyline(

    [

        devices["SOS-04"].coordinates,

        droneLocation

    ],

    {

        color:
            "#a56cff",

        weight:
            2,

        dashArray:
            "4, 8",

        opacity:
            .7

    }

).addTo(map);


// SOS-02 → SOS-07

L.polyline(

    [

        devices["SOS-02"].coordinates,

        devices["SOS-07"].coordinates

    ],

    {

        color:
            "#a56cff",

        weight:
            2,

        dashArray:
            "4, 8",

        opacity:
            .7

    }

).addTo(map);


// ==========================================
// SELECTED DEVICE MESH ROUTE
// ==========================================

let selectedRoute =
    null;


let selectedRouteGlow =
    null;


function showSelectedRoute(
    deviceId
) {

    // Remove previous route

    if (selectedRoute) {

        map.removeLayer(
            selectedRoute
        );

        selectedRoute =
            null;

    }


    if (selectedRouteGlow) {

        map.removeLayer(
            selectedRouteGlow
        );

        selectedRouteGlow =
            null;

    }


    const device =
        devices[deviceId];


    if (!device) {

        return;

    }


    let routePoints;


    // SOS-07 → DRONE

    if (
        deviceId === "SOS-07"
    ) {

        routePoints = [

            device.coordinates,

            droneLocation

        ];

    }


    // SOS-04 → DRONE

    else if (
        deviceId === "SOS-04"
    ) {

        routePoints = [

            device.coordinates,

            droneLocation

        ];

    }


    // SOS-02 → SOS-07 → DRONE

    else if (
        deviceId === "SOS-02"
    ) {

        routePoints = [

            device.coordinates,

            devices["SOS-07"].coordinates,

            droneLocation

        ];

    }


    if (!routePoints) {

        return;

    }


    // Outer glow

    selectedRouteGlow =
        L.polyline(

            routePoints,

            {

                color:
                    "#7fffd4",

                weight:
                    10,

                opacity:
                    .18,

                lineCap:
                    "round",

                lineJoin:
                    "round",

                className:
                    "selected-route-glow"

            }

        ).addTo(map);


    // Main route

    selectedRoute =
        L.polyline(

            routePoints,

            {

                color:
                    "#7fffd4",

                weight:
                    5,

                opacity:
                    1,

                dashArray:
                    "12, 6",

                lineCap:
                    "round",

                lineJoin:
                    "round",

                className:
                    "selected-route"

            }

        ).addTo(map);


    selectedRouteGlow.bringToFront();

    selectedRoute.bringToFront();

}


// ==========================================
// MESH NODE
// ==========================================

const meshNode =
    L.circleMarker(

        [12.9709, 79.1578],

        {

            radius:
                5,

            color:
                "#a56cff",

            fillColor:
                "#a56cff",

            fillOpacity:
                1

        }

    ).addTo(map);


meshNode.bindTooltip(
    "MESH NODE • RELAY",
    {
        direction:
            "top"
    }
);


// ==========================================
// SELECTED DEVICE
// ==========================================

let selectedDevice =
    "SOS-07";


// ==========================================
// DRONE SELECTED STATE
// ==========================================

let droneSelected =
    false;


// ==========================================
// SIGNAL HISTORY
// ==========================================

const signalHistory = {

    "SOS-07":
        createInitialHistory(-47),

    "SOS-04":
        createInitialHistory(-63),

    "SOS-02":
        createInitialHistory(-76)

};


function createInitialHistory(
    baseRSSI
) {

    const values =
        [];


    for (
        let i = 0;
        i < 45;
        i++
    ) {

        values.push(

            baseRSSI +

            (
                Math.random() * 8
                - 4
            )

        );

    }


    return values;

}


// ==========================================
// GET MARKER
// ==========================================

function getMarker(
    deviceId
) {

    if (
        deviceId === "SOS-07"
    ) {

        return victim1;

    }


    if (
        deviceId === "SOS-04"
    ) {

        return victim2;

    }


    if (
        deviceId === "SOS-02"
    ) {

        return victim3;

    }


    return null;

}


// ==========================================
// SIGNAL QUALITY
// ==========================================

function getSignalQuality(
    rssi
) {

    if (
        rssi >= -55
    ) {

        return "GOOD";

    }


    if (
        rssi >= -70
    ) {

        return "FAIR";

    }


    return "WEAK";

}


// ==========================================
// SIGNAL BAR COUNT
// ==========================================

function getBarCount(
    rssi
) {

    if (
        rssi >= -50
    ) {

        return 5;

    }


    if (
        rssi >= -60
    ) {

        return 4;

    }


    if (
        rssi >= -70
    ) {

        return 3;

    }


    if (
        rssi >= -78
    ) {

        return 2;

    }


    return 1;

}


// ==========================================
// UPDATE SIGNAL BARS
// ==========================================

function updateSignalBars(
    rssi
) {

    const bars =
        document.querySelectorAll(
            ".signal-bar"
        );


    const active =
        getBarCount(
            rssi
        );


    bars.forEach(

        (
            bar,
            index
        ) => {

            if (
                index < active
            ) {

                bar.classList.add(
                    "active"
                );

                bar.classList.remove(
                    "inactive"
                );

            } else {

                bar.classList.add(
                    "inactive"
                );

                bar.classList.remove(
                    "active"
                );

            }

        }

    );

}


// ==========================================
// UPDATE PANEL
// ==========================================

function updatePanel(
    device
) {

    document.getElementById(
        "panelSubtitle"
    ).innerHTML =
        `${device.id} • LAST 30-60<br>SECONDS`;


    document.getElementById(
        "deviceId"
    ).textContent =
        device.id;


    document.getElementById(
        "deviceType"
    ).textContent =
        device.type;


    document.getElementById(
        "deviceConnection"
    ).textContent =
        device.connection;


    document.getElementById(
        "deviceQuality"
    ).textContent =
        getSignalQuality(
            device.rssi
        );


    document.getElementById(
        "distanceLabel"
    ).textContent =
        "DISTANCE";


    document.getElementById(
        "deviceDistance"
    ).textContent =
        device.distance;


    document.getElementById(
        "rssiValue"
    ).textContent =
        device.rssi;


    updateSignalBars(
        device.rssi
    );


    updateWaveform();

}


// ==========================================
// SELECT VICTIM DEVICE
// ==========================================

function selectDevice(
    deviceId
) {

    const device =
        devices[deviceId];


    if (!device) {

        return;

    }


    droneSelected =
        false;


    selectedDevice =
        deviceId;


    // Hide drone range

    hideDroneRange();


    // Hide drone information

    document.getElementById(
        "rangeInfo"
    ).classList.remove(
        "visible"
    );


    // Show selected route

    showSelectedRoute(
        deviceId
    );


    // Update panel

    updatePanel(
        device
    );


    // Highlight selected phone

    victim1.setIcon(

        createPhoneIcon(

            "SOS-07",

            devices["SOS-07"].rssi,

            "DETECTED",

            deviceId === "SOS-07"

        )

    );


    victim2.setIcon(

        createPhoneIcon(

            "SOS-04",

            devices["SOS-04"].rssi,

            "RELAYED",

            deviceId === "SOS-04"

        )

    );


    victim3.setIcon(

        createPhoneIcon(

            "SOS-02",

            devices["SOS-02"].rssi,

            "WEAK SIGNAL",

            deviceId === "SOS-02"

        )

    );


    // Move signal radius

    signalRadius.setLatLng(
        device.coordinates
    );


    signalRadius.setStyle({

        color:
            "#ff4f9a",

        fillColor:
            "#ff4f9a"

    });


    // Zoom to victim

    map.flyTo(

        device.coordinates,

        17,

        {

            duration:
                1

        }

    );

}


// ==========================================
// DRONE PANEL
// ==========================================

function selectDrone() {

    droneSelected =
        true;


    // Remove selected victim route

    if (selectedRoute) {

        map.removeLayer(
            selectedRoute
        );

        selectedRoute =
            null;

    }


    if (selectedRouteGlow) {

        map.removeLayer(
            selectedRouteGlow
        );

        selectedRouteGlow =
            null;

    }


    // Show drone range

    showDroneRange();


    // Show range information

    document.getElementById(
        "rangeInfo"
    ).classList.add(
        "visible"
    );


    // ======================================
    // COUNT DEVICES UNDER DRONE RANGE
    // ======================================

    const devicesInRange =
        countDevicesUnderDroneRange();


    document.getElementById(
        "rangeDeviceCount"
    ).textContent =
        `${devicesInRange} DEVICES UNDER DRONE RANGE`;


    // Update panel heading

    document.getElementById(
        "panelSubtitle"
    ).innerHTML =
        `DRONE-01 • LIVE<br>TELEMETRY`;


    // Device ID

    document.getElementById(
        "deviceId"
    ).textContent =
        "DRONE-01";


    // Device type

    document.getElementById(
        "deviceType"
    ).textContent =
        "LoRa Gateway (Drone)";


    // Connection

    document.getElementById(
        "deviceConnection"
    ).textContent =
        "ONLINE";


    // Quality

    document.getElementById(
        "deviceQuality"
    ).textContent =
        "EXCELLENT";


    // Range label

    document.getElementById(
        "distanceLabel"
    ).textContent =
        "RANGE RADIUS";


    // Range

    document.getElementById(
        "deviceDistance"
    ).textContent =
        `${droneData.range} m`;


    // RSSI

    document.getElementById(
        "rssiValue"
    ).textContent =
        droneData.rssi;


    updateSignalBars(
        droneData.rssi
    );


    // Move map to drone

    map.flyTo(

        droneLocation,

        16,

        {

            duration:
                1

        }

    );

}


// ==========================================
// PHONE CLICKS
// ==========================================

victim1.on(
    "click",
    function () {

        selectDevice(
            "SOS-07"
        );

    }
);


victim2.on(
    "click",
    function () {

        selectDevice(
            "SOS-04"
        );

    }
);


victim3.on(
    "click",
    function () {

        selectDevice(
            "SOS-02"
        );

    }
);


// ==========================================
// DRONE CLICK
// ==========================================

drone.on(

    "click",

    function () {

        selectDrone();

    }

);


// ==========================================
// LIVE RSSI
// ==========================================

function updateRSSI() {

    // Do not update victim RSSI
    // while drone is selected

    if (droneSelected) {

        return;

    }


    const device =
        devices[selectedDevice];


    if (!device) {

        return;

    }


    const change =
        Math.floor(
            Math.random() * 7
        ) - 3;


    device.rssi +=
        change;


    if (
        device.rssi > -35
    ) {

        device.rssi =
            -35;

    }


    if (
        device.rssi < -85
    ) {

        device.rssi =
            -85;

    }


    signalHistory[
        selectedDevice
    ].push(
        device.rssi
    );


    if (
        signalHistory[
            selectedDevice
        ].length > 45
    ) {

        signalHistory[
            selectedDevice
        ].shift();

    }


    document.getElementById(
        "rssiValue"
    ).textContent =
        device.rssi;


    document.getElementById(
        "deviceQuality"
    ).textContent =
        getSignalQuality(
            device.rssi
        );


    updateSignalBars(
        device.rssi
    );


    updateWaveform();


    const marker =
        getMarker(
            selectedDevice
        );


    if (marker) {

        const status =

            selectedDevice === "SOS-07"

                ? "DETECTED"

                : selectedDevice === "SOS-04"

                    ? "RELAYED"

                    : "WEAK SIGNAL";


        marker.setIcon(

            createPhoneIcon(

                selectedDevice,

                device.rssi,

                status,

                true

            )

        );

    }

}


// ==========================================
// WAVEFORM
// ==========================================

function updateWaveform() {

    const fill =
        document.getElementById(
            "signalFill"
        );


    const line =
        document.getElementById(
            "signalLine"
        );


    if (
        !fill ||
        !line
    ) {

        return;

    }


    const history =
        signalHistory[
            selectedDevice
        ];


    if (!history) {

        return;

    }


    const width =
        500;


    const baseline =
        180;


    const points =
        [];


    history.forEach(

        (
            rssi,
            index
        ) => {

            const x =

                (
                    index /
                    (history.length - 1)
                ) *
                width;


            const normalized =

                (
                    rssi + 90
                ) / 60;


            let y =

                baseline -
                normalized * 95;


            y +=

                Math.sin(
                    index * 1.7
                ) * 2;


            points.push({

                x:
                    x,

                y:
                    y

            });

        }

    );


    let linePath =

        `M ${points[0].x} ${points[0].y}`;


    for (
        let i = 1;
        i < points.length;
        i++
    ) {

        const previous =
            points[i - 1];


        const current =
            points[i];


        const midX =

            (
                previous.x +
                current.x
            ) / 2;


        linePath +=

            ` Q ${midX} ${previous.y}, ` +
            `${current.x} ${current.y}`;

    }


    const fillPath =

        linePath +

        ` L ${width} ${baseline}` +

        ` L 0 ${baseline}` +

        ` Z`;


    line.setAttribute(
        "d",
        linePath
    );


    fill.setAttribute(
        "d",
        fillPath
    );

}


// ==========================================
// MAP DARK / LIGHT TOGGLE
// ==========================================

let mapIsDark =
    true;


const mapThemeButton =
    L.control({

        position:
            "topright"

    });


mapThemeButton.onAdd =
    function () {

        const button =
            L.DomUtil.create(
                "button",
                "map-theme-button"
            );


        button.innerHTML =
            "☀";


        button.title =
            "Switch to Light Map";


        L.DomEvent.disableClickPropagation(
            button
        );


        button.onclick =
            function () {

                mapIsDark =
                    !mapIsDark;


                const mapElement =
                    document.getElementById(
                        "map"
                    );


                if (mapIsDark) {

                    mapElement.classList.remove(
                        "map-light"
                    );


                    mapElement.classList.add(
                        "map-dark"
                    );


                    button.innerHTML =
                        "☀";


                    button.title =
                        "Switch to Light Map";

                } else {

                    mapElement.classList.remove(
                        "map-dark"
                    );


                    mapElement.classList.add(
                        "map-light"
                    );


                    button.innerHTML =
                        "☾";


                    button.title =
                        "Switch to Dark Map";

                }

            };


        return button;

    };


mapThemeButton.addTo(
    map
);


// ==========================================
// FULLSCREEN / EXPAND MAP
// ==========================================

const fullscreenButton =
    L.control({

        position:
            "topright"

    });


fullscreenButton.onAdd =
    function () {

        const button =
            L.DomUtil.create(

                "button",

                "map-fullscreen-button"

            );


        button.innerHTML =
            "⛶";


        button.title =
            "Expand Map";


        L.DomEvent.disableClickPropagation(
            button
        );


        button.onclick =
            function () {

                const expanded =
                    document.body.classList.toggle(
                        "map-expanded"
                    );


                if (expanded) {

                    button.title =
                        "Exit Expanded Map";


                    window.scrollTo({

                        top:
                            0,

                        behavior:
                            "smooth"

                    });

                } else {

                    button.title =
                        "Expand Map";

                }


                setTimeout(

                    function () {

                        map.invalidateSize();

                    },

                    350

                );

            };


        return button;

    };


fullscreenButton.addTo(
    map
);


// ==========================================
// WINDOW RESIZE
// ==========================================

window.addEventListener(

    "resize",

    function () {

        map.invalidateSize();

    }

);


// ==========================================
// LIVE UPDATES
// ==========================================

setInterval(

    updateRSSI,

    1500

);


// ==========================================
// INITIAL DEVICE
// ==========================================

selectDevice(
    "SOS-07"
);
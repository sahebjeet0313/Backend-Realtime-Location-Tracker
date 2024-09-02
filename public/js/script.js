const socket = io()

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const {  latitude, longitude } = position.coords;
        socket.emit("send-location", {  latitude, longitude });
    }, (error) => {
        console.error(error);
    },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout:5000,
        }
    );
}

const map = L.map("map").setView([0, 0], 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "SSB world" }).addTo(map);

const markers = {};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

socket.on("recieve-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);

    if (markers[id]) {
        // Update marker position
        markers[id].setLatLng([latitude, longitude]);

        // Calculate distance from other markers
        Object.keys(markers).forEach(otherId => {
            if (otherId !== id) {
                const otherMarker = markers[otherId];
                const otherLatLng = otherMarker.getLatLng();
                const distance = calculateDistance(
                    latitude, longitude,
                    otherLatLng.lat, otherLatLng.lng
                );

                // Display the distance
                otherMarker.bindPopup(`Distance to ${id}: ${distance.toFixed(2)} km`).openPopup();
            }
        });
    } else {
        // Create new marker
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", function (id) {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
const map = L.map("map").setView([43.81, -111.78], 13);

function getIcon(color) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color:${color};
      width:12px;
      height:12px;
      border-radius:50%;
      border:2px solid white;
    "></div>`,
  });
}

function addMarker(lat, lng, type, label) {
  const typeInfo = markerTypes[type];

  L.marker([lat, lng], {
    icon: getIcon(typeInfo.color),
  })
    .addTo(map)
    .bindPopup(`${label} (${type})`);
}

const markerTypes = {
  School: { color: "#3b82f6" },
  Restaurant: { color: "#ef4444" },
  Park: { color: "#22c55e" },
};

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

addMarker(43.823, -111.791, "Park", "Porter Park");
addMarker(43.8184, -111.7853, "School", "I-Center");

const locations = [
  { lat: 43.81, lng: -111.78, type: "School", name: "BYU-Idaho" },
  { lat: 43.82, lng: -111.79, type: "Restaurant", name: "Cafe" },
  { lat: 43.8, lng: -111.77, type: "Park", name: "City Park" },
];
locations.forEach((loc) => {
  addMarker(loc.lat, loc.lng, loc.type, loc.name);
});

console.log("Script still running");

const farmLayer = L.featureGroup();

fetch("farms.json")
  .then((r) => r.json())
  .then((data) => {
    console.log("Farm data loaded");
    console.log(data);

    data.forEach((farm) => {
      console.log(farm);

      const marker = L.marker([farm.lat, farm.lng]).bindPopup(farm.name);

      farmLayer.addLayer(marker);
    });

    farmLayer.addTo(map);

    map.fitBounds(farmLayer.getBounds());
  })
  .catch((err) => {
    console.error("FETCH ERROR:", err);
  });

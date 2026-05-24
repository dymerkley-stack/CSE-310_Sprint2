let centerMarker = null;
let centerPoint = null;

const map = L.map("map").setView([43.825, -111.79], 11);

let farmLayer = L.layerGroup().addTo(map);

map.on("click", function (e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  centerPoint = { lat, lng };
  let allFarms = [];

  // remove old marker
  if (centerMarker) {
    map.removeLayer(centerMarker);
  }

  // add new marker
  centerMarker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup("Center point")
    .openPopup();

  updateFilters(); // re-run filtering
});

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

//This categorizes the farms by what type they are
const farmStyles = {
  "Animal Products": {
    color: "red",
  },
  Trees: {
    color: "Green",
  },
  Farm: {
    color: "Blue",
  },
};

//this creates the marker for each type of farm
function addFarm(farm) {
  const style = farmStyles[category] || {
    color: "gray",
  };

  L.circleMarker([farm.lat, farm.lng], {
    radius: 7,
    color: style.color,
    fillOpacity: 0.8,
  })
    .addTo(map)
    .bindPopup(`${farm.name} (${farm.category})`);
}

//Adds the markers to the map
async function loadFarms() {
  const response = await fetch("farms.json");

  const data = await response.json();

  allFarms = data;

  renderFarms(allFarms);
}

//this is a rendering fuction that displays wanted data types of the map
function renderFarms(farms) {
  farmLayer.clearLayers();

  farms.forEach((farm) => {
    const category = farm.category || "Farm";
    const name = farm.name || "Unnamed Farm";

    const style = farmStyles[category] || {
      color: "gray",
    };

    L.circleMarker([farm.lat, farm.lng], {
      radius: 7,
      color: style.color,
      fillOpacity: 0.8,
    })
      .bindPopup(`${name} (${category})`)
      .addTo(farmLayer);
  });
}

//filtering function for the farms
function filterFarms({ selectedCategories, center, radiusMiles }) {
  let filtered = allFarms;

  // category filter
  if (selectedCategories.length > 0) {
    filtered = filtered.filter((f) => {
      if (!f.category) return true;
      return selectedCategories.includes(f.category);
    });
  }

  // distance filter
  if (center && radiusMiles != null) {
    filtered = filtered.filter((f) => {
      const distanceMeters = map.distance(
        [center.lat, center.lng],
        [f.lat, f.lng],
      );

      const distanceMiles = distanceMeters * 0.000621371;

      return distanceMiles <= radiusMiles;
    });
  }

  renderFarms(filtered);
}

function updateFilters() {
  const checkboxes = document.querySelectorAll(
    "#filters input[type=checkbox]:checked",
  );

  const selectedCategories = Array.from(checkboxes).map((cb) => cb.value);

  const radiusMiles = Number(document.getElementById("distanceSlider").value);

  filterFarms({
    selectedCategories,
    center: centerPoint,
    radiusMiles,
  });
}

loadFarms();

document
  .getElementById("distanceSlider")
  .addEventListener("input", updateFilters);

document.getElementById("selectAllBtn").addEventListener("click", () => {
  document
    .querySelectorAll('#filters input[type="checkbox"]')
    .forEach((cb) => (cb.checked = true));

  updateFilters();
});

document.getElementById("clearAllBtn").addEventListener("click", () => {
  document
    .querySelectorAll('#filters input[type="checkbox"]')
    .forEach((cb) => (cb.checked = false));

  updateFilters();
});

document.querySelectorAll('#filters input[type="checkbox"]').forEach((cb) => {
  cb.addEventListener("change", updateFilters);
});

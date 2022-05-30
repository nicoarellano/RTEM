// CESIUM
var cesiumContainer = document.getElementById("cesiumContainer");
initCesium();

function initCesium() {
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNGRmZjIxZC0wMTJkLTQzZmEtOGVhYy05MjYzNWM3ZTRmMjAiLCJpZCI6NTczNTEsImlhdCI6MTYyMjIxMTIwOX0.DiHzzec1-KXRcfMmpppc_4yGSVYSSiEchZa2cGw6dIU";
  const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: Cesium.createWorldTerrain(),
    // useDefaultRenderLoop: false,
    selectionIndicator: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    // infoBox: false,
    animation: false,
    timeline: false,
    allowTextureFilterAnisotropic: false,
    targetFrameRate: 60,
    resolutionScale: 0.1,
    orderIndependentTranslucency: true,
    baseLayerPicker: true,
    geocoder: false,
    automaticallyTrackDataSourceClocks: false,
    fullscreenButton: false,
    dataSources: null,
    clock: null,
    terrainShadows: Cesium.ShadowMode.DISABLED,
  });
  // GET LOCATION 🔍
  //    GET COUNTY 🗺️
  getJson(
    "https://raw.githubusercontent.com/nicoarellano/RTEM/main/nyCounties.geojson"
  ).then((nyData) => {
    const counties = nyData.features;
    const [countiesNames] = [[]];
    var countiesMenu = document.getElementById("counties-menu");
    var data = [];
    for (var i = 0; i <= 61; i++) {
      data.push(i);
    }
    var i = 0;
    counties.sort((a, b) => a.properties.name.localeCompare(b.properties.name));
    counties.forEach((county) => {
      const countyName = county.properties.name;
      loadGraph1(county, viewer, data, i);
      countiesNames.push(countyName);
      var option = document.createElement("option");
      option.innerHTML = countyName;
      option.value = i;
      countiesMenu.appendChild(option);
      i++;
    });
    //  CREATE COUNTY MENU
    document
      .getElementById("counties-menu")
      .addEventListener("change", function () {
        viewer.dataSources.removeAll();
        var i = this.value;
        const countyName = countiesNames[i];
        const county = counties[i];
        loadGeojson(county, viewer, 50);
        // GET COUNTY GEOJSON 🌐
        const countyLng = county.geometry.coordinates.flat()[0][0][0];
        const countyLat = county.geometry.coordinates.flat()[0][0][1];
        const countyLoc = Cesium.Cartesian3.fromDegrees(
          countyLng,
          countyLat,
          200000
        );
        // viewer.camera.flyTo({ destination: countyLoc });
        const footer = document.getElementById("footer");
        setCoordinates(countyLng, countyLat, footer);
        const showBldgs = this.value !== "" ? "block" : "none";
      });
  });

  // Toggle Menu
  const menu = document.getElementById("menu");
  const menuButton = document.getElementById("menu-button");
  var toggleMenu = false;
  menuButton.onclick = function () {
    menu.style.display = toggleMenu ? "block" : "none";
    toggleMenu = !toggleMenu;
  };

  // Show Map Labels
  var baseLayerPickerViewModel = viewer.baseLayerPicker.viewModel;
  baseLayerPickerViewModel.selectedImagery =
    baseLayerPickerViewModel.imageryProviderViewModels[1];
  // Toggle Map view
  const mapView = document.getElementById("map-view");
  var labels = 1;
  var toggleMapView = true;
  mapView.onclick = function () {
    if (toggleMapView) {
      labels = 2;
      this.textContent = "🛰️ Satelital View";
      console.log(this);
    } else {
      labels = 1;
      this.textContent = "🗺️ Map view";
    }
    baseLayerPickerViewModel.selectedImagery =
      baseLayerPickerViewModel.imageryProviderViewModels[labels];
    toggleMapView = !toggleMapView;
  };

  const goTo = document.getElementById("go-to");
  var toggleGoTo = true;
  goTo.onclick = function () {
    if (toggleGoTo) {
      this.textContent = "🌎 Go to State";
      // Fly To Buildings
      flyTo(viewer, -73.97, 40.7435, 500, -45.0, 0);
    } else {
      this.textContent = "🏢 Go to Buildings";
      // Fly to Counties
      flyTo(viewer, -75.4999, 43.00035, 1200000, -90.0, 0);
    }
    toggleGoTo = !toggleGoTo;

    document.getElementById("footer").style.display = toggleGoTo? "none" : "block";
  };

  const showGraphs = document.getElementById("show-graphs");
  const graphsViewer = document.getElementById("graphs-viewer");
  var toggleGraphs = true;
  showGraphs.onclick = function () {
    if (toggleGraphs) {
      this.textContent = "📉 Hide Graphs";
      var showGraphs = document.getElementById("graphs-viewer");
      graphsViewer.style.display = "block";
    } else {
      this.textContent = "📈 Show Graphs";
      var showGraphs = document.getElementById("graphs-viewer");
      graphsViewer.style.display = "none";
    }
    toggleGraphs = !toggleGraphs;
  };

  // Add Cesium OSM Buildings, a global 3D buildings layer.
  const buildingTileset = viewer.scene.primitives.add(
    Cesium.createOsmBuildings()
  );

  // Fly the camera to the NY State.
  flyTo(viewer, -75.4999, 43.00035, 1200000, -90.0, 0);

  // Load OSM
  let loadOSM = document.getElementById("load-osm");
  var bldgs =
    "${elementId} === 144257168 ||" +
    "${elementId} ===		265517920 ||" +
    "${elementId} ===		265516427 ||" +    
    "${elementId} === 	265517913";
  var range = document.getElementById("myRange");

  range.addEventListener("input", function () {
    var hexColor = perc2color(this.value/0.24);
    console.log(this.value);
    buildingTileset.style = new Cesium.Cesium3DTileStyle({
      color: {
        conditions: [
          [bldgs, "color('" + hexColor +"')"], 
          // ["true", 'color("white", 1)'], // All remaining buildings
        ],
      },
      show: {
        conditions: [["${elementId} === 949254697", false]],
      },
    });
  });
}

async function getJson(path) {
  var response = await fetch(path);
  var json = await response.json();
  return json;
}

async function loadGraph1(geojson, viewer, data, i) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const promise = Cesium.GeoJsonDataSource.load(geojson);
  promise.then(function (dataSource) {
    viewer.dataSources.add(dataSource);
    const entities = dataSource.entities.values;
    entities.forEach((entity) => {
      var perc = ((data[i] - min) * 100) / (max - min);
      var color = perc2color(perc);
      entity.polygon.extrudedHeight = (data[i] + 2) * 1500;
      entity.polygon.material = Cesium.Color.fromCssColorString(color);
      entity.polygon.outlineColor = Cesium.Color.fromCssColorString(color);
    });
  });
}

async function loadGeojson(geojson, viewer, h) {
  const fillPromise = Cesium.GeoJsonDataSource.load(geojson, {
    fill: Cesium.Color.fromBytes(251, 184, 41, 50),
    stroke: Cesium.Color.fromBytes(251, 184, 41, 255),
    clampToGround: true,
  });
  fillPromise.then(function (dataSource) {
    viewer.dataSources.add(dataSource);
    const entities = dataSource.entities.values;
    viewer.zoomTo(entities);
    entities.forEach((entity) => {
      // entity.polygon.height = h;
      entity.polygon.outlineWidth = 4;
      // entity.polygon.extrudedHeight = h;
    });
  });
}

function flyTo(viewer, lng, lat, h, pitch = 0, roll = 0) {
  const destination = Cesium.Cartesian3.fromDegrees(lng, lat, h);
  viewer.camera.flyTo({
    destination: destination,
    orientation: {
      pitch: Cesium.Math.toRadians(pitch),
      roll: Cesium.Math.toRadians(roll),
    },
  });
}

function perc2color(perc) {
  var r,
    g,
    b = 0;
  if (perc < 50) {
    r = 255;
    g = Math.round(5.1 * perc);
  } else {
    g = 255;
    r = Math.round(510 - 5.1 * perc);
  }
  var h = r * 0x10000 + g * 0x100 + b * 0x1;
  return "#" + ("000000" + h.toString(16)).slice(-6);
}

function getTree(collection, lng, lat, h, objId, specie) {
  var hLabel = h === 9.99 ? "n/a" : h;
  collection.entity.add({
    name: "Tree id: " + objId,
    description: "Specie: " + specie + ", Height: " + hLabel + " mts",
    position: Cesium.Cartesian3.fromDegrees(lng, lat, 0.5),
    cylinder: {
      length: h - 0.5,
      topRadius: 0.01,
      bottomRadius: h / 4,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      material: Cesium.Color.fromBytes(
        Math.floor(Math.random() * 100),
        Math.floor(220 - h * 3),
        0
      ),
      slices: 5,
    },
  });
}

function setCoordinates(lng, lat, footer) {
  const countyCoor =
    "🌐	Coordinates: Longitude: " +
    lng.toFixed(4) +
    " , Latitud: " +
    lat.toFixed(4);
  // updating page title
  document.getElementById("coordinates").innerHTML = countyCoor;
  footer.style.display = "block";
}

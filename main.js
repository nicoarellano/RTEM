// CESIUM
const cesiumContainer = document.getElementById("cesiumContainer");
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
    var i = 0;
    counties.sort((a, b) => a.properties.name.localeCompare(b.properties.name));
    // Add Json Data
    getJson(
      "https://raw.githubusercontent.com/nicoarellano/RTEM/main/assets/data/county_Datasets.json"
    ).then((countiesData) => {
      const keys = Object.keys(countiesData[0]);
      const countiesDataMenu = document.getElementById("county-data-menu");
      keys.sort((a, b) => a.localeCompare(b));
      keys.forEach((key) => {
        var option = document.createElement("option");
        option.value = key;
        var keyName = key.replace("_", " ");
        keyName = keyName.charAt(0).toUpperCase() + keyName.slice(1);
        option.innerHTML = keyName;
        countiesDataMenu.appendChild(option);
      });
      const countyNums = [];
      counties.forEach((county) => {
        const countyName = county.properties.name;
        countiesNames.push(countyName.replace(" County", ""));
        var option = document.createElement("option");
        option.innerHTML = countyName;
        option.value = i;
        countiesMenu.appendChild(option);
        Object.assign(county.properties, countiesData[[i]]);
        countyNums.push(i);
        loadGraph1(county, viewer, "county_number", 0, 62);
        i++;
      });

      chartIt(countiesNames, countyNums, "County Number")
        // STATE LEVEL 🌎
        document
          .getElementById("county-data-menu")
          .addEventListener("change", function () {
            var param = this.value;
            if (param !== "") {
              var max = 0;
              var min = 1000000000000;
              var values = [];
              var countiesWithData = [];
              counties.forEach((county) => {
                var value = county.properties[param];
                if (value > 0) {
                  values.push(value);
                  countiesWithData.push(county.properties.name);
                }
                value > max ? (max = value) : max;
                value != 0 && value < min ? (min = value) : min;
              });



              chartIt(countiesWithData, values, param);
              counties.forEach((county) => {
                viewer.dataSources.removeAll();
                loadGraph1(county, viewer, param, min, max);
              });
              if (max !== 0 && min !== max) {
                document.getElementById("table-min").innerHTML = min;
                document.getElementById("table-max").innerHTML = max;
              } else {
                document.getElementById("table-min").innerHTML = "MIN";
                document.getElementById("table-max").innerHTML = "MAX";
              }
            }
          });
        //  COUNTY LEVEL 🏙️
        document
          .getElementById("counties-menu")
          .addEventListener("change", function () {
            if (this.value !== "") {
              stateGraphs.style.display = "none";
              countyGraphs.style.display = "block";
              buildingGraphs.style.display = "none";
              viewer.dataSources.removeAll();
              var i = this.value;
              const countyName = countiesNames[[i]];
              const county = counties[[i]];
              loadGeojson(county, viewer, 50);
            } else {
              loadGraph1(county, viewer, "county_number", 0, 62);
            }
          });
      });


    // Toggle Menu
    const menu = document.getElementById("menu");
    const menuButton = document.getElementById("menu-button");
    var toggleMenu = false;
    menuButton.onclick = function () {
      menu.style.display = toggleMenu ? "block" : "none";
      graphsViewer.style.display = toggleMenu ? "block" : "none";
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

    // DOM OBJECTS

    const goTo = document.getElementById("go-to");
    const stateGraphs = document.getElementById("state-graphs");
    const countyGraphs = document.getElementById("county-graphs");
    const buildingGraphs = document.getElementById("building-graphs");
    const rangeSlider = document.getElementById("range-slider");

    // BUILDING LEVEL 🏢
    var toggleGoTo = true;
    goTo.onclick = function () {
      if (toggleGoTo) {
        // Graphs 📈
        graphsViewer.style.display = "block";
        stateGraphs.style.display = "none";
        countyGraphs.style.display = "none";
        buildingGraphs.style.display = "block";
        rangeSlider.style.display = "block";
        viewer.dataSources.removeAll();

        this.textContent = "🌎 Go to State";
        // Fly To Buildings
        flyTo(viewer, -73.99452, 40.75641, 350, -45.0, 0);
        // Load OSM 🏢
        var bldgs =
          "${elementId} === 3573251 ||" + "${elementId} === 265517913";
        var range = document.getElementById("myRange");
        getJson(
          "https://raw.githubusercontent.com/nicoarellano/RTEM/main/assets/data/daily_co2_temp_hospitality_426_new_york.json"
        ).then((data) => {
          range.addEventListener("input", function () {
            // COLOURS 🎨
            var hexColor = perc2color(this.value / 10.97);
            var timestamp = data[this.value].timestamp;
            var date = new Date(timestamp);
            var day = date.getDay().toString();
            var month = date.getMonth().toString();
            var year = date.getFullYear().toString();
            date = date.toString();
            document.getElementById("timestamp").innerHTML =
              "📅 " + year + " / " + month + " / " + day;
            // CO2 INSIDE 📩
            var co2_inside = Math.round(data[this.value].co2_inside);
            var co2_inside_hex = perc2color((co2_inside + 286) / 17.56);
            var co2_inside_html = document.getElementById("co2_inside");
            co2_inside_html.innerHTML = co2_inside;
            co2_inside_html.style.color = "black";
            co2_inside_html.style.background = co2_inside_hex;
            // CO2 OUTSIDE 🅾️
            var co2_outside = Math.round(data[this.value].co2_outside);
            var co2_outside_hex = perc2color((co2_outside + 10) / 3.2);
            var co2_outside_html = document.getElementById("co2_outside");
            co2_outside_html.innerHTML = co2_outside;
            // TEMP 🌡️
            var heat_pump_zone_temp = Math.round(
              data[this.value].heat_pump_zone_temp
            );
            document.getElementById("heat_pump_zone_temp").innerHTML =
              heat_pump_zone_temp;

            console.log();
            buildingTileset.style = new Cesium.Cesium3DTileStyle({
              color: {
                conditions: [[bldgs, "color('" + co2_inside_hex + "')"]],
              },
              show: {
                conditions: [["${elementId} === 949254697", false]],
              },
            });
          });
        });
      } else {
        this.textContent = "🏢 Go to Building";
        buildingGraphs.style.display = "none";
        stateGraphs.style.display = "block";
        counties.forEach((county) => {
          loadGraph1(county, viewer, "county_number", 0, 62);
        });
        // Fly to Counties
        flyTo(viewer, -73.5, 43.00035, 1200000, -90.0, 0);
      }
      toggleGoTo = !toggleGoTo;
    };

    var showGraphs = document.getElementById("show-graphs");
    const graphsViewer = document.getElementById("graphs-viewer");
    var toggleGraphs = true;
    showGraphs.onclick = function () {
      if (toggleGraphs) {
        this.textContent = "📈 Show Graphs";
        graphsViewer.style.display = "none";
      } else {
        this.textContent = "📉 Hide Graphs";
        graphsViewer.style.display = "block";
      }
      toggleGraphs = !toggleGraphs;
    };

    // Add Cesium OSM Buildings, a global 3D buildings layer.
    const buildingTileset = viewer.scene.primitives.add(
      Cesium.createOsmBuildings()
    );
  });
  // Fly the camera to the NY State.
  flyTo(viewer, -73.5, 43.00035, 1200000, -90.0, 0);
}

// FUNCTIONS _____________________________________________________________________________________________________

async function getJson(path) {
  var response = await fetch(path);
  var json = await response.json();
  return json;
}

async function loadGraph1(geojson, viewer, param, min, max) {
  var colors = [];
  const promise = Cesium.GeoJsonDataSource.load(geojson);
  promise.then(function (dataSource) {
    viewer.dataSources.add(dataSource);
    const entities = dataSource.entities.values;
    entities.forEach((entity) => {
      var geoParam = geojson.properties[param];
      isNaN(geoParam) ? (geoParam = 0) : geoParam;
      var perc = ((geoParam - min) * 100) / (max - min);
      var color = perc2color(perc);
      colors.push(color);
      if (geoParam === 0) {
        entity.polygon.extrudedHeight = 1700;
        entity.polygon.material = Cesium.Color.DARKGRAY;
        entity.polygon.outlineColor = Cesium.Color.DARKGRAY;
      } else {
        entity.polygon.extrudedHeight = (perc + 5) * 1000;
        entity.polygon.material = Cesium.Color.fromCssColorString(color);
        entity.polygon.outlineColor = Cesium.Color.fromCssColorString(color);
      }
    });
  });
  return colors;
}

async function loadGeojson(geojson, viewer, h) {
  const fillPromise = Cesium.GeoJsonDataSource.load(geojson, {
    fill: Cesium.Color.fromBytes(251, 184, 41, 100),
    stroke: Cesium.Color.fromBytes(251, 184, 41, 255),
    clampToGround: true,
  });
  fillPromise.then(function (dataSource) {
    viewer.dataSources.add(dataSource);
    const entities = dataSource.entities.values;
    viewer.zoomTo(entities);
    entities.forEach((entity) => {
      entity.polygon.outlineWidth = 4;
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

async function chartIt(x, y, label) {
  const ctx = document.getElementById("myChart").getContext("2d");

  const max = Math.max(...y);
  const min = Math.min(...y);
  var color = [];
  y.forEach((i) => {
    var p = ((i - min) * 100) / (max - min);
    var c = perc2color(p);
    color.push(c);
  });
  color.length === 1 ? color = "darkgray" : color;

  let chartStatus = Chart.getChart("myChart");
  if (chartStatus != undefined) {
    chartStatus.destroy();
  }

  const myChart = await new Chart(ctx, {
    type: "bar",
    data: {
      labels: x,
      datasets: [
        {
          label: label,
          data: y,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          ticks: {
            // Include degrees sign
            callback: function (value) {
              return value;
              // + '°'
            },
          },
        },
      },
      plugins:{
        legend:{
          labels:{
            boxWidth:0
          }
        }
      },
    },
  });
  return myChart;
}

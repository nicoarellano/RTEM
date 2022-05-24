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
    var i = 0
    counties.sort((a, b) => a.properties.name.localeCompare(b.properties.name));
    counties.forEach((county) => {
      const countyName = county.properties.name;
      loadGraph1(county, viewer, data, i);
      // loadGeojson(county, viewer, 1500);
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
        loadGeojson(county, viewer, 500);
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
      });
  });

  // Show Map Labels
  var baseLayerPickerViewModel = viewer.baseLayerPicker.viewModel;
  baseLayerPickerViewModel.selectedImagery =
    baseLayerPickerViewModel.imageryProviderViewModels[1];
  // Toggle Map view
  const mapView = document.getElementById("map-view");
  var labels = 1;
  mapView.onclick = function () {
    mapView.checked ? (labels = 2) : (labels = 1);
    baseLayerPickerViewModel.selectedImagery =
      baseLayerPickerViewModel.imageryProviderViewModels[labels];
  };

  // Add Cesium OSM Buildings, a global 3D buildings layer.
  const buildingTileset = viewer.scene.primitives.add(
    Cesium.createOsmBuildings()
  );
  // Hide OSM Buildings until they are turned on on the GUI
  buildingTileset.style = new Cesium.Cesium3DTileStyle({
    show: { conditions: [["${elementId} !== 0", false]] },
  });

  // Fly the camera to the world.
  const nyStateLoc = Cesium.Cartesian3.fromDegrees(-75.4999, 43.00035, 1200000);

  viewer.camera.flyTo({
    destination: nyStateLoc,
    orientation: {
      pitch: Cesium.Math.toRadians(-90.0),
    },
  });

  // // City:
  // const citySel = document.getElementById("select-city");
  // var city = citySel.value;
  // var [cityName, cityDest, cityCoor] = ["", "", ""];
  // citySel.addEventListener("click", function () {
  //   if (citySel.value === "") {
  //     viewer.camera.flyTo({
  //       destination: countyDest,
  //     });
  //     document.getElementById("title-dest").innerHTML = ": " + countyName;
  //     document.getElementById("coordinates").innerHTML = countyCoor;
  //   } else {
  //     city = citySel.value;
  //     siteSel.value = "";
  //     document.getElementById("obj-menu").style.display = "none";
  //     // Get county data from JSON file
  //     getJson("../assets/" + county + "/" + county + ".json").then(
  //       (countyData) => {
  //         // Get coordinates from JSON
  //         const dd = countyData["cities"][city]["coordinates"]["DD"];
  //         var cityLng = dd["lng"];
  //         var cityLat = dd["lat"];
  //         cityName = countyData["cities"][city]["cityName"];
  //         cityCoor =
  //           "&#127760	Coordinates: Longitude: " +
  //           cityLng +
  //           " , Latitud: " +
  //           cityLat;
  //         // updating page title
  //         document.getElementById("title-dest").innerHTML = ": " + cityName;
  //         document.getElementById("coordinates").innerHTML = cityCoor;
  //         cityDest = Cesium.Cartesian3.fromDegrees(cityLng, cityLat, 60000);
  //         viewer.camera.flyTo({
  //           destination: cityDest,
  //         });
  //       }
  //     );
  //   }
  // });

  // // Site:
  // const siteSel = document.getElementById("select-site");
  // var site = siteSel.value;
  // var [siteCoor, siteLng, siteLat] = ["", "", ""];
  // siteSel.addEventListener("click", function () {
  //   if (siteSel.value === "") {
  //     viewer.camera.flyTo({
  //       destination: cityDest,
  //     });
  //     document.getElementById("title-dest").innerHTML = ": " + cityName;
  //     document.getElementById("coordinates").innerHTML = cityCoor;
  //   } else {
  //     site = siteSel.value;
  //     // Get county data from JSON file
  //     var siteFileLoc = "../assets/" + county + "/" + city + "/";
  //     getJson(siteFileLoc + city + "-sites.json").then((cityData) => {
  //       // Get coordinates from JSON
  //       const siteData = cityData["sites"][site];
  //       const dd = siteData["coordinates"]["DD"];
  //       siteLng = dd["lng"];
  //       siteLat = dd["lat"];
  //       siteCoor =
  //         "&#127760	Coordinates: Longitude: " +
  //         siteLng +
  //         " , Latitud: " +
  //         siteLat;
  //       // updating page title
  //       document.getElementById("title-dest").innerHTML =
  //         ": " + siteData["siteName"];
  //       document.getElementById("coordinates").innerHTML = siteCoor;
  //       var siteType = siteData["siteType"];
  //       var siteDest = Cesium.Cartesian3.fromDegrees(
  //         siteLng,
  //         siteLat,
  //         siteType === "building" ? 800 : 4000
  //       );
  //       viewer.camera.flyTo({
  //         destination: siteDest,
  //       });
  //     });

  //     const lngRange = 0.03;
  //     const latRange = 0.02;

  //     let loadTrees = document.getElementById("load-trees");
  //     var treeDataSource = new Cesium.CustomDataSource("trees");
  //     loadTrees.onclick = function () {
  //       if (loadTrees.checked) {
  //         getJson(siteFileLoc + "geojson/" + city + "-trees-wgs.geojson").then(
  //           (trees) => {
  //             var features = trees["features"];
  //             var count = 0;
  //             features.forEach((feature) => {
  //               var {
  //                 common_name,
  //                 OBJECTID,
  //                 objectid,
  //                 DBH,
  //                 DBH_TRUNK,
  //                 trunk_diameter,
  //                 SPECIES,
  //                 COMMON_NAME,
  //               } = feature["properties"];
  //               if (feature["geometry"] !== null) {
  //                 var coordinates = feature["geometry"]["coordinates"];
  //                 var h =
  //                   (DBH === undefined ? 0 : DBH) +
  //                   (DBH_TRUNK === undefined ? 0 : DBH_TRUNK) +
  //                   (trunk_diameter === undefined ? 0 : trunk_diameter);
  //                 h === 999 ? (h = 9.99) : (h = Math.round(h * 30.48) / 100); // feet to meters
  //                 h > 50 ? (h = 20 + Math.floor(30 * Math.random())) : h;
  //                 var treeLng = coordinates[0];
  //                 var treeLat = coordinates[1];
  //                 if (
  //                   treeLng > siteLng - lngRange &&
  //                   treeLng < siteLng + lngRange &&
  //                   treeLat < siteLat + latRange &&
  //                   treeLat > siteLat - latRange &&
  //                   h > 0.6
  //                 ) {
  //                   count++;
  //                   var specie =
  //                     (SPECIES === undefined ? "" : SPECIES) +
  //                     (COMMON_NAME === undefined ? "" : COMMON_NAME) +
  //                     (common_name === undefined ? "" : common_name);
  //                   var objId =
  //                     (OBJECTID === undefined ? "" : OBJECTID) +
  //                     (objectid === undefined ? "" : objectid) +
  //                     count;
  //                   getTree(treeDataSource, treeLng, treeLat, h, objId, specie);
  //                 }
  //               }
  //             });
  //             viewer.dataSources.add(treeDataSource);

  //             let div = document.createElement("div");
  //             div.id = "tree-count";
  //             let box = document.createElement("span");
  //             box.style.backgroundColor = "yellowgreen";
  //             box.style.border = "1px solid #000000";
  //             box.appendChild(
  //               document.createTextNode("\u00A0\u00A0\u00A0\u00A0")
  //             );
  //             let text = document.createElement("span");
  //             if (count === 0) {
  //               text.appendChild(
  //                 document.createTextNode(" Trees: No available data")
  //               );
  //             } else {
  //               text.appendChild(document.createTextNode(" Trees: " + count));
  //             }
  //             div.onmouseover = function () {
  //               div.style.backgroundColor = "silver";
  //             };
  //             div.onmouseleave = function () {
  //               div.style.backgroundColor = "";
  //             };
  //             div.onclick = function () {
  //               this.remove();
  //               viewer.dataSources.remove(treeDataSource);
  //               loadTrees.checked = false;
  //             };
  //             div.appendChild(box);
  //             div.appendChild(text);
  //             list.appendChild(div);
  //           }
  //         );
  //       } else {
  //         viewer.dataSources.remove(treeDataSource);
  //         document.getElementById("tree-count").remove();
  //       }
  //     };
  //     // GET OBJECTS FROM GEOJSON FILES
  //     let file = document.getElementById("uploadfile");
  //     let uploadConfirm = document.getElementById("uploadconfirm");
  //     uploadConfirm.onclick = function () {
  //       if (
  //         // Check if there is not file or if the file has already been added
  //         file.value !== "" &&
  //         !list.contains(document.getElementById(file.value))
  //       ) {
  //         const path = file.value.slice(12);
  //         const dotsColor = document.getElementById("dotscolor").value;
  //         getJson(siteFileLoc + "geojson/" + path).then((json) => {
  //           const features = json["features"];
  //           var objName = path.split(" data.")[0];
  //           var DataSource = new Cesium.CustomDataSource(objName);

  //           var count = 0;
  //           features.forEach((feature) => {
  //             var lng = feature["geometry"]["coordinates"][0];
  //             var lat = feature["geometry"]["coordinates"][1];
  //             var { ID, SIDE } = feature["properties"];
  //             if (
  //               lng > siteLng - 0.03 &&
  //               lng < siteLng + 0.03 &&
  //               lat < siteLat + 0.02 &&
  //               lat > siteLat - 0.02
  //             ) {
  //               var dotName = objName + ", ID: " + ID;
  //               console.log(dotName);
  //               getDot(DataSource, lng, lat, dotName, dotsColor, 2, 8);
  //               count++;
  //             }
  //           });
  //           let div = document.createElement("div");
  //           let box = document.createElement("span");
  //           box.style.backgroundColor = dotsColor;
  //           box.style.border = "1px solid #000000";
  //           box.appendChild(
  //             document.createTextNode("\u00A0\u00A0\u00A0\u00A0")
  //           );
  //           let text = document.createElement("span");
  //           div.name = objName;
  //           text.appendChild(
  //             document.createTextNode(" " + objName + ": " + count)
  //           );
  //           div.onmouseover = function () {
  //             div.style.backgroundColor = "silver";
  //           };
  //           div.onmouseleave = function () {
  //             div.style.backgroundColor = "";
  //           };
  //           div.onclick = function () {
  //             this.remove();
  //             viewer.dataSources.remove(DataSource);
  //           };
  //           div.appendChild(box);
  //           div.appendChild(text);
  //           list.appendChild(div);
  //           viewer.dataSources.add(DataSource);
  //         });
  //       }
  //     };
  //   }
  // });

  let openSpeckle = document.getElementById("load-bldg-speckle");
  let speckleViewer = document.getElementById("speckle-viewer");
  openSpeckle.onclick = function () {
    if (openSpeckle.checked) {
      //  open("https://speckle.xyz/streams/0e796d08ec/commits/468c3e8582")
      speckleViewer.style.display = "block";
      var iframe = document.createElement("IFRAME");
      iframe.width = "1000";
      iframe.height = "700";
      iframe.setAttribute(
        "src",
        "https://speckle.xyz/streams/0e796d08ec/commits/468c3e8582"
      );
      speckleViewer.appendChild(iframe);
    } else {
      speckleViewer.style.display = "none";
      while (speckleViewer.hasChildNodes()) {
        speckleViewer.removeChild(speckleViewer.firstChild);
      }
    }
  };

  // Load OSM
  let loadOSM = document.getElementById("load-osm");
  loadOSM.onclick = function () {
    if (loadOSM.checked) {
      var cdcBldgs =
        // Carleton
        "${elementId} === 671842709 ||" +
        "${elementId} ===	130338056 ||" +
        "${elementId} === 130329216";
      buildingTileset.style = new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [
            [
              "${name} === 'Bombardier'||" + "${name} === 'East Block'",
              'color("yellow")',
            ],
            [cdcBldgs, 'color("white", 0.05)'],
            ["true", 'color("white", 1)'], // All remaining buildings
          ],
        },
        show: {
          conditions: [["${elementId} === 949254697", false]],
        },
      });
    } else {
      buildingTileset.style = new Cesium.Cesium3DTileStyle({
        show: {
          conditions: [["${elementId} !== 0", false]],
        },
      });
    }
  };
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
      entity.polygon.extrudedHeight = (data[i]+2)*1000;
      entity.polygon.material = Cesium.Color.fromCssColorString(color);
      entity.polygon.outlineColor = Cesium.Color.fromCssColorString(color);
    });
  });
}

async function loadGeojson(geojson, viewer, h) {
  const fillPromise = Cesium.GeoJsonDataSource.load(geojson, {
    fill: Cesium.Color.fromBytes(251, 184, 41, 50),
    clampToGround: true,
  });
  fillPromise.then(function (dataSource) {
    viewer.dataSources.add(dataSource);
  });
  const promise = Cesium.GeoJsonDataSource.load(geojson, {
    stroke: Cesium.Color.BLACK,
    fill: Cesium.Color.fromBytes(0, 0, 0, 0),
  });
  promise.then(function (dataSource) {
    viewer.dataSources.add(dataSource);
    const entities = dataSource.entities.values;
    viewer.zoomTo(entities);
    entities.forEach((entity) => {
      entity.polygon.height = h;
      // entity.polygon.extrudedHeight = h
    });
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
  return '#' + ('000000' + h.toString(16)).slice(-6);
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

function getDot(
  collection,
  lng,
  lat,
  dotName,
  color = "#ff0000",
  h = 1,
  pix = 10
) {
  collection.entities.add({
    name: dotName,
    position: Cesium.Cartesian3.fromDegrees(lng, lat, h),
    point: {
      pixelSize: pix,
      color: Cesium.Color.fromCssColorString(color),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
    },
  });
}

function addImage(path, viewer, lng, lat, height = 0) {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lng, lat, height),
    billboard: {
      image: path,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
    },
  });
}

function loadGLB(url, dataSource, lng, lat, h = 0, angle = 0) {
  var position = Cesium.Cartesian3.fromDegrees(lng, lat, h);
  var heading = Cesium.Math.toRadians(angle);
  var pitch = 0;
  var roll = 0;
  var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

  // const position = Cesium.Cartesian3.fromDegrees(lng, lat, height);
  dataSource.entities.add({
    name: url,
    position: position,
    material: "red",
    orientation: orientation,
    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
    model: {
      uri: url,
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

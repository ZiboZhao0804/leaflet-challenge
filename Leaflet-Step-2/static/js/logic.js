//define a function to get color of earthquake depth
function getColor(d) {
  return d > 90  ? '#E31A1C' :
         d > 70  ? '#FC4E2A' :
         d > 50   ? '#FD8D3C' :
         d > 30   ? '#FEB24C' :
         d > 10   ? '#FED976' :
                    '#FFEDA0';
}
// plate layer
var plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
var plateLayer;
var plateStyle = {
  color:"orange",
  fillOpacity:0,
  weight: 1.5
};
d3.json(plateUrl).then(function(data){
  plateLayer = L.geoJSON(data,{
      style:plateStyle
  });
});

// Store our API endpoint as queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
// markerLayer with the data
d3.json(queryUrl).then(function(data) {
  features = data.features;
  var earthquakeData =[];
  var earthquakeMarker = [];
  features.forEach(
      function(f){
          var e = {};
          e.place = f.properties.place;
          e.mag = f.properties.mag;
          e.location = [f.geometry.coordinates[1],f.geometry.coordinates[0]];
          e.depth = f.geometry.coordinates[2];
          earthquakeData.push(e);
      }      
  );
  earthquakeData.forEach(
      function(e){
        earthquakeMarker.push(L.circleMarker(e.location,{
          fillOpacity:0.75,
          color:getColor(e.depth),
          radius: e.mag*5,
          fillColor: getColor(e.depth)
        }).bindPopup(`<h2>${e.place}</h2><hr>Mag: ${e.mag}<hr>Depth: ${e.depth}<hr>latitude/longitude: ${e.location}`));  
      });   
  var markerLayer = L.layerGroup(earthquakeMarker); 

  //overlay maps
  var overlayMaps = {
      "Tectronic Plates": plateLayer,  
      "Earthquakes": markerLayer
  };

  // Define map layers
  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "satellite-v9",
      accessToken: API_KEY
  });

  var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "outdoors-v11",
      accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "dark-v10",
      accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
      "Satellite Map": satellitemap,
      "Outdoors Map": outdoorsmap,
      "Dark Map": darkmap
  };

  // Create a new map
  var myMap = L.map("map", {
      center: [15.5994, -28.6731],
      zoom: 3,
      layers: [satellitemap, markerLayer]
  }); 
  // Create a layer control containing our baseMaps
  // Be sure to add an overlay Layer containing the earthquake GeoJSON
  L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
  }).addTo(myMap);
  
  // Add legend
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function () {
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [-10, 10, 30, 50, 70, 90];
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      };
      return div;
  };
  legend.addTo(myMap);
}); 
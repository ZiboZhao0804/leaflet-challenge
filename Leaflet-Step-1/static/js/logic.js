// Create a map object
var myMap = L.map("map", {
    center: [15.5994, -28.6731],
    zoom: 3
  });

L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    tileSize: 512,
    zoomOffset: -1,
    id: "light-v10",
    accessToken: API_KEY
  }).addTo(myMap);

function getColor(d) {
    return d > 90  ? '#E31A1C' :
           d > 70  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 30   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}

var legend = L.control({position: 'bottomright'});

legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

// Store our API endpoint as queryUrl
// Use all earthquakes from the past 7 days
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var earthquakeData =[];
// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
    console.log(data.features);
    features = data.features;
    //  Using the features array sent back in the API data, create a GeoJSON layer and add it to the map
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
    console.log(earthquakeData);
    earthquakeData.forEach(
        function(e){
          L.circleMarker(e.location,{
            fillOpacity:0.75,
            color:getColor(e.depth),
            radius: e.mag*5,
            fillColor: getColor(e.depth)
          }).bindPopup(`<h2>${e.place}</h2><hr>Mag: ${e.mag}<hr>Depth: ${e.depth}<hr>latitude/longitude: ${e.location}`)
          .addTo(myMap);
        }
    );
}); 

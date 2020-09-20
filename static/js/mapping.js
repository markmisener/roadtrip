

function formatPointData(pointData) {
  /* format for API request, lng,lat;lng,lat...
  */
  var coordinatesArray = [];
  pointData.features.forEach(element => coordinatesArray.push(element.geometry.coordinates));

  var stringifiedCoordinatesArray = [];
  coordinatesArray.forEach(point => stringifiedCoordinatesArray.push(point.join(',')));

  return stringifiedCoordinatesArray.join(';')
}

function requestData(requestUrl) {
  /* make API request
  */
  return $.ajax({
    method: 'GET',
    url: requestUrl
  });
};

function addDataToMap(map, pointData, geometry) {
  /* add point data and route geometry to the map
  */
  map.addLayer({
    "id": "route",
    "type": "line",
    "source": {
      "type": "geojson",
      "data": {
        "type": "Feature",
        "properties": {},
        "geometry": geometry
      }
    },
    "paint": {
      "line-color": "#03AA46",
      "line-width": 4,
      "line-opacity": 0.5
    }
  });

  map.addSource("points", {
    'type': 'geojson',
    'data': pointData
  });

  map.addLayer({
    'id': 'pointData',
    'type': 'circle',
    'source': "points",
    'paint': {
      'circle-radius': 5,
      'circle-color': "purple"
    }
  });

  map.on('click', 'pointData', function(e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = '<h3>' + e.features[0].properties.Name + '</h3>' +
      '<h4>' + '<b>' + 'Lodging: ' + '</b>' + e.features[0].properties.Lodging + '</h4>';

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    //add Popup to map
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);

  });

  map.on('mouseenter', 'pointData', function() {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'pointData', function() {
    map.getCanvas().style.cursor = '';
  });

  var bbox = turf.bbox(pointData);
  map.fitBounds(bbox, {
    padding: 50
  });
}


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

  pointData.features.forEach(function(marker, i) {
    var el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = '<span><b>' + (i + 1) + '</b></span>'

    new mapboxgl.Marker(el)
      .setLngLat(marker.geometry.coordinates)
      .setPopup(new mapboxgl.Popup({
          offset: 25
        })
        .setHTML('<h3>' + marker.properties.Name + '</h3>' +
                 '<h4>' + marker.properties.Lodging + '</h4>'))
      .addTo(map);
  });

  var bbox = turf.bbox(pointData);
  map.fitBounds(bbox, {
    padding: 50
  });
}

STATE = {
  "lastClickedDescriptionId": null,
}

function toggleVisibility(id) {
   var e = document.getElementById(id);
   if (e.style.display == 'block') {
     e.style.display = 'none';
   } else {
     e.style.display = 'block';
   }
}

function buildLocationList(data) {
  pointData.features.forEach(function(location, i){
    var prop = location.properties;

    var listings = document.getElementById('listings');
    var listing = listings.appendChild(document.createElement('div'));
    listing.id = `listing-${prop.id}`;
    listing.className = 'item';

    var link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';
    link.id = `link-${prop.id}`;
    link.innerHTML = prop.name;

    var details = listing.appendChild(document.createElement('div'));
    details.innerHTML = prop.lodging;

    var description = details.appendChild(document.createElement("div"));
    var descriptionId = `link-${prop.id}-description`;
    description.setAttribute("id", descriptionId);
    description.setAttribute("hidden", true);
    description.innerHTML = prop.description;

    link.addEventListener('click', function(e) {
      for (var i = 0; i < data.features.length; i++) {
        if (this.id === `link-${data.features[i].properties.id}`) {
          var thisDescriptionId = `${this.id}-description`

          // open clicked description
          toggleVisibility(thisDescriptionId);

          // close the last open description
          if (STATE.lastClickedDescriptionId !== null & thisDescriptionId !== STATE.lastClickedDescriptionId) {
            if (document.getElementById(STATE.lastClickedDescriptionId).style.display === 'block') {
              toggleVisibility(STATE.lastClickedDescriptionId);
            }
          }

          // center on marker, open popup
          if (thisDescriptionId !== STATE.lastClickedDescriptionId) {
            var clickedListing = data.features[i];
            var coords = clickedListing.geometry.coordinates;
            map.flyTo([coords[1] + 0.3, coords[0]], 10)
            document.getElementById(`marker-${clickedListing.properties.id}`).click();

            STATE.lastClickedDescriptionId = thisDescriptionId;
          }
        }
      }
    });
  });
}

function generatePopupContent(feature) {
  var images = feature.properties.images;
  var captions = feature.properties.captions;
  var slideshowContent = '';
  for ( var i = 0; i < images.length; i++ ) {
      slideshowContent += '<div class="image' + (i === 0 ? ' active' : '') + '">' +
                            `<img src="${images[i]}" />` +
                            `<div class="caption">${captions[i]}</div>` +
                          '</div>';
  }

  var popupContent =  `<div id="${feature.properties.city}-popup" class="popup">` +
                          `<h3>${feature.properties.name}</h3>` +
                          `<div class="slideshow">${slideshowContent}</div>` +
                          '<div class="cycle">' +
                            '<a href="#" class="prev">&laquo; Previous</a>' +
                            '<a href="#" class="next">Next &raquo;</a>' +
                          '</div>'
                      '</div>';

  return popupContent
}

function onEachFeature(feature, layer) {
  if (feature.properties && feature.properties.popupContent) {
      layer.bindPopup(feature.properties.popupContent, {
        closeButton: true,
        closeOnClick: true,
        minWidth: 350,
        offset: L.point(-5, -25)
      })
      layer.setIcon(new L.DivIcon({
        className:"marker",
        html:`<div id="marker-${feature.properties.id}"><span><b>${feature.properties.id}</b></span></div>`
      }));
  }
}

function formatPointData(f) {
  var coordinatesArray = [];
  f.forEach(element => coordinatesArray.push(element.geometry.coordinates));

  var stringifiedCoordinatesArray = [];
  coordinatesArray.forEach(point => stringifiedCoordinatesArray.push(point.join(',')));

  return stringifiedCoordinatesArray.join(';')
}

function handleRouteData(coordinates) {
  var feature = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "LineString",
      "coordinates": coordinates
    }
  }

  L.geoJSON(feature).addTo(map)
}

function makeRoute(pointArr) {
  var chunks = [];
  for (var i=0; i < pointArr.length; i+= 25) {
    if (i === 0) {
      chunks.push(pointArr.slice(0, 25));
    }
    else if (i < pointArr.length - 25) {
      chunks.push(pointArr.slice(i-1, i+25));
    } else {
      var arrWithHome = pointArr.slice(i-1, i+25).concat(pointArr[0]);
      chunks.push(arrWithHome);
    }
  }

  for (var i=0; i < chunks.length; i++) {
      var pointsString = formatPointData(chunks[i]);
      var baseUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving'
      var requestUrl = `${baseUrl}/${pointsString}.json?access_token=${L.mapbox.accessToken}&geometries=geojson&overview=full`
      var response = $.ajax({
        method: 'GET',
        dataType: "json",
        url: requestUrl,
        success: function(data) {
          handleRouteData(data.routes[0].geometry.coordinates)
        }
      });
  };
}

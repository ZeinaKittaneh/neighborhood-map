var map;
// Create a new blank array for all the listing markers.
var markers = [];
// to track marker that is currently bouncing
var currentMarker = null;

function initMap() {
  var mapStyles = [];
  $.getJSON("js/map-style.json", function (data) {
         // THE ARRAY TO STORE JSON ITEMS.
    $.each(data, function (index, value) {
        mapStyles.push(value); // PUSH THE VALUES INSIDE THE ARRAY.
    });
  });
  map = new google.maps.Map(document.getElementById('map'),{
    center: {lat: 45.5017, lng: -73.5673},
    styles: mapStyles,
    zoom: 13
  });

  var largeInfowindow = new google.maps.InfoWindow();
  var locations = montrealAttractions;
  var locationInfo = "";

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    console.log("add ", locations[i].title);
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
     var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open an infowindow at each marker and
    //adding bouncing animation
    marker.addListener('click', (function(thisMarker) {
      return function(){
        getInfoWikipedia(thisMarker, largeInfowindow);
      };
    })(marker));

  //Loop through the markers array and display them all
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow, locationInfo) {
  console.log("information = ", locationInfo);
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div><b>' + marker.title + '</b><br/>' +
                          locationInfo + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    // remove the bounce from the "old" marker
    if (currentMarker != null) currentMarker.setAnimation(null);
    // set this marker to the currentMarker
    currentMarker = marker;
    // add a bounce to this marker
    marker.setAnimation(google.maps.Animation.BOUNCE);
    //make it bounce for few seconds
    setTimeout(function(){ marker.setAnimation(null); }, 2000);
  }
}

async function getInfoWikipedia(thisMarker, infowindow){
    var content = "";
    var url = "https://en.wikipedia.org/w/api.php?action=opensearch&search="
              + thisMarker.title + "&limit=1&format=json";
    fetch(url, {
      headers : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
    }).then(function(response) {
        response.json().then(function(data) {
          console.log(data[2]);
          populateInfoWindow(thisMarker, infowindow, data[2]);
          console.log("response : ", data[2])
        });
      })
      .catch(function() {
          content = "error happened during fetching information";
          populateInfoWindow(thisMarker, largeInfowindow, data[2]);
      });
  }
}

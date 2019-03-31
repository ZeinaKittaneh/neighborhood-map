var map;
// Create a new blank array for all the listing markers.
var markers = [];
// to track marker that is currently bouncing
var currentMarker = null;
var lastInfoWindow;
var locations;

var montrealAttractions = [
  {
    title:"Mount Royal",
    location:{lat: 45.5071, lng: -73.5874},
    type:"hill"
  },
  {
    title:"Old Montreal",
    location:{lat: 45.5075, lng: -73.5544},
    type:"historic buildings"
  },
  {
    title:"Botanical Garden",
    location:{lat: 45.5600, lng: -73.5630},
    type:"park"
  },
  {
    title:"Notre-Dame Basilica (Montreal)",
    location:{lat: 45.5045, lng: -73.5561},
    type:"church"
  },
  {
    title:"Lachine Canal",
    location:{lat: 45.4666648, lng: -73.589330976},
    type:"canal national historic site"
  },
  {
    title:"Parc Jean-Drapeau",
    location:{lat: 45.5171, lng: -73.5336},
    type:"park"
  },
  {
    title:"Montreal Museum of Fine Arts",
    location:{lat: 45.4985, lng: -73.5794},
    type:"museum"
  },
  {
    title:"Pointe-à-Callière Museum",
    location:{lat: 45.5027, lng: -73.5542},
    type:"museum"
  },
  {
    title:"Place des Arts",
    location:{lat: 45.5083, lng: -73.5664},
    type:"museum"
  },
  {
    title:"Atwater Market",
    location:{lat: 45.5365, lng: -73.6147},
    type:"market"
  }
];

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
  console.log("array length : ", montrealAttractions.length);
  montrealAttractions.forEach(function(attraction){
      // Get the position from the location array.
      console.log("add ", attraction.title);
      var position = attraction.location;
      var title = attraction.title;
      // Create a marker per location, and put into markers array.
       var marker = new google.maps.Marker({
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i,
      });
      // Push the marker to our array of markers.
      markers.push(marker);
      // Create an onclick event to open an infowindow at each marker and
      //adding bouncing animation
      marker.addListener('click', (function(thisMarker) {
        return function(){
          getInfoWikipedia(thisMarker);
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
  });
}//end of initMAp

async function getInfoWikipedia(thisMarker){
  var infowindow = new google.maps.InfoWindow();
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

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow, locationInfo) {
  if(lastInfoWindow)
    lastInfoWindow.close();
  console.log("information = ", locationInfo);
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div><b>' + marker.title + '</b><br/>' +
                          locationInfo + '</div>');
    infowindow.open(map, marker);
    lastInfoWindow = infowindow;
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

var ViewModel = function() {

    var self = this;

    var attractions;
	  self.filter = ko.observable("");
    self.searchInput = ko.observable("");

    if(self.searchInput == ""){
      self.visibleAttractions = montrealAttractions;
    }

    this.visibleAttractions = ko.computed(function() {
        var result = [];
        markers.forEach(function(marker) {
            if (marker.title.toLowerCase().includes(
                self.search().toLowerCase())) {
                result.push(marker);
                marker.setVisible(true);
            } else {
                marker.setVisible(false);
            }
        });

        return result;
    }, this);
	  // self.visibleAttractions = ko.computed( function() {
  	// 	attractions = [];
  // 		montrealAttractions.forEach(function(attraction) {
  // 			if (attraction.title.toLowerCase().indexOf(self.filter().toLowerCase()) > -1) {
  // 				attractions.push(attraction);
  // 				attraction.marker.setMap(map);
  // 			}else{
  // 				attraction.marker.setMap(null);
  // 			}
	// 	});
	// 	return attractions;
	// });

    this.displayInfo = function(parent) {
      if(lastInfoWindow)
        lastInfoWindow.close();
      markers.forEach(function(marker){
        if(marker.title == parent.title)
          getInfoWikipedia(marker);
      });
      console.log("display :", parent.title);
    };

};

ko.applyBindings(new ViewModel());

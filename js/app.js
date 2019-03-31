function initMap() {
  var mapStyles = [];
  $.getJSON("js/map-style.json", function (data) {
         // THE ARRAY TO STORE JSON ITEMS.
    $.each(data, function (index, value) {
        mapStyles.push(value);       // PUSH THE VALUES INSIDE THE ARRAY.
    });
  });
  map = new google.maps.Map(document.getElementById('map'),{
    center: {lat: 45.5017, lng: -73.5673},
    styles: mapStyles,
    zoom: 13
  });
  var location1 = {lat: 45.5017, lng: -73.5673};
  var marker = new google.maps.Marker({
    position: location1,
    map: map,
    title: 'Montreal'
  });
  var infoWindow = new google.maps.InfoWindow({
    content: "my current location!"
  });
  marker.addListener('click', function(){
    infoWindow.open(map, marker);
  });
}

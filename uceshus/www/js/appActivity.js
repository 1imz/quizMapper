// the variables
// and a variable that will hold the layer itself – we need to do this outside the function so that we can use it to remove the layer later on 
var earthquakelayer;
// a global variable to hold the http request
var client;
// store the map
var mymap;

var testMarkerRed = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'red'
});

var testMarkerPink = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'pink'
});

var popup = L.popup();

// this is the code that runs when the App starts

	loadMap();
	trackLocation();
	//showPointLineCircle();
	
		
		
// ***********************************
// the functions

function trackLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition);
    } else {
		alert("geolocation is not supported by this browser");
    }
}
function showPosition(position) {
	// draw a point on the map
	L.marker([position.coords.latitude, position.coords.longitude]).addTo(mymap).bindPopup("<b>You were at "+ position.coords.longitude + " "+position.coords.latitude+"!</b>");mymap.setView([position.coords.latitude, position.coords.longitude], 13);
	}

function loadMap(){
		mymap = L.map('mapid').setView([51.505, -0.09], 13);
		// load the tiles
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
		}).addTo(mymap);

} 

function getDistance() {
	// getDistanceFromPoint is the function called once the distance has been found
	navigator.geolocation.getCurrentPosition(getDistanceFromPoint);
}

function getDistanceFromPoint(position) {
	// find the coordinates of a point using this website:
	// these are the coordinates for Warren Street
	var lat = 51.524616;
	var lng = -0.13818;
	// return the distance in kilometers
	var distance = calculateDistance(position.coords.latitude, position.coords.longitude, lat,lng, 'K');
	document.getElementById('showDistance').innerHTML = "Distance: " + distance;
}

// code adapted from https://www.htmlgoodies.com/beyond/javascript/calculate-the-distance-between-two-points-inyour-web-apps.html
function calculateDistance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var radlon1 = Math.PI * lon1/180;
	var radlon2 = Math.PI * lon2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var subAngle = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	subAngle = Math.acos(subAngle);
	subAngle = subAngle * 180/Math.PI; // convert the degree value returned by acos back to degrees from radians
	dist = (subAngle/360) * 2 * Math.PI * 3956; // ((subtended angle in degrees)/360) * 2 * pi * radius )
	// where radius of the earth is 3956 miles
	if (unit=="K") { dist = dist * 1.609344 ;} // convert miles to km
	if (unit=="N") { dist = dist * 0.8684 ;} // convert miles to nautical miles
	return dist;
}

// call the server
function getGeoJSON() {
   // set up the request
   client = new XMLHttpRequest();
   // make the request to the URL
   client.open('GET','http://developer.cege.ucl.ac.uk:30263/getGeoJSON/uk_poi_subset/geom');
   // tell the request what method to run that will listen for the response
   client.onreadystatechange = earthquakeResponse;  // note don't use earthquakeResponse() with brackets as that doesn't work
   // activate the request
   client.send();
}
// receive the response
function earthquakeResponse() {
  // wait for a response - if readyState is not 4 then keep waiting 
  if (client.readyState == 4) {
    // get the data from the response
    var earthquakedata = client.responseText;
    // call a function that does something with the data
    loadearthquakelayer(earthquakedata);
  }
}
function loadearthquakelayer(earthquakedata) {
      // convert the text received from the server to JSON 
      var earthquakejson = JSON.parse(earthquakedata );

      // load the geoJSON layer
      var earthquakelayer = L.geoJson(earthquakejson,
        {
            // use point to layer to create the points
            pointToLayer: function (feature, latlng)
            {
              // look at the GeoJSON file - specifically at the properties - to see the earthquake magnitude and use a different marker depending on this value
              // also include a pop-up that shows the place value of the earthquakes
              if (feature.properties.mag > 1.75) {
                 return L.marker(latlng, {icon:testMarkerRed}).bindPopup("<b>"+feature.properties.place +"</b>");
              }
              else {
                // magnitude is 1.75 or less
                return L.marker(latlng, {icon:testMarkerPink}).bindPopup("<b>"+feature.properties.place +"</b>");;
              }
            },
        }).addTo(mymap); 
    mymap.fitBounds(earthquakelayer.getBounds());
}


//function showPointLineCircle(){
	// add a point
	//L.marker([51.5, -0.09]).addTo(mymap).bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();

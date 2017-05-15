(function(){

  var map = L.map('big-map-canvas', {
    center: [40, -125],
    zoom: 4,
    // maxBounds: bounds,
    maxBoundsViscosity:.7,
    minZoom: 4,
    scrollWheelZoom: false
  });

  //add OSM base tilelayer
  L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    minZoom:2
  }).addTo(map);

  //create section watchers
  var exploreWatcher = scrollMonitor.create($('#exploration'));
  //code watches for when the user scrolls to section1
  var whereWatcher = scrollMonitor.create($('#where'));


  //add 2016 call center data to map
  var callData2016 = L.tileLayer('https://api.mapbox.com/styles/v1/leanneabraham/cj299g6h100022rphvjdys5u4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGVhbm5lYWJyYWhhbSIsImEiOiJjaXVvZjVtNGEwMTBiMm9wZWgxM2NjNjJtIn0.0SuLczxyMd4gPzPVU5YD7g').addTo(map);


  //use d3.queue to parallelize asynchronous data loading
  d3.queue()
  .defer(d3.csv, "data/HumanTrafficking_CLDB.csv")
  .defer(d3.json, "data/Judicial_Districts_Dissolved.geojson")
  .defer(d3.json, "data/CircutCourts.geojson")
  .await(callback);



  //cleans up text because we entered it all manually
  function sanitize (word) {
    return word.toLowerCase().trim().split(' ').join('_');
  };


  function callback (error, caseStories, districts, courts){
    //joining data to court district polygons
    for (var k = 0; k < districts.features.length; k++) {
      districts.features[k].properties.cases = []
      var allDistricts = districts.features[k];
      var jdName = allDistricts.properties.JD_NAME;
      //loop over every row in the csv
      for (var i = 0; i < caseStories.length; i++) {
        var story = caseStories[i];
        //make all keyfield names in csv into a single variable
        var allCourts = story.CourtJoinName;
        if (sanitize(allCourts) === sanitize(jdName)) {
          //push the stories to the district polygons
          allDistricts.properties.cases.push(story);
        };
      };
    };

    //return statement notifying when this happens
    whereWatcher.enterViewport(function () {
      //changes the scale and zoom location to user location
      //map.flyTo(new L.LatLng(46,-94), 6, {animate: true});
      getUserLocation();
      callData2016.addTo(map);
      createCourts(courts);
      createDistricts(districts);
    });

    //adds map layers when final section is in view
    //return statement notifying when this happens
    exploreWatcher.enterViewport (function () {
      //changes the scale and zoom location to continental US
      map.flyTo(new L.LatLng( 40, -125), 4, {animate: true});
      callData2016.remove();
      createCourts(courts);
      createDistricts(districts);
    });
    var circutCourts, courtDistricts;

    //Add polygons of the human trafficing district court regions
    function createCourts(courts){
      if (exploreWatcher.isInViewport === true) {
        //create a Leaflet GeoJSON layer and add it to the map
        circutCourts = L.geoJson(courts, {
          style: style
        }).addTo(map);
      } else if (typeof circutCourts != 'undefined') {
        circutCourts.remove();
      }
    };


    //Add polygons of the human trafficing district court regions
    function createDistricts(districts, courts){
      if (exploreWatcher.isInViewport === true) {
        //create a Leaflet GeoJSON layer and add it to the map
        courtDistricts = L.geoJson(districts, {
          style: style
        }).addTo(map);

      } else if  (typeof courtDistricts != 'undefined'){
        courtDistricts.remove();
      }
    };
    //find the max number of cases in a single district for the entire dataset
    var max = d3.max(districts.features.map(function (feature) { return feature.properties.cases.length; }));

    //creates styles for use in the two court layers
    function style(feature) {
      if (typeof feature.properties.JD_NAME === 'undefined'){
        return {
          weight: 1,
          opacity: 1,
          color: 'white',
          fillOpacity: 0,
          fillColor: 'black'
        };
      } else {
        return {
          weight: .25,
          opacity: 1,
          color: 'tomato',
          //this fill opacity will need to be set based on a function that determines opacity by returning a number between 1 and 0
          fillOpacity: parseFloat(feature.properties.cases.length / (max/2)),
          fillColor: 'tomato'
        };
      }
    }


function getUserLocation(){
    //basic jQuery ajax method
    $.ajax("http://freegeoip.net/json/", {
        dataType: "json",
        success: function(response){
          console.log(response);
          var userLocation = [response.latitude, response.longitude];
          var userState = response.region_name;
          //Insert callback function to zoom to user location
          //zoomtoUser(userLocation);
          showStateData(userState);
        }
    });
};

function zoomtoUser(userLocation, userState){
    var latitude = userLocation[0];
    var longitude = userLocation[1]-1;
    map.flyTo(new L.LatLng(latitude, longitude), 8, {animate: true});
}

function showStateData(userState){
    $.ajax("Data/StateCentroid.geojson", {
      dataType: "json",
      success: function(response){
        var allStates = response.features;
        for (var i = 0, l = allStates.length; i < l; i++){
          var obj = allStates[i];
          if (obj.properties["State"] == userState){
            console.log(obj.properties);
            console.log("You can access the user state in the geojson centroid now")
            console.log(obj.properties["latitude"]);
            console.log(obj.properties["longitude"]);
            map.flyTo(new L.LatLng(obj.properties["latitude"],(obj.properties["longitude"]-5)), 6, {animate: true});
          }

        }
      }
    });
};

  };
})();

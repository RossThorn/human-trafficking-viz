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

  //add 2016 call center data to map
  var callData2016 = L.tileLayer('https://api.mapbox.com/styles/v1/leanneabraham/cj299g6h100022rphvjdys5u4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGVhbm5lYWJyYWhhbSIsImEiOiJjaXVvZjVtNGEwMTBiMm9wZWgxM2NjNjJtIn0.0SuLczxyMd4gPzPVU5YD7g').addTo(map);

  //code watches for when the user scrolls to section1
  var whereWatcher = scrollMonitor.create($('#where'));
  //return statement notifying when this happens
  whereWatcher.enterViewport(function () {
    //changes the scale and zoom location to just wisconsin
    map.flyTo(new L.LatLng(46,-94), 6, {animate: true});
    callData2016.addTo(map);
    addPolygons ();
  });

  //adds map layers when final section is in view
  var exploreWatcher = scrollMonitor.create($('#exploration'));
  //return statement notifying when this happens
  exploreWatcher.enterViewport (function () {
    //changes the scale and zoom location to continental US
    map.flyTo(new L.LatLng( 40, -125), 4, {animate: true});
    callData2016.remove();
    addPolygons ();
  });

  $(window).on("resize", function () {
    $("#big-map-canvas").height($(window).height());
    map.invalidateSize();
  }).trigger("resize");

  $(document).ready(function() {
    $(window).resize(function() {
      var bodyheight = $(this).height();
      $("#page-content").height(bodyheight-70);
    }).resize();
  });

  function addPolygons (){
    //Add circuit court data to map
    $.ajax("data/CircutCourts.geojson", {
      dataType: "json",
      success: createCourts
    });
    //Add circuit court data to map
    $.ajax("data/Judicial_Districts_Dissolved.geojson", {
      dataType: "json",
      success: createDistricts
    });
  };

  var circutCourts, courtDistricts;

  //Add polygons of the human trafficing district court regions
  function createCourts(courts){
    if (exploreWatcher.isInViewport === true) {
      //console.log("true")
      //create a Leaflet GeoJSON layer and add it to the map
      circutCourts = L.geoJson(courts, {
        style: style
      }).addTo(map);
    } else if (typeof circutCourts != 'undefined') {

          circutCourts.remove();

      }
  };


  //Add polygons of the human trafficing district court regions
  function createDistricts(districts){
    if (exploreWatcher.isInViewport === true) {
      //create a Leaflet GeoJSON layer and add it to the map
      courtDistricts = L.geoJson(districts, {
        style: style
      }).addTo(map);

    } else if  (typeof courtDistricts != 'undefined'){
      courtDistricts.remove();
    }
  };

  //creates styles for use in the two court layers
  function style(data) {
    joiningData(data);
    if (typeof data.properties.JD_NAME === 'undefined'){
      return {
        weight: .75,
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
        fillOpacity: .25,
        fillColor: 'tomato'
      };
    }
  }

  //call csv data to join
  $.ajax("data/HumanTrafficking_CLDB.csv", {
    //dataType: "text",
    success: joiningData
  });

  //joining data to court district polygons
  function joiningData (data){
    //console.log(data);
  };

  // //style court boundaries
  // function (createDistricts){
  //   if(feature.properties.PARTY === 'Democrat'){
  //       return {color: 'blue', weight: 2 };
  //     } else if(feature.properties.PARTY === 'Republican'){
  //       return { color: 'red', weight: 2 }
  // };

  ///////////////////////////////////////////////////////////////////////////////
  //
  // function pointToLayer(feature, latlng){
  //     //create marker options
  // var options = {
  //     radius: 0.5,
  //     fillColor: "tomato",
  //     color: "tomato",
  //     weight: 1,
  //     opacity: 1,
  //     fillOpacity: 0.6
  // };

  //      var layer = L.circleMarker(latlng, options);
  //
  //      return layer;
  //  };

})();

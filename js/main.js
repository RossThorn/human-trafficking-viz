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

  //code watches for when the user scrolls to teh first section1
  var firstSectionWatcher = scrollMonitor.create($('#section1'));
  //return statement notifying when this happens
  firstSectionWatcher.enterViewport(function () {
    console.log('in viewport now');
    var firstchange = map.setView(new L.LatLng(46,-94), 6, {animate: true});
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

  $.ajax("data/Calls_2016_Random.geojson", {
    dataType: "json",
    success: createHotlineDots
  });

  //Add circle markers for point features to the map
  function createHotlineDots(data){
      //create a Leaflet GeoJSON layer and add it to the map
      L.geoJson(data, {
        pointToLayer: function(feature, latlng){
           return pointToLayer(feature, latlng);

       }

     }).addTo(map);
  };

 ///////////////////////////////////////////////////////////////////////////////

 function pointToLayer(feature, latlng){
     //create marker options
     var options = {
         radius: 0.5,
         fillColor: "tomato",
         color: "tomato",
         weight: 1,
         opacity: 1,
         fillOpacity: 0.6
     };

      var layer = L.circleMarker(latlng, options);

      return layer;
  };

})();

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

  $.ajax("data/States.geojson", {
    dataType: "json",
    success: createPolygons
  });

  function processPolyData(data){
    var attributes = [];
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    //push each attribute name into attributes array
    for (var attribute in properties){
      //only take attributes with Rank values
      if (attribute.indexOf("postal") > -1){
        attributes.push(attribute);
      };
    };
    return attributes;
  };

  function createPolygons(data) {
    var attributes = processPolyData(data);
    //create a Leaflet GeoJSON layer and add it to the map
    var polyLayer = L.geoJson(data, {
      style: function(feature){
        var options = {
          fillColor: "tomato",
          weight: .5,
          color: "chartreuse",
          opacity: 1,
          fillOpacity: 0.8
        };
        return options;
      },
    });
    var overlays = {
      "States": polyLayer
    };
    L.control.layers(null,overlays,{collapsed:false}).addTo(map);
  };
})();

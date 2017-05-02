(function(){

  var attributes = [];

  function createMap(){

    // var southWest = L.latLng(39, -98),
    // northEast = L.latLng(50, -79),
    // bounds = L.latLngBounds(southWest, northEast);

    //create the map
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

    // Create necessary panes in correct order
    // map.createPane("pointsPane");
    // map.createPane("polygonsPane");


    //call getData function
    getCountryShapeData(map);
    //         getData(map);
    $(window).on("resize", function () { $("#big-map-canvas").height($(window).height()); map.invalidateSize(); }).trigger("resize");
    $(document).ready(function() {$(window).resize(function() {
      var bodyheight = $(this).height();
      $("#page-content").height(bodyheight-70);
    }).resize();
  });


};

////////////////////////////////////////////////////////////////////////////////

function getCountryShapeData(map){
  //load the data
  $.ajax("data/States.geojson", {
    dataType: "json",
    success: function(response){
      var polyAttributes = processPolyData(response);
      createPolygons(response, map, attributes);
    }
  });
};

////////////////////////////////////////////////////////////////////////////////

function processPolyData(data){
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

///////////////////////////////////////////////////////////////////////////////

function createPolygons(data, map, attributes){
  //create a Leaflet GeoJSON layer and add it to the map
  var polyLayer = L.geoJson(data, {
    style: function(feature){
      //console.log(feature);
      var options = {
        fillColor: "tomato",
        weight: .5,
        color: "chartreuse",
        opacity: 1,
        fillOpacity: 0.8
      };

      //console.log(options.fillColor);
      return options;
    },
    // pane:"polygonsPane"
  });
  var overlays = {
    "States": polyLayer
  };
  L.control.layers(null,overlays,{collapsed:false}).addTo(map);

};

///////////////////////////////////////////////////////////////////////////////

$(document).ready(createMap);

})();

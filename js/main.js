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

  function callback (error, caseStories, districts, courts){

    //return statement notifying when this happens
    whereWatcher.enterViewport(function () {
      //changes the scale and zoom location to just wisconsin
      map.flyTo(new L.LatLng(46,-94), 6, {animate: true});
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
          if (allCourts === jdName) {
            //push the stories to the district polygons
            allDistricts.properties.cases.push(story);
          };
        };
      };
      console.log(districts.features[13].properties.cases[0].Court);
    };

    //I'm not sure what this does or if we need it
    // $(window).on("resize", function () {
    //   $("#big-map-canvas").height($(window).height());
    //   map.invalidateSize();
    // }).trigger("resize");
    //
    // $(document).ready(function() {
    //   $(window).resize(function() {
    //     var bodyheight = $(this).height();
    //     $("#page-content").height(bodyheight-70);
    //   }).resize();
    // });

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

  })();

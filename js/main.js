(function(){
  var pageCheck = 0;
  var loopCheck = 0;
  var map = L.map('big-map-canvas', {
    center: mapCenter (),
    zoom: mapZoom(),
    // maxBounds: bounds,
    maxBoundsViscosity:.7,
    //minZoom: 4,
    scrollWheelZoom: false,
    zoomControl: true
  });
  // change map center for mobile
  function mapCenter (){
    if (window.innerWidth > 600) {return [40, -125]}
    else {return [40, -98]}
  };
  //change map zoom level based on screensize
  function mapZoom (){
    var d = [3, 4]
    if (window.innerWidth > 600) {return d[1]}
    else {return d[0]}
  };

  //add OSM base tilelayer
  L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
  }).addTo(map);

  //Accordion implementation for text sections
  var acc = document.getElementsByClassName("accordion");
  var a;

  for (a = 0; a < acc.length; a++) {
    acc[a].onclick = function(){
      /* Toggle between adding and removing the "active" class,
      to highlight the button that controls the panel */
      this.classList.toggle("active");

      /* Toggle between hiding and showing the active panel */
      var questions = this.nextElementSibling;
      if (questions.style.display === "block") {
        questions.style.display = "none";
      } else {
        questions.style.display = "block";
      }
    }
  }

  //create section watchers
  var exploreWatcher = scrollMonitor.create($('#explore'));
  //code watches for when the user scrolls to section1
  var whereWatcher = scrollMonitor.create($('#where'));
  var statsWatcher = scrollMonitor.create($('#calls'));
  var amberWatcher = scrollMonitor.create($('#amber'));


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
      callData2016.addTo(map);
      //createCourts();
      //createDistricts();
    });

    statsWatcher.enterViewport(function () {
      //changes the scale and zoom location to user location
      map.flyTo(new L.LatLng(46,-94), 6, {animate: true});
      if (pageCheck == 0){
        getUserLocation();
      };
    });

    //return statement notifying when this happens
    amberWatcher.enterViewport(function () {
      //changes the scale and zoom location to user location
      map.flyTo(new L.LatLng(38.6,-92), 8, {animate: true});
    });

    //adds map layers when final section is in view
    //return statement notifying when this happens
    exploreWatcher.enterViewport (function () {
      //changes the scale and zoom location to continental US
      map.flyTo(new L.LatLng(40, -125), 4, {animate: true});
      callData2016.remove();
      //createCourts();
      createDistricts();
    });
    var circuitCourts, courtDistricts;
    // create configuration for checkboxes that
    // contain filters to control which data is active
    var checkboxFilters = {
      maleVictim: {
        fn: function (d) {
          return d['MaleVictim(s)'] && d['MaleVictim(s)'].toUpperCase() === 'YES';
        }
      },
      femaleVictim: {
        fn: function (d) {
          return d['FemaleVictim(s)'] && d['FemaleVictim(s)'].toUpperCase() === 'YES';
        }
      },
      minors: {
        fn: function (d) {
          return d['MinorsIncluded'] && d['MinorsIncluded'].toUpperCase() === 'YES';
        }
      },
      femaleDefendant: {
        fn: function (d) {
          return d['FemaleDefendant(s)'] && d['FemaleDefendant(s)'].toUpperCase() === 'YES';
        }
      },
      maleDefendant: {
        fn: function (d) {
          return d['MaleDefendant(s)'] && d['MaleDefendant(s)'].toUpperCase() === 'YES';
        }
      }
    };

    // filter only active cases
    function applyCheckboxFilters (cases) {
      if (!cases || !cases.length) {
        return [];
      }
      var active = cases;
      for (var filter in checkboxFilters) {
        if (checkboxFilters[filter].active) {
          active = active.filter(checkboxFilters[filter].fn);
        }
      }
      return active;
    }

    // hook up check boxes to exploration map
    $('.exploration-form').find('input[type="checkbox"]')
    .on('change', function (e) {
      var target = $(e.currentTarget);
      var dataValue = target.data('value');
      var filter = checkboxFilters[dataValue];
      filter.active = target.is(':checked');
      createDistricts();
    });

    //Add polygons of the human trafficing district court regions
    function createCourts(){
      if (exploreWatcher.isInViewport === true) {
        //create a Leaflet GeoJSON layer and add it to the map
        //create a Leaflet GeoJSON layer and add it to the map
        if (circuitCourts && typeof circuitCourts.remove === 'function') {
          circuitCourts.remove();
        }
        circuitCourts = L.geoJson(courts, {
          style: style
        }).addTo(map);
      } else if (typeof circuitCourts != 'undefined') {
        circuitCourts.remove();
      }
    };

    //Add polygons of the human trafficing district court regions
        function createDistricts(){
          if (typeof courtDistricts == 'undefined'){
            courtDistricts = L.geoJson(districts, {
              style: style
            });
          }
          console.log(courtDistricts);
          if (exploreWatcher.isInViewport === true && districts && !map.hasLayer(courtDistricts)) {
            //create a Leaflet GeoJSON layer and add it to the map
            // if (courtDistricts && typeof courtDistricts.remove === 'function') {
            //   courtDistricts.remove();
            // }
            courtDistricts.addTo(map);
            updateActiveCases();
          } else {
            console.log("fired");
            courtDistricts.remove();
          }
        };

    //changes the text of the cases that fit the description based on user input (the sorted cases)
    function updateActiveCases () {
      var activeCasesContainer = $('#active-cases');
      var content = $('<div />');
      districts.features.forEach(function (feature) {
        var cases = applyCheckboxFilters(feature.properties.cases);
        cases.forEach(function (d) {
          var caseContent = $('<div />', {
            class: 'active-case'
          });
          caseContent.append($('<h3 />', {
            text: d['Case']
          }));
          caseContent.append($('<em />', {
            text: d['Court']
          }));
          caseContent.append($('<p />', {
            text: d['FactSummary']
          }));
          // caseContent.text(d['FactSummary']);
          // caseContent.addClass('active-case');
          content.append(caseContent);
        });
      });
      activeCasesContainer.html(content.html());
    }

    //find the max number of cases in a single district for the entire dataset
    var max = d3.max(districts.features.map(function (feature) {
      return applyCheckboxFilters(feature.properties.cases).length;
    }));


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
          fillOpacity: parseFloat(applyCheckboxFilters(feature.properties.cases).length / (max/2)),
          fillColor: 'tomato'
        };
      }
    }


    function getUserLocation(){
      //basic jQuery ajax method
      $.ajax("https://freegeoip.net/json/", {
        dataType: "json",
        success: function(response){
          console.log(response);
          var userLocation = [response.latitude, response.longitude];
          var userState = response.region_name;
          console.log(userState);
          //Insert callback function to zoom to user location
          zoomToUserState(userState);
        }
      });
    };


    function zoomToUserState(userState){
        $.ajax("Data/StateCentroid.geojson", {
          dataType: "json",
          success: function(response){
            var allStates = response.features;
            for (var i = 0, l = allStates.length; i < l; i++){
              var obj = allStates[i];
              if (obj.properties["State"] == userState){
                console.log("Location in the US");
                map.flyTo(new L.LatLng(obj.properties["latitude"],(obj.properties["longitude"]-5)), 6, {animate: true});
                if (pageCheck == 0){
                displayStateStatistics(userState);
                  pageCheck = 1;
                  loopCheck = 1;
                };
              };
            }

            if (loopCheck == 0){
              console.log("Location outside the US. Resetting proxy state.");
              map.flyTo(new L.LatLng( 44, -90), 6, {animate: true});
              var proxyState = "Wisconsin";
              displayStateStatistics(proxyState);
              pageCheck = 1;
              loopCheck = 1;
            };

          }
        });
    };


    function displayStateStatistics(userState){
      var csvStates = d3.csv("Data/TotalCallsCases.csv", function(data){

        for (var i = 0, l = data.length; i < l; i++){
          var obj = data[i];

          if (obj.state == userState){
            var stateStats = d3.select("#calls")
            .append("div")
            .attr("class","stats")
            .append("p")
            .html("There were <span id='big-stats'>"+obj.calls+" calls </span> and <span id='big-stats'>"+obj.cases+" trafficking cases</span> reported in "+userState+" from 2012 to 2016.");
          }
        };
      });

    };

  };
})();

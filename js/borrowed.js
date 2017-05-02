/*
interactivity by Jon Schleuss
*/

// Get window width and height
var windowWidth = document.documentElement.clientWidth;
var windowHeight = $(window).height();

// update the big map based on that height if mobile
if (windowWidth < 600) {
  $("#big-map-canvas").css("height",windowHeight+"px");
}

var initZoom = 10;

var initLng = (windowWidth < 600) ? -118.25648 : -118.499;
var initLat = (windowWidth < 600) ? 34.12538 : 34.02538;

var initCoords = (windowWidth < 600) ? [34,-118.25648] :
[34.02538,-118.7];

// function to check for retina
function isHighDensity(){
  return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
}

var map = L.map('big-map-canvas', {
  center: new L.LatLng(initCoords[0],initCoords[1]),
  zoom: initZoom,

  scrollWheelZoom: false,
  zoomControl: false,
  maxBounds: new L.LatLngBounds(
    new L.LatLng(30.77723866322742, -122.30255126953126),
    new L.LatLng(36.56480607840351, -111.12945556640625)
  )
});

// disable all the things
map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();


L.control.zoom({
  position:'bottomright'
}).addTo(map);

// carto's background layer
var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
  attribution: 'Map tiles by <a href="http://cartodb.com/attributions#basemaps">CartoDB</a>, under <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>. Data by <a href="http://www.openstreetmap.org/">OpenStreetMap</a>, under ODbL.',
  opacity: 0.7,
  detectRetina: true
});
map.addLayer(layer);

var pointCSS = "#homeless_totstreetsingadult2016 { \
  marker-fill-opacity: 1; \
  marker-line-color: #FFF; \
  marker-line-width: 0; \
  marker-line-opacity: 1; \
  marker-placement: point; \
  marker-type: ellipse; \
  marker-width: 1.5; \
  marker-allow-overlap: true; \
  marker-fill: #da7c70; \
  [zoom > 11] { \
    marker-width: 2.5; \
  } \
  [zoom > 12] { \
    marker-width: 3.5; \
  } \
  [zoom > 13] { \
    marker-width: 4.5; \
  } \
  [zoom > 14] { \
    marker-width: 5.5; \
  } \
}";

var raceDots = '#homeless_2016_race_dots { \
  marker-fill-opacity: 1; \
  marker-line-color: #FFF; \
  marker-line-width: 0; \
  marker-line-opacity: 1; \
  marker-placement: point; \
  marker-type: ellipse; \
  marker-width: 1.5; \
  marker-allow-overlap: true; \
  marker-fill: #ffc54e; \
  [zoom > 11] { \
    marker-width: 2.5; \
  } \
  [zoom > 12] { \
    marker-width: 3.5; \
  } \
  [zoom > 13] { \
    marker-width: 4.5; \
  } \
  [zoom > 14] { \
    marker-width: 5.5; \
  } \
} \
\
#homeless_2016_race_dots[race="asian"] { \
  marker-fill: #A6CEE3; \
} \
#homeless_2016_race_dots[race="black"] { \
  marker-fill: #b6a8ca; \
} \
#homeless_2016_race_dots[race="latino"] { \
  marker-fill: #94cdc2; \
} \
#homeless_2016_race_dots[race="multi"] { \
  marker-fill: #de9cb7; \
} \
#homeless_2016_race_dots[race="native"] { \
  marker-fill: #e1ae9c; \
} \
#homeless_2016_race_dots[race="pacific"] { \
  marker-fill: #E31A1C; \
} \
#homeless_2016_race_dots[race="white"] { \
  marker-fill: #6d9dc1; \
}';

// var homelessPoints = cartodb.createLayer(map, {
//   user_name: 'latimes',
//   type: 'cartodb',
//   cartodb_logo: false,
//   minZoom: 8,
//   maxZoom: 16,
//   detectRetina: true,
//   sublayers: [{
//     sql: "SELECT * FROM homeless_2016_race_dots",
//     cartocss: pointCSS
//   },{
//     sql: "SELECT * FROM homeless_2016_race_dots",
//     cartocss: raceDots
//   }]
// })
// .addTo(map)
// .done(function(layer){
//   // console.log(layer);
//   // layer.getSubLayer(0).setInteraction(true);
//   layer.getSubLayer(0).show();
//   layer.getSubLayer(1).hide();
//   // console.log(layer.toggle())
//   // layer.getSubLayer(1).show();
//   scrollReady(layer);
// });


// homelessPoints.on("load", function() {
//   var labelTiles = L.tileLayer("http://{s}.basemaps.cartocdn.comdark_only_labels/{z}/{x}/{y}.png").addTo(map);
// });

// list of sections
var introShow = false,
raceShow = false,
ageShow = false,
skidrowShow = false,
veniceShow = false;

var highlightArea = {
  fillColor: "#fff",
  color: "#fff",
  weight: 2,
  opacity: 1,
  fillOpacity: 0.2
};

var hollowArea = {
  fillColor: "#fff",
  color: "#fff",
  weight: 1,
  opacity: 1,
  fillOpacity: 0
}



var paddingLeft = (windowWidth >= 600) ? map.getSize().x / 2 : 0;
var paddingTop = (windowWidth >= 600) ? 0 : 250;

function scrollReady(layer) {

  // detect where user has scrolled to
  $(window).scroll(function() {
    // user location
    var userScroll = $(this).scrollTop();

    var introSection = $('#intro_section'),
    raceSection = $('#race_section'),
    ageSection = $('#age_section'),
    skidrowSection = $('#skidrow_section'),
    veniceSection = $('#venice_section');


    // see which div is in view as user scrolls
    if (userScroll < raceSection.offset().top) {
      // INTRO
      if (!introShow) {
        $(".vis_bullet").removeClass('visible');

        introShow = true;
        raceShow = false;
        ageShow = false;
        skidrowShow = false;
        veniceShow = false;

        // remove any labels
        $('.neighborhood_bounds').remove();
        $('.hoodlabel').remove();

        layer.getSubLayer(0).show();
        layer.getSubLayer(1).hide();
        map.setView(new L.LatLng(initCoords[0],initCoords[1]), initZoom, {animation: true});
      }
    } else if (viewCheck(raceSection)) {
      if (!raceShow) {
        $(".vis_bullet").removeClass('visible');

        // RACE
        // flip this section to true
        introShow = false;
        raceShow = true;
        ageShow = false;
        skidrowShow = false;
        veniceShow = false;

        // remove any labels
        $('.neighborhood_bounds').remove();
        $('.hoodlabel').remove();

        layer.getSubLayer(0).show();
        layer.getSubLayer(1).hide();
        map.setView(new L.LatLng(initCoords[0],initCoords[1]), initZoom, {animation: true});
      }

    } else if (viewCheck(ageSection)) {
      // AGE
      if (!ageShow) {
        $(".vis_bullet").removeClass('visible');


        // remove any other neighborhoods
        $('.neighborhood_bounds').remove();
        $('.hoodlabel').remove();

        introShow = false;
        raceShow = false;
        ageShow = true;
        skidrowShow = false;
        veniceShow = false;
        map.setView(new L.LatLng(initCoords[0],initCoords[1]), initZoom, {animation: true});

      }


    } else if (viewCheck(skidrowSection)) {
      // SKID ROW
      if (!skidrowShow) {
        bulletSelector('skidrow');

        introShow = false;
        raceShow = false;
        ageShow = false;
        skidrowShow = true;
        veniceShow = false;

        // remove any other neighborhoods
        $('.neighborhood_bounds').remove();
        $('.hoodlabel').remove();

        layer.getSubLayer(0).show();
        layer.getSubLayer(1).hide();
        // var centerPoint = map.getSize().divideBy(4);
        // centerPoint.x = centerPoint.x*3;
        // centerPoint.y = map.getSize().divideBy(2).y;
        // console.log(centerPoint)

        // var targetLatLng = map.containerPointToLatLng(centerPoint);

        // console.log(targetLatLng);

        // var coords = new L.LatLng(34.044438, -118.244090);
        // console.log(map.latLngToLayerPoint(coords))
        // offset pan based on maps dimensions


        // add downtowns border
        $.getJSON( 'static/neighborhoods/downtown.geojson', function( data ) {
          var dtlabounds = L.geoJson(data,{style: hollowArea,className:'neighborhood_bounds'}).addTo(map); // add skid row boundaries
          // jump to hood, but padd half the width of the map
          map.fitBounds(dtlabounds.getBounds(),{'paddingTopLeft':[paddingLeft,0],maxZoom:14});

        });

        // map.setView(new L.LatLng(34.044438, -118.244090), 14, {animation: true});
        // map.setView(targetLatLng, 14, {animation: true})
        skidrowShow = true;
        $.getJSON( 'static/neighborhoods/skidrow.geojson', function( data ) {
          var skidrowbounds = L.geoJson(data,{style: highlightArea,className:'neighborhood_bounds'}).addTo(map); // add skid row boundaries
          // jump to hood, but padd half the width of the map
          // var paddingLeft = map.getSize().x / 2;
          // map.fitBounds(skidrowbounds.getBounds(),{'paddingTopLeft':[paddingLeft,0],maxZoom:14});

          // add skid row label
          L.marker([34.041064, -118.237536], {icon: L.divIcon ({
            iconSize: [54, 48],
            iconAnchor: [0, 2],
            className: 'hoodlabel',
            html: 'Skid Row'
          })}).addTo(map);
        });
        // add border
      }
    } else if (viewCheck(veniceSection)) {
      if (!veniceShow) {
        bulletSelector('venice');
        introShow = false;
        raceShow = false;
        ageShow = false;
        skidrowShow = false;
        veniceShow = true;


        // VENICE
        // console.log('venice visibile');
        $('.neighborhood_bounds').remove();
        $('.hoodlabel').remove();
        // map.setView(new L.LatLng(34.044438, -118.244090), 14, {animation: true});
        // map.setView(targetLatLng, 14, {animation: true})
        veniceShow = true;
        $.getJSON( 'static/neighborhoods/venice.geojson', function( data ) {
          var veniceBounds = L.geoJson(data,{style: hollowArea,className:'neighborhood_bounds'}).addTo(map); // add skid row boundaries
          // jump to hood, but padd half the width of the map
          map.fitBounds(veniceBounds.getBounds(),{'paddingTopLeft':[paddingLeft,0]});
        });

      }



    }

    // figures out if passed div is in user's view
    function viewCheck(div) {
      return userScroll + (windowHeight/3) > div.offset().top && userScroll + (windowHeight/3) < div.offset().top + div.outerHeight();
    }
  });

} // scrollReady()

function bulletSelector(hood) {
  $(".vis_bullet").removeClass('visible'); // remove all bullets
  $("#"+hood+"_section h2 i.vis_bullet").addClass('visible');
}

var hoodTotals = [{"slug":"acton","name":"Acton","rounded16":20},
{"slug":"adams-normandie","name":"Adams-Normandie","rounded16":80},
{"slug":"agoura-hills","name":"Agoura Hills","rounded16":20},
{"slug":"agua-dulce","name":"Agua Dulce","rounded16":0},
{"slug":"alhambra","name":"Alhambra","rounded16":60},
{"slug":"alondra-park","name":"Alondra Park","rounded16":20},
{"slug":"altadena","name":"Altadena","rounded16":60},
{"slug":"angeles-crest","name":"Angeles Crest","rounded16":20},
{"slug":"arcadia","name":"Arcadia","rounded16":20},
{"slug":"arleta","name":"Arleta","rounded16":90},
{"slug":"arlington-heights","name":"Arlington Heights","rounded16":120},
{"slug":"artesia","name":"Artesia","rounded16":30},
{"slug":"athens","name":"Athens","rounded16":150},
{"slug":"atwater-village","name":"Atwater Village","rounded16":80},
{"slug":"avalon","name":"Avalon","rounded16":20},
{"slug":"avocado-heights","name":"Avocado Heights","rounded16":90},
{"slug":"azusa","name":"Azusa","rounded16":60},
{"slug":"baldwin-hillscrenshaw","name":"Baldwin Hills/Crenshaw","rounded16":220},
{"slug":"baldwin-park","name":"Baldwin Park","rounded16":110},
{"slug":"bel-air","name":"Bel-Air","rounded16":0},
{"slug":"bellflower","name":"Bellflower","rounded16":240},
{"slug":"bell-gardens","name":"Bell Gardens","rounded16":110},
{"slug":"bell","name":"Bell","rounded16":140},
{"slug":"beverly-crest","name":"Beverly Crest","rounded16":0},
{"slug":"beverly-grove","name":"Beverly Grove","rounded16":110},
{"slug":"beverly-hills","name":"Beverly Hills","rounded16":20},
{"slug":"beverlywood","name":"Beverlywood","rounded16":10},
{"slug":"boyle-heights","name":"Boyle Heights","rounded16":760},
{"slug":"bradbury","name":"Bradbury","rounded16":0},
{"slug":"brentwood","name":"Brentwood","rounded16":80},
{"slug":"broadway-manchester","name":"Broadway-Manchester","rounded16":300},
{"slug":"burbank","name":"Burbank","rounded16":170},
{"slug":"calabasas","name":"Calabasas","rounded16":0},
{"slug":"canoga-park","name":"Canoga Park","rounded16":250},
{"slug":"carson","name":"Carson","rounded16":160},
{"slug":"carthay","name":"Carthay","rounded16":10},
{"slug":"castaic-canyons","name":"Castaic Canyons","rounded16":50},
{"slug":"castaic","name":"Castaic","rounded16":80},
{"slug":"central-alameda","name":"Central-Alameda","rounded16":230},
{"slug":"century-city","name":"Century City","rounded16":10},
{"slug":"cerritos","name":"Cerritos","rounded16":30},
{"slug":"charter-oak","name":"Charter Oak","rounded16":10},
{"slug":"chatsworth","name":"Chatsworth","rounded16":200},
{"slug":"chatsworth-reservoir","name":"Chatsworth Reservoir","rounded16":20},
{"slug":"chesterfield-square","name":"Chesterfield Square","rounded16":140},
{"slug":"cheviot-hills","name":"Cheviot Hills","rounded16":20},
{"slug":"chinatown","name":"Chinatown","rounded16":170},
{"slug":"citrus","name":"Citrus","rounded16":10},
{"slug":"claremont","name":"Claremont","rounded16":30},
{"slug":"commerce","name":"Commerce","rounded16":350},
{"slug":"compton","name":"Compton","rounded16":480},
{"slug":"covina","name":"Covina","rounded16":60},
{"slug":"cudahy","name":"Cudahy","rounded16":130},
{"slug":"culver-city","name":"Culver City","rounded16":120},
{"slug":"cypress-park","name":"Cypress Park","rounded16":50},
{"slug":"del-aire","name":"Del Aire","rounded16":0},
{"slug":"del-rey","name":"Del Rey","rounded16":160},
{"slug":"desert-view-highlands","name":"Desert View Highlands","rounded16":0},
{"slug":"diamond-bar","name":"Diamond Bar","rounded16":10},
{"slug":"downey","name":"Downey","rounded16":210},
{"slug":"downtown","name":"Downtown","rounded16":4700},
{"slug":"duarte","name":"Duarte","rounded16":60},
{"slug":"eagle-rock","name":"Eagle Rock","rounded16":120},
{"slug":"east-compton","name":"East Compton","rounded16":50},
{"slug":"east-hollywood","name":"East Hollywood","rounded16":860},
{"slug":"east-los-angeles","name":"East Los Angeles","rounded16":280},
{"slug":"east-pasadena","name":"East Pasadena","rounded16":10},
{"slug":"east-san-gabriel","name":"East San Gabriel","rounded16":10},
{"slug":"east-whittier","name":"East Whittier","rounded16":20},
{"slug":"echo-park","name":"Echo Park","rounded16":380},
{"slug":"elizabeth-lake","name":"Elizabeth Lake","rounded16":null},
{"slug":"el-monte","name":"El Monte","rounded16":270},
{"slug":"el-segundo","name":"El Segundo","rounded16":20},
{"slug":"el-sereno","name":"El Sereno","rounded16":30},
{"slug":"elysian-park","name":"Elysian Park","rounded16":20},
{"slug":"elysian-valley","name":"Elysian Valley","rounded16":10},
{"slug":"encino","name":"Encino","rounded16":30},
{"slug":"exposition-park","name":"Exposition Park","rounded16":200},
{"slug":"fairfax","name":"Fairfax","rounded16":30},
{"slug":"florence-firestone","name":"Florence-Firestone","rounded16":520},
{"slug":"florence","name":"Florence","rounded16":450},
{"slug":"gardena","name":"Gardena","rounded16":190},
{"slug":"glassell-park","name":"Glassell Park","rounded16":30},
{"slug":"glendale","name":"Glendale","rounded16":0},
{"slug":"glendora","name":"Glendora","rounded16":270},
{"slug":"gramercy-park","name":"Gramercy Park","rounded16":30},
{"slug":"granada-hills","name":"Granada Hills","rounded16":100},
{"slug":"green-meadows","name":"Green Meadows","rounded16":170},
{"slug":"green-valley","name":"Green Valley","rounded16":null},
{"slug":"griffith-park","name":"Griffith Park","rounded16":30},
{"slug":"hacienda-heights","name":"Hacienda Heights","rounded16":200},
{"slug":"hancock-park","name":"Hancock Park","rounded16":10},
{"slug":"hansen-dam","name":"Hansen Dam","rounded16":60},
{"slug":"harbor-city","name":"Harbor City","rounded16":150},
{"slug":"harbor-gateway","name":"Harbor Gateway","rounded16":130},
{"slug":"harvard-heights","name":"Harvard Heights","rounded16":140},
{"slug":"harvard-park","name":"Harvard Park","rounded16":90},
{"slug":"hasley-canyon","name":"Hasley Canyon","rounded16":0},
{"slug":"hawaiian-gardens","name":"Hawaiian Gardens","rounded16":10},
{"slug":"hawthorne","name":"Hawthorne","rounded16":110},
{"slug":"hermosa-beach","name":"Hermosa Beach","rounded16":20},
{"slug":"hidden-hills","name":"Hidden Hills","rounded16":0},
{"slug":"highland-park","name":"Highland Park","rounded16":110},
{"slug":"historic-south-central","name":"Historic South-Central","rounded16":1350},
{"slug":"hollywood-hills","name":"Hollywood Hills","rounded16":40},
{"slug":"hollywood-hills-west","name":"Hollywood Hills West","rounded16":10},
{"slug":"hollywood","name":"Hollywood","rounded16":1020},
{"slug":"huntington-park","name":"Huntington Park","rounded16":100},
{"slug":"hyde-park","name":"Hyde Park","rounded16":90},
{"slug":"industry","name":"Industry","rounded16":80},
{"slug":"inglewood","name":"Inglewood","rounded16":510},
{"slug":"irwindale","name":"Irwindale","rounded16":0},
{"slug":"jefferson-park","name":"Jefferson Park","rounded16":70},
{"slug":"koreatown","name":"Koreatown","rounded16":310},
{"slug":"la-canada-flintridge","name":"La Canada Flintridge","rounded16":0},
{"slug":"la-crescenta-montrose","name":"La Crescenta-Montrose","rounded16":0},
{"slug":"ladera-heights","name":"Ladera Heights","rounded16":10},
{"slug":"la-habra-heights","name":"La Habra Heights","rounded16":10},
{"slug":"lake-balboa","name":"Lake Balboa","rounded16":50},
{"slug":"lake-hughes","name":"Lake Hughes","rounded16":null},
{"slug":"lake-los-angeles","name":"Lake Los Angeles","rounded16":130},
{"slug":"lake-view-terrace","name":"Lake View Terrace","rounded16":60},
{"slug":"lakewood","name":"Lakewood","rounded16":50},
{"slug":"la-mirada","name":"La Mirada","rounded16":40},
{"slug":"lancaster","name":"Lancaster","rounded16":1060},
{"slug":"la-puente","name":"La Puente","rounded16":50},
{"slug":"larchmont","name":"Larchmont","rounded16":10},
{"slug":"la-verne","name":"La Verne","rounded16":10},
{"slug":"lawndale","name":"Lawndale","rounded16":40},
{"slug":"leimert-park","name":"Leimert Park","rounded16":100},
{"slug":"lennox","name":"Lennox","rounded16":130},
{"slug":"leona-valley","name":"Leona Valley","rounded16":0},
{"slug":"lincoln-heights","name":"Lincoln Heights","rounded16":130},
{"slug":"littlerock","name":"Littlerock","rounded16":10},
{"slug":"lomita","name":"Lomita","rounded16":30},
{"slug":"long-beach","name":"Long Beach","rounded16":0},
{"slug":"lopezkagel-canyons","name":"Lopez/Kagel Canyons","rounded16":20},
{"slug":"los-feliz","name":"Los Feliz","rounded16":90},
{"slug":"lynwood","name":"Lynwood","rounded16":110},
{"slug":"malibu","name":"Malibu","rounded16":110},
{"slug":"manchester-square","name":"Manchester Square","rounded16":30},
{"slug":"manhattan-beach","name":"Manhattan Beach","rounded16":0},
{"slug":"marina-del-rey","name":"Marina del Rey","rounded16":40},
{"slug":"mar-vista","name":"Mar Vista","rounded16":140},
{"slug":"mayflower-village","name":"Mayflower Village","rounded16":20},
{"slug":"maywood","name":"Maywood","rounded16":120},
{"slug":"mid-city","name":"Mid-City","rounded16":150},
{"slug":"mid-wilshire","name":"Mid-Wilshire","rounded16":90},
{"slug":"mission-hills","name":"Mission Hills","rounded16":50},
{"slug":"monrovia","name":"Monrovia","rounded16":60},
{"slug":"montebello","name":"Montebello","rounded16":50},
{"slug":"montecito-heights","name":"Montecito Heights","rounded16":30},
{"slug":"monterey-park","name":"Monterey Park","rounded16":10},
{"slug":"mount-washington","name":"Mount Washington","rounded16":40},
{"slug":"northeast-antelope-valley","name":"Northeast Antelope Valley","rounded16":870},
{"slug":"north-el-monte","name":"North El Monte","rounded16":null},
{"slug":"north-hills","name":"North Hills","rounded16":360},
{"slug":"north-hollywood","name":"North Hollywood","rounded16":570},
{"slug":"northridge","name":"Northridge","rounded16":180},
{"slug":"northwest-antelope-valley","name":"Northwest Antelope Valley","rounded16":30},
{"slug":"northwest-palmdale","name":"Northwest Palmdale","rounded16":10},
{"slug":"north-whittier","name":"North Whittier","rounded16":20},
{"slug":"norwalk","name":"Norwalk","rounded16":260},
{"slug":"pacific-palisades","name":"Pacific Palisades","rounded16":200},
{"slug":"pacoima","name":"Pacoima","rounded16":360},
{"slug":"palmdale","name":"Palmdale","rounded16":360},
{"slug":"palms","name":"Palms","rounded16":130},
{"slug":"palos-verdes-estates","name":"Palos Verdes Estates","rounded16":0},
{"slug":"panorama-city","name":"Panorama City","rounded16":190},
{"slug":"paramount","name":"Paramount","rounded16":50},
{"slug":"pasadena","name":"Pasadena","rounded16":0},
{"slug":"pico-rivera","name":"Pico Rivera","rounded16":110},
{"slug":"pico-robertson","name":"Pico-Robertson","rounded16":80},
{"slug":"pico-union","name":"Pico-Union","rounded16":200},
{"slug":"playa-del-rey","name":"Playa del Rey","rounded16":20},
{"slug":"playa-vista","name":"Playa Vista","rounded16":20},
{"slug":"pomona","name":"Pomona","rounded16":690},
{"slug":"porter-ranch","name":"Porter Ranch","rounded16":30},
{"slug":"quartz-hill","name":"Quartz Hill","rounded16":0},
{"slug":"rancho-dominguez","name":"Rancho Dominguez","rounded16":190},
{"slug":"rancho-palos-verdes","name":"Rancho Palos Verdes","rounded16":0},
{"slug":"rancho-park","name":"Rancho Park","rounded16":60},
{"slug":"redondo-beach","name":"Redondo Beach","rounded16":220},
{"slug":"reseda","name":"Reseda","rounded16":200},
{"slug":"ridge-route","name":"Ridge Route","rounded16":10},
{"slug":"rolling-hills-estates","name":"Rolling Hills Estates","rounded16":0},
{"slug":"rolling-hills","name":"Rolling Hills","rounded16":null},
{"slug":"rosemead","name":"Rosemead","rounded16":20},
{"slug":"rowland-heights","name":"Rowland Heights","rounded16":70},
{"slug":"san-dimas","name":"San Dimas","rounded16":30},
{"slug":"san-fernando","name":"San Fernando","rounded16":20},
{"slug":"san-gabriel","name":"San Gabriel","rounded16":10},
{"slug":"san-marino","name":"San Marino","rounded16":0},
{"slug":"san-pasqual","name":"San Pasqual","rounded16":null},
{"slug":"san-pedro","name":"San Pedro","rounded16":480},
{"slug":"santa-clarita","name":"Santa Clarita","rounded16":310},
{"slug":"santa-fe-springs","name":"Santa Fe Springs","rounded16":120},
{"slug":"santa-monica","name":"Santa Monica","rounded16":710},
{"slug":"sawtelle","name":"Sawtelle","rounded16":330},
{"slug":"sepulveda-basin","name":"Sepulveda Basin","rounded16":80},
{"slug":"shadow-hills","name":"Shadow Hills","rounded16":100},
{"slug":"sherman-oaks","name":"Sherman Oaks","rounded16":150},
{"slug":"sierra-madre","name":"Sierra Madre","rounded16":10},
{"slug":"signal-hill","name":"Signal Hill","rounded16":30},
{"slug":"silver-lake","name":"Silver Lake","rounded16":180},
{"slug":"south-diamond-bar","name":"South Diamond Bar","rounded16":0},
{"slug":"southeast-antelope-valley","name":"Southeast Antelope Valley","rounded16":170},
{"slug":"south-el-monte","name":"South El Monte","rounded16":40},
{"slug":"south-gate","name":"South Gate","rounded16":110},
{"slug":"south-park","name":"South Park","rounded16":280},
{"slug":"south-pasadena","name":"South Pasadena","rounded16":10},
{"slug":"south-san-gabriel","name":"South San Gabriel","rounded16":10},
{"slug":"south-san-jose-hills","name":"South San Jose Hills","rounded16":0},
{"slug":"south-whittier","name":"South Whittier","rounded16":230},
{"slug":"stevenson-ranch","name":"Stevenson Ranch","rounded16":0},
{"slug":"studio-city","name":"Studio City","rounded16":90},
{"slug":"sunland","name":"Sunland","rounded16":60},
{"slug":"sun-valley","name":"Sun Valley","rounded16":890},
{"slug":"sun-village","name":"Sun Village","rounded16":80},
{"slug":"sylmar","name":"Sylmar","rounded16":240},
{"slug":"tarzana","name":"Tarzana","rounded16":80},
{"slug":"temple-city","name":"Temple City","rounded16":20},
{"slug":"toluca-lake","name":"Toluca Lake","rounded16":10},
{"slug":"topanga","name":"Topanga","rounded16":10},
{"slug":"torrance","name":"Torrance","rounded16":110},
{"slug":"tujunga-canyons","name":"Tujunga Canyons","rounded16":150},
{"slug":"tujunga","name":"Tujunga","rounded16":130},
{"slug":"unincorporated-catalina-island","name":"Unincorporated Catalina Island","rounded16":10},
{"slug":"unincorporated-santa-monica-mountains","name":"Unincorporated Santa Monica Mountains","rounded16":70},
{"slug":"unincorporated-santa-susana-mountains","name":"Unincorporated Santa Susana Mountains","rounded16":20},
{"slug":"universal-city","name":"Universal City","rounded16":0},
{"slug":"university-park","name":"University Park","rounded16":110},
{"slug":"valinda","name":"Valinda","rounded16":20},
{"slug":"valley-glen","name":"Valley Glen","rounded16":150},
{"slug":"valley-village","name":"Valley Village","rounded16":50},
{"slug":"val-verde","name":"Val Verde","rounded16":null},
{"slug":"van-nuys","name":"Van Nuys","rounded16":530},
{"slug":"venice","name":"Venice","rounded16":870},
{"slug":"vermont-knolls","name":"Vermont Knolls","rounded16":280},
{"slug":"vermont-slauson","name":"Vermont-Slauson","rounded16":390},
{"slug":"vermont-square","name":"Vermont Square","rounded16":690},
{"slug":"vermont-vista","name":"Vermont Vista","rounded16":140},
{"slug":"vernon","name":"Vernon","rounded16":90},
{"slug":"veterans-administration","name":"Veterans Administration","rounded16":350},
{"slug":"view-park-windsor-hills","name":"View Park-Windsor Hills","rounded16":20},
{"slug":"vincent","name":"Vincent","rounded16":10},
{"slug":"walnut","name":"Walnut","rounded16":0},
{"slug":"walnut-park","name":"Walnut Park","rounded16":20},
{"slug":"watts","name":"Watts","rounded16":310},
{"slug":"west-adams","name":"West Adams","rounded16":60},
{"slug":"west-carson","name":"West Carson","rounded16":140},
{"slug":"westchester","name":"Westchester","rounded16":510},
{"slug":"west-compton","name":"West Compton","rounded16":120},
{"slug":"west-covina","name":"West Covina","rounded16":40},
{"slug":"west-hills","name":"West Hills","rounded16":40},
{"slug":"west-hollywood","name":"West Hollywood","rounded16":80},
{"slug":"westlake","name":"Westlake","rounded16":1470},
{"slug":"westlake-village","name":"Westlake Village","rounded16":10},
{"slug":"west-los-angeles","name":"West Los Angeles","rounded16":110},
{"slug":"westmont","name":"Westmont","rounded16":220},
{"slug":"west-puente-valley","name":"West Puente Valley","rounded16":40},
{"slug":"west-whittier-los-nietos","name":"West Whittier-Los Nietos","rounded16":50},
{"slug":"westwood","name":"Westwood","rounded16":240},
{"slug":"whittier","name":"Whittier","rounded16":240},
{"slug":"whittier-narrows","name":"Whittier Narrows","rounded16":60},
{"slug":"willowbrook","name":"Willowbrook","rounded16":330},
{"slug":"wilmington","name":"Wilmington","rounded16":590},
{"slug":"windsor-square","name":"Windsor Square","rounded16":10},
{"slug":"winnetka","name":"Winnetka","rounded16":80},
{"slug":"woodland-hills","name":"Woodland Hills","rounded16":180}];

// neighborhood selector
function selectHood(hood) {
  hood = hood.value;

  // update text
  $("#hood_count_graf").css("display","block");

  var hoodCount, hoodName;

  // find matching hood
  for (var i = 0; i < hoodTotals.length; i++) {
    if (hoodTotals[i].slug === hood) {
      hoodCount = hoodTotals[i].rounded16;
      hoodName = hoodTotals[i].name;
    }
  }

  var hoodText;

  if (hood == 'pasadena' || hood == 'glendale' || hood == 'long-beach') {
    hoodText = "<strong>"+hoodName+"</strong> wasn't included in this count.";
  } else if (hoodCount == null || hoodCount < 10) {
    hoodText = "<strong>"+hoodName+"</strong> had <strong>fewer than 10</strong> estimated homeless people.";
  } else {
    hoodText = "<strong>"+hoodName+"</strong> had an estimated <strong>"+commafy(hoodCount)+"</strong> homeless people living on the street or in shelters.";
  }

  $("#hood_count_graf").html(hoodText);


  // remove any other neighborhoods
  $('.neighborhood_bounds').remove();
  $('.hoodlabel').remove();

  var neighborhoodBounds;
  // put neighborhood boundary on the map
  $.getJSON( 'static/neighborhoods/'+hood+'.geojson', function( data ) {
    neighborhoodBounds = L.geoJson(data,{style: hollowArea,className:'neighborhood_bounds'}).addTo(map); // add boundaries

  }).done(function(){
    map.fitBounds(neighborhoodBounds.getBounds(),{'paddingTopLeft':[paddingLeft,paddingTop],maxZoom:14});
  });

}

// add commas to numbers
function commafy(num) {
  var s = String(num);
  var cs = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return cs;
}

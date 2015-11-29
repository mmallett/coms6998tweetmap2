var candidates = {
  'clinton':{
    showMarkers:true,
    markers:[]
  },
  'sanders':{
    showMarkers:true,
    markers:[]
  },
  'trump':{
    showMarkers:true,
    markers:[]
  },
  'carson':{
    showMarkers:true,
    markers:[]
  },
  'bush':{
    showMarkers:true,
    markers:[]
  },
  'rubio':{
    showMarkers:true,
    markers:[]
  },
  'fiorina':{
    showMarkers:true,
    markers:[]
  },
  'cruz':{
    showMarkers:true,
    markers:[]
  },
}

var indeces = {
  clinton: 0,
  sanders: 1,
  trump: 2,
  carson: 3,
  bush: 4,
  rubio: 5,
  fiorina: 6,
  cruz: 7
};
var tweetChartData = [0,0,0,0,0,0,0,0];

var issuesData = [
  0, //inequality [inequality, income]
  0, //guns [gun, gun control, guns, mass shooting]
  0, //climate [global warming, climate change]
  0, //education [education, tuition, college, common core]
  0, //immigration
  0, //health care [healthcare, health care, obamacare]
  0  //foreign policy [including keywords syria iran iraq afganistan, islamic state, russia]
];

var mapData = [];

$(document).ready(function(){
  var socket = io();

  var map = initMap();
  var heatmap;

  socket.on('mention', function(mention){
    var selector = "div[data-candidate='" + mention.candidate + "']";
    $(selector).addClass('hit');
    setTimeout(function(){
      $(selector).removeClass('hit');
    }, 200);

    tweetChartData[indeces[mention.candidate]]++;

    issuesTally(mention.text);

    // tweetsChart.update();
    // updateTweetChart(tweetChart);

    if(mention.coordinates){

      mapData.push(mention);
      console.log(mention);

      updateHeatmap(heatmap);

      addMarker(map, mention.coordinates.coordinates, mention.candidate);
    }
  });



  $.get('/mentions/geotagged', function(data){

    mapData = data;

    // for(var i=0; i<data.length; i++){
    //   addMarker(map, data[i].coordinates.coordinates, data[i].candidate);
    //
    // }

    heatmap = showHeatmap(map);
  });

  $.get('/sentiment', function(data){

    var template = '<h3>#CANDIDATE</h3><p>#PERSONALITY</p><p>Needs #NEEDS</p><p>Values #VALUES</p>';

    for(var i=0; i<data.length; i++){
        var tmp1 = template.replace('#CANDIDATE', data[i].candidate);
        var personality = ''
        for(var k=0; k<data[i].personality.length; k++){
          personality += data[i].personality[k] + ' ';
        }
        tmp2 = tmp1.replace('#PERSONALITY', personality);
        tmp3 = tmp2.replace('#NEEDS', data[i].needs);
        html = tmp3.replace('#VALUES', data[i].values);

        $('.sentiment').append(html);
    }

  });

  socket.on('sentiment', function(data){
    $('.sentiment h3, .sentiment p').remove();

    var template = '<h3>#CANDIDATE</h3><p>#PERSONALITY</p><p>Needs #NEEDS</p><p>Values #VALUES</p>';

    for(var i=0; i<data.length; i++){
        var tmp1 = template.replace('#CANDIDATE', data[i].candidate);
        var personality = ''
        for(var k=0; k<data[i].personality.length; k++){
          personality += data[i].personality[k] + ' ';
        }
        tmp2 = tmp1.replace('#PERSONALITY', personality);
        tmp3 = tmp2.replace('#NEEDS', data[i].needs);
        html = tmp3.replace('#VALUES', data[i].values);

        $('.sentiment').append(html);
    }


  });

  $('input').change(function(){
    var candidate = $(this).attr('id').replace('-markers', '');
    var checked = $(this).is(':checked');
    if(checked){
      showCandidateMarkers(candidate, map);
    }
    else{
      hideCandidateMarkers(candidate, map);
    }
    updateHeatmap(heatmap);
  });

  // var tweetChart = initTweetsChart();
  // initKeywordsChart();
  var tweetsChart = initTweetsChart();
  setInterval(function(){
    for(var i=0; i<tweetChartData.length; i++){
      tweetsChart.datasets[0].bars[i].value = tweetChartData[i];
    }
    tweetsChart.update();
  }, 2000);

  var issuesChart = initIssuesChart();
  setInterval(function(){
    for(var i=0; i<issuesData.length; i++){
      issuesChart.datasets[0].bars[i].value = issuesData[i];
    }
    issuesChart.update();
  }, 2000);

  $('#button-toggle').click(function(){
    $('.graph').toggle();
  });

  $('#button-about').click(function(){
    alert('Live feed of candidate mentions on Twitter. Created by Matt Mallett for ComS 6998 - Cloud and Big Data at Columbia University');
  });

});

function initMap(){

  var customMapType = new google.maps.StyledMapType([
      {
        stylers: [
          {hue: '#4C95F2'},
          // {visibility: 'simplified'},
          // {gamma: 0.5},
          {weight: 0.5}
        ]
      },
      {
        elementType: 'labels',
        stylers: [{visibility: 'off'}]
      },
      {
        featureType: 'water',
        stylers: [{color: '#ffffff'}]
      }
    ], {
      name: 'Custom Style'
  });
  var customMapTypeId = 'custom_style';

  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38, lng: -95},
    zoom: 4,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, customMapTypeId]
    },
    disableDefaultUI: true
  });

  map.mapTypes.set(customMapTypeId, customMapType);
  map.setMapTypeId(customMapTypeId);

  return map;

}

function addMarker(map, coords, candidate){

  var latlng =  new google.maps.LatLng(coords[1], coords[0]);

  var marker = new google.maps.Marker({
    position: latlng,
    title: candidate,
    animation: google.maps.Animation.DROP,
    map: map
  });

  // candidates[candidate].markers.push(marker);

  if(!candidates[candidate].showMarkers){
    marker.setMap(null);
  }

  setTimeout(function(){
    marker.setMap(null);
  }, 3000);


}

function showCandidateMarkers(candidate, map){
  candidates[candidate].showMarkers = true;
  // for(var i=0; i<candidates[candidate].markers.length; i++){
  //   var marker = candidates[candidate].markers[i];
  //   marker.setMap(map);
  //   marker.setAnimation(google.maps.Animation.DROP);
  // }
}

function hideCandidateMarkers(candidate, map){
  candidates[candidate].showMarkers = false;
  // for(var i=0; i<candidates[candidate].markers.length; i++){
  //   var marker = candidates[candidate].markers[i];
  //   marker.setMap(null);
  // }
}

function initTweetsChart(){
  var data = {
    labels: ["Clinton", "Sanders", "Trump", "Carson", "Bush",
        "Rubio", "Fiorina", "Cruz"],
    datasets: [
        {
            // label: "My First dataset",
            fillColor: "#232066",
            strokeColor: "#232066",
            highlightFill: "#e91d0e",
            highlightStroke: "#e91d0e",
            data: tweetChartData
        }
    ]
  };
  var ctx = document.getElementById('tweets-chart').getContext('2d');
  return chart = new Chart(ctx).Bar(data, {});
}

function initIssuesChart(){
  var data = {
    labels: ['Inequality', 'Gun Control', 'Climate Change', 'Education',
        'Immigration', 'Health Care', 'Foreign Policy'],
    datasets: [
      {
          // label: "My First dataset",
          fillColor: "#232066",
          strokeColor: "#232066",
          highlightFill: "#e91d0e",
          highlightStroke: "#e91d0e",
          data: issuesData
      }
    ]
  };

  var ctx = document.getElementById('issues-chart').getContext('2d');
  return chart = new Chart(ctx).Bar(data, {});

}

function issuesTally(tweet){

  // 0, //inequality [inequality, income]
  // 0, //guns [gun, gun control, guns, mass shooting]
  // 0, //climate [global warming, climate change]
  // 0, //education [education, tuition, college, common core]
  // 0, //immigration
  // 0, //health care [healthcare, health care, obamacare]
  // 0  //foreign policy [including keywords syria iran iraq afganistan, islamic state, russia]

  // if(men)

  if(/inequality|income/i.exec(tweet)){ //|| tweet.match(/income/i){
    issuesData[0]++;
  }
  if(/gun|mass shooting|nra/i.exec(tweet)){ // || tweet.match(/mass shooting/i) || tweet.match(/nra/i)){
    issuesData[1]++;
  }
  if(/climate|global warming/i.exec(tweet)){ // || tweet.match(/global warming/i)){
    issuesData[2]++;
  }
  if(/education|college|tuition|common core/i.exec(tweet)){ // || tweet.match(/tuition/i) || tweet.match(/college/i) ||
      // tweet.match(/common core/i)){
    issuesData[3]++;
  }
  if(/immigra|border|citizenship|naturalization/i.exec(tweet)){
    issuesData[4]++;
  }
  if(/health|obama\s?care/i.exec(tweet)){
    issuesData[5]++;
  }
  if(/foreign policy|syria|isis|iraq|iran|afganistan|china|russia/i.exec(tweet)){ //|| tweet.match(/syria/i) || tweet.match(/iran/i) ||
      // tweet.match(/iraq/i) || tweet.match(/afganistan/i) || tweet.match(/islamic state/i) ||
      // tweet.match(/isis/i) || tweet.match(/russia/i) || tweet.match(/china/i)){
    issuesData[6]++;
  }
}

function getHeatmapData(){

  var ret = [];

  for(var i=0; i<mapData.length; i++){

    var showMarker = candidates[mapData[i].candidate].showMarkers;

    if(showMarker){
      var latlng =  new google.maps.LatLng(mapData[i].coordinates.coordinates[1], mapData[i].coordinates.coordinates[0]);
      ret.push(latlng);
    }


  }

  return ret;
}


function showHeatmap(map){

  var gradient = [
    'rgba(0, 255, 255, 0)',
    'rgba(0, 255, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 127, 255, 1)',
    'rgba(0, 63, 255, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 0, 223, 1)',
    'rgba(0, 0, 191, 1)',
    'rgba(0, 0, 159, 1)',
    'rgba(0, 0, 127, 1)',
    'rgba(63, 0, 91, 1)',
    'rgba(127, 0, 63, 1)',
    'rgba(191, 0, 31, 1)',
    'rgba(255, 0, 0, 1)'
  ];

  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: getHeatmapData(),
    map: map,
    maxIntensity: 10,
    gradient: gradient
  });

  return heatmap;

}

function updateHeatmap(heatmap){

  var data = getHeatmapData();

  heatmap.setData(data);

}

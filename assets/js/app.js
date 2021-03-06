var recentSearch = [];
var chartStats = {
        assists: "",
        goals: "",
        saves: ""
};
var completedRequests = 0;
// Firebase initialization
var config = {
    apiKey: "AIzaSyAf2Mv8BSPQn2d50Uu_rbP-V3V8rwtdqP0",
    authDomain: "rlstatsdb.firebaseapp.com",
    databaseURL: "https://rlstatsdb.firebaseio.com",
    projectId: "rlstatsdb",
    storageBucket: "rlstatsdb.appspot.com",
    messagingSenderId: "510843603868"
};
firebase.initializeApp(config);
var database = firebase.database();
// EO firebase initialization

$.ajaxPrefilter(function(options) {
    if (options.crossDomain && $.support.cors) {
        options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
    }
});
function getPopulation() {
    $.ajax({
        method: 'GET',
        url: "https://api.rocketleague.com/api/v1/population",
        headers: {
            'Authorization': 'Token ' + apikey
        }
    }).done(function(popData) {
        database.ref().set({
          PopObject: popData
        })
    });

    database.ref().on('value', function (snap) {
      console.log(snap.val());
      // //Value for Steam players playing ranked solo duel
      // console.log("Ranked Solo Duel",snap.val().PopObject.Steam[10].NumPlayers);
      // // Value for steam players playing ranked team doubles
      // console.log("Ranked team doubles",snap.val().PopObject.Steam[11].NumPlayers);
      // // Value for steam players playing ranked solo standard
      // console.log("Ranked solo standard",snap.val().PopObject.Steam[12].NumPlayers);
      // // Value for steam players playing ranked team standard
      // console.log("Ranked team standard",snap.val().PopObject.Steam[13].NumPlayers);

      $("#rankedSoloDuel").text("Ranked Solo Duel: " + snap.val().PopObject.Steam[10].NumPlayers);

      $("#rankedDoubles").text("Ranked Doubles: " + snap.val().PopObject.Steam[11].NumPlayers);

      $("#rankedSoloStandard").text("Ranked Solo Standard: " + snap.val().PopObject.Steam[12].NumPlayers);

      $("#rankedTeamStandard").text("Ranked Team Standard: " + snap.val().PopObject.Steam[13].NumPlayers)

    })

}

function getStatsValueForUser(identification, plat) {
    var id = identification;
    var platform = plat;
    var statsArray = ["assists", "goals", "mvps", "saves", "shots", "wins"];
    console.log(identification, 'id::');
    console.log('plat:::: ', plat);
    for( var i = 0; i < statsArray.length; i++){
      var statistics = statsArray[i];
      ajaxIfCalls(statistics, id, platform);
    }
}

function ajaxIfCalls(statistics, id, platform){
  var id = id;
  var platform = platform;
  var steamPowered = "61559FC24A7A28F1C4E55C92CFBFFE46";
  var statsArray = ["assists", "goals", "mvps", "saves", "shots", "wins"];
  var stats = statistics;
  console.log(isNaN(id));

  if ( $('#steam').hasClass("active") && isNaN(id) ) {
          $.ajax({
              method: 'GET',
              url: "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" + steamPowered + "&vanityurl=" + id,
              success: function(response) {
                  var resolvedID = response.response.steamid;
                  $.ajax({
                      method: 'GET',
                      url: "https://api.rocketleague.com/api/v1/" + platform + "/leaderboard/stats/" + stats + "/" + resolvedID + "/",
                      headers: {
                          'Authorization': 'Token ' + apikey
                      }
                  }).done(function(data) {

                      console.log('Successfully Fetched Data: ', data);

                      console.log('das data: ', data);
                      $("#individualStats").show();

                      if ( stats === "wins"){
                        $("#winTotal").empty();
                        $("#winTotal").append(data[0].value);

                    } else if ( stats === "goals"){
                        $("#goalTotal").empty();
                        $("#goalTotal").append(data[0].value);
                        chartStats.goals = data[0].value;
                        completedRequests++;

                    }else if ( stats === "saves"){
                          $("#saveTotal").empty();
                          $("#saveTotal").append(data[0].value);
                          chartStats.saves = data[0].value;
                          completedRequests++;

                    }else if ( stats === "shots"){
                          $("#shotTotal").empty();
                          $("#shotTotal").append(data[0].value);

                    }else if ( stats === "mvps"){
                          $("#mvpTotal").empty();
                          $("#mvpTotal").append(data[0].value);

                    }else if ( stats === "assists"){
                      $("#assistsTotal").empty();
                      $("#assistsTotal").append(data[0].value);
                      chartStats.assists = data[0].value;
                      completedRequests++;

                    }
                    graph();
              })
            }
          })
  } else if (!isNaN(id)) {
    $.ajax({
        method: 'GET',
        url: "https://api.rocketleague.com/api/v1/" + platform + "/leaderboard/stats/" + stats + "/" + id + "/",
        headers: {
            'Authorization': 'Token ' + apikey
        }
    }).done(function(data) {

        console.log('Successfully Fetched Data:');
        console.log(data);

        $("#individualStats").show();

        if ( stats === "wins"){
          $("#winTotal").empty();
          $("#winTotal").append(data[0].value);

      } else if ( stats === "goals"){
          $("#goalTotal").empty();
          $("#goalTotal").append(data[0].value);
          chartStats.goals = data[0].value;
          completedRequests++;

      }else if ( stats === "saves"){
            $("#saveTotal").empty();
            $("#saveTotal").append(data[0].value);
            chartStats.saves = data[0].value;
            completedRequests++;

      }else if ( stats === "shots"){
            $("#shotTotal").empty();
            $("#shotTotal").append(data[0].value);

      }else if ( stats === "mvps"){
            $("#mvpTotal").empty();
            $("#mvpTotal").append(data[0].value);

      }else if ( stats === "assists"){
            $("#assistsTotal").empty();
            $("#assistsTotal").append(data[0].value);
            chartStats.assists = data[0].value;
            completedRequests++;
        }

})

  } else if ($('#xbox').hasClass('active') || $('#ps4').hasClass('active')) {
      $.ajax({
          method: 'GET',
          url: "https://api.rocketleague.com/api/v1/" + platform + "/playerskills/" + id + "/",
          headers: {
              'Authorization': 'Token ' + apikey
          }
      }).done(function(data) {
          console.log(data);
      });
  } else {
      $('#emptyPlatformModal').modal('show');
  }
}

function checkActive(item) {
    $(item).siblings().removeClass("active");
    $(item).toggleClass('active');
}

// ASK for API key, website only works with API key
var apikey = localStorage.getItem('apikey');
if (!apikey) {
    $('#myModal').modal({
        show: false
    });
    $('#myModal').modal('show');
    $('#saveKey').on('click', function() {
        apikey = $('#apiKeyToken').val();
        localStorage.setItem('apikey', apikey);
        $('#myModal').modal('hide');
    });
};

// Platform selection
var platform;
$('#ps4').on('click', function() {
    platform = "ps4";
    if (platform === "ps4") {
        console.log("ps4 selected")
        checkActive($(this));
    };
});
$('#xbox').on('click', function() {
    platform = "xbox";
    if (platform === "xbox") {
        console.log("xbox selected");
        checkActive($(this));
    };
});
$('#steam').on('click', function() {
    platform = "steam";
    if (platform === "steam") {
        console.log("steam selected");
        checkActive($(this));
    };
});
// Platform selection end

$('#submit').on('click', function() {
    event.preventDefault();
    var id = $('#inputSearch').val();
    if (id === "") {
        $('#inputEmptyModal').modal('show');
    } else {
        //Check to see if ID exists in the database (not working returns null)
        recentSearch.push(id);
        localStorage.setItem('recentSearch', JSON.stringify(recentSearch));

        database.ref().push({
            searchTerm: id,
            searchTermCount: 0
        });

        // resolveVanityURL(id, platform);
        getStatsValueForUser(id, platform);
        console.log("CR: " + completedRequests);

    };
})


//Query API every 1 minute for population data
getPopulation();

setInterval(function () {
  getPopulation();
}, 60000);

function graph(){
 console.log(chartStats);
 console.log('before completedRequests: ', completedRequests);
if(completedRequests === 3 ){
    Chart.defaults.global.defaultFontColor = 'white';
    var ctx = $("#playStyle")
    console.log('line: 293.', chartStats.goals, chartStats.assists, chartStats.saves);
    var goals = chartStats.goals,
        assists = chartStats.assists,
        saves = chartStats.saves;
    var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: "doughnut",
      // The data for our dataset
      data: {
          labels: ["Goals", "Assists", "Saves"],
          datasets: [{
              label: "My First dataset",
              backgroundColor: ["#ff6700", "#C0C0C0", "#004E98"],
              borderColor: 'rgb(255, 255, 255)',
              data: [goals, assists, saves]
          }]
      },
      // Configuration options go here
      options: {}
    });
    completedRequests = 0
  }
}

function getLeaderBoardData(selection, playlist) {
      var htmlhook = selection;
      var playlist = playlist;

      $.ajax({
          method: 'GET',
          url: "https://api.rocketleague.com/api/v1/" + "steam" + "/leaderboard/skills/" + playlist + "/",
          headers: {
              'Authorization': 'Token ' + apikey
          }
      }).done(function(data) {
          console.log(data);
          for (var i = 0; i < 10; i++) {
              var newtr = $("<tr>");
              $(htmlhook).append("<tr><th>" + (i + 1) + "</th>" +
                  "<td>" + data[i].user_name + "</td>" +
                  "<td>" + data[i].skill + "</td>" )
          }
      })
  }

  function generateLeaderBoard() {
      getLeaderBoardData("#ranked2v2body", 11);
      getLeaderBoardData("#ranked3v3body", 13);
      getLeaderBoardData("#rankedduels", 10);
  }

generateLeaderBoard();

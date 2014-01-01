var app = angular.module('app.controllers', [])

//Controller responsible for the left column on the page
app.controller('LeftSummonerCtrl', function($scope, $http, StatCompareService){

   $scope.regions = ['NA', 'EUW', 'EUNE'];
   $scope.region = $scope.regions[0];
   $scope.showSummoner = false;

   //List of champions a specific summoner has played during 2013 ranked
   $scope.champions = [];


   $scope.querySummoner = function(){
      //Reset display name b/c a new (or same) summoner name is being searched
      StatCompareService.leftChampionData = {displayName: '?'};

      getSummonerIDFromName($scope, $http);//Create a service instead of using below functions
   }

   //Provides updated data to the Comparison Controller in order to compare stats
   $scope.updateStatCompareData = function(champion){
      $scope.championFilter = champion.name;

      //Include summoner name with champion name to eliminate confusion
      champion.displayName = champion.name + ' (' + $scope.summonerName + ')';

      StatCompareService.leftChampionData = champion;
      console.log(StatCompareService);

      $scope.showChampionList = false;
   }

});

//Controller responsible for the right column on the page
app.controller('RightSummonerCtrl', function($scope, $http, StatCompareService){

   $scope.regions = ['NA', 'EUW', 'EUNE'];
   $scope.region = $scope.regions[0];
   $scope.showSummoner = false;

   //List of champions a specific summoner has played during 2013 ranked
   $scope.champions = [];

   $scope.querySummoner = function(){
      //Reset display name b/c a new (or same) summoner name is being searched
      StatCompareService.rightChampionData = {displayName: '?'};

      getSummonerIDFromName($scope, $http);//Create a service instead of using below functions
   }

   //Provides updated data to the Comparison Controller in order to compare stats
   $scope.updateStatCompareData = function(champion){
      $scope.championFilter = champion.name;

      //Include summoner name with champion name to eliminate confusion
      champion.displayName = champion.name + ' (' + $scope.summonerName + ')';

      StatCompareService.rightChampionData = champion;
      console.log(StatCompareService);

      $scope.showChampionList = false;
   }

});

//Controller responsible for stat comparison related tasks
app.controller('ComparisonCtrl', function($scope, StatCompareService){

   $scope.championData = StatCompareService;
   $scope.statTableRows = [];

   //Remove stats of previously chosen champions when a new champion is selected
   $scope.$watch('championData', function(){
      $scope.statTableRows = [];
   }, true);

   $scope.compareStats = function(){

      if($scope.championData.leftChampionData.displayName == '?' || 
         $scope.championData.rightChampionData.displayName == '?'){
         //Display error message?
         return;
      }

      $scope.statTableRows = [];
      var tmpStatTableRows = [];

      var leftIcon = {color: 'orange', icon: 'minus'}, 
          rightIcon = {color: 'orange', icon: 'minus'};
      var difference;

      for(var stat in StatCompareService.leftChampionData.stats){

         difference = StatCompareService.leftChampionData.stats[stat] - 
                      StatCompareService.rightChampionData.stats[stat];

         //Change icon object depending on stat difference
         if(difference < 0){
            leftIcon = {color: 'red', icon: 'arrow-down'};
            rightIcon = {color: 'green', icon: 'arrow-up'};
         } 
         else if(difference > 0){
            leftIcon = {color: 'green', icon: 'arrow-up'};
            rightIcon = {color: 'red', icon: 'arrow-down'};
         }

         tmpStatTableRows.push(
            {
               left: {
                  stats: StatCompareService.leftChampionData.stats[stat],
                  color: leftIcon.color,
                  icon: leftIcon.icon
               },
               statName: stat,
               right: {
                  stats: StatCompareService.rightChampionData.stats[stat],
                  color: rightIcon.color,
                  icon: rightIcon.icon
               }
            }
         );

      }

      //Filter out stats that are 0 for both of the selected champions
      $scope.statTableRows = tmpStatTableRows.filter(function(row){
         return row.left.stats > 0 || row.right.stats > 0;
      })
      //Change camel cased stat names to space seperated
      .map(function(row){
         row.statName = fromCamelCase(row.statName);
         return row;
      });

      console.log($scope.statTableRows);
   };
});


//PUT ME IN A SERVICE
function getSummonerIDFromName($scope, $http){
   var region = $scope.region.toLowerCase();
   var summonerName = $scope.summonerName || '';

   if(summonerName.length < 3 || summonerName.length > 16){
      $scope.showSummoner = false;
      return;
   }

   $http({
      method: 'GET', 
      url: 'http://prod.api.pvp.net/api/lol/'+region+'/v1.2/summoner/by-name/'+
            summonerName+'?api_key='+apikey
   })
   .success(function(data, status, headers, config){

      console.log(data);
      getSummonerRankedStats($scope, $http, data.id)

   })
   .error(function(data, status, headers, config){//DISPLAY ERROR MESSAGE?
      
      $scope.showSummoner = false;
      console.log('Error on GET to /api/lol/'+ $scope.region +
         'v1.2/summoner/by-name/' + summonerName);
      console.log('HTTP status code: ' + status);

   });
}

//PUT ME IN A SERVICE
function getSummonerRankedStats($scope, $http, summonerID){

   var region = $scope.region.toLowerCase();
   $http({
      method: 'GET',
      url: 'http://prod.api.pvp.net/api/lol/'+region+'/v1.2/stats/by-summoner/' +
      summonerID+'/ranked?season=SEASON3&api_key='+apikey
   })
   .success(function(data, status, headers, config){
      $scope.champions = data.champions;
      $scope.showSummoner = true;
      console.log(data);
   })
   .error(function(data, status, headers, config){//DISPLAY ERROR MESSAGE?
      $scope.showSummoner = false;
      console.log('Unable to retrieve ranked stats');
   });
}



function fromCamelCase(string){

   return string[0].toUpperCase() + 
      string.substring(1, string.length)
         .replace(/[A-Z]/g, function(match){return ' ' + match.toLowerCase();})
}
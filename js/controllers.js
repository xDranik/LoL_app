var app = angular.module('app.controllers', [])

//Controller responsible for the left column on the page
app.controller('LeftSummonerSearchCtrl', function($scope, $http, StatCompareService, RiotApiService){

   //REMOVE STATCOMPARESERVICE?

   $scope.regions = ['NA', 'EUW', 'EUNE'];
   $scope.region = $scope.regions[0];


   //CHANGE SHOW BACK TO FALSE!
   $scope.success = {show:false, message: 'Search Successfull'};
   $scope.failure = {show:false, message: 'Incorrect Info'};

   $scope.summonerColor = 'Blue';

   // $scope.summonerInfo = undefined;
   // $scope.summonerChampionData = undefined;

   $scope.summonerInfo = {name: 'xDranik', summonerLevel: '30'};
   $scope.summonerChampionData = {};

   $scope.selectedChampions = ['Aatrox', 'Ashe', 'Fiddle Sticks', 'Ryze'];//sort before dispalying
   $scope.showOrHideSelectedChampions = 'hide';
   $scope.toggleSelectedChampionList = function(){
      $scope.showOrHideSelectedChampions = 
         $scope.showOrHideSelectedChampions == 'hide' ? 'show' : 'hide';
      $('#'+$scope.summonerColor+'-list').slideToggle();
   }


   $scope.querySummoner = function(){
      RiotApiService.getSummonerInfoFromName($scope, $http);
   }

});

//Controller responsible for the right column on the page
app.controller('RightSummonerSearchCtrl', function($scope, $http, StatCompareService, RiotApiService){

   //REMOVE STATCOMPARESERVICE?

   $scope.regions = ['NA', 'EUW', 'EUNE'];
   $scope.region = $scope.regions[0];
   $scope.showSummoner = false;

   //List of champions a specific summoner has played during season 3 ranked
   $scope.champions = [];

   $scope.success = {show:false, message: 'Search Successfull'};
   $scope.failure = {show:false, message: 'Invalid Summoner'};

   $scope.summonerColor = 'Red';

   // $scope.summonerInfo = undefined;
   // $scope.summonerChampionData = undefined;

   $scope.summonerInfo = {name: 'xDranik', summonerLevel: '30'};
   $scope.summonerChampionData = {};

   $scope.selectedChampions = ['Aatrox', 'Ashe', 'Fiddle Sticks', 'Ryze'];//sort before dispalying

   $scope.showOrHideSelectedChampions = 'hide';
   $scope.toggleSelectedChampionList = function(){
      $scope.showOrHideSelectedChampions = 
         $scope.showOrHideSelectedChampions == 'hide' ? 'show' : 'hide';
      $('#'+$scope.summonerColor+'-list').slideToggle();
   }



   $scope.querySummoner = function(){
      RiotApiService.getSummonerInfoFromName($scope, $http);
   }


});


app.controller('MainCtrl', function($scope){

   $scope.fromCamelCase = function(string){
      return string[0].toUpperCase() + 
         string.substring(1, string.length)
            .replace(/[A-Z]/g, function(match){return ' ' + match;})
   }

   $scope.championNames = ["Aatrox", "Ahri", "Akali", "Alistar", "Amumu", "Anivia", "Annie", "Ashe", "Blitzcrank", "Brand", "Caitlyn", "Cassiopeia", "Chogath", "Corki", "Darius", "Diana", "Draven", "DrMundo", "Elise", "Evelynn", "Ezreal", "FiddleSticks", "Fiora", "Fizz", "Galio", "Gangplank", "Garen", "Gragas", "Graves", "Hecarim", "Heimerdinger", "Irelia", "Janna", "JarvanIV", "Jax", "Jayce", "Jinx", "Karma", "Karthus", "Kassadin", "Katarina", "Kayle", "Kennen", "Khazix", "KogMaw", "Leblanc", "LeeSin", "Leona", "Lissandra", "Lucian", "Lulu", "Lux", "Malphite", "Malzahar", "Maokai", "MasterYi", "MissFortune", "MonkeyKing", "Mordekaiser", "Morgana", "Nami", "Nasus", "Nautilus", "Nidalee", "Nocturne", "Nunu", "Olaf", "Orianna", "Pantheon", "Poppy", "Quinn", "Rammus", "Renekton", "Rengar", "Riven", "Rumble", "Ryze", "Sejuani", "Shaco", "Shen", "Shyvana", "Singed", "Sion", "Sivir", "Sona", "Soraka", "Swain", "Syndra", "Talon", "Taric", "Teemo", "Thresh", "Tristana", "Trundle", "Tryndamere", "TwistedFate", "Twitch", "Udyr", "Urgot", "Varus", "Vayne", "Veigar", "Vi", "Viktor", "Vladimir", "Volibear", "Warwick", "Xerath", "XinZhao", "Yasuo", "Yorick", "Zac", "Zed", "Ziggs", "Zilean", "Zyra"];
   $scope.spacedChampionNames = $scope.championNames.map(function(name){
      return $scope.fromCamelCase(name);
   });

   $scope.championSearchName = '';

   $scope.selectedChampions = [];
   $scope.selectChampion = function(champName){
      var nameIndex = $scope.selectedChampions.indexOf(champName);
      if(nameIndex == -1){
         $scope.selectedChampions.push(champName);
      }
      else{
         $scope.selectedChampions.splice(nameIndex, 1);
      }

      $('#'+champName).toggleClass('selected');

      console.log($scope.selectedChampions)
   }

   $scope.nameMatches = function(searchName, champName){
      var regexp = new RegExp('^.*' + searchName + '.*$', 'i');
      return champName.match(regexp)==null?false:true;
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
         //At least one champion hasn't been selected. Display error message?
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

         tmpStatTableRows.push({
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
         });

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


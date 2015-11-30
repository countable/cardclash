var app = angular.module('deckBuilder', ['ng-sortable']);




app.controller('deckBuilderCtrl', function($scope, $timeout) {
    
    
  $scope.deck = [];
  $scope.pool = CardSet.Cards.all().filter(function(c){return c.rarity});

  $scope.sort_config = {
      animation: 150,
      handle: '.handle'
  };

  $scope.add = function(index){
    console.log(index);
    $scope.deck.push($scope.pool[index])
  }

  $scope.remove = function(index){
    $scope.deck.splice(index,1);
  }
    
}).config(function($sceProvider) {
  // Completely disable SCE.  For demonstration purposes only!
  // Do not use in new projects.
  $sceProvider.enabled(false);
})


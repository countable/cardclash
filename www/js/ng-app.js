GAME.app = angular.module('gameApp', ['ng-sortable', 'ngRoute']).config(
['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {

        //$locationProvider.html5Mode(true);

        $routeProvider.when('/deckbuilder', {
            templateUrl: "deckbuilder.html"
        });
        $routeProvider.when('/levels', {
            templateUrl: "levels.html"
        });
        $routeProvider.when('/game/:level', {
            templateUrl: "game.html"
        });
        $routeProvider.when('/story', {
            templateUrl: "story.html"
        });
    }
])
.run();

GAME.app.controller('cardGameCtrl', ['$scope','$routeParams','$timeout',
  function($scope, $routeParams, $timeout) {
    
    GAME.player = inherit(Player);
    GAME.player.client = true;

    GAME.enemy = inherit(Player);

    GAME.players = [GAME.player, GAME.enemy];
    
    GAME.scen_idx = parseInt($routeParams.level);
    GAME.scenarios[GAME.scen_idx].start();

    $scope.player = GAME.player;
    $scope.enemy = GAME.enemy;
    
    $scope.pick = function(card){
      if ($scope.player.resolving) {
        $scope.player.done_targetting(card);
      }
    };
    
    $scope.buy = function(card){
      if ($scope.player.diams >= card.price) {
        $scope.player.diams -= card.price;
        $scope.player.discard.push(CardSet.Cards.create(card.name));
      } else {
        alert('cannot afford');
      }
    };
    
    $scope.turn = function(){
      
      if (GAME.player.resolving) return alert('finish targeting first.');

      $scope.playing = true;
      
      animate_war();
      
      GAME.enemy_turn();
      
      GAME.turn_idx ++;
      
      $timeout(function(){
        
        // queued moves.
        var pending_actions = R.pluck('pending_actions')(GAME.players).reduce(R.concat);
        
        // sort actions by speed.
        pending_actions.sort(function(x, y){ 
            if (x.card.speed > y.card.speed) {
                return 1;
            }
            if (x.card.speed < y.card.speed) {
                return -1;
            }
            return 0;
        });
        
        var complete = function(){
          
            GAME.players.forEach(function(whom) {
              whom.end_turn();
            });
            // done turn, reset
            
            $scope.playing=false;
            $timeout(function(){GAME.player.begin_turn()}, 500);
            
        };
        
        var do_action = function(cur_action_idx){
          var move = pending_actions[cur_action_idx];
          
          if (move){
            move.player.complete_move(move, function(){
              $timeout(function(){ // let ui update.
            
                do_action(cur_action_idx + 1);
              }, 0);
            });
          } else {
            $timeout(complete, 500);
          }
        };
        
        do_action(0);
      }, 500);
      
    };
    
    $scope.play = function(index, aindex){
      var result = $scope.player.play(index, aindex, function(){
        $timeout(function(){ //trigger repaint
        },100)
      });
      if (!result.success) alert(result.message);
    };
    
    $scope.act = function(index, aindex){
      var result = $scope.player.act(index, aindex);
      if (!result.success) alert(result.message);
    };

    $scope.dig = function(index) {
      GAME.player.dig(index);
    };

    
    $scope.get_card_classes = function(card){
      if (card._placeholder) return ['card', 'placeholder'];
      var classes = ['card'];
      
      if (card._target) classes.push('target');
      if (card._done) classes.push('done');
      if (card.stunned) classes.push('stunned');
      if (card.health < card.__proto__.health) classes.push('damaged');
      if (card.health < 1 && 'number' === typeof card.health) classes.push('dead');
      
      classes.push(card.display_class);
      
      return classes;
    };
    
    $scope.sort_config = {
        animation: 150,
        handle: '.handle'
    };

    
}]).config(function($sceProvider) {
  // Completely disable SCE.  For demonstration purposes only!
  // Do not use in new projects.
  $sceProvider.enabled(false);
})

GAME.app.controller('deckBuilderCtrl', function($scope, $timeout) {
    
    
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



GAME.app.controller('storyCtrl', function($scope, $timeout) {
    $scope.place=-1;
    $scope.can_proceed=false;
    $timeout(function(){
      $scope.place++;
      $scope.can_proceed = true;
    }, 1000);
    $scope.next=function(){
      $scope.place++;
      $scope.can_proceed = false;
      $timeout(function(){$scope.can_proceed=true},1500)
    }
    $scope.choose=function(value){
      $scope.place ++;
    }
    
}).config(function($sceProvider) {
  // Completely disable SCE.  For demonstration purposes only!
  // Do not use in new projects.
  $sceProvider.enabled(false);
})

GAME.app.controller('scenarioCtrl', function($scope, $timeout) {
    
    
  $scope.scenarios = GAME.scenarios;
    
}).config(function($sceProvider) {
  // Completely disable SCE.  For demonstration purposes only!
  // Do not use in new projects.
  $sceProvider.enabled(false);
})
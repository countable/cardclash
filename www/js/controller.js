
function generateUUID(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

var disableSCE = function($sceProvider) {
  // Completely disable SCE.
  $sceProvider.enabled(false);
}

//GAME.app = angular.module('gameApp', ['ng-sortable', 'ngRoute']).config(
GAME.app = angular.module('gameApp', ['ngRoute', 'ngDraggable']).config(
['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {

        //$locationProvider.html5Mode(true);

        $routeProvider.when('/:epic_id/deck/:deck_id', {
          templateUrl: "deck.html"
        });
        $routeProvider.when('/:epic_id/deck', {
          templateUrl: "decks.html"
        });
        $routeProvider.when('/:epic_id', {
          templateUrl: "epic.html"
        })
        $routeProvider.when('/:epic_id/map/:map', {
          templateUrl: "map.html"
        });
        $routeProvider.when('/:epic_id/game/:map/:level', {
          templateUrl: "game.html"
        });
        $routeProvider.when('/:epic_id/story', {
          templateUrl: "story.html"
        });
        $routeProvider.when('/', {
          templateUrl: "menu.html"
        });
    }
])
.run();

GAME.app.controller('cardGameCtrl', ['$scope','$routeParams','$timeout',
  function($scope, $routeParams, $timeout) {
    

    $scope.epic_id = $routeParams.epic_id;
    
    // players
    GAME.player = inherit(Player);
    GAME.player.client = true;
    GAME.enemy = inherit(Player);
    GAME.players = [GAME.player, GAME.enemy];
    
    // scenario
    GAME.scen_idx = parseInt($routeParams.level);
    GAME.map_idx = parseInt($routeParams.map);
    GAME.maps[GAME.map_idx].scenarios[GAME.scen_idx].start();

    $scope.player = GAME.player;
    $scope.enemy = GAME.enemy;

    var _apply = function(){$scope.$apply();};
    $scope.is_targeting = function(){
      if (!GAME.player.resolving) return null;
      return (!!GAME.player.resolving.action.num_targets);
    }
    $scope.onDropField = function(){
      // complete untargeted moves.
      if (!$scope.is_targeting()) {
        GAME.player.apply_move(GAME.player.resolving,_apply);
      }
    };
    $scope.onDropEnemyField = function(){
      // complete untargeted moves.
      if (!$scope.is_targeting()) {
        GAME.player.apply_move(GAME.player.resolving,_apply);
      }
    };
    $scope.onDropDig = function(index){
      GAME.player.dig(index);
    }
    $scope.playStart = function(card){
      $scope.play(card, card.hand_actions[0]);
    }
    $scope.actStart = function(card){
      $scope.play(card, card.field_actions[0]);
    }
    $scope.cancelDrag = function(){
      $timeout(function(){
        GAME.player.clear_targets();
      });
    }

    $scope.close_details = function(){
      $scope.details=null;
    };

    $scope.pick = function(card){
      if ($scope.player.resolving) {
        $scope.player.done_targetting(card,_apply);
      }
    };



    $scope.info = function(card){
      $scope.details=card;
    }
    
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
    
    $scope.play = function(card, action){
      var result = $scope.player.play(card, action, function(){
        $timeout(function(){ //trigger repaint
        },100)
      });
      if (!result.success) alert(result.message);
    };
    
    /*$scope.act = function(card, action){
      var result = $scope.player.act(card, action);
      if (!result.success) alert(result.message);
    };*/

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
    
    /*$scope.sort_config = {
        animation: 150,
        handle: '.handle'
    };*/

    
}]).config(disableSCE);

GAME.app.controller('deckCtrl', function($scope, $timeout, $routeParams) {

  $scope.epic_id = $routeParams.epic_id;
  
  $scope.epic = GAME.get_epic($scope.epic_id);

  $scope.deck = $scope.epic.decks.filter(function(deck){
    return deck.id === $routeParams.deck_id;
  })[0];
  $scope.pool = CardSet.Cards.all().filter(function(c){return c.rarity});

  $scope.sort_config = { // ng-sortable
      animation: 150,
      handle: '.handle'
  };

  $scope.add = function(index){
    $scope.deck.cards.push($scope.pool[index]);
    GAME.save_epic($scope.epic);
  };

  $scope.remove = function(index){
    $scope.deck.cards.splice(index,1);
    GAME.save_epic($scope.epic);
  };

  $scope.save = function(){
    $scope.deck.name = $scope.deck.name.replace(/[^a-z\d]/ig,'').substr(0,15);
    GAME.save_epic($scope.epic);
  }
    
}).config(disableSCE);


GAME.app.controller('mapCtrl', function($scope, $timeout, $routeParams) {
  $scope.epic_id = $routeParams['epic_id']
  $scope.map = GAME.maps[$routeParams.map];
  $scope.map_idx = $routeParams.map;
  $scope.scenarios = GAME.maps[$routeParams.map].scenarios;
}).config(disableSCE);


var adjectives = ['spiny','elusive','dark','vile','flappy','angry','beastly','stunning'];
var nouns = ['equine','singer','thrummer','blaster','smash','wheel','plume','aura','fall'];

GAME.app.controller('decksCtrl', function($scope, $timeout, $routeParams) {
  $scope.epic_id = $routeParams.epic_id;
  $scope.decks = GAME.get_epic($scope.epic_id).decks || [];
  $scope.new_deck = function(){
    var deck = {
      cards: [],
      id: generateUUID(),
      name: adjectives[Math.floor(Math.random()*adjectives.length)]+nouns[Math.floor(Math.random()*nouns.length)]
    };
    var epic = GAME.get_epic($routeParams.epic_id);
    epic.decks = epic.decks || [];
    epic.decks.push(deck);
    GAME.save_epic(epic);
    window.location.hash = '/'+$scope.epic_id+'/deck/'+deck.id
  };
}).config(disableSCE);


GAME.app.controller('menuCtrl', function($scope, $timeout, $routeParams) {

  $scope.maps = GAME.maps;

  var get_epics = function(){
    var epics = {};
    for(var i=1;i<=3;i++) {
      if (localStorage['epic_'+i]) {
        var epic = GAME.get_epic(i);
        if (epic) epics[epic.id] = epic;
      }
    }
    return epics;
  };
  $scope.epics = get_epics();

  $scope.load_epic = function(idx){
    console.log(idx, 'epic is loading');
    if (!$scope.epics[idx]) {
      window.location.hash = "/"+idx+"/story"
    } else {
      window.location.hash = "/"+idx
    }
  }

}).config(disableSCE);

GAME.save_epic = function(epic){
  if (!epic.id) throw ("Epic ID missing!");
  localStorage["epic_"+epic.id] = JSON.stringify(epic);
};

GAME.get_epic = function(id){
  if (!localStorage['epic_'+id]) { throw "No epic with ID:"+id }
  return JSON.parse(localStorage['epic_'+id])
}

GAME.app.controller('epicCtrl', function($scope, $timeout, $routeParams) {
  $scope.maps = GAME.maps;
  $scope.epic_id = $routeParams.epic_id;
}).config(disableSCE);

GAME.app.directive('card', function() {
  return {
    restrict: 'E',
    templateUrl: 'card.html',
    transclude: true
  }
});
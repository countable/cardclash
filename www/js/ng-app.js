GAME.app = angular.module('cardClash', ['ng-sortable']);




GAME.app.controller('cardGameCtrl', function($scope, $timeout) {
    
    GAME.start();

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
        animate_buy(card);
      } else {
        alert('cannot afford');
      }
    };
    
    $scope.turn = function(){
      
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
            $timeout(function(){
              GAME.player.draw(4);
            }, 500);
            
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
    
    $scope.playable = function(card){
      return card.playable;
    };
    
    $scope.get_card_classes = function(card){
      if (card._placeholder) return ['card', 'placeholder'];
      var classes = ['card'];
      
      if (card._target) classes.push('target');
      if (card.health < card.__proto__.health) classes.push('damaged');
      if (card.health < 1 && 'number' === typeof card.health) classes.push('dead');
      
      classes.push(card.display_class);
      
      return classes;
    };
    
    $scope.sort_config = {
        animation: 150,
        handle: '.handle'
    };

    
}).config(function($sceProvider) {
  // Completely disable SCE.  For demonstration purposes only!
  // Do not use in new projects.
  $sceProvider.enabled(false);
})


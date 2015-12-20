
var GAME = {

  emit_move: function(move){

      var check = function(listener, att) {
          if (listener[att] === 'any') return true;
          if (listener[att] === 'self') return move.card === listener.card;
          if (move[att].is_a(listener[att])) return true;
      };

      var listeners = this.getListeners(move.player);
      listeners.forEach(function(listener){
          if (check(listener, 'card') && check(listener, 'target') && check(listener, 'action')) {
              listener.fn(move);
          }
      });
  },

  getListeners: function(player){
    var listeners = [];
    listeners = listeners.concat(
      [].concat.apply([], player.field.map(function(card){return card.events || []}))
    );
    listeners = listeners.concat(
      [].concat.apply([], player.get_opponent().field.map(function(card){return card.events || []}))
    );
    return listeners;
  }

};


String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

var Scenario = {
  start: function(){
    this.setup();
    // initial deploys status.
    GAME.player.get_opponent().field.forEach(function(c){
      c.stunned=c.delay;
    });
    GAME.player.field.forEach(function(c){
      c.stunned=c.delay;
    });

    // shuffle deck
    GAME.player.deck = CardSet.shuffle(GAME.player.deck);    
    
    this.reg_events();

    GAME.scenario = this;
    GAME.turn_idx = 0;
    
    GAME.player.draw(6);
  },

  reg_events: function(){
    GAME.player.deck.forEach(function(card){
      // TODO:...
    });
  }
};


GAME.scenarios = [

  
  inherit(Scenario, {
    name: 'TEST',
    setup: function(){   
      GAME.player.deck = CardSet.Cards.from_list([
        'blizzard','priest','aatxe','haste','zap_shield',
        'bolt','gem','hillscale','zap_trap','bolt'
      ]);
      GAME.player.field = CardSet.Cards.from_list([
        'keep'
      ]);
      GAME.enemy.field = [
        inherit(CardSet.Cards.get('nest'), {health: 7})
      ];
    },
    enemy_turn: function(){
      if (GAME.enemy.field.length < 4) {
          if (Math.random() < 0.3) GAME.enemy.field.splice(GAME.enemy.field.length-1, 0, CardSet.Cards.create('serpent'));
          else if (Math.random() < 0.3) GAME.enemy.field.push(CardSet.Cards.create('bandit'));
          //GAME.enemy.field.splice(GAME.enemy.field.length-1, 0, CardSet.Cards.create('serpent'));
      }
    }
  }),

  inherit(Scenario, {
    name: 'Tutorial',
    setup: function(){
      GAME.player.deck = CardSet.Cards.from_list(JSON.parse(localStorage.collection));
      GAME.player.field = CardSet.Cards.from_list(['keep', 'goose']);
      GAME.player.store = [];
      GAME.enemy.field = CardSet.Cards.from_list(['nest', 'rat','rat']);
      /*setTimeout(function(){
        introJs().start({
          showBullets: false,
          overlayOpacity: 0.2,
          showStepNumbers: false,
          tooltipPosition: 'auto'
        })
      }, 100);*/
    }
  }),
  
  inherit(Scenario, {
    name: 'The Store',
    setup: function(){   
      GAME.player.deck = CardSet.Cards.from_list([
        'militia','militia',
        'soldier','archer','hunter','cavalry',
        'militia','soldier','archer','gem','gem'
      ]);
      GAME.player.field = CardSet.Cards.from_list(['keep']);
      GAME.enemy.field = CardSet.Cards.from_list(['nest']);
      GAME.player.store = CardSet.Cards.from_list(['soldier']);
    },
    enemy_turn: function(){
      GAME.enemy.field.push(CardSet.Cards.create('bandit'));
    }
  }),

  
  inherit(Scenario, {
    name: 'Magic',
    setup: function(){   
      GAME.player.deck = CardSet.Cards.from_list([
        'militia','militia',
        'gem','gem','gem','gem',
        'gem','gem','gem','gem'
      ]);
      GAME.player.field = CardSet.Cards.from_list([
        'keep'
      ]);
      GAME.enemy.field = [
        CardSet.Cards.create('wall'),
        inherit(CardSet.Cards.get('nest'), {health: 4})
      ];
      GAME.player.store = CardSet.Cards.from_list(['archer','arson','bolt']);
    },
    enemy_turn: function(){
      if (GAME.enemy.field.length < 4) {
        
        GAME.enemy.field.splice(GAME.enemy.field.length-1, 0, CardSet.Cards.create('bandit'));
      }
    }
  }),
  
  inherit(Scenario, {
    name: 'Brutes',
    setup: function(){   
      GAME.player.deck = CardSet.Cards.from_list([
        'militia','militia',
        'gem','gem','gem','gem',
        'gem','gem','gem','gem'
      ]);
      GAME.player.field = CardSet.Cards.from_list([
        'keep'
      ]);
      GAME.enemy.field = [
        inherit(CardSet.Cards.get('nest'), {health: 7})
      ];
      GAME.player.store = CardSet.Cards.from_list(['entomb','cavalry']);
    },
    enemy_turn: function(){
      if (GAME.enemy.field.length < 4) {
        if (Math.random() < .5)
          GAME.enemy.field.splice(GAME.enemy.field.length-1, 0, CardSet.Cards.create('serpent'));
      }
    }
  }),
  
  inherit(Scenario, {
    name: 'Horde',
    setup: function(){   
      GAME.player.deck = CardSet.Cards.from_list([
        'militia','militia',
        'gem','gem','gem','gem',
        'gem','gem','gem','gem'
      ]);
      GAME.player.field = CardSet.Cards.from_list([
        'keep'
      ]);
      GAME.enemy.field = [
        inherit(CardSet.Cards.get('nest'), {health: 7})
      ];
      GAME.player.store = CardSet.Cards.from_list(['entomb','cavalry']);
    },
    enemy_turn: function(){
      if (GAME.enemy.field.length < 4) {
          GAME.enemy.field.splice(GAME.enemy.field.length-1, 0, CardSet.Cards.create('serpent'));
          GAME.enemy.field.splice(GAME.enemy.field.length-1, 0, CardSet.Cards.create('serpent'));
      }
    }
  })


];


GAME.won = function(){

  animate_won(function(){
    
    window.location.hash = GAME.scen_idx + 1;
    window.location.reload();
  });
}


GAME.lost = function(){
  animate_lost(function(){
    window.location.reload();
  })
}

// AI
GAME.enemy_turn = function(){
  //enemy.field.unshift(CardSet.Cards.get('evilcow'))
  GAME.enemy.hand.forEach(function(card){
    
  });
  
  GAME.enemy.field.forEach(function(card){
    if (card.field_actions){
      var move={
        card: card,
        action: card.field_actions[0],
        player: GAME.enemy
      }
      GAME.enemy.initiate_move(move);
      if (GAME.enemy.resolving && GAME.enemy.resolving.action.targets){ // just pick the first target, if needed
        var targets = GAME.enemy.resolving.action.targets(GAME.enemy.resolving);
        GAME.enemy.done_targetting(targets[Math.floor(Math.random()*targets.length)]);
      }
    }
  });
  
  var et = GAME.scenario.enemy_turn;
  et && et();
};





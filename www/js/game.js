
var GAME = {

  emit_move: function(move){

      var check = function(listener, att) {
          if (listener[att] === 'any') return true;
          if (listener[att] === 'self') return move.card === listener.card;
          if (move[att].is_a(listener[att])) return true;
      };

      var listeners = this.getListeners(move.player);
      console.log(listeners);
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
    GAME.player.deck = CardSet.shuffle(GAME.player.deck);    
    
    this.reg_events();

    GAME.scenario = this;
    GAME.turn_idx = 0;
    
    GAME.player.draw(4);
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
        'priest','priest',
        'bolt','gem','gem','gem','bolt'
      ]);
      GAME.player.field = CardSet.Cards.from_list([
        'keep', 'flame_swan'
      ]);
      GAME.enemy.field = [
        inherit(CardSet.Cards.get('nest'), {health: 7}), inherit(CardSet.Cards.get('evilcow'))
      ];
      GAME.player.store = CardSet.Cards.from_list(['entomb','cavalry']);
    },
    enemy_turn: function(){
      if (GAME.enemy.field.length < 4) {
          GAME.enemy.field.splice(GAME.enemy.field.length-1, 0, CardSet.Cards.create('serpent'));
          //GAME.enemy.field.splice(GAME.enemy.field.length-1, 0, CardSet.Cards.create('serpent'));
      }
    }
  }),

  inherit(Scenario, {
    name: 'Tutorial',
    setup: function(){
      GAME.player.deck = CardSet.Cards.from_list(['militia', 'gem', 'militia', 'gem', 'militia', 'gem', 'militia', 'gem']);
      GAME.player.field = CardSet.Cards.from_list(['militia', 'militia', 'militia', 'keep']);
      GAME.player.deck = CardSet.shuffle(GAME.player.deck);
      GAME.player.store = [];
      GAME.enemy.field = CardSet.Cards.from_list(['evilcow', 'nest']);
      setTimeout(function(){
        introJs().start({
          showBullets: false,
          overlayOpacity: 0.2,
          showStepNumbers: false
        })
      }, 100);
    }
  }),
  
  inherit(Scenario, {
    name: 'The Store',
    setup: function(){   
      GAME.player.deck = CardSet.Cards.from_list([
        'militia','militia',
        'gem','gem','gem','gem',
        'gem','gem','gem','gem'
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
      console.log(card);
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
      console.log(move);
    }
  });
  
  var et = GAME.scenario.enemy_turn;
  et && et();
};


// 
GAME.start = function(){
  GAME.player = inherit(Player);
  GAME.player.client = true;

  GAME.enemy = inherit(Player);

  GAME.players = [GAME.player, GAME.enemy];
  
  GAME.scen_idx = parseInt((window.location.hash).replace("#",""));
  GAME.scenarios[GAME.scen_idx].start();
};


var GAME = {

  emit_move: function(move){

      var check = function(listener, att) {
          if (listener[att] === 'card') return true;
          if (listener[att] === 'self') return move.card === listener.card;
          if (move[att].is_a(listener[att])) return true;
      };

      var listeners = GAME.get_listeners(move.player);
      listeners.forEach(function(listener){
          if (check(listener, 'card') && check(listener, 'target') && check(listener, 'action')) {
              listener.fn(move);
          }
      });
  },

  get_listeners: function(player){
    var listeners = [];
    listeners = listeners.concat(
      [].concat.apply([], player.field.map(function(card){return card.events || []}))
    );
    listeners = listeners.concat(
      [].concat.apply([], player.get_opponent().field.map(function(card){return card.events || []}))
    );
    return listeners;
  },

  get_globals: function(for_card, attr){
    var ownership = (for_card.owned_by == GAME.player) ? 'player': 'enemy';
    var from_card, effect, i, j, total = 0;
    
    var check = function(from_card, effect){
      if (!effect[attr] && !effect['get_'+attr]) return false;
      if (!(effect.card_type === 'card' || for_card.is_a(effect.card_type))) return false;
      if (effect.owner === 'ally') {
        return from_card.owned_by === for_card.owned_by;
      } else if (effect.owner === 'enemy') {
        return from_card.owned_by !== for_card.owned_by;
      } else { // no ownership constraint.
        return true;
      }
    };

    // oldschool loops for perf boost.
    var fields = GAME.get_fields();
    for (i=0;i<fields.length;i++) {
      if (fields[i].global_effects) {
        from_card = fields[i];
        for(j=0;j<from_card.global_effects.length;j++){
          effect = from_card.global_effects[j];
          if (check(from_card, effect)){
            total += effect[attr] ? effect[attr] : effect['get_'+attr](card)
          } 
        }
      }
    }

    return total;
  },

  get_fields: function(){
    return GAME.enemy.field.concat(GAME.player.field);
  }

};


String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

var Scenario = {
  start: function(){
    this.setup();
    // initial deploys status.
    GAME.get_fields().forEach(function(c){
      c.stunned=c.delay;
    });
    GAME.player.field.concat(GAME.player.deck).forEach(function(c){
      c.owned_by = GAME.player;
    });
    GAME.enemy.field.concat(GAME.enemy.deck).forEach(function(c){
      c.owned_by = GAME.enemy;
    });
    // shuffle deck
    GAME.player.deck = CardSet.shuffle(GAME.player.deck);    
    
    this.reg_events();

    GAME.scenario = this;
    GAME.turn_idx = 0;
    
    GAME.player.draw(this.hand_size || 6);
  },

  reg_events: function(){
    GAME.player.deck.forEach(function(card){
      // TODO:...
    });
  }
};

var add_enemy = function(card_name){
  var c = CardSet.Cards.create(card_name);
  c.owned_by = GAME.enemy;
  GAME.enemy.field.push(c);
}
GAME.scenarios = [

  inherit(Scenario, {
    name: 'TEST',
    setup: function(){
      GAME.player.deck = CardSet.Cards.from_list(Object.keys(CardSet.Cards.by_name)).filter(function(c){
        return c.rarity;
      }); // all cards that aren't abstract
      GAME.player.field = CardSet.Cards.from_list([
        'keep', 'alpha_wolf', 'militia'
      ]);
      GAME.enemy.field = [
        inherit(CardSet.Cards.get('nest'), {health: 7})
      ].concat(CardSet.Cards.from_list(['bandit']));
    },
    enemy_turn: function(){
      if (GAME.enemy.field.length < 4) {
          if (Math.random() < 0.01) add_enemy('serpent')
          else if (Math.random() < 0.9) add_enemy('bandit');
          //GAME.enemy.field.splice(GAME.enemy.field.length-1, 0, CardSet.Cards.create('serpent'));
      }
    }
  }),

  inherit(Scenario, {
    name: 'Welcome',
    hand_size: 3,
    setup: function(){
      GAME.player.deck = CardSet.Cards.from_list(JSON.parse(localStorage.collection));
      //GAME.player.deck = GAME.player.deck.concat(CardSet.Cards.from_list(['goose', 'goose', 'goose', 'goose']));
      GAME.player.field = CardSet.Cards.from_list(['keep', 'goose']);
      GAME.player.store = [];
      GAME.enemy.field = CardSet.Cards.from_list(['nest', 'rat','rat']);
      setTimeout(function(){
        introJs().start({
          showBullets: false,
          overlayOpacity: 0.2,
          showStepNumbers: false,
          tooltipPosition: 'auto'
        })
      }, 100);
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
      add_enemy('bandit');
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
        var c= CardSet.Cards.create('bandit');
        c.owned_by = GAME.enemy;
        GAME.enemy.field.splice(GAME.enemy.field.length-1, 0, c);
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
          add_enemy('serpent')
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
          add_enemy('serpent');
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





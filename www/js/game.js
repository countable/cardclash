
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

    // oldschool loops for perf.
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
  
  /**
   * Get a list of all units on the field.
   */
  get_fields: function() {
    return GAME.enemy.field.concat(GAME.player.field);
  },


  save_epic: function(epic) {
    if (!epic.id) throw ("Epic ID missing!");
    localStorage["epic_"+epic.id] = JSON.stringify(epic);
  },

  get_epic: function(id) {
    if (!localStorage['epic_'+id]) { throw "No epic with ID:"+id }
    return JSON.parse(localStorage['epic_'+id])
  },

  get_default_deck: function(epic) {
    var deck_list;
    if (epic.decks) {
      deck_list = epic.decks[epic.default_deck_id || object.keys(epic.decks)[0]];
    } else { // no decks, use entire collection.
      deck_list = epic.collection;
    }
    return CardSet.Cards.from_list(deck_list);
  },

  start: function(){
    this.player = inherit(Player);
    this.enemy = inherit(Player);
    this.players = [this.player, this.enemy];
    this.player.deck = this.get_default_deck(this.epic);
    this.maps[this.map_idx].scenarios[this.scen_idx].start();    
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
GAME.maps = [
  {
    name: "cellar",
    scenarios: [
      inherit(Scenario, {
        order: 1,
        name: 'stairwell',
        setup: function(){

          GAME.player.field = CardSet.Cards.from_list([
            'keep', 'shiba_pup'
          ]);
          GAME.enemy.field = [
            inherit(CardSet.Cards.get('nest'), {health: 7})
          ].concat(CardSet.Cards.from_list(['mousefly']));
        },
        enemy_turn: function(){
          if (Math.random() < 0.9) add_enemy('mousefly');
        }
      }),
      inherit(Scenario, {
        order: 2,
        name: 'mousefly_swarm',
        setup: function(){
        },
        enemy_turn: function(){

        }
      }),
      inherit(Scenario, {
        order: 3,
        name: 'mousefly_queen',
        setup: function(){
        },
        enemy_turn: function(){

        }
      }),
      inherit(Scenario, {
        order: 5,
        name: 'kilapede',
        setup: function(){
        },
        enemy_turn: function(){

        }
      }),
      inherit(Scenario, {
        order: 5,
        name: 'squallway',
        setup: function(){
        },
        enemy_turn: function(){

        }
      }),
      inherit(Scenario, {
        order: 4,
        name: 'impedence',
        setup: function(){
        },
        enemy_turn: function(){

        }
      })
    ]
  },
  {
    name: 'surface',
    scenarios: [

    ]
  },
  {
    name: 'by_the_sea',
    scenarios: [

    ]
  },
  {
    name: "tests",
    scenarios:[

      inherit(Scenario, {
        name: 'TEST',
        setup: function(){
          /*GAME.player.deck = CardSet.Cards.from_list(Object.keys(CardSet.Cards.by_name)).filter(function(c){
            return c.rarity;
          });*/ // all cards that aren't abstract
          GAME.player.deck = CardSet.Cards.from_list([
            'haste','archer',
            'archer','archer','archer','archer','archer'
          ]);
          GAME.player.field = CardSet.Cards.from_list([
            'keep', 'alpha_wolf', 'archer'
          ]);
          GAME.enemy.field = [
            inherit(CardSet.Cards.get('nest'), {health: 7})
          ].concat(CardSet.Cards.from_list(['bandit', 'bandit']));
        },
        enemy_turn: function(){
          if (GAME.enemy.field.length < 4) {
              //if (Math.random() < 0.01) add_enemy('serpent')
              //else if (Math.random() < 0.9) add_enemy('bandit');
              //GAME.enemy.field.splice(GAME.enemy.field.length-1, 0, CardSet.Cards.create('serpent'));
          }
        }
      }),

      inherit(Scenario, {
        name: 'Welcome',
        hand_size: 3,
        setup: function(){
          //GAME.player.deck = GAME.player.deck.concat(CardSet.Cards.from_list(['goose', 'goose', 'goose', 'goose']));
          GAME.player.deck = CardSet.Cards.from_list([
            'haste','archer',
            'archer','archer','archer','archer','archer'
          ]);
          GAME.player.field = CardSet.Cards.from_list(['keep', 'goose']);
          GAME.player.store = [];
          GAME.enemy.field = CardSet.Cards.from_list(['nest', 'mousefly','mousefly']);
          /*
          setTimeout(function(){
            introJs().start({
              showBullets: false,
              overlayOpacity: 0.2,
              showStepNumbers: false,
              tooltipPosition: 'auto'
            })
          }, 100);
          */
        }
      }),
      
      inherit(Scenario, {
        name: 'Oger',
        setup: function(){   
          GAME.player.deck = CardSet.Cards.from_list([
            'archer','archer',
            'archer','archer','archer','archer',
            'archer','archer','archer','archer','archer'
          ]);
          GAME.player.field = CardSet.Cards.from_list(['keep']);
          GAME.enemy.field = CardSet.Cards.from_list(['nest']);
        },
        enemy_turn: function(){
          add_enemy('ogre');
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
      })

    ]
  }

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
    if (card.field_actions && GAME.enemy.can_act(card)){

      var move = {
          card: card,
          action: card.field_actions[0],
          player: GAME.enemy,
          cost: card.field_actions[0].cost,
      };
      GAME.enemy.initiate_move(move);

      if (GAME.enemy.resolving) {
        if (GAME.enemy.resolving.action.targets){ // just pick the first target, if needed
          var targets = GAME.enemy.resolving.action.targets(GAME.enemy.resolving);
          GAME.enemy.done_targetting(targets[Math.floor(Math.random()*targets.length)]);
        } else {
          GAME.enemy.apply_move(GAME.enemy.resolving);
        }
      }
    }
  });
  
  var et = GAME.scenario.enemy_turn;
  et && et();
};






var GAME = {};



String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var Scenario = {
  start: function(){
    this.setup();
    GAME.player.deck = CardSet.shuffle(GAME.player.deck);    
    
    GAME.scenario = this;
    GAME.turn_idx = 0;
    
    GAME.player.draw(4);
  }
};


GAME.scenarios = [
  
  inherit(Scenario, {
    name: 'Tutorial',
    setup: function(){
      GAME.player.deck = CardSet.Cards.from_list(['militia', 'wealth', 'militia', 'wealth', 'militia', 'wealth', 'militia', 'wealth']);
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
        'wealth','wealth','wealth','wealth',
        'wealth','wealth','wealth','wealth'
      ]);
      GAME.player.field = CardSet.Cards.from_list(['keep']);
      GAME.enemy.field = CardSet.Cards.from_list(['nest']);
      GAME.player.store = CardSet.Cards.from_list(['archer','soldier']);
    },
    enemy_turn: function(){
      GAME.enemy.field.unshift(CardSet.Cards.create('bandit'));
    }
  }),

  
  inherit(Scenario, {
    name: 'Magic',
    setup: function(){   
      GAME.player.deck = CardSet.Cards.from_list([
        'militia','militia',
        'wealth','wealth','wealth','wealth',
        'wealth','wealth','wealth','wealth'
      ]);
      GAME.player.field = CardSet.Cards.from_list([
        'keep'
      ]);
      GAME.enemy.field = [
        CardSet.Cards.create('wall'),
        inherit(CardSet.Cards.get('nest'), {health: 5})
      ];
      GAME.player.store = CardSet.Cards.from_list(['militia','arson','entomb']);
    },
    enemy_turn: function(){
      while(GAME.enemy.field.length < 4) {
        
        GAME.enemy.field.splice(GAME.enemy.field.length-1, 0, CardSet.Cards.create('bandit'));
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
        GAME.enemy.done_targetting(GAME.enemy.resolving.action.targets(GAME.enemy.resolving)[0]);
      }
      console.log(move);
    }
  });
  var et = GAME.scenario.enemy_turn
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

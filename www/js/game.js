
var GAME = {
  
  set_awarded: function(value) {
    var award_status_key = '' + this.map_idx + '-' + this.room_idx + '-' + this.scen_idx;
    this.epic.awarded[award_status_key] = 1;
    this.save_epic(this.epic);
  },

  currently_awarded: function(map_idx, room_idx, scen_idx) {
    var award_status_key = '' + map_idx + '-' + room_idx + '-' + scen_idx;
    this.epic.awarded = this.epic.awarded || {};
    return this.epic.awarded[award_status_key];
  },

  load_route_context: function($routeParams, $scope){
    ['scen_idx', 'room_idx', 'map_idx', 'epic_id'].forEach(function(key){
      if ($routeParams[key]){
        $scope[key] = parseInt($routeParams[key]);
        GAME[key] = parseInt($routeParams[key]);
      }
    })
    GAME.epic = GAME.get_epic($scope.epic_id);
  },

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
    if (GAME.enemy) {// short circuit on non-game pages.
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
      deck = epic.decks.filter(function(deck){
        return deck.id === epic.default_deck_id;
      })[0];
      if (!deck) {
        deck= epic.decks[0];
      }
    } else { // no decks, use entire collection.
      deck = {
        cards: epic.collection
      };
    }
    return CardSet.Cards.from_list(deck.cards);
  },
  
  get_current_scenario: function() {
    return this.maps[this.map_idx].rooms[this.room_idx].scenarios[this.scen_idx];
  },

  get_current_room: function() {
    return this.maps[this.map_idx].rooms[this.room_idx];
  },

  start: function() {
    this.player = inherit(Player);
    this.enemy = inherit(Player);
    this.players = [this.player, this.enemy];
    this.get_current_scenario().start();
  }

};


String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

var C = function(c, o){
  o = o || {};
  return inherit(CardSet.Cards.get(c), o);
}
var CL = function(l){
  return CardSet.Cards.from_list(l);
}

var Scenario = {
  
  // defaults
  num_prizes: 0,
  prizes: [],

  setup_player_field: function(){
    GAME.player.field = CL(['keep']);
  },
  
  setup_enemy_field: function(){
    GAME.enemy.field = [
      C('nest', {health: 7})
    ];
  },
  
  setup_card_state: function(){
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
  },
  
  shuffle_decks: function(){
    // shuffle deck
    GAME.player.deck = CardSet.shuffle(GAME.player.deck);
    GAME.enemy.deck = CardSet.shuffle(GAME.enemy.deck);
  },
  
  draw_hands: function(){
    GAME.player.draw(6);
    GAME.enemy.draw(6);
  },

  get_player_deck: function(){
    GAME.player.deck = GAME.get_default_deck(GAME.epic);
  },

  get_enemy_deck: function(){
    GAME.enemy.deck = CL(this.enemy_deck || []);
  },

  start: function(){

    GAME.scenario = this;
    GAME.turn_idx = 0;
    
    this.draw_player_hand();
    this.draw_enemy_hand();
  },
  
  draw_player_hand: function(){
    GAME.player.draw(this.hand_size || 6);
  },

  draw_enemy_hand: function(){
    GAME.enemy.draw(this.hand_size || 6);
  },
  
  start: function(){
    this.get_enemy_deck();
    this.get_player_deck();

    this.setup_player_field();
    this.setup_enemy_field();

    this.setup_card_state();

    this.shuffle_decks();
    this.draw_hands();

    this.postsetup && this.postsetup()
  }

};

var add_enemy = function(card_name){
  var c = CardSet.Cards.create(card_name);
  c.owned_by = GAME.enemy;
  GAME.enemy.field.push(c);
}



GAME.won = function(){
  animate_won(function(){
    window.location.hash += "/won";
    //window.location.reload();
  });
}


GAME.lost = function(){
  animate_lost(function(){
    window.location.hash += "/lost";
    //window.location.reload();
  })
}

// AI
GAME.enemy_turn = function(){

  var consider = function(from_hand) {
    var action_type = from_hand ? 'hand_actions' : 'field_actions';
    var move_type = from_hand ? 'play' : 'act';
    return function(card){

      if (card[action_type] && GAME.enemy['can_'+move_type](card)){
        var action = card[action_type][0];
        var move = new Move({
            card: card,
            action: action,
            player: GAME.enemy,
            cost: from_hand ? (action.cost || card.cost) : action.cost,
            from_hand: from_hand
        });
        GAME.enemy.initiate_move(move);

        if (GAME.enemy.resolving) {
          if (GAME.enemy.resolving.action.single_target()){
            var targets = GAME.enemy.resolving.action.targets(GAME.enemy.resolving);
            GAME.enemy.done_targetting(targets[Math.floor(Math.random()*targets.length)]);
          } else {
            GAME.enemy.apply_move(GAME.enemy.resolving);
          }
        }
      }
    };
  };

  GAME.enemy.field.forEach(consider(false));
  GAME.enemy.hand.forEach(consider(true));
  
  if (GAME.enemy.hand.length > GAME.enemy.diams) {
    GAME.enemy.dig(0)
  }
  var et = GAME.scenario.enemy_turn;
  et && et(GAME.turn_idx);
};





function add_prop(prop) {
  return function(a, b) {
    return a + b[prop];
  };
}

function sum_of(arr, prop) {
  return arr.reduce(add_prop(prop), 0);
}

var enemy_should_dig = function() {
  var enemy = GAME.enemy;
  cost_sum = sum_of(enemy.hand, 'cost');
  //console.log('cost sum / res', cost_sum, (enemy.income * 3 + enemy.diams));
  return cost_sum > (enemy.income * 3 + enemy.diams);
};


// AI
GAME.enemy_turn = function() {

  var consider = function(from_hand) {
    var action_type = from_hand ? 'hand_actions' : 'field_actions';
    var move_type = from_hand ? 'play' : 'act';

    return function(card) {
      console.log(card, 'is under consideration');
      if (card[action_type] && GAME.enemy['can_' + move_type](card)) {
        var action = card[action_type][0];
        var move = new Move({
          card: card,
          action: action,
          player: GAME.enemy,
          from_hand: from_hand
        });
        GAME.enemy.initiate_move(move);

        if (GAME.enemy.resolving) {
          if (GAME.enemy.resolving.action.single_target()) {
            var targets = GAME.enemy.resolving.action.targets(GAME.enemy.resolving);
            if (targets.length)
              GAME.enemy.done_targetting(targets[Math.floor(Math.random() * targets.length)]);
          } else {
            GAME.enemy.apply_move(GAME.enemy.resolving);
          }
        }
      }
    };
  };

  GAME.enemy.field.forEach(consider(false));
  GAME.enemy.hand.forEach(consider(true));


  if (enemy_should_dig()) {
    for (var i = 0; i < GAME.enemy.hand.length; i++) {
      if (!GAME.enemy.hand[i]._done) {
        GAME.enemy.dig(i);
        break;
      }
    }
  }
  var et = GAME.scenario.enemy_turn;
  et && et(GAME.turn_idx);
};

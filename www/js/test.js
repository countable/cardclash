
var assertEqual = function(a, b) {
  if (a !== b) {
    throw new Error(JSON.stringify({VALUE:a}) + " != " + JSON.stringify({VALUE:b}));
  }
};

var run_tests = function(){

  // create an epic (saved game).
  GAME.epic = {
    id: 4,
    collection: ['fist'],
    job: 'clerk',
    award: 'jock',
    death: 'dogs'
  };
  GAME.save_epic(GAME.epic);

  // route context setup.
  GAME.scen_idx = 0;
  GAME.room_idx = 0;
  GAME.map_idx = 0;
  GAME.epic_idx = 4;

  GAME.start();

  return [
    function(){
      arguments.callee.name = "Start the game.";
      GAME.start();
      assertEqual(GAME.scenario.num_prizes, 2);
      return "Started the game."
    },
    function() {
      assertEqual(GAME.players.length, 2);
      assertEqual(GAME.players[0].get_opponent(), GAME.players[1]);
      assertEqual(GAME.players[1].get_opponent(), GAME.players[0]);
      assertEqual(GAME.player.hand.length, 1);
      return "Check the players."
    },
    function() {
      var move = new Move({
          card: GAME.player.hand[0],
          action: GAME.player.hand[0].hand_actions[0],
          player: GAME.player,
          from_hand: true
      });
      var result = GAME.player.initiate_move(move);
      assertEqual(GAME.player.hand[0].name, GAME.player.resolving.card.name)
      GAME.player.apply_move(GAME.player.resolving);
      //GAME.player.done_targetting();
      assertEqual(result.success, true);
      return "Test playing a card from hand."
    },
    function() {
      return "TODO: test using a card action."
    },
    function() {
      GAME.get_pending_moves().forEach(function(move){
        move.card._done = false;
        move.player.complete_move(move);
      })
      GAME.player.end_turn();
      GAME.enemy.end_turn();
      // done turn, reset
      GAME.player.begin_turn()
      GAME.enemy.begin_turn()
      return "TODO: test updating the turn."
    },
    function() {
      return "Done."
    }
  ].map(function(test){
    return test();
  })
};

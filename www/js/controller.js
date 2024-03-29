function generateUUID() {
  var d = new Date().getTime();
  if (window.performance && typeof window.performance.now === "function") {
    d += performance.now(); //use high-precision timer if available
  }
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}


var disableSCE = function($sceProvider) {
  // Completely disable SCE.
  $sceProvider.enabled(false);
}


GAME.app = angular.module('gameApp', ['ngRoute', 'ngDraggable']).config(
    ['$routeProvider', '$locationProvider',
      function($routeProvider, $locationProvider) {
        $routeProvider.when('/:epic_id/deck/:deck_id', {
            templateUrl: "deck.html"
          })
          .when('/:epic_id/deck', {
            templateUrl: "decks.html"
          })
          .when('/:epic_id/map/:map_idx', {
            templateUrl: "map.html"
          })
          .when('/:epic_id/room/:map_idx/:room_idx', {
            templateUrl: "room.html"
          })
          .when('/:epic_id/game/:map_idx/:room_idx/:scen_idx', {
            templateUrl: "game.html"
          })
          .when('/:epic_id/game/:map_idx/:room_idx/:scen_idx/won', {
            templateUrl: "won.html"
          })
          .when('/:epic_id/game/:map_idx/:room_idx/:scen_idx/lost', {
            templateUrl: "lost.html"
          })
          .when('/:epic_id/story', {
            templateUrl: "story.html"
          })
          .when('/tests', {
            templateUrl: "tests.html"
          })
          .when('/:epic_id', {
            templateUrl: "epic.html"
          })
          .when('/', {
            templateUrl: "menu.html"
          });
      }
    ])
  .run();


GAME.app.controller('wonCtrl', ['$scope', '$routeParams', '$timeout',
  function($scope, $routeParams, $timeout) {
    GAME.load_route_context($routeParams, $scope);

    var scenario = GAME.get_current_scenario();

    if (GAME.currently_awarded(GAME.map_idx, GAME.room_idx, GAME.scen_idx) === 1) {
      $scope.prizes = [];
    } else {
      $scope.num_prizes = scenario.num_prizes;
      $scope.prizes = CL(scenario.prizes);
      GAME.set_awarded(1);
    }

    $scope.pick_prize = function(index) {
      var prize = $scope.prizes.splice(index, 1);
      GAME.epic.collection.push(prize[0].name);
      $scope.num_prizes--;
      GAME.save_epic(GAME.epic)
    }
  }
]);


GAME.app.controller('lostCtrl', ['$scope', '$routeParams', '$timeout',
  function($scope, $routeParams, $timeout) {
    GAME.load_route_context($routeParams, $scope);
  }
]);

GAME.app.controller('testCtrl', ['$scope',
  function($scope) {
    $scope.results = run_tests();
  }
]);

GAME.app.controller('gameCtrl', ['$scope', '$routeParams', '$timeout',
  function($scope, $routeParams, $timeout) {
    // get active epic.
    GAME.load_route_context($routeParams, $scope);

    GAME.start();
    GAME.player.client = true;

    // refs.
    $scope.GAME = GAME;
    $scope.scenario_name = GAME.get_current_scenario().name;
    $scope.room_name = GAME.get_current_room().name;
    $scope.player = GAME.player;
    $scope.enemy = GAME.enemy;

    var _apply = function() {
      $scope.$apply();
    };

    $scope.is_targeting_player_field = function() {
      var r = GAME.player.resolving;
      if (!r) return false;
      return r.get_cost() <= GAME.player.diams && (r.action.targets === 'PLAYER_FIELD' ||
        r.action.targets === 'BOTH_FIELDS'
      );
    };

    $scope.is_targeting_enemy_field = function() {
      var r = GAME.player.resolving;
      if (!r) return false;

      return r.get_cost() <= GAME.player.diams && (r.action.targets === 'ENEMY_FIELD' ||
        r.action.targets === 'BOTH_FIELD'
      );
    };
    $scope.can_target = function(card) {
      return GAME.player.resolving &&
        card._target === true /*&& GAME.player.can_play(GAME.player.resolving.card)*/ ;
    };

    // Drag and Drop events.
    $scope.onDropField = function() {
      // complete untargeted moves.
      if ($scope.is_targeting_player_field()) {
        GAME.player.apply_move(GAME.player.resolving, _apply);
      }
    };
    $scope.onDropEnemyField = function() {
      // complete untargeted moves.
      if ($scope.is_targeting_enemy_field()) {
        GAME.player.apply_move(GAME.player.resolving, _apply);
      }
    };
    $scope.onDropDig = function() {
      GAME.player.dig(GAME.player.hand.indexOf(GAME.player.resolving.card));
    };
    $scope.playStart = function(card) {
      var move = new Move({
        card: card,
        action: card.hand_actions[0],
        player: GAME.player,
        from_hand: true
      });
      var result = GAME.player.initiate_move(move);
    };
    $scope.actStart = function(card) {
      var move = new Move({
        card: card,
        action: card.field_actions[0],
        player: GAME.player
      });

      var result = GAME.player.initiate_move(move);
    };
    $scope.cancelDrag = function() {
      $timeout(function() {
        GAME.player.clear_targets();
      });
    };
    $scope.pick = function(card) {
      if ($scope.player.resolving) {
        $scope.player.done_targetting(card, _apply);
      }
    };
    // Details screen
    $scope.close_details = function() {
      $scope.details = null;
    };
    $scope.info = function(card) {
      $scope.details = card;
    }
    $scope.detail_stats = ['health', 'speed', 'damage',
      'cost', 'delay', 'spikes', 'armor', 'poison'
    ];
    $scope.get_stat = function(card, stat) {
      var orig = card.__proto__[stat] || 0;
      var current = card['effective_' + stat] || card[stat] || 0;
      result = orig;
      if (current > orig) {
        result += " + " + (current - orig);
      } else if (current < orig) {
        result += " - " + (orig - current);
      }
      return result;
    };

    $scope.turn = function() {

      if (GAME.player.resolving) return alert('finish targeting first.');
      $scope.playing = true;

      GAME.end_turns();

      $timeout(function() {

        // queued moves.
        var pending_moves = GAME.get_pending_moves();
        var complete = function() {

          GAME.player.end_turn();
          GAME.enemy.end_turn();
          // done turn, reset

          $scope.playing = false;
          $timeout(function() {
            GAME.player.begin_turn()
            GAME.enemy.begin_turn()
            console.log(GAME.enemy.hand.length, 'cards in ehand')
          }, 500);

        };
        var last = (new Date()).valueOf()
        var do_move = function(cur_move_idx) {
          if (GAME.is_over) return;
          last = (new Date()).valueOf()

          var move = pending_moves[cur_move_idx];
          if (move) {
            console.log('executing', move);
            move.card._done = false;
            move.player.complete_move(move, function() {
              $timeout(function() { // let ui update.

                do_move(cur_move_idx + 1);
              }, 0);
            });
          } else {
            $timeout(complete, 500);
          }
        };

        do_move(0);
      }, 500);
    };


  }
]).config(disableSCE);

GAME.app.controller('deckCtrl', function($scope, $timeout, $routeParams) {

  GAME.load_route_context($routeParams, $scope);
  $scope.epic = GAME.epic;

  $scope.deck = $scope.epic.decks.filter(function(deck) {
    return deck.id === $routeParams.deck_id;
  })[0];

  $scope.picks = CardSet.Cards.from_list($scope.deck.cards);
  $scope.pool = CardSet.Cards.from_list($scope.epic.collection);

  $scope.sort_config = { // ng-sortable
    animation: 150,
    handle: '.handle'
  };
  $scope.available = function(index) { // check if there are enough left of this card.
    var cardname = $scope.pool[index].name
    var num_in_use = $scope.picks.filter(function(c){
      return cardname === c.name;
    }).length;
    var num_available = $scope.pool.filter(function(c){
      return cardname === c.name;
    }).length;
    return num_available > num_in_use;
  };
  $scope.add = function(index) {
    $scope.picks.push($scope.pool[index]);
    
    $scope.deck.cards = $scope.picks.map(function(c) {
      return c.name
    });
    GAME.save_epic(GAME.epic);
  };

  $scope.remove = function(index) {
    $scope.picks.splice(index, 1);
    $scope.deck.cards = $scope.picks.map(function(c) {
      return c.name
    });
    GAME.save_epic($scope.epic);
  };

  $scope.save = function() {
    $scope.deck.name = $scope.deck.name.replace(/[^a-z\d]/ig, '').substr(0, 15);
    GAME.save_epic($scope.epic);
  };

}).config(disableSCE);


GAME.app.controller('mapCtrl', function($scope, $timeout, $routeParams) {
  GAME.load_route_context($routeParams, $scope);
  $scope.map = GAME.maps[$routeParams.map_idx];
  $scope.room_available = function(room_idx) {
    if (room_idx === 0) {
      return true;
    } else {
      return GAME.currently_awarded($routeParams.map_idx, room_idx - 1, 3);
    }
  };
  $scope.goto_room = function(room_idx) {
    if ($scope.room_available(room_idx)) {
      window.location.hash = '/' + GAME.epic_id + '/room/' + GAME.map_idx + '/' + room_idx;
    }
  };
  $scope.map = GAME.get_current_map();
}).config(disableSCE);


GAME.app.controller('roomCtrl', function($scope, $timeout, $routeParams) {
  GAME.load_route_context($routeParams, $scope);
  $scope.room = GAME.maps[$routeParams.map_idx].rooms[$scope.room_idx];
  $scope.scen_available = function(scen_idx) {
    if (scen_idx === 0) {
      return true;
    } else {
      return GAME.currently_awarded($routeParams.map_idx, $scope.room_idx, scen_idx - 1);
    }
  };
  $scope.goto_scen = function(scen_idx) {
    if ($scope.scen_available(scen_idx)) {
      window.location.hash = '/' + GAME.epic_id + '/game/' + GAME.map_idx + '/' + GAME.room_idx + '/' + scen_idx;
    }
  };
}).config(disableSCE);


var adjectives = ['spiny', 'elusive', 'dark', 'vile', 'flappy', 'angry', 'beastly', 'stunning'];
var nouns = ['equine', 'singer', 'thrummer', 'blaster', 'smash', 'wheel', 'plume', 'aura', 'fall'];

GAME.app.controller('decksCtrl', function($scope, $timeout, $routeParams) {
  GAME.load_route_context($routeParams, $scope);
  $scope.epic = GAME.epic;
  $scope.decks = $scope.epic.decks || [];
  $scope.delete_deck = function(index) {
    $scope.epic.decks.splice(index, 1);
    GAME.save_epic($scope.epic);
  }
  $scope.default_deck = function(id) {
    $scope.epic.default_deck_id = id;
    GAME.save_epic($scope.epic);
  }
  $scope.new_deck = function() {
    var deck = {
      cards: [],
      id: generateUUID(),
      name: adjectives[Math.floor(Math.random() * adjectives.length)] + nouns[Math.floor(Math.random() * nouns
        .length)]
    };
    $scope.epic.decks = $scope.epic.decks || [];
    $scope.epic.decks.push(deck);
    GAME.save_epic($scope.epic);
    window.location.hash = '/' + $scope.epic_id + '/deck/' + deck.id
  };
}).config(disableSCE);


GAME.app.controller('menuCtrl', function($scope, $timeout, $routeParams) {

  var get_epics = function() {
    var epics = {};
    for (var i = 1; i <= 3; i++) {
      if (localStorage['epic_' + i]) {
        var epic = GAME.get_epic(i);
        if (epic) epics[epic.id] = epic;
      }
    }
    return epics;
  };


  $scope.epics = get_epics();

  $scope.load_epic = function(idx) {
    if (!$scope.epics[idx]) {
      window.location.hash = "/" + idx + "/story"
    } else {
      window.location.hash = "/" + idx
    }
  }

  $scope.delete_epic = function(idx) {
    if ($scope.confirm === idx) {
      delete localStorage['epic_' + idx];
      $scope.epics = get_epics();
      $scope.confirm = null;
    } else {
      $scope.confirm = idx;
    }
  }

}).config(disableSCE);


GAME.app.controller('epicCtrl', function($scope, $timeout, $routeParams) {
  $scope.maps = GAME.maps.slice(0, 6);
  $scope.epic_id = $routeParams.epic_id;
}).config(disableSCE);


GAME.app.directive('card', function() {
  return {
    restrict: 'E',
    templateUrl: 'card.html',
    transclude: true
  }
});

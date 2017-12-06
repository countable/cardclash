GAME.maps = [{
    name: "cellar",
    rooms: [{
        name: "stairwell",
        order: 1,

        scenarios: [

          inherit(Scenario, {
            name: 'the door',
            description: 'A door blocks your way.',
            get_enemy_deck: function() {
              GAME.enemy.deck = [];
            },
            setup_enemy_field: function() {
              GAME.enemy.field = [
                C('nest', {
                  health: 1,
                  svg: 'wooden-door'
                })
              ];
            },
            num_prizes: 2,
            prizes: ['slap', 'throw_rock'],
            postsetup: function() {
              GAME.player.diams = 5;
              GAME.player.storage = 5;
              GAME.player.income = 5;
              if (GAME.player.client) setTimeout(animate_help);
            },
            on_order: function() {
              //animate_help_2();
            }
          }),

          inherit(Scenario, {
            name: 'table flip',
            description: 'Another door, this time blocked by some furniture!',
            get_enemy_deck: function() {
              GAME.enemy.deck = [];
            },
            setup_enemy_field: function() {
              GAME.enemy.field = [
                C('nest', {
                  health: 1,
                  svg: 'wooden-door'
                }),
                C('table'),
                C('table'),
                C('table')
              ];
            },
            postsetup: function() {
              GAME.player.diams = 5;
              GAME.player.storage = 5;
              GAME.player.income = 5;
            },
            num_prizes: 3,
            prizes: ['table', 'table', 'table']
          }),

          inherit(Scenario, {
            name: 'company',
            description: 'A goose is here, locked in a cage.',
            get_enemy_deck: function() {
              GAME.enemy.deck = [];
            },
            setup_enemy_field: function() {
              GAME.enemy.field = [
                C('goose', {
                  stunned: 5
                }),
                C('nest', {
                  health: 4,
                  svg: 'portculis'
                }),
                C('bear_trap')
              ];
            },
            postsetup: function() {
              GAME.player.diams = 2;
              GAME.player.storage = 5;
              GAME.player.income = 1;
              if (GAME.player.client) setTimeout(animate_help_3, 10);
              GAME.player.hand.unshift(C('table'));
            },
            num_prizes: 1,
            prizes: ['goose'],
            hand_size: 3
          }),


          inherit(Scenario, {
            name: 'trade',
            description: 'This next door looks too strong to bash with your fists.',
            get_enemy_deck: function() {
              GAME.enemy.deck = [
                C("ogre")
              ];
            },
            setup_enemy_field: function() {
              GAME.enemy.field = [
                C('nest', {
                  health: 1,
                  svg: 'closed-doors',
                  armor: 2
                })
              ];
            },
            postsetup: function() {
              GAME.player.hand.push(C('mace'));
              GAME.player.diams = 2;
              GAME.enemy.income = 1;
              GAME.enemy.storage = 3;
            },
            num_prizes: 1,
            prizes: ['mace']
          })
        ]
      },

      {
        name: "mouseflies",
        order: 2,
        scenarios: [

          inherit(Scenario, {
            name: 'not_alone',
            description: 'Chittering and a rush of wings.',
            get_enemy_deck: function() {
              GAME.enemy.deck = [];
            },
            setup_enemy_field: function() {
              GAME.enemy.field = [
                C('nest', {
                  health: 2,
                  svg: 'wooden-door'
                }),
                C('mousefly')
              ];
            },
            enemy_turn: function(t) {
              if (!((t + 1) % 4)) GAME.enemy.field.push(C('mousefly'))
            },
            num_prizes: 1,
            prizes: ['cheese']
          }),

          inherit(Scenario, {
            name: 'rats',
            description: 'Chattring of teeth and bitey things.',
            get_enemy_deck: function() {
              GAME.enemy.deck = [];
            },
            setup_enemy_field: function() {
              GAME.enemy.field = [
                C('nest', {
                  health: 3,
                  svg: 'wooden-door'
                }),
              ];
            },
            enemy_turn: function(t) {
              if (!((t + 1) % 2)) GAME.enemy.field.push(C('mousefly'))
            },
            num_prizes: 1,
            prizes: ['cheese']
          }),

          inherit(Scenario, {
            name: 'TEST',
            get_player_deck: function() {
              GAME.player.deck = CL([
                'archer', 'soldier'
              ])
            },
            get_enemy_deck: function() {
              GAME.enemy.deck = CL([

              ]);
            },
            setup_enemy_field: function() {
              GAME.enemy.field = [
                C('nest', {
                  health: 7,
                  svg: 'wooden-door'
                }),
                C('goose')
              ];
            },
            setup_player_field: function() {
              GAME.player.field = [
                C('keep', {
                  health: 7,
                  svg: 'wooden-door'
                }),
                C('archer')
              ];
            }
          }),


        ]
      },

      {
        name: 'queen',
        order: 3,
        scenarios: [
          inherit(Scenario, {
            order: 3,
            name: 'mousefly_queen',
            get_enemy_deck: function() {},
            enemy_turn: function() {

            }
          })
        ]
      },

      {
        name: 'kilapedes',
        order: 6,
        scenarios: [
          inherit(Scenario, {
            get_enemy_deck: function() {},
            enemy_turn: function() {

            }
          })
        ]
      },

      {
        order: 5,
        name: 'squallway',
        scenarios: [
          inherit(Scenario, {
            get_enemy_deck: function() {},
            enemy_turn: function() {

            }
          })
        ]
      },

      {
        order: 4,
        name: 'impedence',
        scenarios: [
          inherit(Scenario, {
            get_enemy_deck: function() {},
            enemy_turn: function() {

            }
          })
        ]
      }
    ]
  },

  {
    name: 'grounds',
    rooms: [

    ]
  },
  {
    name: 'kitchen',
    rooms: [

    ]
  },
  {
    name: 'terrace',
    rooms: [

    ]
  },
  {
    name: 'bestiary',
    rooms: [

    ]
  },
  {
    name: 'attic',
    rooms: [

    ]
  },
  {}, {},

  // 8 is automated tests!
  {
    name: "automated tests",
    rooms: [{
      name: "automated test #1",
      order: 1,

      scenarios: [

        inherit(Scenario, {
          name: 'the door',
          description: 'A door blocks your way.',
          get_enemy_deck: function() {
            GAME.enemy.deck = [];
          },
          setup_enemy_field: function() {
            GAME.enemy.field = [
              C('nest', {
                health: 1,
                svg: 'wooden-door'
              })
            ];
          },
          num_prizes: 2,
          prizes: ['slap', 'throw_rock'],
          postsetup: function() {
            GAME.player.diams = 5;
            GAME.player.storage = 5;
            GAME.player.income = 5;
            if (GAME.player.client) setTimeout(animate_help);
          },
          on_order: function() {
            //animate_help_2();
          }
        })
      ]
    }]
  },

  // 9 is sandbox!
  {
    name: 'SANDBOX',
    rooms: [{
      name: "sandbox1",
      order: 1,

      scenarios: [

        inherit(Scenario, {
          name: 'test scenario 1 start big',
          description: 'add random stuff to test here.',
          get_enemy_deck: function() {
            GAME.enemy.deck = [
              C('bandit')
            ];
          },
          setup_enemy_field: function() {
            GAME.enemy.field = [
              C('nest', {
                health: 1,
                svg: 'wooden-door'
              })
            ];
          },
          setup_player_field: function() {
            GAME.player.field = [
              C('keep'),
              C('goose')
            ]
          },
          postsetup: function() {
            GAME.player.diams = 5;
            GAME.player.storage = 5;
            GAME.player.income = 5;
            GAME.enemy.diams = 10;
            GAME.enemy.storage = 10;
          }
        }),

        inherit(Scenario, {
          name: 'test scenario 2 e2e',
          description: 'add random stuff to test here.',
          get_enemy_deck: function() {
            GAME.enemy.deck = [];
            var cardnames = Object.keys(CardSet.Cards.by_name)
            for (var i = 0; i < cardnames.length; i++) {
              var card = C(cardnames[i])
              if (card.cost) GAME.enemy.deck.push(card);
            }
          },
          get_player_deck: function() {
            GAME.player.deck = [];
            var cardnames = Object.keys(CardSet.Cards.by_name)
            for (var i = 0; i < cardnames.length; i++) {
              var card = C(cardnames[i])
              if (card.cost) GAME.player.deck.push(card);
            }
          },
          shuffle_decks: function() {

          },
          postsetup: function() {
            GAME.enemy.diams = 10;
            GAME.player.diams = 10;
          }
        })
      ]
    }]
  }
];

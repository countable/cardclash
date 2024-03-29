CardSet.Cards.add([

  {
    name: 'magic',
    hand_actions: [
      Actions.create('cast')
    ],
    delayed: true,
    parent: 'card',
    display_class: 'magic',
  },

  {
    name: 'tool',
    display_class: 'tool',
    hand_actions: [
      Actions.create('reuse')
    ],
    parent: 'card',
  },

  {
    name: 'fist',
    cost: 1,
    hand_actions: [
      Actions.create('reuse', {
        targets: 'ENEMY_FIELD',
        retarget: function(move) {
          var alive_enemies = target_enemies(move, function(item) {
            return item.health > 0;
          });
          return [alive_enemies[alive_enemies.length - 1]];
        },
        effect: function(move) {
          melee(move.player.get_keep(), move.target, 1);
        }
      })
    ],
    svg: 'fist',
    parent: 'tool'
  },

  {
    name: 'mace',
    cost: 4,
    hand_actions: [
      Actions.create('reuse', {
        targets: 'ENEMY_FIELD',
        retarget: function(move) {
          var alive_enemies = target_enemies(move, function(item) {
            return item.health > 0;
          });
          return [alive_enemies[alive_enemies.length - 1]];
        },
        effect: function(move) {
          melee(move.player.get_keep(), move.target, 3);
          move.player.get_keep().stunned = 2;
        }
      })
    ],
    svg: 'spiked-mace',
    parent: 'tool'
  },

  {
    name: 'flag',
    cost: 4,
    hand_actions: [
      Actions.create('reuse', {
        targets: enemy_filter('asset'),
        effect: function(move) {
          move.player.field.push(C('militia'));
        }
      })
    ],
    svg: 'flying-flag',
    parent: 'tool'
  },

  {
    name: 'arson',
    cost: 4,
    hand_actions: [
      Actions.create('cast', {
        targets: enemy_filter('asset'),
        effect: function(move) {
          move.target.hurt(2);
        }
      })
    ],
    parent: 'magic',
    svg: 'arson',
    rarity: 1
  },

  {
    name: 'copier',
    hand_actions: [
      Actions.create('cast', {
        targets: any_filter(),
        effect: function(move) {
          move.player.hand.push(CardSet.Cards.create(move.target.name))
        }
      })
    ],
    cost: 2,
    svg: 'trade',
    parent: 'magic',
    rarity: 9
  },

  {
    name: 'entomb',
    cost: 4,
    hand_actions: [
      Actions.create('cast', {
        targets: enemy_filter('agent'),
        effect: function(move) {
          move.target.health = 0;
        }
      })
    ],
    parent: 'magic',
    svg: 'tombstone',
    rarity: 1
  },

  {
    name: 'bolt',
    cost: 1,
    hand_actions: [
      Actions.create('cast', {
        targets: enemy_filter('agent'),
        effect: function(move) {
          move.target.hurt(3);
        },
        animate: function(done, move) {
          animate_pow(done, move.target, {
            color: 'black'
          })
        }
      })
    ],
    parent: 'magic',
    svg: 'lightning-storm',
    rarity: 1
  },

  {
    name: 'throw_rock',
    cost: 1,
    hand_actions: [
      Actions.create('cast', {
        targets: enemy_filter('agent'),
        effect: function(move) {
          move.target.hurt(1);
        }
      })
    ],
    parent: 'magic',
    svg: 'rock',
    rarity: 1
  },

  {
    name: 'scratch',
    cost: 1,
    hand_actions: [
      Actions.create('cast', {
        targets: enemy_filter('agent'),
        effect: function(move) {
          move.target.hurt(1);
        }
      })
    ],
    parent: 'magic',
    svg: 'triple-scratches',
    rarity: 1
  },

  {
    name: 'low_kick',
    cost: 2,
    hand_actions: [
      Actions.create('cast', {
        targets: enemy_filter('agent'),
        effect: function(move) {
          move.target.hurt(3);
        }
      })
    ],
    parent: 'magic',
    svg: 'tread',
    rarity: 1
  },

  {
    name: 'slap',
    cost: 2,
    hand_actions: [
      Actions.create('cast', {
        targets: enemy_filter('agent'),
        effect: function(move) {
          move.target.hurt(1);
          move.target.delay += 1;
        }
      })
    ],
    parent: 'magic',
    svg: 'slap',
    rarity: 1
  },

  {
    name: 'cobweb',
    cost: 1,
    hand_actions: [
      Actions.create('cast', {
        targets: 'ENEMY_FIELD',
        effect: function(move) {
          target_enemies(move, 'agent').forEach(function(enemy) {
            enemy.speed -= 2;
          });
        }
      })
    ],
    parent: 'magic',
    svg: 'cobweb',
    rarity: 1
  },

  {
    name: 'haste',
    cost: 1,
    hand_actions: [
      Actions.create('cast', {
        targets: ally_filter('agent'),
        effect: function(move) {
          move.target.speed += 4;
          move.target.stunned = 0;
        }
      })
    ],
    parent: 'magic',
    svg: 'time-trap',
    rarity: 1
  },

  {
    name: 'blizzard',
    cost: 4,
    hand_actions: [
      Actions.create('cast', {
        targets: 'ENEMY_FIELD',
        effect: function(move) {
          target_enemies(move, 'agent').forEach(function(enemy) {
            enemy.stunned = 1;
            enemy.hurt(1, move);
          });
        }
      })
    ],
    parent: 'magic',
    svg: 'snowing',
    rarity: 1
  },

  {
    name: 'zap_shield',
    cost: 1,
    hand_actions: [
      Actions.create('cast', {
        targets: ally_filter('agent'),
        effect: function(move) {
          move.target.spikes = (move.target.spikes || 0) + 3;
        }
      })
    ],
    parent: 'magic',
    svg: 'lightning-shield',
    rarity: 1
  },

  {
    name: 'isolation',
    svg: 'suspicious',
    cost: 1,
    hand_actions: [
      Actions.create('cast', {
        text: 'Stuns an agent.',
        targets: enemy_filter(function(item) {
          return item.is_a('agent')
        }),
        fn: function(move) {
          move.target.stunned += 1;
        },
        animate: function(done, move) {
          animate_message(done, move.target, {
            text: "stun +1",
            color: 'black'
          })
        }
      })
    ],
    parent: 'magic',
    rarity: 9
  },
  {
    name: 'quicksand',
    svg: 'quicksand',
    cost: 1,
    hand_actions: [
      Actions.create('cast', {
        text: 'Chosen agent skips action.',
        targets: any_filter('agent'),
        fn: function(move) {
          move.target.stunned = 1;
        },
        animate: function(done, move) {
          animate_message(done, move.target, {
            text: "stun 1",
            color: 'black'
          })
        }
      })
    ],
    parent: 'magic',
    rarity: 9
  },

  {
    name: 'math_tome',
    svg: 'white-book',
    cost: 3,
    hand_actions: [
      Actions.create('cast', {
        targets: 'PLAYER_FIELD',
        effect: function(move) {
          GAME.player.draw(2);
        },
        animate: function(done, move) {
          var keep = move.player.field[0];
          animate_message(done, keep, {
            text: '+2 cards',
            color: '#0c0'
          });
        }
      })
    ],
    parent: 'magic',
    rarity: 9
  },
  {
    name: 'leadership',
    svg: 'sensuousness',
    cost: 1,
    hand_actions: [
      Actions.create('cast', {
        targets: 'PLAYER_FIELD',
        effect: function(move) {
          target_allies(move, 'agent').forEach(function(ally) {
            ally.health += 1;
            ally.damage += 1;
          });
        }
      })
    ],
    parent: 'magic',
    rarity: 9
  },
  {
    name: 'spirit_ball',
    svg: 'american-football-ball',
    cost: 1,
    hand_actions: [
      Actions.create('cast', {
        targets: enemy_filter(function(e) {
          return e.speed < 4
        }),
        fn: function(move) {
          move.target.health -= 2;
        },
        animate: function(done, move) {
          animate_pow(done, move.target, {
            color: 'black'
          })
        }
      })
    ],
    parent: 'magic',
    rarity: 9
  },
  {
    name: 'nut_shell',
    svg: 'shieldcomb',
    cost: 1,
    hand_actions: [
      Actions.create('cast', {
        targets: ally_filter('agent'),
        effect: function(move) {
          move.target.armor = (move.target.armor || 0) + 1;
        },
        animate: function(done, move) {
          animate_pow(done, move.target, {
            color: 'black'
          })
        }
      })
    ],
    parent: 'magic',
    rarity: 9
  },

  {
    name: 'love_potion',
    cost: 6,
    hand_actions: [
      Actions.create('cast', {
        targets: enemy_filter('agent'),
        effect: function(move) {
          var op = move.player.get_opponent();
          op.field = op.field.filter(function(c) {
            return c != move.target;
          });
          move.player.field.push(move.target);
        }
      })
    ],
    parent: 'magic',
    svg: 'heart-bottle',
    rarity: 2
  }
]);

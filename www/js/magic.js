
CardSet.Cards.add([

  {
    name: 'magic',
    display_class: 'magic',
    cost: 0,
    hand_actions: [
      Actions.create('cast')
    ],
    delayed: true,
    parent: 'card',
    display_class: 'magic',
  },

  {
    name: 'arson',
    cost: 4,
    hand_actions: [
      Actions.create('cast', {
        targets: enemy_filter(function(item){
            return item.is_a('asset')
        }),
        fn: function(move){
          move.target.hurt(2);
          Actions.get('cast').fn.apply(this, [move]);
        }
      })
    ],
    parent: 'magic',
    svg: 'arson',
    rarity: 1
  },

  {
    name: 'entomb',
    cost: 4,
    hand_actions: [
      Actions.create('cast', {
        targets: enemy_filter('minion'),
        effect: function(move){
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
        num_targets: 1,
        targets: enemy_filter('minion'),
        effect: function(move){
          move.target.hurt(3);
        },
        animate: function(move, done){
          animate_pow(move.target, {
            color: 'black',
            callback: done
          })
        }
      })
    ],
    parent: 'magic',
    svg: 'lightning-storm',
    rarity: 1
  },

  {
    name: 'scratch',
    cost: 1,
    hand_actions: [
      Actions.create('cast', {
        num_targets: 1,
        targets: enemy_filter('minion'),
        effect: function(move){
          move.target.hurt(1);
        },
        animate: function(move, done){
          animate_pow(move.target, {
            color: 'black',
            callback: done
          })
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
        num_targets: 1,
        targets: enemy_filter('minion'),
        effect: function(move){
          move.target.hurt(3);
        },
        animate: function(move, done){
          animate_pow(move.target, {
            color: 'black',
            callback: done
          })
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
        num_targets: 1,
        targets: enemy_filter('minion'),
        effect: function(move){
          move.target.hurt(1);
          move.target.delay += 1;
        },
        animate: function(move, done){
          animate_pow(move.target, {
            color: 'black',
            callback: done
          })
        }
      })
    ],
    parent: 'magic',
    svg: 'slap',
    rarity: 1
  },

  {
    name: 'haste',
    cost: 1,
    hand_actions: [
      Actions.create('cast', {
        targets: ally_filter('minion'),
        effect: function(move){
          move.target.speed -= 4;
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
    cost: 3,
    hand_actions: [
      Actions.create('cast', {
        num_targets: 0,
        fn: function(move){
          get_enemies(move, 'minion').forEach(function(enemy){
            enemy.stunned = 1;
          });
          Actions.get('cast').fn.apply(this, [move]);
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
        targets: ally_filter(function(item){
            return item.is_a('minion')
        }),

        fn: function(move){
          move.target.spikes -= 3;
          Actions.get('cast').fn.apply(this, [move]);
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
        num_targets: 1,
        targets: enemy_filter(function(item){
            return item.is_a('minion')
        }),
        fn: function(move){
          move.target.delay += 3;
          Actions.get('cast').fn.apply(self, [move]);
        },
        animate: function(move, done){
          animate_pow(move.target, {
            color: 'black',
            callback: done
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
        num_targets: 0,
        fn: function(move){
          var keep = get_allies(move, 'keep')[0];
          GAME.player.draw(2);
          setTimeout(function(){
            animate_message(keep, {
              text: '+3 mana',
              color: '#0c0'
            })
          }, 300);
          Actions.get('cast').fn.apply(this, [move]);
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
        num_targets: 0,
        fn: function(move){
          get_allies(move, 'minion').forEach(function(enemy){
            enemy.health += 1;
            enemy.damage += 1;
          });
          Actions.get('cast').fn.apply(this, [move]);
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
        num_targets: 1,
        targets: enemy_filter(function(item){
            return item.is_a('minion')
        }),
        fn: function(move){
          move.target.health -= 3;
          Actions.get('cast').fn.apply(self, [move]);
        },
        animate: function(move, done){
          animate_pow(move.target, {
            color: 'black',
            callback: done
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
        num_targets: 1,
        targets: ally_filter(function(item){
            return item.is_a('minion')
        }),
        fn: function(move){
          move.target.armor += 1;
          Actions.get('cast').fn.apply(self, [move]);
        },
        animate: function(move, done){
          animate_pow(move.target, {
            color: 'black',
            callback: done
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
        targets: enemy_filter(function(item){
            return item.is_a('minion')
        }),
        fn: function(move){
          var op = move.player.get_opponent();
          op.field = op.field.filter(function(item){
            return c != move.card;
          });
          move.player.field.push(move.target);
          Actions.get('cast').fn.apply(this, [move]);
        }
      })
    ],
    parent: 'magic',
    svg: 'heart-bottle',
    rarity: 2
  }
]);
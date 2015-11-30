
CardSet.Cards.add([
  
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
    pic: '&#xe05b;',
    rarity: 1
  },
  
  {
    name: 'entomb',
    cost: 4,
    hand_actions: [
      Actions.create('cast', {
        targets: enemy_filter( function(item){
            return item.is_a('minion')
        }),
        fn: function(move){
          move.target.health = 0;
          Actions.get('cast').fn.apply(this, [move]);
        }
      })
    ],
    parent: 'magic',
    pic: '&#xe2ef;',
    rarity: 1
  },
  {
    name: 'bolt',
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
    pic: '&#xe0d3;',
    rarity: 1
  },
  {
    name: 'haste',
    cost: 1,
    hand_actions: [
      Actions.create('cast', {
        targets: ally_filter('minion'),
        fn: function(move){
          move.target.speed -= 3;
          Actions.get('cast').fn.apply(this, [move]);
        }
      })
    ],
    parent: 'magic',
    pic: '&#xe1ee;',
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
    pic: '&#xe003;',
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
    pic: '&#xe006;',
    rarity: 1
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
    pic: '&#xe0d2;',
    rarity: 2
  }
]);
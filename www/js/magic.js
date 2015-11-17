
CardSet.Cards.add([
  
  {
    name: 'arson',
    cost: 1,
    price: 3,
    hand_actions: [
      Actions.create('cast', {
        targets: get_enemies(function(item){
            return item.is_a('asset')
        }),
        fn: function(move){
          move.target.hurt(2);
          Actions.get('cast').fn.apply(this, [move]);
        }
      })
    ],
    parent: 'magic',
    pic: '&#xe05b;'
  },
  
  {
    name: 'entomb',
    cost: 2,
    price: 5,
    hand_actions: [
      Actions.create('cast', {
        targets: get_enemies( function(item){
            return item.is_a('minion')
        }),
        fn: function(move){
          move.target.health = 0;
          Actions.get('cast').fn.apply(this, [move]);
        }
      })
    ],
    parent: 'magic',
    pic: '&#xe2ef;'
  },
  {
    name: 'bolt',
    cost: 1,
    price: 3,
    hand_actions: [
      Actions.create('cast', {
        num_targets: 1,
        targets: get_enemies(function(item){
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
    pic: '&#xe0d3;'
  },
  {
    name: 'haste',
    cost: 0,
    price: 2,
    hand_actions: [
      Actions.create('cast', {
        targets: get_allies(function(item){
            return item.is_a('minion')
        }),
        fn: function(move){
          move.target.speed -= 3;
          Actions.get('cast').fn.apply(this, [move]);
        }
      })
    ],
    parent: 'magic',
    pic: '&#xe0d3;'
  },
  {
    name: 'blizzard',
    cost: 0,
    price: 2,
    hand_actions: [
      Actions.create('cast', {
        fn: function(move){
          move.player.get_opponent().field.filter(function(e){e.is_a('minion')}).forEach(function(enemy){
            enemy.hurt(self.damage, move);
            if (enemy.spikes) self.hurt(enemy.spikes);
            if (self.poison) enemy._poison = self.poison;
          });
          Actions.get('cast').fn.apply(this, [move]);
        }
      })
    ],
    parent: 'magic',
    pic: '&#xe003;'
  },
  {
    name: 'zap_shield',
    cost: 1,
    price: 3,
    hand_actions: [
      Actions.create('cast', {
        targets: get_allies(function(item){
            return item.is_a('minion')
        }),
        fn: function(move){
          move.target.spikes -= 3;
          Actions.get('cast').fn.apply(this, [move]);
        }
      })
    ],
    parent: 'magic',
    pic: '&#xe0d3;'
  },
  {
    name: 'love_potion',
    cost: 2,
    price: 7,
    hand_actions: [
      Actions.create('cast', {
        targets: get_enemies(function(item){
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
    pic: '&#xe01e;'
  }
]);
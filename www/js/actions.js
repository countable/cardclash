


var get_enemies = function(filter){
  return function(move){
    return move.player.get_opponent().field.filter(filter).filter(function(item){
      return !item.untargetable;
    });
  }
};
var get_allies = function(filter){
  return function(move){
    return move.player.field.filter(filter).filter(function(item){
      return !item.untargetable;
    });
  }
};


CardSet.Actions.add([
  {
    name: 'action',
    cost: 0,
    animate: function(move, done){
      done && done();
    },
    button: function(card){
      return this.name + (this.damage ? ' ' + this.damage : '');
    }
  },
  {
    name: 'strike',
    delayed: true,
    num_targets: 1,
    animate: function(move, done){
      animate_strike(move, done);
    },
    fn: function(move){
      move.target.hurt(this.damage, move);
      
      if (move.target.spikes) move.card.hurt(move.target.spikes);
      if (this.poison) move.target._poison = this.poison;
    },
    parent: 'action'
  },
  {
    name: 'shoot',
    delayed: true,
    animate: function(move, done){
      animate_shoot(move, done);
    },
    fn: function(move){
      move.target.hurt(this.damage, move);
    },
    parent: 'action'
  },
  
  // combat.
  {
    name: 'hunt',
    damage: 1,
    targets: function(move){
      return move.player.get_opponent().field;
    },
    parent: 'strike'
  },
  {
    name: 'raid',
    damage: 1,
    targets: get_enemies(function(item){
        return item.is_a('asset')
    }),
    parent: 'strike'
  },
  {
    name: 'charge',
    damage: 1,
    num_targets: 0,
    retarget: function(move){
      var alive_enemies = move.player.get_opponent().field.filter(function(item){
        return item.health > 0;
      });
      return alive_enemies[alive_enemies.length-1];
    },
    parent: 'strike'
  },
  {
    name: 'volley',
    damage: 1,
    targets: function(move){
      var targets = [], field = move.player.get_opponent().field;
      for (var i=field.length-1; i; i--){
        targets.push(field[i]);
        if (field[i].is_a('asset')) {
          break;
        }
      }
      return targets;
    },
    parent: 'shoot'
  },
  {
    name: 'siege',
    damage: 1,
    retarget: function(move){
      return move.player.get_opponent().field.filter(function(item){
        return item.is_a('asset')
      })[0];
    },
    parent: 'strike'
  },
  {
    name: 'flank',
    damage: 1,
    targets: function(move){
      var op_field = move.player.get_opponent().field;
      return op.slice(Math.max(1, op_field.length-2));
    },
    parent: 'strike'
  },
  
  {
    name: 'guard', // force attacking me, can counterattack.
    parent: 'action'
  },
  {
    name: 'sentry', // prevent attacking past. strike first.
    parent: 'action'
  },
  {
    name: 'escort', // protect one unit.
    parent: 'action' 
  },
  {
    name: 'assault', // hit first army (only)
    parent: 'strike'
  },
  {
    name: 'ambush', // hit a unit, if it moves.
    parent: 'action'
  },
  {
    name: 'slash',
    delayed: true,
    animate: function(move, done){
      animate_spin(move, done);
    },
    num_targets: -1,
    targets: function(move){
      console.log(move);
      return move.player.get_opponent().field.filter(function(e){return e.is_a('minion')})
    },
    fn: function(move){
      self = this;
      this.targets(move).forEach(function(enemy){
        console.log('e',enemy);
        enemy.hurt(self.damage, move);
        //animate_pow(move, enemy);
        if (enemy.spikes) self.hurt(enemy.spikes);
        if (self.poison) enemy._poison = self.poison;
      });
    },
    damage: 1,
    parent: 'action'
  },
  {
    name: 'hide', // units attacking this are redirected to next target
  },
  
  {
    name: 'deploy',
    fn: function(move){
      move.player.move_card(move.card, move.player.hand, move.player.field, true);
    },
    button: function(card){
      return (card.cost || 0 > 0 ? '' : card.cost) + '&diams; ' + this.name;
    },
    animate: function(move, done){
        animate_play(move, done);
    },
    parent: 'action'
  },
  {
    name: 'use',
    fn: function(move) {
      move.player.move_card(move.card, move.player.hand, move.player.played_cards, true);
      this.effect && this.effect(move);
    },
    animate: function(move, done){
      animate_play(move, done);
    },
    parent: 'action'
  },
  {
    name: 'cast',
    delayed: true,
    parent: 'use',
    num_targets: 1
  }
]);


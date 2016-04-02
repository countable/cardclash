


function Move(o){
  for (k in o) this[k] = o[k];
}
Move.prototype.get_damage = function(){
  return this.action.damage || this.card.effective_damage || 0;
}
Move.prototype.melee = function(target){
  target.hurt(this.get_damage(), this);
  if (target.spikes) this.card.hurt(target.spikes);
  if (this.card.poison) target._poison = this.card.poison;
}

var enemy_filter = function(filter){
  return function(move){
    return get_enemies(move, filter).filter(function(item){
      return !item.untargetable;
    });
  }
};
var ally_filter = function(filter){
  return function(move){
    return get_allies(move, filter).filter(function(item){
      return !item.untargetable;
    });
  }
};
var get_enemies = function(move, filter){
  return filter_field(move.player.get_opponent().field, filter);
}
var get_allies = function(move, filter){
  return filter_field(move.player.field, filter);
}
var filter_field = function(field, filter) {
  var filter_fn;
  if (filter + '' === filter) {
    filter_fn = function(e){return e.is_a(filter)}
  } else {
    filter_fn = filter;
  }
  return field.filter(filter_fn);
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

CardSet.Actions.add([
  {
    name: 'action',
    cost: 0,
    animate: function(move, done){
      done && done();
    },
    button: function(card){
      return this.name + (this.damage ? ' ' + this.damage : '');
    },
    get_description: function(card){
      return this.name + ' ' + (this.damage || '') + ' to ' +
        (isNumeric(this.num_targets) ? this.num_targets + ' card' : (this.num_targets||'').toLowerCase().replace("_"," "));
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
      move.melee(move.target)
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
      move.target.hurt(move.get_damage(), move);
    },
    parent: 'action'
  },
  
  // combat.
  {
    name: 'hunt',
    targets: function(move) {
      return get_enemies(move, function(enemy){
        return enemy.speed >= move.card.speed;
      });
    },
    parent: 'strike'
  },
  {
    name: 'raid',
    targets: enemy_filter('asset'),
    parent: 'strike'
  },
  {
    name: 'tunnel',
    targets: enemy_filter('asset'),
    parent: 'strike'
  },  
  {
    name: 'charge',
    num_targets: 'ENEMY_FIELD',
    retarget: function(move){
      var alive_enemies = get_enemies(move, function(item){
        return item.health > 0;
      });
      return alive_enemies[alive_enemies.length-1];
    },
    parent: 'strike'
  },
  {
    name: 'mug',
    num_targets: 'ENEMY_FIELD',
    retarget: function(move){
      var alive_enemies = get_enemies(move, function(item){
        return item.health > 0;
      });
      return alive_enemies[Math.floor(alive_enemies.length*Math.random())];
    },
    parent: 'strike'
  },
  {
    name: 'rob',
    targets: function(move) {
      return get_enemies(function(enemy){
        return true;
      });
    },
    fn: function(move){
      if (move.target.is_a('keep')) {
        move.player.get_opponent().diams -= move.get_damage();
      } else {
        move.target.stunned += move.get_damage();
      }
    },
    parent: 'strike'
  },
  {
    name: 'volley',
    num_targets: 1,
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
    retarget: function(move){
      return get_enemies('asset')[0];
    },
    parent: 'strike'
  },
  {
    name: 'flank',
    targets: function(move){
      var op_field = move.player.get_opponent().field;
      return op_field.slice(Math.max(1, op_field.length-2));
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
    num_targets: 'ENEMY_FIELD',
    targets: function(move){
      return get_enemies(move, 'minion');
    },
    fn: function(move){
      self = this;
      this.targets(move).forEach(move.melee);
    },
    parent: 'action'
  },
  {
    name: 'batter',
    delayed: true,
    animate: function(move, done){
      animate_spin(move, done);
    },
    num_targets: 'ENEMY_FIELD',
    targets: function(move){
      var t = get_enemies(move, 'card')
      return t.slice(0,Math.min(t.length, 2));
    },
    fn: function(move){
      self = this;
      this.targets(move).forEach(move.melee);
    },
    parent: 'action'
  },
  {
    name: 'hide', // units attacking this are redirected to next target
  },
  
  {
    name: 'deploy',
    fn: function(move){
      if (move.card.delay) {
        move.card.stunned = move.card.delay;
      }
      move.player.move_card(move.card, move.player.hand, move.player.field, true);
    },
    num_targets: 'PLAYER_FIELD',   
    button: function(card){
      return card.cost + '&diams; ' + this.name;
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
    button: function(card){
      return card.cost + '&diams; ' + this.name;
    },
    parent: 'action'
  },
  {
    name: 'cast',
    delayed: true,
    parent: 'use',
    num_targets: 1
  },
  {
    name: 'blast',
    parent: 'cast'
  }
]);


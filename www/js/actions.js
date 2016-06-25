


function Move(o){
  for (k in o) this[k] = o[k];
}
Move.prototype.get_damage = function(){
  return this.action.damage || this.card.effective_damage || 0;
}

var melee = function(source, target, damage){
  damage = damage || source.effective_damage || 0;
  target.hurt(damage);
  if (target.spikes) source.hurt(target.spikes);
  if (source.poison) target._poison = source.poison;
}

var enemy_filter = function(filter){
  return function(move){
    return target_enemies(move, filter).filter(function(c){return !c.untargetable;});
  }
};
var ally_filter = function(filter){
  return function(move){
    return target_allies(move, filter).filter(function(c){ return !c.untargetable; });
  }
};
var any_filter = function(filter){
  return function(move){
    return target_any(move, filter).filter(function(c){ return !c.untargetable; });
  }
}
var target_any = function(move, filter) {
  return target_enemies(move, filter).concat(target_allies(move, filter));
}
var target_enemies = function(move, filter){
  return filter_field(move.player.get_opponent().field, filter);
}
var target_allies = function(move, filter){
  return filter_field(move.player.field, filter);
}
var filter_field = function(field, filter) {
  var filter_fn;
  if (!filter) { // no filter, return all results.
    filter_fn = function(e){return true};
  } else if (filter + '' === filter) {
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
    single_target: function(){ // whether the action targets a single card.
      return this.targets instanceof Function;
    },
    animate: function(move, done){
      done && done();
    },
    button: function(card){
      return this.name + (card.effective_damage ? ' ' + card.effective_damage : '');
    },
    get_description: function(card){
      var desc = this.name;
      if (this.text){
        desc += ' : ' + this.text;
      } else {
        desc += ' ' +
        (card.effective_damage || '') + ' to ' +
        (this.single_target() ? 'a card' : (this.targets || '').toLowerCase().replace("_"," "));
      }
      desc += '.';
      return desc;
    }
  },
  {
    name: 'strike',
    delayed: true,
    targets: 'ENEMY_FIELD',
    animate: function(move, done){
      animate_strike(move, done);
    },
    fn: function(move){
      melee(move.card, move.target)
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
    targets: enemy_filter(function(enemy){
      return enemy.speed <= move.card.speed;
    }),
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
    targets: 'ENEMY_FIELD',
    retarget: function(move){
      var alive_enemies = target_enemies(move, function(item){
        return item.health > 0;
      });
      return alive_enemies[alive_enemies.length-1];
    },
    parent: 'strike'
  },
  {
    name: 'mug',
    targets: 'ENEMY_FIELD',
    retarget: function(move){
      var alive_enemies = target_enemies(move, function(item){
        return item.health > 0;
      });
      return alive_enemies[Math.floor(alive_enemies.length*Math.random())];
    },
    parent: 'strike'
  },
  {
    name: 'rob',
    targets: enemy_filter(),
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
      return target_enemies('asset')[0];
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
    targets: 'ENEMY_FIELD',
    fn: function(move){
      self = this;
      target_enemies(move, 'agent').forEach(function(target){
        melee(move.card, target);
      });
    },
    parent: 'action'
  },
  {
    name: 'batter',
    delayed: true,
    animate: function(move, done){
      animate_spin(move, done);
    },
    targets: 'ENEMY_FIELD',
    fn: function(move){
      self = this;
      var targets = target_enemies(move, 'card').slice(0,Math.min(t.length, 2));
      targets.forEach(function(target){
        melee(move.card, target);
      });
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
        move.card.stunned = Math.max(move.card.stunned, move.card.delay);
      }
      move.player.move_card(move.card, move.player.hand, move.player.field, true);
    },
    targets: 'PLAYER_FIELD',   
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
    parent: 'action',
    delayed: true
  },
  {
    name: 'reuse',
    fn: function(move) {
      this.effect && this.effect(move);
    },
    parent: 'use'
  },
  {
    name: 'cast',
    fn: function(move) {
      move.player.move_card(move.card, move.player.hand, move.player.played_cards, true);
      this.effect && this.effect(move);
    },
    delayed: true,
    parent: 'use'
  },
  {
    name: 'blast',
    parent: 'cast'
  }
]);


; var CardSet, card_proxy;

if (typeof module !== 'undefined') {
  module.exports = CardSet
}


(function(){ // Closure

// a convenient way to define game objects, the Entity Tree.
// takes a list of objects with name and parent attributes (referencing parent object's name.)
// ie, new EntityTree([
//     {name: 'base'},
//     {name: 'child', parent: 'base'}
//  ]);
var EntityTree = function(all){
  
  this.by_name = {};
  var tree = this;
  all.forEach(
    function (entity)
    {
      if (entity.parent)
      {
        var parent = tree.by_name[entity.parent];
        if (!parent) throw('parent ' + entity.parent + ' of ' + entity.name + ' does not exist');
        tree.by_name[entity.name] = inherit(parent, entity, entity.name);
        
      }
      else
      {
        
        tree.by_name[entity.name] = entity;
        entity.is_a = function(name)
        {
          if (this.name === name) return true;
          if (!this.parent) return false;
          return tree.get(this.parent).is_a(name);
        }
        
      }
    }
  );
}
// instantiate a tree node.
EntityTree.prototype.create = function(name, overrides){
  return inherit(this.by_name[name], overrides || {}, name + "Instance");
};
EntityTree.prototype.get = function(name){
  return this.by_name[name];
};
EntityTree.prototype.from_list = function(list){
  var tree = this;
  return list.map(function(name){
    return tree.create(name);
  });
};


var get_enemies = function(filter){
  return function(move){
    return move.player.get_opponent().field.filter(filter).filter(function(item){
      return !item.untargetable;
    });
  }
};


Actions = new EntityTree([
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
    animate: function(move, done){
      animate_strike(move, done);
    },
    fn: function(move){
      move.target.hurt(this.damage, move);
      
      if (move.target.spikes) this.hurt(move.target.spikes);
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
    retarget: function(move){
      return move.player.get_opponent().field.filter(function(item){
        return item.health > 0;
      })[0];
    },
    parent: 'strike'
  },
  {
    name: 'volley',
    damage: 1,
    targets: function(move){
      var targets = [], field = move.player.get_opponent().field;
      for (var i=0; i<field.length; i++){
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
      return move.player.get_opponent().field.slice(0,2);
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
    parent: 'use'
  }
]);



var Cards = new EntityTree([
    
  {
    name: 'card'
  },
  // card types.
  {
    name: 'resource',
    display_class: 'resource',
    hand_actions: [
      Actions.create('use')
    ],
    parent: 'card'
  },
  {
    name: 'fieldable',
    parent: 'card',
    hurt: function(damage, move){
      this.health = this.health - damage;

      
      console.log('being hurt', this);
    }
  },
  {
    name: 'minion',
    display_class: 'minion',
    health: 1,
    speed: 1,
    hand_actions: [
      Actions.create('deploy')
    ],
    cost: 1, // minion specific
    is_alive: function(){
      return this.health > 0;
    },
    get_counterattack: function(move){ // called when melee attacked.
      console.log('checking for counter attack...', this._move);
      if (
          !this.is_alive()
          || move.is_counterattack
          || (this._move && this._move._done)
        ) {
        console.log ('not allowed, abort');
        return;
      }
      var counter_move;
      if (
          this._move
          && this._move.action.is_a('strike')
      ) { // pending strike interrupted.
        console.log ('countered with move');
        counter_move = this._move;
      } else { // if we're idle and have counter action available, use it.
        console.log ('countered with first action avail.');
        var a = this.field_actions.filter(function(a){
          return a.is_a('strike')})[0];
        if (a) {
          counter_move = {
            action: a,
            player: move.player.get_opponent(),
            card: this,
            target: move.card,
            is_counterattack: true
          };
        }
      }
      return counter_move;
    },
    parent: 'fieldable'
  },
  {
    name: 'asset',
    display_class: 'asset',
    parent: 'fieldable'  
  },
  {
    name: 'magic',
    display_class: 'magic',
    cost: 0,
    hand_actions: [
      Actions.create('cast')
    ],
    delayed: true,
    parent: 'card'
  },
  
  // minions.
  {
    name: 'militia',
    health: 1,
    speed: 7,
    field_actions: [
      Actions.create('charge', {
        damage: 1
      })
    ],
    parent: 'minion',
    pic: '&#xe2de;'
  },
  {
    name: 'archer',
    health: 1,
    speed: 2,
    field_actions: [
      Actions.create('volley', {
        damage: 1
      })
    ],
    parent: 'minion',
    price: 3,
    health: 2,
    pic: '&#xe0bb;'
  },
  {
    name: 'soldier',
    health: 1,
    cost: 2,
    speed: 6,
    field_actions: [
      Actions.create('charge', {
        damage: 2
      })
    ],
    parent: 'minion',
    price: 2,
    health: 3,
    pic: '&#xe310;'
  },
  {
    name: 'cavalry',
    health: 1,
    speed: 4,
    field_actions: [
      Actions.create('flank', {
        damage: 2
      })
    ],
    parent: 'minion',
    price: 4,
    health: 4,
    pic: '&#xe171;'
  },
  {
    name: 'hunter',
    health: 1,
    speed: 5,
    field_actions: [
      Actions.create('hunt', {
        damage: 2
      })
    ],
    parent: 'minion',
    price: 4,
    pic: '&#xe2c5;'
  },
  {
    name: 'hoplite',
    health: 1,
    speed: 6,
    field_actions: [
      Actions.create('charge', {
        damage: 1
      })
    ],
    spikes: 1,
    parent: 'minion',
    price: 4,
    pic: '&#xe045;'
  },
  
  // baddies
  {
    name: 'evilcow',
    health: 3,
    field_actions:[
      Actions.create('charge', {
        damage: 1
      })
    ],
    speed: 5,
    parent: 'minion',
    pic: '&#xe216;'
  },
  {
    name: 'ogre',
    health: 5,
    field_actions:[
      Actions.create('charge', {
        damage: 3
      })
    ],
    speed: 8,
    parent: 'minion',
    pic: '&#xe133;'
  },
  {
    name: 'bandit',
    health: 1,
    field_actions:[
      Actions.create('charge', {
        damage: 1
      })
    ],
    speed: 4,
    parent: 'minion',
    pic: '&#xe18f;'
  },
  {
    name: 'shade',
    health: 2,
    untargetable: true,
    field_actions:[
      Actions.create('hunt', {
        damage: 1
      })
    ],
    speed: 4,
    parent: 'minion',
    pic: '&#xe039;'
  },
  {
    name: 'serpent',
    health: 4,
    field_actions:[
      Actions.create('hunt', {
        damage: 1
      })
    ],
    poison: 1,
    speed: 4,
    parent: 'minion',
    pic: '&#xe03a;'
  },
  
  {
    name: 'wall',
    health: 9,
    parent: 'asset',
    pic: '&#xe0ac;'
  },
  
  // resources
  {
    name: 'wealth',
    cost: -1,
    parent: 'resource',
    pic: '&diams;'
  },
  
  {
    name: 'keep',
    health: 5,
    parent: 'asset',
    pic: '&#xe043;',
    hurt: function(damage, move){
      Cards.get('fieldable').hurt.call(this, damage, move);
      
      move.card.health = 0
      if (this.health < 1) GAME.lost();
    }
  },
  {
    name: 'nest',
    health: 5,
    parent: 'asset',
    pic: '&#xe13d;',
    hurt: function(damage, move){
      Cards.get('fieldable').hurt.call(this, damage, move);
      
      move.card.health = 0;
      if (this.health < 1) GAME.won();
    }
  },
  
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
          console.log(move, 'was run')
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
    cost: 0,
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
    cost: 0,
    price: 3,
    hand_actions: [
      Actions.create('cast', {
        targets: get_enemies(function(item){
            return item.is_a('minion')
        }),
        fn: function(move){
          move.target.health -= 3;
          Actions.get('cast').fn.apply(this, [move]);
        }
      })
    ],
    parent: 'magic',
    pic: '&#xe0d3;'
  }
]);


var shuffle = function(arr)
{
  tmp = [], out = [], tmpi = {};
  for (var i = 0; i < arr.length; i++)
  {
    tmp[i] = Math.random();
    tmpi[tmp[i]] = i;
  }
  tmp.sort();
  for (var i = 0; i < arr.length; i++)
  {
    out.push(arr[tmpi[tmp[i]]]);
  }
  return out;
}

CardSet = {
  Cards: Cards,
  Actions: Actions,
  shuffle: shuffle
};

})(); // End closure


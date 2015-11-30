
CardSet.Cards.add([

  {
    name: 'minion',
    display_class: 'minion',
    health: 1,
    delay: 1,
    speed: 1,
    hand_actions: [
      Actions.create('deploy')
    ],
    events: [],
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
      } else if (this.field_actions) { // if we're idle and have counter action available, use it.
        return null; // only pending actions can be used to counter.
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
  
  // minions.
  {
    name: 'militia',
    cost: 1,
    delay: 2,
    health: 2,
    speed: 7,
    field_actions: [
      Actions.create('charge', {
        damage: 1,
        cost: 1
      })
    ],
    parent: 'minion',
    pic: '&#xe2de;',
    rarity: 1
  },
  {
    name: 'priest',
    cost: 2,
    health: 1,
    speed: 7,
    events: [
        {
            card: 'any',
            action: 'deploy',
            target: 'any',
            setter: null,
            fn: function(move){
                var keep = get_allies(move, 'keep')[0];
                keep.health++;
                setTimeout(function(){
                  animate_message(keep, {
                    text: '+1 health',
                    color: '#0c0'
                  })
                }, 300);
            }
        }
    ],
    text: 'When a minion deploys, your keep gets +1 health',
    pic: '&#xe2dd;',
    parent: 'minion',
    rarity: 1
  },
  {
    name: 'alpha_wolf',
    cost: 2,
    health: 2,
    speed: 2,
    delay: 0,
    field_actions: [
      Actions.create('charge', {
        damage: 1
      })
    ],
    text: 'youy minions have -1 speed',
    globals: {
      card: 'any',
      owner: 'yours',
      effect: {
        speed: -1
      }
    },
    parent: 'minion',
    pic: '&#xe0e6;',
    rarity: 1
  },
  {
    name: 'archer',
    cost: 3,
    health: 2,
    speed: 2,
    field_actions: [
      Actions.create('volley', {
        damage: 1
      })
    ],
    parent: 'minion',
    pic: '&#xe0bb;',
    rarity: 1
  },
  {
    name: 'soldier',
    health: 1,
    cost: 3,
    speed: 6,
    field_actions: [
      Actions.create('charge', {
        damage: 2
      }),
      Actions.create('guard', {
        
      })
    ],
    parent: 'minion',
    health: 3,
    pic: '&#xe310;',
    rarity: 1
  },
  {
    name: 'cavalry',
    cost: 5,
    health: 1,
    speed: 4,
    field_actions: [
      Actions.create('flank', {
        damage: 2
      })
    ],
    parent: 'minion',
    health: 4,
    pic: '&#xe171;',
    rarity: 1
  },
  {
    name: 'hunter',
    health: 1,
    cost: 4,
    speed: 5,
    field_actions: [
      Actions.create('hunt', {
        damage: 2
      })
    ],
    parent: 'minion',
    pic: '&#xe2c5;',
    rarity: 2
  },
  {
    name: 'hoplite',
    cost: 2,
    health: 1,
    speed: 6,
    field_actions: [
      Actions.create('charge', {
        damage: 1
      })
    ],
    spikes: 1,
    parent: 'minion',
    pic: '&#xe045;',
    rarity: 1
  },
  
  {
    name: 'flame_swan',
    health: 2,
    cost: 5,
    speed: 6,
    field_actions: [
      Actions.create('slash', {
        damage: 1
      })
    ],
    spikes: 1,
    parent: 'minion',
    pic: '&#xe09b;',
    rarity: 1
  },
  
  // baddies
  {
    name: 'aatxe',
    health: 3,
    cost: 1,
    delay: 2,
    field_actions:[
      Actions.create('charge', {
        damage: 1
      })
    ],
    speed: 6,
    parent: 'minion',
    pic: '&#xe216;'
  },
  {
    name: 'ogre',
    health: 5,
    delay: 2,
    field_actions:[
      Actions.create('batter', {
        damage: 3
      })
    ],
    speed: 6,
    parent: 'minion',
    pic: '&#xe133;'
  },
  {
    name: 'bandit',
    health: 2,
    cost: 2,
    field_actions:[
      Actions.create('mug', {
        damage: 1
      })
    ],
    speed: 4,
    parent: 'minion',
    pic: '&#xe18f;',
    rarity: 1
  },
  {
    name: 'hillscale',
    speed: 8,
    health: 7,
    delay: 4,
    cost: 5,
    field_actions:[
      Actions.create('charge', {
        damage: 4
      })
    ],
    parent: 'minion',
    pic: '&#xe100;',
    rarity: 1
  },
  {
    name: 'shade',
    health: 2,
    cost: 4,
    untargetable: true,
    field_actions:[
      Actions.create('batter', {
        damage: 1
      })
    ],
    speed: 4,
    parent: 'minion',
    pic: '&#xe039;',
    rarity: 2
  },
  {
    name: 'doom_guard',
    delay: 2,
    health: 5,
    cost: 5,
    field_actions:[
      Actions.create('flank', {
        damage: 3
      })
    ],
    speed: 5,
    parent: 'minion',
    pic: '&#xe015;',
    rarity: 2,
    armor: 1
  },
  {
    name: 'serpent',
    health: 4,
    poison: 1,
    cost: 3,
    speed: 4,
    parent: 'minion',
    pic: '&#xe03a;',
    rarity: 1
  },
  
  {
    name: 'wall',
    health: 7,
    cost: 3,
    parent: 'asset',
    pic: '&#xe0ac;',
    rarity: 1
  },

  {
    name: 'zap_trap',
    health: 1,
    cost: 3,
    spikes: 2,
    parent: 'minion',
    pic: '&#xe02f;',
    rarity: 1
  }
]);

CardSet.Cards.add([

  {
    name: 'minion',
    display_class: 'minion',
    health: 1,
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
  
  // minions.
  {
    name: 'militia',
    health: 2,
    speed: 7,
    field_actions: [
      Actions.create('charge', {
        damage: 1,
        cost: 1
      })
    ],
    parent: 'minion',
    pic: '&#xe2de;'
  },
  {
    name: 'priest',
    health: 1,
    speed: 7,
    events: [
        {
            card: 'any',
            action: 'deploy',
            target: 'any',
            setter: null,
            fn: function(move){
                var keep = move.player.field.filter(function(item){return item.is_a('keep')})[0]
                keep.health++;
                console.log(move);
                setTimeout(function(){

                  animate_message(keep, {
                    text: '+1 health',
                    color: '#0c0'
                  })
                }, 300);
            }
        }
    ],
    pic: '&#xe2dd;',
    parent: 'minion'
  },
  {
    name: 'archer',
    health: 2,
    speed: 2,
    field_actions: [
      Actions.create('volley', {
        damage: 1
      })
    ],
    parent: 'minion',
    price: 3,
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
      }),
      Actions.create('guard', {
        
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
  
  {
    name: 'flame_swan',
    health: 1,
    speed: 6,
    field_actions: [
      Actions.create('slash', {
        damage: 1
      })
    ],
    spikes: 1,
    parent: 'minion',
    price: 4,
    pic: '&#xe09b;'
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
    health: 2,
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
      Actions.create('slash', {
        damage: 1
      })
    ],
    speed: 4,
    parent: 'minion',
    pic: '&#xe039;'
  },
  {
    name: 'doom_guard',
    health: 5,
    field_actions:[
      Actions.create('flank', {
        damage: 3
      })
    ],
    speed: 5,
    parent: 'minion',
    pic: '&#xe015;;'
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

  {
    name: 'zap_trap',
    health: 1,
    spikes: 2,
    parent: 'minion',
    pic: '&#xe00f;'
  }
]);
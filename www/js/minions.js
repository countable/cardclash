
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

  {
    name:'mammal',
    parent: 'minion'
  },
  {
    name: 'bird',
    parent: 'minion'
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
    svg: 'broad-dagger',
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
    svg: 'guarded-tower',
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
    svg: 'bowman',
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
    svg: 'battle-gear',
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
    svg: 'cavalry',
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
    svg: 'rogue',
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
    svg: 'spears',
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
    svg: 'bull-horns',
    pic: '&#xe216;'
  },
  {
    name: 'rat',
    health: 2,
    cost: 3,
    field_actions:[
      Actions.create('charge', {
        damage: 1
      })
    ],
    speed: 5,
    parent: 'mammal',
    svg: 'mouse'
  },
  {
    name: 'goose',
    delay: 3,
    health: 2,
    cost: 2,
    field_actions:['charge'],
    speed: 3,
    parent: 'bird',
    svg: 'duck'
  },
  
  {
    name: 'bread',
    svg: 'bread'
  },
  {
    name: 'nuts',
    svg: 'coffee-beans'
  },

  {
    name: 'copier',
    svg: 'trade',
    rarity: 9
  },
  {
    name: 'snappy_book',
    svg: 'evil-book',
    rarity: 9
  },
  {
    name: 'dust_bunny',
    svg: 'rabbit',
    rarity: 9
  },
  {
    name: 'broom_mount',
    svg: 'witch',
    rarity: 9
  },
  {
    name: 'hermes_sandals',
    svg: 'sandals',
    rarity: 9
  },
  {
    name: 'gopher',
    svg: 'seated-mouse',
    rarity: 9
  },
  {
    name: 'isolation',
    svg: 'suspicious',
    rarity: 9
  },
  {
    name: 'misery',
    svg: 'misery',
    rarity: 9
  },
  {
    name: 'math_tome',
    svg: 'white-book',
    rarity: 9
  },
  {
    name: 'history-tome',
    svg: 'black-book',
    rarity: 9
  },
  {
    name: 'leadership',
    svg: 'sensuousness',
    rarity: 9
  },
  {
    name: 'city_crier',
    svg: 'screaming',
    rarity: 9
  },
  {
    name: 'spirit_ball',
    svg: 'american-football-ball',
    rarity: 9
  },
  {
    name: 'mini_slam',
    svg: 'basketball-ball',
    rarity: 9
  },
  {
    name: 'misery',
    svg: 'tear-tracks',
    rarity: 9
  },
  {
    name: 'shiba_pup',
    svg: 'wolf-howl',
    rarity: 9
  },
  {
    name: 'hunters_instinct',
    svg: 'target-arrows',
    rarity: 9
  },
  {
    name: 'automata',
    delay: 3,
    health: 5,
    svg: 'abstract-018',
    rarity: 9
  },
  {
    name: 'schematic',
    svg: 'processor',
    rarity: 9
  },
  {
    name: 'poison_gas',
    svg: 'poison-gas',
    rarity: 9
  },
  {
    name: 'nut_shield',
    svg: 'shieldcomb',
    rarity: 9
  },

  {
    name: 'ogre',
    health: 5,
    delay: 2,
    damage: 3,
    field_actions:['batter'],
    speed: 6,
    parent: 'minion',
    rarity: 2
  },
  {
    name: 'bandit',
    health: 2,
    cost: 2,
    field_actions:['mug'],
    speed: 4,
    parent: 'minion',
    rarity: 1
  },
  {
    name: 'hillscale',
    speed: 8,
    health: 7,
    delay: 4,
    cost: 5,
    damage: 4,
    field_actions:['charge'],
    parent: 'minion',
    rarity: 1
  },
  {
    name: 'shade',
    health: 2,
    cost: 4,
    untargetable: true,
    field_actions:['batter'],
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
    field_actions:['flank'],
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
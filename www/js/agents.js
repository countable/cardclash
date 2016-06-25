CardSet.Cards.add([
  // card types.

  {
    name: 'fieldable',
    parent: 'card',
    hurt: function(damage) {
      if (this.armor) {
        damage = Math.max(0, damage-this.armor);
      }
      this.health = this.health - damage;
      animate_message(this, {
          text: damage + " dmg!",
          color: 'red', 
          delay: 50
      });
    },
    get: function(attr){
      var base = this[attr];
      GAME.player.field.forEach(function(){
        
      });
    },
    hand_actions: [
      Actions.create('deploy')
    ]
  },

  {
    name: 'asset',
    display_class: 'asset',
    parent: 'fieldable'  
  }
]);

CardSet.Cards.add([

  {
    name: 'agent',
    display_class: 'agent',
    health: 1,
    delay: 1,
    speed: 1,
    events: [],
    cost: 1, // agent specific
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
    parent: 'agent'
  },
  {
    name: 'bird',
    parent: 'agent'
  },
  
  // agents.
  {
    name: 'militia',
    cost: 1,
    delay: 2,
    health: 2,
    speed: 1,
    damage: 1,
    field_actions: [
      Actions.create('charge', {
        damage: 1,
        cost: 1
      })
    ],
    parent: 'agent',
    svg: 'broad-dagger',
    rarity: 1
  },
  {
    name: 'priest',
    cost: 2,
    health: 1,
    speed: 1,
    events: [
        {
            card: 'card',
            action: 'deploy',
            target: 'card',
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
    text: 'When a agent deploys, your keep gets +1 health',
    svg: 'holy-symbol',
    parent: 'agent',
    rarity: 1
  },
  {
    name: 'alpha_wolf',
    cost: 2,
    health: 2,
    speed: 5,
    delay: 0,
    damage: 2,
    field_actions: ['charge'],
    text: 'your agents have -1 speed',
    global_effects: [
      {
        card_type: 'card',
        owner: 'ally',
        speed: 1
      }
    ],
    parent: 'agent',
    svg: 'wolf-head',
    rarity: 1
  },
  {
    name: 'archer',
    cost: 3,
    health: 2,
    speed: 6,
    damage: 1,
    field_actions: ['volley'],
    parent: 'agent',
    svg: 'bowman',
    rarity: 1
  },
  {
    name: 'soldier',
    health: 1,
    cost: 3,
    speed: 6,
    damage: 2,
    armor: 1,
    field_actions: [
      'charge'
    ],
    parent: 'agent',
    health: 3,
    svg: 'battle-gear',
    rarity: 1
  },
  {
    name: 'cavalry',
    cost: 5,
    speed: 4,
    damage: 3,
    field_actions: ['flank'],
    parent: 'agent',
    health: 4,
    svg: 'cavalry',
    rarity: 1
  },
  {
    name: 'hunter',
    health: 1,
    cost: 4,
    speed: 2,
    field_actions: ['hunt'],
    parent: 'agent',
    svg: 'rogue',
    rarity: 2
  },
  
  {
    name: 'flame_swan',
    health: 2,
    cost: 5,
    speed: 1,
    damage: 1,
    field_actions: ['slash'],
    spikes: 1,
    parent: 'agent',
    svg: 'fluffy-flame',
    rarity: 1
  },
  
  // baddies
  {
    name: 'aatxe',
    health: 3,
    cost: 1,
    delay: 2,
    damage: 1,
    field_actions:['charge'],
    speed: 1,
    parent: 'agent',
    svg: 'bull-horns'
  },
  {
    name: 'mousefly',
    health: 2,
    cost: 3,
    damage: 1,
    field_actions:['charge'],
    speed: 2,
    parent: 'mammal',
    svg: 'mouse'
  },
  {
    name: 'goose',
    delay: 3,
    health: 2,
    cost: 2,
    damage: 2,
    field_actions:['charge'],
    speed: 4,
    parent: 'bird',
    svg: 'duck'
  },
  

  {
    name: 'dust_bunny',
    svg: 'rabbit',
    health: 3,
    cost: 3,
    damage: 3,
    field_actions:['charge'],
    on_turn:function(player, i){
      player.move_card(i, player.field, player.hand)
    },
    delay: 0,
    speed: 5,
    parent: 'mammal',
    rarity: 9
  },
  {
    name: 'gopher',
    svg: 'fox-head',
    health: 2,
    cost: 1,
    field_actions:['charge'],
    speed: 5,
    parent: 'mammal',
    rarity: 9
  },

  {
    name: 'shiba_pup',
    svg: 'wolf-howl',
    health: 4,
    cost: 3,
    damage: 2,
    play_turn: function(player){
      player.diams += 1;
    },
    field_actions:['charge'],
    speed: 2,
    parent: 'mammal',
    rarity: 9
  },
  {
    name: 'droid',
    delay: 3,
    health: 5,
    cost: 6,
  damage: 3,
    field_actions:['charge'],
    speed: 2,
    parent: 'agent',
    svg: 'vintage-robot',
    rarity: 9
  },

  {
    name: 'ogre',
    health: 5,
    delay: 2,
    damage: 3,
    cost: 3,
    field_actions:['batter'],
    speed: 1,
    parent: 'agent',
    svg: 'pig-face',
    rarity: 2
  },
  {
    name: 'bandit',
    health: 2,
    damage: 1,
    cost: 2,
    field_actions:['mug'],
    speed: 3,
    parent: 'agent',
    svg: 'cloak-dagger',
    rarity: 1
  },
  {
    name: 'hillscale',
    speed: 0,
    health: 7,
    delay: 4,
    armor: 1,
    cost: 5,
    damage: 4,
    field_actions:['charge'],
    parent: 'agent',
    svg: 'shoulder-scales',
    rarity: 1
  },
  {
    name: 'shade',
    health: 2,
    cost: 4,
    untargetable: true,
    field_actions:['batter'],
    speed: 3,
    parent: 'agent',
    svg: 'spectre',
    rarity: 2
  },
  {
    name: 'doom_guard',
    delay: 2,
    health: 5,
    cost: 5,
    field_actions:['flank'],
    speed: 2,
    parent: 'agent',
    svg: 'daemon-skull',
    rarity: 2,
    armor: 1
  },
  {
    name: 'serpent',
    health: 4,
    poison: 1,
    cost: 3,
    speed: 3,
    parent: 'agent',
    svg: 'snake',
    rarity: 1
  },
  
  {
    name: 'wall',
    health: 7,
    cost: 3,
    parent: 'asset',
    svg: 'brick-wall',
    rarity: 1
  },
  
  {
    name: 'table',
    health: 1,
    cost: 3,
    parent: 'agent',
    svg: 'table',
    rarity: 1
  },

  {
    name: 'zap_trap',
    health: 1,
    cost: 3,
    spikes: 4,
    parent: 'agent',
    svg:  'lightning-arc',
    rarity: 1
  },

  {
    name: 'bear_trap',
    health: 1,
    cost: 3,
    spikes: 2,
    parent: 'agent',
    svg:  'wolf-trap',
    rarity: 1
  }
]);
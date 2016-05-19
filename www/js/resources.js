CardSet.Cards.add([
  {
    name: 'resource',
    display_class: 'resource',
    hand_actions: [
      Actions.create('use', {
        targets: 'ANY_FIELD'
      })
    ],
    parent: 'card'
  },

  {
    name: 'gem',
    cost: -2,
    parent: 'resource',
    svg: 'gems',
    rarity: 2
  },
  
  {
    name: 'cheese',
    cost: 1,
    health: 1,
    svg: 'cheese-wedge',
    parent: 'agent'
  },

  {
    name: 'ore',
    cost: -1,
    parent: 'resource',
    svg: 'rock',
    hand_actions: [
      Actions.create('use', {
        targets: 'PLAYER_FIELD',
        effect: function(move){
          move.player.deck.unshift(CardSet.Cards.create('gem'));
          move.player.deck.unshift(CardSet.Cards.create('gem'));
          move.player.clear_placeholders();
        }
      })
    ],
    rarity: 2
  },

  {
    name: 'keep',
    health: 5,
    parent: 'asset',
    hurt: function(damage, move){
      CardSet.Cards.get('fieldable').hurt.call(this, damage);
      
      //move.card.health = 0
      if (this.health < 1) GAME.lost();
    },
    svg: 'guarded-tower'
  },
  
  {
    name: 'nest',
    health: 5,
    parent: 'asset',
    hurt: function(damage){
      CardSet.Cards.get('fieldable').hurt.call(this, damage);
      
      //move.card.health = 0;
      if (this.health < 1) GAME.won();
    },
    svg: 'bridge'
  }
]);
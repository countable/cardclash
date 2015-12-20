CardSet.Cards.add([
  {
    name: 'resource',
    display_class: 'resource',
    hand_actions: [
      Actions.create('use')
    ],
    parent: 'card'
  },

  {
    name: 'gem',
    cost: -2,
    parent: 'resource',
    pic: '&diams;',
    rarity: 2
  },

  {
    name: 'ore',
    cost: 0,
    parent: 'resource',
    pic: '&#xe000;',
    hand_actions: [
      Actions.create('use', {
        effect: function(move){
          move.player.hand.push(CardSet.Cards.create('gem'));
          move.player.hand.push(CardSet.Cards.create('gem'));
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
    pic: '&#xe043;',
    hurt: function(damage, move){
      CardSet.Cards.get('fieldable').hurt.call(this, damage, move);
      
      //move.card.health = 0
      if (this.health < 1) GAME.lost();
    },
    svg: 'guarded-tower'
  },
  {
    name: 'nest',
    health: 5,
    parent: 'asset',
    pic: '&#xe13d;',
    hurt: function(damage, move){
      CardSet.Cards.get('fieldable').hurt.call(this, damage, move);
      
      move.card.health = 0;
      if (this.health < 1) GAME.won();
    },
    svg: 'bridge'
  }
]);
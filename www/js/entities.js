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
  all = all || [];
  this.by_name = {};
  this.add(all);
}
EntityTree.prototype.add = function(entity) {
  var tree = this;

  if (entity instanceof Array) {
  
    entity.forEach(function(item){
      tree.add(item);
    });

  } else {

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




var Cards = new EntityTree([
    
  {
    name: 'card'
  }
]);



Actions = new EntityTree()

Cards.add([
  // card types.

  {
    name: 'fieldable',
    parent: 'card',
    hurt: function(damage, move){
      this.health = this.health - damage;
      console.log('being hurt', this);
    }
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
  Actions: Actions,
  Cards: Cards,
  shuffle: shuffle
};

})(); // End closure


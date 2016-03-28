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
var EntityTree = function(opts, all){
  this.opts = opts || {};
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
    if (tree.opts.on_create) tree.opts.on_create(entity);

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
  var kls = this.by_name[name];
  if (!kls) throw kls + " is not a valid object."
  return inherit(kls, overrides || {}, name + "Instance");
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
EntityTree.prototype.all = function(){
  var that=this;
  return Object.keys(this.by_name).map(function(k){
    return that.by_name[k];
  });
}




var Cards = new EntityTree({
    on_create: function(card){
      for (var i=0; i<(card.field_actions || []).length; i++) {
        if (typeof card.field_actions[i] === 'string') card.field_actions.splice(i,1,Actions.create(card.field_actions[i]))
      }
    }
  }, [
    
  {
    name: 'card',
    valid_target: function(){

    },
    get_description: function() {
      return (this.field_actions || []).map(function(action){
        return action.get_description();
      }).join(". ")
      + "<br>" + (this.hand_actions || []).map(function(action){
        return action.get_description();
      }).join(". ")
    },
    get effective_speed() {
      return this.speed + GAME.get_globals(this, 'speed');
    }
  }
]);


Actions = new EntityTree()




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


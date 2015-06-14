;

(function(){


if (typeof module !== 'undefined') {
    CardSet = require('./cards')
}

var Player = 
{
    phase: 'START', // game has yet to start.

    init: function (opts)
    {
        
        this.deck = [];
        this.store = [];
        this.hand = [];
        this.field = [];
        
        this.played_cards = []; // cards played this turn.
        this.pending_actions = [];
        this.discard = [];

        this.diams = 0;

    },
    
    getState: function()
    {
        return {

        };
    },
    
    getPublicState: function()
    {
        return {

        };
    },

    draw: function(n)
    {
        var new_cards;
        if (this.is_client)
        {
            // wait for the server to simulate this.
            //socket.emit('draw', n);
            this.waiting = true;
        }
        else
        {
            if (this.deck.length === 0 && this.discard.length === 0)
            {
                new_cards = []; // no cards left to draw.
            }
            else if (this.deck.length < n) // need to reshuffle
            {
                new_cards = this.deck;
                this.deck = CardSet.shuffle(this.discard);
                this.discard = [];
                this.draw(n - new_cards.length);
            }
            else
            {
                new_cards = this.deck.splice(0,n);
            }
            this.hand = this.hand.concat(new_cards);
            //this.socket.emit('drawCards', new_cards);
        }
    },

    draw_hand: function ()
    {
        this.draw(5);
    },
    
    move_pile: function(from, to)
    {
        console.log(from);
        while(from.length){
            this.move_card(0, from, to);
        }
    },
    
    
    // provide an index OR a card for the first arg.
    move_card: function(index, source, dest, placeholder)
    {
        if (typeof index !== 'number') {
            index = this.hand.indexOf(index);
        }
        if (index >= source.length) {
            console.error("can't move element",index,"of",source);
        }

        var card;
        if (placeholder){
            card = source.slice(index, index + 1)[0];
            source[index] = {_placeholder: true};
        } else {
            card = source.splice(index, 1)[0];
        }
        if (!card._placeholder) dest.push(card);
        
        // which switching piles, clear temp state.
        card._done = false;
        card._move = null;
    },
       
    cleanup_field : function(){
           
        var i=this.field.length;
        while(--i >= 0){
          // clear done flag.
          this.field[i]._done = false;
          this.field[i]._move = null;
          
          // clear casualties
          if (this.field[i].health < 1){
            this.field[i].health = this.field[i].__proto__.health;
            this.move_card(i, this.field, this.discard);
          }
        }
    },
    
    end_turn: function ()
    {
        this.pending_actions = [];
        this.cleanup_field();
        this.move_pile(this.hand, this.discard);
        this.move_pile(this.played_cards, this.discard);
    },
    
    readyForCombat: function(){
        this.setPhase('COMBAT');
    },
    
    play: function (card, action, then)
    {
        
        var move = {
            card: card,
            action: action,
            player: this,
            cost: card.cost
        };
        var result = this.initiate_move(move, then);
        return result;
    },
    
    act: function(card, action){
        var move = {
            card: card,
            action: action,
            player: this,
            cost: action.cost
        };
        return this.initiate_move(move, action);
    },
    
    initiate_move: function(move, then){

        if (move.cost) {
            if (move.cost > this.diams) {
                return {
                    message: "Not enough diamonds.",
                    success: false
                }
            }
            
            this.diams -= move.cost;
        };
        
        //hilight targets, if any, and wait for user to select.
        if (move.action.targets) {
            
            if (this.client) {
                
                var targets = move.action.targets(move);
                targets.forEach(function(card){
                    card._target = true;
                });
            
            }
            
            if (move.action.targets.length){
                this.resolving = move;
            } else {
                alert('No targets.');
                return {
                    success: false
                }
            }
                
            
        } else { // otherwise just complete the move.
            this.apply_move(move, then);
        }

        return {
            success: true
        };
    
    },
    
    done_targetting: function(target){
        if (this.resolving){
            
            this.resolving.target = target
            this.apply_move(this.resolving);
            
            // clear targets hilight
            if (this.client) {
                this.resolving.action.targets(this.resolving).forEach(function(card){
                    delete card._target;
                });
            }
            this.resolving = null;
        }
    },
    
    apply_move: function(move, then){
        move.card._done = true;
        move.card._move = move;
        
        if (move.action.delayed) {
            if (this.client) animate_order();
            this.pending_actions.push(move);
        } else {
            this.complete_move(move, then);
        }
    },
    
    complete_move: function(move, then){
        
        console.log(move, 'being done');
        
        // if the card targets dynamicaly, then do it now.
        if (move.action.retarget) {
            move.target = move.action.retarget(move);
        }
        
        // dead cards can't do moves.
        if (move.card.is_alive && !move.card.is_alive()){
            return then && then();
        }
        
        // ensure this move wasnt already used, ie as a counterattack.        
        if (move._done){
            return then && then();
        }
        
        move.action.animate(move, function(){
            move._done = true;
            console.log('executing')
            move.action.fn(move);
            if (move.action.is_a('strike') && move.target.get_counterattack) {
                // in melee, target may attack back.
                var counter_move = move.target.get_counterattack(move, then);
                if (counter_move) {
                  return move.player.get_opponent().complete_move(counter_move, then);
                }
            }
            then && then();
            
        });
    },
    
    get_opponent: function(){
        var self = this;
        return GAME.players.filter(function(p){ return p !== self })[0];
    }

};


if (typeof module !== 'undefined') {
    module.exports = Player;
} else {
    window.Player = Player;
}

})();
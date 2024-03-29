;

(function() {

  var _get_move_cost = function() {
    return move.action.cost || move.card.cost || 0;
  };

  if (typeof module !== 'undefined') {
    CardSet = require('./cards')
  }

  var Player = {
    phase: 'START', // game has yet to start.

    init: function(opts) {

      this.deck = [];
      this.store = [];
      this.hand = [];
      this.field = [];

      this.played_cards = []; // cards played this turn.
      this.pending_moves = [];
      this.discard = [];

      this.diams = 0;
      this.income = 0;
      this.storage = 2;

    },

    getState: function() {
      return {

      };
    },

    getPublicState: function() {
      return {

      };
    },

    draw: function(n) {
      var new_cards;
      if (this.hand.length + n > 7) {
        n = 7 - this.hand.length
      }
      if (this.deck.length === 0 && this.discard.length === 0) {
        new_cards = []; // no cards left to draw.
      } else if (this.deck.length < n) // need to reshuffle
      {
        new_cards = this.deck;
        this.deck = [];
        // don't resuffle the discard
        /*this.deck = CardSet.shuffle(this.discard);
        this.discard = [];
        this.draw(n - new_cards.length);*/

      } else {
        new_cards = this.deck.splice(0, n);
      }
      this.hand = this.hand.concat(new_cards);
    },

    move_pile: function(from, to) {
      while (from.length) {
        this.move_card(0, from, to);
      }
    },

    can_dig: function(move) {
      move = move || this.resolving;
      return !!(!this._dug && move && move.from_hand);
    },

    can_act: function(card) {
      return card.field_actions && !card._done && !card.stunned &&
        card.field_actions[0].cost <= this.diams;
    },

    can_play_or_dig: function(card) {
      return !card._done &&
        (!this._dug ||
          this.can_play(card)
        );
    },

    can_play: function(card) {
      return card.hand_actions && card.cost <= this.diams
    },

    // provide an index OR a card for the first arg.
    move_card: function(index, source, dest, placeholder) {
      if (typeof index !== 'number') {
        var i = this.hand.indexOf(index);
        index = i;
      }
      if (index >= source.length) {
        console.error("can't move element", index, "of", source);
      }

      var card;
      if (placeholder) {
        card = source.slice(index, index + 1)[0];
        source[index] = {
          _placeholder: true,
          get_classes: function() {
            return ['card', 'placeholder']
          }
        };
      } else {
        card = source.splice(index, 1)[0];
      }
      if (!card._placeholder) dest.push(card);

      // when switching piles, clear temp state.
      card._done = false;
      card._move = null;
    },

    clear_placeholders: function() {
      this.hand = this.hand.filter(function(c) {
        return !c._placeholder
      });
    },

    cleanup_field: function() {

      var i = this.field.length;
      while (--i >= 0) {
        var card = this.field[i];
        // clear done flag.
        if (card.stunned) card.stunned -= 1;
        if (card.poisoned) card.health -= card.poisoned;

        card._done = false;
        card._move = null;

        // clear casualties
        if (this.field[i].health < 1) {
          // reset health?
          //this.field[i].health = this.field[i].__proto__.health;
          this.move_card(i, this.field, this.discard);
        } else {
          card.on_turn && card.on_turn(this, i);
        }
      }
    },

    cleanup_hand: function() {
      var i = this.hand.length;
      while (--i >= 0) {
        var card = this.hand[i];
        card._done = false;
        card._move = null;
        card.on_turn_field && card.on_turn_field(this, i);
      }
    },

    begin_turn: function() {
      this.clear_placeholders();
      this.diams += this.income;
      if (this.diams > this.storage) {
        this.diams = this.storage;
      }
      this._dug = false;
      this.draw(1);
    },

    end_turn: function() {
      this.pending_moves = [];
      this.cleanup_field();
      this.cleanup_hand();
      //this.move_pile(this.hand, this.discard);
      this.move_pile(this.played_cards, this.discard);
    },

    readyForCombat: function() {
      this.setPhase('COMBAT');
    },

    get_keep: function(index) {
      return this.field.filter(function(item) {
        return item.is_a('keep') || item.is_a('nest')
      })[0];
    },

    dig: function(index) {
      var keep = this.get_keep();
      if (this.client) {
        animate_message(null, keep, {
          text: '+1 income',
          color: '#39f'
        });
      }
      this.income++;
      this._dug = true;
      this.storage += 1;
      this.move_card(index, this.hand, this.discard);
    },

    initiate_move: function(move, then) {

      //hilight targets, if any, and wait for user to select.
      if (move.action.single_target()) {

        var targets = move.action.targets(move);

        targets.forEach(function(card) {
          card._target = true;
        });


      }
      this.resolving = move;

      return {
        success: true
      };

    },

    done_targetting: function(target, done) {
      if (this.resolving) {
        if (this.resolving.action.targets(this.resolving).indexOf(target) > -1) {
          this.resolving.target = target
          this.apply_move(this.resolving, done);
        } else {
          console.log("invalid target", target, this.resolving.action.targets(this.resolving))
          alert('invalid target');
        }
        // clear targets hilight
        if (this.client) {
          this.clear_targets();
        }
        delete this.resolving;
      }
    },

    clear_targets: function() {
      if (this.resolving) {
        if (this.resolving.action.single_target()) {

          this.resolving.action.targets(this.resolving).forEach(function(card) {
            delete card._target;
          });
        }
        delete this.resolving;
      }
    },

    apply_move: function(move, then) {

      var move_cost = move.get_cost();
      if (move_cost > this.diams) {
        return {
          message: "Not enough diamonds.",
          success: false
        }
      }

      move.card._move = move;
      this.diams -= move_cost;
      if (true) { //move.action.delayed) {
        move.card._done = true;
        if (this.client) animate_order();
        this.pending_moves.push(move);
      } else {
        this.complete_move(move, then);
      }
    },

    complete_move: function(move, then) {

      // if the card targets dynamicaly, then do it now.
      if (move.action.retarget) {
        move.targets = move.action.retarget(move);
        move.target = move.targets[0];
        console.log("TARGET", move.target);
        console.log("TARGETS", move.targets);
        if (!move.target) {
          return then && then();
        }
      }
      if (move.card.stunned) { // stunned cards can't move.
        return then && then();
      }
      // dead cards can't do moves.
      if (move.card.is_alive && !move.card.is_alive()) {
        return then && then();
      }
      // ensure this move wasnt already used, ie as a counterattack.
      if (move._done) {
        return then && then();
      }

      move.action.animate(function() {
        move._done = true;
        move.action.fn(move);

        GAME.emit_move(move);

        if (move.action.is_a('strike') && move.target.get_counterattack) {
          // in melee, target may attack back.
          var counter_move = move.target.get_counterattack(move, then);
          if (counter_move) {
            return move.player.get_opponent().complete_move(counter_move, then);
          }
        }
        then && then();
      }, move);
    },

    get_opponent: function() {
      var self = this;
      return GAME.players.filter(function(p) {
        return p !== self
      })[0];
    }

  };


  if (typeof module !== 'undefined') {
    module.exports = Player;
  } else {
    window.Player = Player;
  }

})();

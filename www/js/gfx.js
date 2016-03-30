


var $$ = function(s){
    return document.querySelectorAll(s);
}

var 
    shoot_proxy_el = $$(".shoot-proxy")[0],
    pow_proxy_el = $$(".pow-proxy")[0],
    text_proxy_el = $$(".text-proxy")[0];

if (true) { // mute
    Audio = function(){
        this.play = function(){};
    }
}

var knife_sound = (new Audio('sounds/knifeSlice.mp3')),
    trample_sound = (new Audio('sounds/trample.mp3')),
    spend_sound = (new Audio('sounds/spend.mp3')),
    deploy_sound = (new Audio('sounds/deploy2.mp3')),
    buy_sound = (new Audio('sounds/buy.mp3')),
    spend_sound = (new Audio('sounds/spend.mp3')),
    trumpet_sound = (new Audio('sounds/trumpet.mp3')),
    lost_sound = (new Audio('sounds/lost.mp3')),
    won_sound = (new Audio('sounds/won.mp3')),
    lock_sound = (new Audio('sounds/lock.mp3'));

var get_actor_display = function(move){
    return get_display(move.card);
};

var get_target_display = function(move) {
    return get_display(move.target);
};

// Get the dom element and related data for a card, used for animations.
var get_display = function(card) {
    
    var selector, field = GAME.player.field, idx = field.indexOf(card);

    if (idx == -1) {
        field = GAME.player.get_opponent().field;
        idx = field.indexOf(card);
    }
    
    if (field !== GAME.player.field) {
        idx = field.length - 1 - idx;
        selector = '.enemy';
    } else {
        selector = '.field';
    }
    
    var el = $$(selector + " .card")[idx];
    
    var rect = el.getBoundingClientRect();    
    return {
        el: el,
        rect: rect,
        near: field === GAME.player.field
    };
}

var animate_won = function(then){
    setTimeout(function(){
        won_sound.play();
    }, 350);
    
    Array.prototype.slice.call(document.querySelectorAll('.zone')).forEach(function(el, i){
        
        Velocity(el, {
            scale:0.01,
            opacity: 0
        },
            {duration:3500, easing: 'easeInSine', complete:then}
        );
    });
};

var animate_lost = function(then){
    setTimeout(function(){
        lost_sound.play();
    }, 350);
    
    Array.prototype.slice.call(document.querySelectorAll('.zone')).forEach(function(el, i){
        
        Velocity(el, {
            translateY:window.screen.height*.15*(4-i)+'px',
            rotateZ:Math.floor((1-i%2)*20-10)+'deg'
            //rotateX:Math.floor((i%2)*40-20)+'deg',
            //rotateY:Math.floor(i*10-40)+'deg'
        },
            {duration:3500, easing: [ 300, 10 ], complete:then}
        );
    });
};


var animate_order = function(){
    lock_sound.play();
};

var animate_war = function(){
    trumpet_sound.play();
};

var animate_play= function(move, done){
    var el = $$(".hand .card")[move.player.hand.indexOf(move.card)];
    (move.card.is_a('wealth') ? spend_sound : deploy_sound ).play(); 
    
    Velocity(el,{
        translateY: '-30px',
        scale: 1.2,
        opacity: 0
    },{
        duraton: 200,
        visibility: 'hidden',
        complete: function(){
            
            Velocity(el,'reverse',{
                duration: 1,
                visibility: 'hidden',
                complete: function(){
                    setTimeout(function(){
                        el.style.visibility='visible'; // element may be reused by angular, so make it show again after it's done $applying
                    }, 500);
                    done()
                }
            });
        }
    });
};

var animate_buy = function(card){
    buy_sound.play();
    
    var el = $$(".store .card")[GAME.player.store.indexOf(card)];
    Velocity(el,{
        translateY: '-30px',
        scale: 1.1,
        rotateZ: "15deg",
        opacity: 0
    },{
        duraton: 200
    });
    Velocity(el, 'reverse');
};

var animate_strike = function(move, done) {
    
    actor = get_actor_display(move);
    target = get_target_display(move);
    
    console.log(actor);

    Velocity(actor.el, {
      translateX: target.rect.left - actor.rect.left + 'px',
      translateY: target.rect.top - actor.rect.top + (actor.near ? actor.rect.height * .75 : -actor.rect.height * .75) + 'px'
    }, {
      duration: 500,
      complete: function(){
        Velocity(actor.el, 'reverse', {duration: 800, complete: done});
        Velocity(target.el, 'reverse');
      },
      easing: "easeInQuart"
    });
    
    // smash.
    Velocity(target.el, {
      scaleX: 1.1,
      scaleY: 1.1 
    }, {
        duration: 100,
        delay: 500
    });
    
    if (move.action.damage) {

        (move.action.name === 'charge' ? trample_sound : knife_sound).play();
        
        animate_message(move.target, {
            text: move.action.damage + " dmg!",
            color: 'red', 
            delay: 400
        });
    }
}

var animate_spin = function(move, done) {
    
    var targets = move.action.targets(move);
    
    var iter = function(i){
        move.target = targets[i];
        if (move.action.damage) {
            animate_pow(move.target);
        }
        animate_strike(move, function(){
            i++;
            if (i>=targets.length) {
                done();
            } else {
                iter(i);
            }
        })
    };
    iter(0);
}

var animate_shoot = function(move, done){
    actor = get_actor_display(move);
    target = get_target_display(move);

    shoot_proxy_el.style.left=actor.rect.left + (target.rect.right-target.rect.left)/2 + 'px';
    shoot_proxy_el.style.top=actor.rect.top + (target.rect.bottom-target.rect.top)/2 + 'px';
    shoot_proxy_el.style.opacity=1;
    
    Velocity(shoot_proxy_el, {
      translateX: target.rect.left - actor.rect.left + 'px',
      translateY: target.rect.top - actor.rect.top + 'px'
    }, {
      duration: 500,
      complete: function(){
        shoot_proxy_el.style.opacity=0;
        
        Velocity(shoot_proxy_el, 'reverse', {duration: 800, complete: done});
        Velocity(target.el, 'reverse');
      },
      easing: "easeInQuart"
    });
    
    // smash.
    Velocity(target.el, {
      scaleX: 1.1,
      scaleY: 1.1 
    }, {
        duration: 100,
        delay: 500
    });
    
    if (move.action.damage) {

        animate_message(move.target, {
            text: move.action.damage + " dmg!",
            color: 'red', 
            delay: 400
        });
    }
}

// async, no callback.
var animate_message = function(card, opts){
    opts = opts || {};

    target = get_display(card);

    text_proxy_el.textContent = opts.text;
    text_proxy_el.style.left=target.rect.left + (target.rect.bottom-target.rect.top)/6 + 'px';
    text_proxy_el.style.top=target.rect.top /*- (target.rect.bottom-target.rect.top)*.2*/ + 'px';

    text_proxy_el.style.color = opts.color || 'green';
    
    Velocity(text_proxy_el,{
        scaleX: 1.5,
        opacity: 1,
        complete: function(){

            Velocity(text_proxy_el,{
                opacity: 0
            },{
                duration: 100,
                delay: 800
            });
            opts.callback && opts.callback();
        }
    },{
        duration: 100,
        delay: opts.delay || 0
    });
}


// async, no callback.
var animate_pow = function(card, opts){
    opts = opts || {};
    target = get_display(card);

    pow_proxy_el.style.left=target.rect.left + (target.rect.right-target.rect.left)/2 + 'px';
    pow_proxy_el.style.top=target.rect.top + (target.rect.bottom-target.rect.top)/2 + 'px';
    pow_proxy_el.style.backgroundColor = opts.color || 'orange';

    Velocity(pow_proxy_el,{
        opacity: 1,
        complete: function(){
            
            Velocity(pow_proxy_el,{
                scale: 9,
                opacity: 0,
                complete: function(){
                    Velocity(pow_proxy_el,{
                        scale: 1
                    },{
                        duration: 1,
                        delay: 0
                    });
                    opts.callback && opts.callback();
                }
            },{
                duration: 400,
                delay: 0
            });
        }
    },{
        duration: 200,
        delay: opts.delay || 0
    });
}



var $$ = function(s){
    return document.querySelectorAll(s);
}

var 
    shoot_proxy_el = $$(".shoot-proxy")[0],
    text_proxy_el = $$(".text-proxy")[0];

var knife_sound = (new Audio('assets/knifeSlice.mp3')),
    trample_sound = (new Audio('assets/trample.mp3')),
    spend_sound = (new Audio('assets/spend.mp3')),
    deploy_sound = (new Audio('assets/deploy2.mp3')),
    buy_sound = (new Audio('assets/buy.mp3')),
    spend_sound = (new Audio('assets/spend.mp3')),
    trumpet_sound = (new Audio('assets/trumpet.mp3')),
    lost_sound = (new Audio('assets/lost.mp3')),
    won_sound = (new Audio('assets/won.mp3')),
    lock_sound = (new Audio('assets/lock.mp3'));

var get_actor_display = function(move){
    if (move.player.client){
        var field_selector = ".field";
        var near = true;
    } else {
        var field_selector = ".enemy";
        var near = false;
    }
    var el = $$(field_selector + " .card")[move.player.field.indexOf(move.card)];
    var rect = el.getBoundingClientRect();
    return {
        el: el,
        rect: rect,
        near: near
    };
};

var get_target_display = function(move) {
    if (move.player.client){
        var enemy_selector = ".enemy";
    } else {
        var enemy_selector = ".field";
    }
    var el = $$(enemy_selector + " .card")[move.player.get_opponent().field.indexOf(move.target)];
    var rect = el.getBoundingClientRect();
    return {
        el: el,
        rect: rect
    };
};

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
    
    Velocity(actor.el, {
      translateX: target.rect.left - actor.rect.left + 'px',
      translateY: target.rect.top - actor.rect.top + (actor.near ? actor.rect.height : -target.rect.height) + 'px'
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
        animate_damage(move, target);
    }
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
        animate_damage(move, target);
    }
}

// async, no callback.
var animate_damage = function(move, target){
    
    text_proxy_el.textContent = move.action.damage + " dmg!";
    text_proxy_el.style.left=target.rect.left -5 + 'px';
    text_proxy_el.style.top=target.rect.top + (target.rect.bottom-target.rect.top)/2 + 'px';
    
    Velocity(text_proxy_el,{
        scaleX: 1.1,
        opacity: 1,
        complete: function(){
            
            (move.action.name === 'charge' ? trample_sound : knife_sound).play();
            
            Velocity(text_proxy_el,{
                opacity: 0
            },{
                duration: 100,
                delay: 500
            });
        }
    },{
        duration: 100,
        delay: 400
    });
}
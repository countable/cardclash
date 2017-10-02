

var W_U, H_U;

update_viewport_dimensions = function(){
    W_U = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) / 100;
    H_U = W_U * 9/16;
}

window.document.body.onresize = update_viewport_dimensions;
update_viewport_dimensions();

var $$ = function(s){
    return document.querySelectorAll(s);
}


if (true) { // mute
    Audio = function(){
        this.play = function(){};
    };
}

var _client_only = function(fn){
    return function(then){
      if (GAME.player.client) {
        return fn.apply(null, arguments);
      } else {
        return function(then){
          then && then();
        }
      }
    }
};

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


/**
 * Find the element associated with a card.
 */
var find_card_el = function(card) {
    var places = [
        {
            pile: GAME.player.field,
            selector: '.field'
        },
        {
            pile: GAME.player.hand,
            selector: '.hand'
        },
        {
            pile: GAME.enemy.field,
            selector: '.efield'
        },
        {
            pile: GAME.enemy.hand,
            selector: '.ehand'
        }
    ];

    for (var i=0; i<4; i++){
        var spot = places[i].pile.indexOf(card);
        if (spot > -1) {
            var selector = places[i].selector;
            if (selector === '.efield') spot = GAME.enemy.field.length - 1 - spot; // rtl
            console.log(spot, selector);
            return $$(selector + ' .card')[spot];
        }
    }

    return null;
};

// Get the dom element and related data for a card, used for animations.
var get_display = function(card) {

    var el = find_card_el(card);
    return {
        el: el,
        rect: el.getBoundingClientRect()
    };
};


var animate_won = _client_only(function(then){
    setTimeout(function(){
        won_sound.play();
    }, 350);

    Velocity(document.querySelectorAll('.zone'), {
        scale:0.01,
        opacity: 0
    },
        {duration:3500, easing: 'easeInSine', complete:then}
    );
});

var animate_lost = _client_only(function(then){
    setTimeout(function(){
        lost_sound.play();
    }, 350);

    Velocity(document.querySelectorAll('.zone'), {
        translateY:window.screen.height*.15*(4-i)+'px',
        rotateZ:Math.floor((1-i%2)*20-10)+'deg'
        //rotateX:Math.floor((i%2)*40-20)+'deg',
        //rotateY:Math.floor(i*10-40)+'deg'
    },
        {duration:3500, easing: [ 300, 10 ], complete:then}
    );
});


var animate_order = _client_only(function(){
    lock_sound.play();
    // AOP would be much nicer for this:

    var sc = GAME.get_current_scenario();
    sc.on_order && sc.on_order();
});

var animate_war = _client_only(function(){
    trumpet_sound.play();
});

var animate_play= _client_only(function(done, move){

    var actor = get_display(move.card);

    (move.card.is_a('wealth') ? spend_sound : deploy_sound ).play();

    var adjust_x = (44 * W_U - actor.rect.left) / W_U;
    var adjust_y =  (actor.rect.top / W_U) > 50 ? (-15) : (15);

    Velocity(actor.el,{
        translateY: [adjust_y + 'vh', 0],
        translateX: [adjust_x + 'vh', 0],
        scale: 1.7
    },{
        duraton: 300,
        //visibility: 'hidden',
        complete: function(){

            if (move.target) {
                Velocity(actor.el, 'reverse', {duration: 300, delay: 800, complete:function(){
                    animate_strike(done, move);
                }})
            } else {
                Velocity(actor.el,'transition.fadeOut',{
                    duration: 1,
                    delay: 1200,
                    complete: function(){
                        done && done()
                    }
                });
            }
            return;
        }
    });
});


var animate_buy = _client_only(function(card){
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
});


var animate_strike = _client_only(function(done, move) {

    actor = get_display(move.card);

    target = get_display(move.target);

    var near = actor.rect.top > target.rect.top;

    Velocity(actor.el, {
      translateX: target.rect.left - actor.rect.left + 'px',
      translateY: target.rect.top - actor.rect.top + (near ? actor.rect.height : -actor.rect.height) + 'px',
      scale: 1
    }, {
      duration: 500,
      complete: function(){
        if (move.action.is_a('cast')) {
            done && done();
            Velocity(actor.el, {
                opacity: 0,
            }, {duration: 500, complete: function(){
                actor.el.style.transform = '';
                actor.el.style.opacity = '';
            }});
        } else {
            done && done();
            Velocity(actor.el, 'reverse',{
            //    complete: done,
                delay: 300,
            });
        }

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

    }
});

var animate_spin = _client_only(function(done, move) {

    var targets = move.action.targets(move);

    var iter = function(i){
        move.target = targets[i];
        if (move.action.damage) {
            animate_pow(move.target);
        }
        animate_strike(move, function(){
            i++;
            if (i>=targets.length) {
                done && done();
            } else {
                iter(i);
            }
        })
    };
    iter(0);
});

var VIEW_EL = $$('#viewport')[0];

var make_proxy = function(class_name) {
    var el = document.createElement('div');
    el.className = class_name;
    document.body.appendChild(el);
    return el;
};

var remove_proxy = function(el){
    document.body.removeChild(el);
};

var animate_shoot = _client_only(function(done, move){

    actor = get_display(move.card);
    target = get_display(move.target);

    shoot_proxy_el = make_proxy('shoot-proxy');

    shoot_proxy_el.style.left=actor.rect.left + 5*W_U + 'px';
    shoot_proxy_el.style.top=actor.rect.top + 5*W_U + 'px';
    shoot_proxy_el.style.opacity=1;

    Velocity(shoot_proxy_el, {
      translateX: target.rect.left - actor.rect.left + 'px',
      translateY: target.rect.top - actor.rect.top + 'px'
    }, {
      duration: 500,
      complete: function(){
        document.body.removeChild(shoot_proxy_el);
        Velocity(target.el, 'reverse', {complete:done});
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
});

// async, no callback.
var animate_message = _client_only(function(done, card, opts){
    opts = opts || {};

    target = get_display(card);

    var proxy = make_proxy('text-proxy bounce');

    proxy.textContent = opts.text;

    initial(proxy, {
        left: target.rect.left,
        top: target.rect.top - W_U * 5,
        color: opts.color || 'green'
    });

    Velocity(proxy,{
        scaleX: 1.5,
        opacity: 1,
        complete: function(){
            opts.effect && Velocity(proxy,opts.effect);
            Velocity(proxy,{
                opacity: 0
            },{
                duration: 100,
                delay: opts.duration || 800
            });
            done && done();
        }
    },{
        duration: 100,
        delay: opts.delay || 0
    });
});

var animate = function(el, steps) {
    var step = steps.shift();
    var duration = step.duration;
    var delay = step.delay;
    delete step.delay;
    delete step.duration;
    if (step.step) {step=step.step}
    Velocity(el, step, {
        delay: delay,
        duration: duration,
        complete: function(){
            if (steps.length) animate(el, steps);
        }
    })
};
var initial = function(el, values) {
    for (var k in values){
        if (k === 'left' || k === 'top' || k === 'width' || k === 'height' || k === 'bottom' || k === 'right')
            values[k] += 'px';
        el.style[k] = values[k];
    }
};

var animate_help = _client_only(function(opts){
    opts = opts || {};

    var actor = get_display(GAME.player.hand[0]);
    var arrow_proxy_el = make_proxy('arrow-proxy');

    initial(arrow_proxy_el, {
        left: actor.rect.left - actor.rect.width,
        top: actor.rect.top ,
        backgroundColor: 'red'
    });

    var target = get_display(GAME.enemy.field[0]);

    animate_message(GAME.player.hand[0], {
        text: 'drag me',
        color: 'red',
        duration: 3000,
        effect: 'callout.bounce'
    });

    Velocity.RunSequence([
        {
            e: arrow_proxy_el,
            p:{ opacity: 1 },
            o:{ duration: 700, delay: 1000 }
        },
        {
            e: arrow_proxy_el,
            p: 'callout.pulse'
        },
        {
            e: arrow_proxy_el,
            p: { translateY: target.rect.top - actor.rect.top },
            o:{ duration: 1800 }
        },
        {
            e: arrow_proxy_el,
            p: { opacity: 0, },
            o: { duration: 500, callback: function(){
                remove_proxy(arrow_proxy_el);
            } }
        }
    ]);

});


// not used currently... (dead code)
var animate_help_2 = _client_only(function(opts){
    opts = opts || {};

    var arrow_proxy_el = make_proxy('arrow-proxy');

    initial(arrow_proxy_el, {
        left: 8 * W_U,
        top: $$("#turn")[0].getBoundingClientRect().top - 6 * W_U,
        backgroundColor: '#5cc2f1'
    });

    Velocity.RunSequence([
        {
            e: arrow_proxy_el,
            p:{ opacity: 1, scale: 0.8, rotateZ:25 },
            o:{ duration: 500, delay: 500 }
        },
        {
            e: arrow_proxy_el,
            p: 'callout.pulse'
        },
        {
            e: arrow_proxy_el,
            p: { opacity: 0, },
            o: { duration: 500, delay: 5000, callback: function(){
                remove_proxy(arrow_proxy_el);
            }}
        }
    ]);

});


var animate_help_3 = _client_only(function(opts){
    opts = opts || {};

    var arrow_proxy_el = make_proxy('arrow-proxy');
    var diams_rect = $$("#diams")[0].getBoundingClientRect();
    var player_card = get_display(GAME.player.hand[0]);

    initial(arrow_proxy_el, {
        left: player_card.rect.left,
        top: diams_rect.top - 14 * W_U,
        backgroundColor: 'red'
    });

    console.log('left', player_card.left);

    animate_message(GAME.player.hand[0], {
        text: 'sell me',
        color: '#5cc2f1',
        duration: 1300,
        effect: 'callout.bounce'
    });

    Velocity.RunSequence([
        {
            e: arrow_proxy_el,
            p:{ rotateZ:90 },
            o:{ duration: 1, delay: 2300 }
        },
        {
            e: arrow_proxy_el,
            p:{ opacity: 1, translateX: 6*W_U },
            o:{ duration: 500 }
        },
        {
            e: arrow_proxy_el,
            p: 'callout.pulse'
        },
        {
            e: arrow_proxy_el,
            p: { translateY: player_card.rect.left - diams_rect.left + W_U },
            o: { duration: 600, delay: 300}
        },
        {
            e: arrow_proxy_el,
            p: { opacity: 0, },
            o: { duration: 500, delay: 5000, callback: function(){
                remove_proxy(arrow_proxy_el);
            }}
        }
    ]);

});

// async, no callback.
var animate_pow = _client_only(function(done, card, opts){
    opts = opts || {};
    target = get_display(card);

    var pow_proxy_el = make_proxy('pow-proxy');
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
                    done && done();
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
});

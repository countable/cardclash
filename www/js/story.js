

STORY = {
  start: {
    pages: [

      {
        text: 'Mom: "Wake up, it\'s your graduation day!".'
      },

      {
        text: 'But your unconscious mind is mired in dreams of your day job as a (pick one)',
        input: "job",
        options: [
          {
            value: "clerk",
            text: "office clerk"
          },
          {
            value: "laborer",
            text: "chimney sweep"
          },
          {
            value: "gopher",
            text: "delivery gopher"
          }
        ]
      },

      {
        text: 'Mom: "Don\'t you miss the award ceremony, you\'re nominated for (pick one)',
        input: 'award',
        options: [
          {
            value: "jock",
            text: "the sports award"
          },
          {
            value: "geek",
            text: "academic honour award"
          },
          {
            value: "prep",
            text: "valedictorian"
          },
          {

            value: "loser",
            text: "most improved"
          }
        ]
      },

      {
        text: 'You drag yourself to hasty meal of nut butter on bread, and rush out the hatch of your home. Upon leaving your house, you (pick one)',
        input: 'death',
        options: [
          {
            value: "dogs",
            text: "are downed by a pack of wild dogs"
          },
          {
            value: "bus",
            text: "are run over by a shuttle"
          },
          {
            value: "nuts",
            text: "die from an allergic reaction to nuts"
          }
        ]
      },

      {
        text: 'You convulse violently on the ground and your vision goes dark...'
      },
      
      {
        text: "..."
      },

      {
        text: 'Your eyes slowly slide open, and find yourself lying on a morgue slab.'
      },

      {
        text: '"Where am I?" you wonder aloud.'
      },

      {
        text: 'The noise of your voice alerts the rats. Huge ones, who scurry toward you. You start to scratch and slap at the rats, and a nearby goose waddles to your aid, but it is not enough!'
      },

      {
        text: 'Brightly coloured objects flood your vision as familiar feelings course through you. The new powers might give you a chance against the rats!'
      }

    ]
  },

  garden: {
    pages: [
      {
        text: 'You exit to the Garden...'
      },
      {
        text: '... it\'s deserted ...'
      },
      {
        text: 'Except for a PLANT!'
      }
    ]
  },

  garden: {
    pages: [
      {
        text: 'Phew! That was a close one! When knew plants could fight?'
      },
      {
        text: 'You march up the stairs into the Kitchen.'
      }
    ]
  }

};

GAME.app.controller('storyCtrl', function($scope, $timeout, $routeParams) {
    
    initial_cards = {
      clerk: ['copier'],
      laborer: ['dust_bunny'],
      gopher: ['gopher'],

      jock: ['spirit_ball'],
      geek: ['math_tome'],
      prep: ['leadership'],
      loser: ['isolation'],

      dogs: ['shiba_pup'],
      bus: ['droid'],
      nuts: ['nut_shell'],
    };

    $scope.place = -1;

    $scope.collection = ['low_kick', 'low_kick', 'slap', 'slap', 'scratch', 'scratch'];

    $timeout(function(){
      $scope.place++;
    }, 1000);
    
    $scope.story = STORY.start;

    $scope.next=function(){
      $scope.place++;
      if ($scope.place == 10) {
        $scope.collection = $scope.collection.concat(initial_cards[$scope.award]);
        $scope.collection = $scope.collection.concat(initial_cards[$scope.job]);
        $scope.collection = $scope.collection.concat(initial_cards[$scope.death]);

        GAME.save_epic({
          id: $routeParams.epic_id,
          collection: $scope.collection
        });

        window.location.hash = "/" + $routeParams.epic_id + "/game/0/0";
      }
    }
    $scope.choose=function(key, value){
      console.log(key,value);
      $scope[key] = value;
      $scope.place ++;
    }
    
}).config(function($sceProvider) {
  // Completely disable SCE.  For demonstration purposes only!
  // Do not use in new projects.
  $sceProvider.enabled(false);
})

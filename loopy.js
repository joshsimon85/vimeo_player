// add in validations for a must be less than b

var VimeoPlayer;
var options = jQuery('<div class="ab-loop-wrapper"><form class="video-loop-select"><input type="button" value="Set A Point" data-btn="a" /><input type="text" name="apoint" data-input="a" placeholder="00:00 min"> &#x21ba;<input type="text" name="bpoint" data-input="b" placeholder="00:00 min"><input type="button" value="Set B Point" data-btn="b" /><input class="run-loop-button" type="submit" value="Run Loop"></form>&nbsp; &nbsp;<form class="video-speed-select"><select id="myList"><option value="" disabled selected>Video Speed</option><option value = "1">0.5x</option><option value = "2">0.75x</option><option value = "3">Normal</option><option value = "4">1.25x</option><option value = "5">1.5x</option><option value = "6">2x</option></select></form></div>');

function insertOptionsBar() {
  jQuery('.cgo-vp-video-wrapper').append(options);
}

function formatTime(seconds) {
  var utc;
  var time;
  var date = new Date(null);

  date.setSeconds(seconds);
  utc = date.toUTCString();
  return utc.substr(utc.indexOf(':') + 1, 5);
}

function convertToSeconds(time) {
  var timeList = time.split(':');
  var minutes = +timeList[0];
  var seconds = +timeList[1];

  if (isNaN(minutes) || isNaN(seconds)) {
    return NaN;
  } else {
    return minutes * 60 + seconds;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  VimeoPlayer = {
    $: jQuery,
    checkPlayerStatus: function() {
      if (this.player) {
        var id = $(this.player.element).attr('src');
        if (id !== this.playerId) {
          // need to initialize a new player based on the iframe
        }
      } else {
        this.initializePlayer(this.$('iframe'));
        this.playerId = $(this.player.element).attr('src');
      }
    },
    checkCuePointStatus: function(cuePoint) {
      if (cuePoint === 'a') {
        if (this.cueIdA) {
          this.player.removeCuePoint(this.cueIdA).catch(function(error) {
            console.log(error);
          });
        }
      } else {
        if (this.cueIdB) {
          this.player.removeCuePoint(this.cueIdB).catch(function(error) {
            console.log(error);
          });
        }
      }
    },
    setInputTime: function($el, seconds) {
      $el.val(formatTime(seconds) + ' min');
    },
    setCuePoint: function(e) {
      e.preventDefault();

      var $inputList = this.$('input');
      var $inputA = $($inputList[1]);
      var $inputB = $($inputList[2]);
      var $target = $(e.target);
      var cuePoint = $target.data('btn');
      var self = this;
      var $input;

      if (cuePoint === 'a') {
        $input = $($inputList[1]);
      } else {
        $input = $($inputList[2]);
      }

      this.checkPlayerStatus();
      this.checkCuePointStatus(cuePoint);

      this.player.getCurrentTime().then(function(seconds) {
        self.player.addCuePoint(seconds, {
          customKey: cuePoint
        }).then(function(id) {
          if (cuePoint === 'a') {
            self.cueIdA = id;
            self.cueTimeA = seconds;
          } else {
            self.cueIdB = id;
            self.cueTimeB = seconds;
          }
          self.setInputTime($input, seconds);
        }).catch(function(error) {
          //new ViemoError(error.name, error);
          //add error to dom
          console.log(error);
        });
      });
    },
    setCuePointWithTime: function(e) {
      e.preventDefault();
      var $target = $(e.target);
      var cuePoint = $target.data('input');
      var self = this;
      var seconds;

      this.checkPlayerStatus();
      this.checkCuePointStatus(cuePoint);
      seconds = convertToSeconds($target.val());

      if (!!seconds) {
        this.player.addCuePoint(seconds, {
          customKey: cuePoint
        }).then(function(id) {
          if (cuePoint === 'a') {
            self.cueIdA = id;
            self.cueTimeA = seconds;
          } else {
            self.cueIdB = id;
            self.cueTimeB = seconds;
          }
          self.setInputTime($target, seconds);
        }).catch(function(error) {
          //new ViemoError(error.name, error);
          //add error to dom
          console.log(error);
        });
      } else {
        // add error to DOM
        console.log('not a number error');
      }
    },
    bind: function() {
      this.$('.video-loop-select').on('click', '[type="button"]', this.setCuePoint.bind(this));
      this.$('.video-loop-select').on('blur', '[type="text"]', this.setCuePointWithTime.bind(this));
    },
    initializePlayer: function(e) {
      this.player = new Vimeo.Player(this.$('iframe'));
    },
    init: function() {
      insertOptionsBar();
      this.bind();
    }
  };

  // Loopy = {
  //   setCuePoints: function(e) {
  //     // need to check if previous cue points exist and remove them then add new ones
  //     var $inputList = this.$('input');
  //     var $inputA = $($inputList[1]);
  //     var $inputB = $($inputList[2]);
  //     var $target = $(e.target);
  //     //var $input = $btn.next('input');
  //     e.preventDefault();
  //     if ($target.data('btn')) {
  //       VimeoPlayer.setCuePoint(this.player, 'a').then(function(result) {
  //
  //       });
  //
  //     } else {
  //       VimeoPlayer.setCuePointWithTime(this.player, 'a', time).then(function(result) {
  //
  //       });
  //
  //     }
  //     // if ($input.attr('name') === 'apoint') {
  //     //   this.player.getCurrentTime().then(function(seconds) {
  //     //     self.player.addCuePoint(seconds, {
  //     //       customKey: 'a'
  //     //     }).then(function(id) {
  //     //       self.aCueId = id;
  //     //       $input.val(self.formatTime(seconds) + ' min');
  //     //     }).catch(function(error) {
  //     //       switch(error.name) {
  //     //         case 'UnsupportedError':
  //     //           console.log('cues are not supported in your browser');
  //     //           break;
  //     //         case 'RangeError':
  //     //           console.log(error);
  //     //           break;
  //     //         default:
  //     //           console.log('a general error occured');
  //     //           console.log(error);
  //     //           break;
  //     //       }
  //     //     });
  //     //   });
  //     // } else {
  //     //   this.player.getCurrentTime().then(function(seconds) {
  //     //     self.player.addCuePoint(seconds, {
  //     //       customKey: 'end'
  //     //     }).then(function(id) {
  //     //       self.endCueId = id;
  //     //       $btn.prev('input').val(self.formatTime(seconds) + ' min');
  //     //     }).catch(function(error) {
  //     //       switch(error.name) {
  //     //         case 'UnsupportedError':
  //     //           console.log('cues are not supported in your browser');
  //     //           break;
  //     //         case 'RangeError':
  //     //           console.log(error);
  //     //           break;
  //     //         default:
  //     //           console.log('a general error occured');
  //     //           console.log(error);
  //     //           break;
  //     //       }
  //     //     });
  //     //   });
  //       // set b point cue
  //       // add error handling where a must be less than and not equal to b point
  //   //  }
  //     // also need to fire this on blur
  //     // set up error handling for improper inputs
  //     // set beginning and end cue points then we can add event listeners to them
  //     //if (e.target)
  //   }
  // };

  VimeoPlayer.init();
});

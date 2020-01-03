// add in validations for A must be less than B
var VimeoPlayer;
var options_template = ' \
  <div class="ab-loop-wrapper fullscreen"> \
    <div class="video-toolbar-titles fullscreen">AB Loop Toolbar</div> \
    <form class="video-loop-select"> \
      <input type="button" value="Set A Point" data-btn="a" class="set-a-button" /> \
      <input type="text" name="apoint" data-input="a" class="set-a-input error" placeholder="00:00 min"> \
      <div class="ab-loop-icon">&#x21ba;</div> \
      <input type="text" name="bpoint" data-input="b" class="set-b-input error" placeholder="00:00 min"> \
      <input type="button" value="Set B Point" data-btn="b" class="set-b-button" /> \
      <input class="run-loop-button" type="submit" value="Run Loop"> \
      <input type="button" value="Remove Loop" data-btn="r" class="reset-loop" /> \
    </form> \
    <div class="video-toolbar-error abloop">This is a sample ab loop error message</div> \
    <div class="video-toolbar-titles fullscreen">Adjust Playback Speed</div> \
    <form class="video-speed-select"> \
      <div class="video-speed-caret">	&#8964;</div> \
      <select class="video-speed-options"> \
        <option class="default" value="" disabled selected>Video Speed</option> \
        <option value = "0.5">0.5x</option> \
        <option value = "0.6">0.6x</option> \
        <option value = "0.7">0.7x</option> \
        <option value = "0.8">0.8x</option> \
        <option value = "0.9">0.9x</option> \
        <option value = "1.0">1.0x</option> \
        <option value = "1.1">1.1x</option> \
        <option value = "1.2">1.2x</option> \
        <option value = "1.3">1.3x</option> \
        <option value = "1.4">1.4x</option> \
        <option value = "1.5">1.5x</option> \
      </select> \
    </form> \
    <div class="video-toolbar-error speed">This is a sample playback speed error message</div> \
  </div> \
';
var options = jQuery(options_template);

function insertOptionsBar() {
  jQuery('.cgo-vp-video-wrapper').after(options);
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
    loop: false,
    playing: false,
    initialLoop: true,
    checkPlayerStatus: function() {
      if (this.player) {
        var id = this.$(this.player.element).attr('src');
        if (id !== this.playerId) {
          // need to initialize a new player based on the iframe
        }
      } else {
        this.initializePlayer(this.$('iframe'));
        this.setLoopBtn();
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
    playerPausedState: function(_) {
      this.checkPlayerStatus();
      this.playing = false;
      this.changeLoopBtnState();
    },
    playerPlayingState: function(_) {
      this.checkPlayerStatus();
      this.playing = true;
      this.changeLoopBtnState();
    },
    changeLoopBtnState: function() {
      var STOP = 'Stop Loop';
      var RUN = 'Run Loop';
      // if player is stopped and a loop not set the btn should return and error
      // if the player is stopped and loop is set is should show start loop
      // if the player is started and the loop is not set it should display start loop
      // if the player is started and the loop is set it should display stop loop

      if (this.playing === false && this.loop === false) {
        this.loopBtn.val(RUN);
      }

      if (this.playing === true && this.loop === false) {
        this.loopBtn.val(RUN);
      }

      if (this.playing === true && this.loop === false) {
        this.loopBtn.val(RUN);
      }

      if (this.playing === false && this.loop === true) {
        this.loopBtn.val(RUN);
      }

      if (this.playing === true && this.loop === true) {
        this.loopBtn.val(STOP);
      }
    },
    startLoop: function(e) {
      var self = this;

      this.player.getCurrentTime().then(function(seconds) {
        if (seconds < self.cueTimeA || seconds >= self.cueTimeB) {
          self.player.setCurrentTime(self.cueTimeA).then(function(result) {
            console.log(result);
            self.loop = true;
            self.playing = true;
            self.changeLoopBtnState();
            self.player.getPaused().then(function(state) {
              if (state === true) {
                self.playing = true;
                self.player.play().catch(function(error) {
                  console.log(error);
                });
              }
            });
            // check if player is playing if it is do nothing otherwise play
            // change text in submit btn
          }).catch(function(error) {
            console.log(error);
          });
        } else {
          self.loop = true;
          self.player.play().catch(function(error) {
            console.log(error);
          });
        }
      });
    },
    endLoop: function(e) {
      var self = this;

      this.playing = false;
      this.player.pause().then(function(_) {
        self.changeLoopBtnState();
      });
    },
    changeLoopState: function(e) {
      e.preventDefault();
      this.checkPlayerStatus();

      if (this.playing === false) {
        this.startLoop(e);
        this.initialLoop = false;
      } else if (this.playing === true && this.initialLoop === true) {
        this.initialLoop = false;
        this.startLoop(e);
      } else {
        this.endLoop(e);
      }
    },
    deleteCueItems: function() {
      this.player.removeCuePoint(cueIdA).catch(function(error) {
        console.log(error);
      });
      this.player.removeCuePoint(cueIdB).catch(function(error) {
        console.log(error);
      });
      this.cueIdA = null;
      this.cueIdB = null;
    },
    resetTimes: function($abloopbar) {
      $abloopbar.find('.set-a-input').val('');
      $abloopbar.find('.set-b-input').val('');
    },
    resetLoop: function(e) {
      e.preventDefault();
      var $el = this.$(e.target).parents('.ab-loop-wrapper');

      this.loop = false;
      this.initialLoop = true;
      this.resetTimes($el);
      this.changeLoopBtnState();
    },
    setSpeed: function(e) {
      var speed = this.$(e.target).val();

      this.checkPlayerStatus();
      this.player.setPlayBackRate(+val).catch(function(error) {
        console.log(error);
      });
    },
    bind: function() {
      this.$('.set-a-button, .set-b-button').on('click', this.setCuePoint.bind(this));
      this.$('.video-loop-select').on('submit', this.changeLoopState.bind(this));
      this.$('.reset-loop').on('click', this.resetLoop.bind(this));
      this.$('.video-speed-select').on('change', this.setSpeed.bind(this));
    },
    resetPlayBackTime: function(e) {
      if (this.loop === false) { return; }
      if (e.id !== this.cueIdB) { return; }
      this.player.setCurrentTime(this.cueTimeA).then(function(result) {
        console.log(result);
      }).catch(function(error) {
        console.log(error);
      });
    },
    setLoopBtn: function() {
      var $iframeWrapper = this.$('iframe[src="' + this.playerId + '"]')
                               .parents('.cgo-vp-video-wrapper');
      this.loopBtn = $iframeWrapper.next('.ab-loop-wrapper')
                                   .find('.run-loop-button');
    },
    bindPlayerEvents: function() {
      this.player.on('cuepoint', this.resetPlayBackTime.bind(this));
      this.player.on('pause', this.playerPausedState.bind(this));
      this.player.on('play', this.playerPlayingState.bind(this));
    },
    setPlayerId: function() {
      this.playerId = this.$(this.player.element).attr('src');
    },
    initializePlayer: function(e) {
      this.player = new Vimeo.Player(this.$('iframe'));
      this.setPlayerId();
      this.bindPlayerEvents();
    },
    init: function() {
      insertOptionsBar();
      this.bind();
    }
  };
  VimeoPlayer.init();
});
// rules for loop btn
// if player is stopped and a loop not set the btn should return and error
// if the player is stopped and loop is set is should show start loop
// if the player is started and the loop is not set it should display start loop
// if the player is started and the loop is set it should display stop loop

// check if player is playing and loop is set to true
// if player is playing and loop is not set to true keep text as run loop
// if player is playing and loop is set to true text should be stop loop
// when paused if you hit run loop again nothing happens if the loop is set
// create an event on player play that checks the val of the run loop btn
// add this.playing: boolean
// reset state when a new player is added, do I need to destroy all associated data?
// when i reset state i need to destroy the cue points on that player
// when we reset/initialize a player we need to clear loop state, cue ids, cue times, playing status
// on pause and on play it needs to initialzie a player and set the state of the run loop btn

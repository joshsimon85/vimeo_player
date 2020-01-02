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
      <input type="button" value="Reset" data-btn="r" class="reset-loop" /> \
    </form> \
    <div class="video-toolbar-error abloop">This is a sample ab loop error message</div> \
  <div class="video-toolbar-titles fullscreen">Adjust Playback Speed</div> \
    <form class="video-speed-select"> \
      <div class="video-speed-caret">	&#8964;</div> \
      <select class="video-speed-options"> \
        <option class="default" value="" disabled selected>Video Speed</option> \
         <option value = "1">0.5x</option> \
         <option value = "2">0.75x</option> \
         <option value = "3">Normal</option> \
         <option value = "4">1.25x</option> \
         <option value = "5">1.5x</option> \
         <option value = "6">2x</option> \
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
    changeLoopState: function(e) {
      e.preventDefault();
      var self = this;

      this.checkPlayerStatus();
      this.player.getCurrentTime().then(function(seconds) {
        if (seconds < self.cueTimeA || seconds >= self.cueTimeB) {
          self.player.setCurrentTime(self.cueTimeA).then(function(result) {
            console.log(result);
            self.loop = true;
          }).catch(function(error) {
            console.log(error);
          });
        } else {
          self.loop = true;
        }
      });
    },
    bind: function() {
      this.$('.video-loop-select').on('click', '[type="button"]', this.setCuePoint.bind(this));
      this.$('.video-loop-select').on('blur', '[type="text"]', this.setCuePointWithTime.bind(this));
      this.$('.video-loop-select').on('submit', this.changeLoopState.bind(this));
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
    initializePlayer: function(e) {
      this.player = new Vimeo.Player(this.$('iframe'));
      this.player.on('cuepoint', this.resetPlayBackTime.bind(this));
    },
    init: function() {
      insertOptionsBar();
      this.bind();
    }
  };
  VimeoPlayer.init();
});

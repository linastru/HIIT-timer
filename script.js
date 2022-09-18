// Default settings
let intervals = 8;
let activeSec = 15;
let restSec = 10;
let countInSec = 5;

// Sounds
let beepCountdown = new Audio("./audio/beepCountdown.ogg");
let beepTransition = new Audio("./audio/beepTransition.ogg");
let beepFinish = new Audio("./audio/beepFinish.ogg");

// Control parameters
let isStarted = false;
let isRunning = false;
let isResting = false;
let isFinished = false;

let currentSec = countInSec;
let currentInterval = 0;
let timePoint = null;

let maxBeeps = 5;
let beepCounter = maxBeeps;

let tickLength = 50;

window.onload = function() {
  addListeners();
  initialize();
  setInterval(updateTimer, tickLength);
}

function addListeners() {
  document.getElementById("start-btn").addEventListener("click", startTimer);
  document.getElementById("pause-btn").addEventListener("click", pauseTimer);
  document.getElementById("reset-btn").addEventListener("click", resetTimer)
  document.getElementById("interval-input").addEventListener("change", handleIntervalInput);
  document.getElementById("active-time-input").addEventListener("change", handleTimeInput);
  document.getElementById("rest-time-input").addEventListener("change", handleTimeInput);
  document.getElementById("interval-minus-btn").addEventListener("click", decreaseIntervalNo);
  document.getElementById("interval-plus-btn").addEventListener("click", increaseIntervalNo);
}

function initialize() {
  // Reset control parameters.
  isStarted = false;
  isRunning = false;
  isResting = false;
  isFinished = false;
  currentSec = countInSec;
  currentInterval = 0;
  beepCounter = 5;

  // Initialize clock, blips & finish flags.
  document.getElementById("clock-min-sec").innerHTML = formatClockOutput(currentSec)[0];
  document.getElementById("clock-millisec").innerHTML = formatClockOutput(currentSec)[1];
  document.getElementsByClassName("clock-container")[0].classList.remove("clock-rest");
  document.getElementsByClassName("clock-container")[0].classList.remove("clock-active"); 
  Array.from(document.getElementsByClassName("blips-group")).forEach((item) => {
    item.innerHTML = "&#11044; &#11044; &#11044; &#11044; &#11044;";
  });
  Array.from(document.getElementsByTagName("img")).forEach((item) => {
    item.style.display = "none";
  });
  document.getElementById("interval-no").innerHTML = 0;
  document.getElementById("interval-total").innerHTML = intervals;

  // Initialize control buttons.
  document.getElementById("start-btn").innerHTML = "Start";
  document.getElementById("start-btn").classList.remove("start-btn-resume");
  document.getElementById("start-btn").removeAttribute("disabled");
  document.getElementById("reset-btn").setAttribute("disabled", true);

  // Initialize settings.
  document.getElementById("interval-input").value = intervals;
  document.getElementById("active-time-input").value = formatTimeInput(activeSec);
  document.getElementById("rest-time-input").value = formatTimeInput(restSec);

  // Initialize progress bars.
  initProgressBars();
}

function initProgressBars() {
  let progressBars = document.getElementById("progress-bars");
  progressBars.innerHTML = "";

  for (let i = 1; i <= intervals; i++) {
    let divInterval = document.createElement("div");
    divInterval.classList.add("interval")
    progressBars.append(divInterval);

    let divActiveFrame = document.createElement("div");
    divActiveFrame.classList.add("active-frame");
    divInterval.append(divActiveFrame);

    let divActiveBar = document.createElement("div");
    divActiveBar.classList.add("active-bar");
    divActiveFrame.append(divActiveBar);

    let pActiveFrameLabel = document.createElement("p");
    pActiveFrameLabel.classList.add("active-frame-label");
    pActiveFrameLabel.innerHTML = i;
    divActiveFrame.append(pActiveFrameLabel);

    if (i < intervals) {
      let divRestFrame = document.createElement("div");
      divRestFrame.classList.add("rest-frame");
      divInterval.append(divRestFrame);
  
      let divRestBar = document.createElement("div");
      divRestBar.classList.add("rest-bar");
      divRestFrame.append(divRestBar);
    }
  }
  
  // Update progress frame widths.
  let activeFrameWidth = Math.round(activeSec / (activeSec + restSec) * 100);
  let restFrameWidth = 100 - activeFrameWidth;
  document.documentElement.style.setProperty("--active-frame-width", activeFrameWidth + "%");
  document.documentElement.style.setProperty("--rest-frame-width", restFrameWidth + "%");
}

function updateTimer() {
  if (isRunning) {
    // Calculate the time.
    let newTimePoint = new Date().getTime();
    let deltaSec = (newTimePoint - timePoint) / 1000;
    currentSec = currentSec - deltaSec;
    timePoint = newTimePoint;

    // Handle transition points.
    let barTransition = false;

    if (currentSec < 0) {
      if (currentInterval === intervals) {  // End the session.
        isFinished = true;
        pauseTimer();
        beepFinish.play();
        barTransition = true;
        
      } else {
        if (!isStarted) { // Finish the count-in.
          isStarted = true;
          currentSec = activeSec + currentSec;
          currentInterval = 1;
          beepTransition.play();

        } else {  
          
          if (!isResting) { // Proceed to next rest.
            isResting = true;
            currentSec = restSec + currentSec;
            beepTransition.play();
            barTransition = true;

          } else {  // Proceed to next interval.
            isResting = false;
            currentInterval = currentInterval + 1;
            currentSec = activeSec + currentSec;
            beepTransition.play();
            barTransition = true;
          }
        }
      }
    }

    // Update clock and interval count output.
    if (!isFinished) {
      document.getElementById("clock-min-sec").innerHTML = formatClockOutput(currentSec)[0];
      document.getElementById("clock-millisec").innerHTML = formatClockOutput(currentSec)[1];
      document.getElementById("interval-no").innerHTML = currentInterval;
    } else {
      document.getElementById("clock-min-sec").innerHTML = "Finished";
      document.getElementById("clock-millisec").innerHTML = "";
    }

    // Update clock & blip colours.
    if (isStarted && !isFinished) {
      if (!isResting) {
        document.getElementsByClassName("clock-container")[0].classList.add("clock-active");
        document.getElementsByClassName("clock-container")[0].classList.remove("clock-rest");
      } else {
      document.getElementsByClassName("clock-container")[0].classList.add("clock-rest");
      document.getElementsByClassName("clock-container")[0].classList.remove("clock-active");
      }
    } else {
      document.getElementsByClassName("clock-container")[0].classList.remove("clock-rest");
      document.getElementsByClassName("clock-container")[0].classList.remove("clock-active");
    }

    // Update blips.
    if (!isFinished) {
      if (currentSec <= 1) {
        Array.from(document.getElementsByClassName("blips-group")).forEach((item) => {
          item.innerHTML = "&#11044;";
        });
        playBeepCountdown(1);

      } else if (currentSec <= 2) {
        Array.from(document.getElementsByClassName("blips-group")).forEach((item) => {
          item.innerHTML = "&#11044; &#11044;";
        });
        playBeepCountdown(2);

      } else if (currentSec <= 3) {
        Array.from(document.getElementsByClassName("blips-group")).forEach((item) => {
          item.innerHTML = "&#11044; &#11044; &#11044;";
        });
        playBeepCountdown(3); 

      } else if (currentSec <= 4 && !isStarted) {
        Array.from(document.getElementsByClassName("blips-group")).forEach((item) => {
          item.innerHTML = "&#11044; &#11044; &#11044; &#11044;";
        });
        playBeepCountdown(4); 

      } else if (currentSec <= 5 && !isStarted) {
        Array.from(document.getElementsByClassName("blips-group")).forEach((item) => {
          item.innerHTML = "&#11044; &#11044; &#11044; &#11044; &#11044;";
        });
        playBeepCountdown(5);

      } else {
        Array.from(document.getElementsByClassName("blips-group")).forEach((item) => {
          item.innerHTML = "";
        });
        beepCounter = maxBeeps;
      }

    } else {
      Array.from(document.getElementsByClassName("blips-group")).forEach((item) => {
        item.innerHTML = "";
      });
    }

    // Update finish flags.
    if (isFinished) {
      Array.from(document.getElementsByTagName("img")).forEach((item) => {
        item.style.display = "inline";
      });
    }
    
    // Manually set previous active/rest bar to full length to prevent slivers of incomplete
    // progress bars.
    if (barTransition) {
      if (isFinished) {
        document.getElementsByClassName("active-bar")[currentInterval - 1].style.width = "100%";    
      } else {
        if (!isResting) {
          document.getElementsByClassName("rest-bar")[currentInterval - 2].style.width = "100%";
        } else {
          document.getElementsByClassName("active-bar")[currentInterval - 1].style.width = "100%";      
        }
      }
    }

    // Update progress bars.
    if (isStarted && !isFinished) {
      if (!isResting) {
        let progress = (((activeSec - currentSec) / activeSec) * 100) + "%";
        document.getElementsByClassName("active-bar")[currentInterval - 1].style.width = progress;
      } else {
        let progress = (((restSec - currentSec) / restSec) * 100) + "%";
        document.getElementsByClassName("rest-bar")[currentInterval - 1].style.width = progress;
      }
    }

    // Disable Start button once finished.
    if (isFinished) {
      document.getElementById("start-btn").setAttribute("disabled", true);
      document.getElementById("start-btn").innerHTML = "Start";
    }
  }
}

function playBeepCountdown(beepNo) {
  if (beepNo <= beepCounter) {
    beepCountdown.play();
    }

  beepCounter = beepNo - 1;
}

function startTimer() {
  isRunning = true;
  isFinished = false;

  document.getElementById("pause-btn").style.display = "inline";
  document.getElementById("start-btn").style.display = "none";
  document.getElementById("start-btn").innerHTML = "Resume";
  document.getElementById("start-btn").classList.add("start-btn-resume");
  document.getElementById("reset-btn").setAttribute("disabled", true);
  disableInputs();

  timePoint = new Date().getTime();
}

function pauseTimer() {
  isRunning = false;

  document.getElementById("pause-btn").style.display = "none";
  document.getElementById("start-btn").style.display = "inline";
  document.getElementById("reset-btn").removeAttribute("disabled");
  enableInputs();
}

function resetTimer() {
  initialize();
}

function handleIntervalInput(e) {
  changeIntervalNo(e.target.value);
}

function decreaseIntervalNo() {
  changeIntervalNo(intervals-1);
}

function increaseIntervalNo() {
  changeIntervalNo(intervals+1);
}

function changeIntervalNo(value) {
  value = parseInt(value, 10);
  document.getElementById("interval-input").value = value;
  
  if (isNaN(value) || value < 1) {
    document.getElementById("interval-input").classList.add("input-error");
  } else {
    document.getElementById("interval-input").classList.remove("input-error");
    intervals = value;

    initialize();
  }
}

function handleTimeInput(e) {
  let source = e.target.id;
  let value = e.target.value;
  let totalSec = null;
  
  // Check if input matches (x)x:xx regex.
  let match = value.match(/[0-9]+:[0-9]{2}?/);
  if (match) {
    let sec = parseInt(match[0].substring(match[0].length - 2, match[0].length), 10);
    let min = parseInt(match[0].substring(0, match[0].length - 3), 10);
    if (((min * 60) + sec) == 0) {
      document.getElementById(source).classList.add("input-error");
    } else {
      totalSec = (min * 60) + sec;
    }
  } else {
    // If input doesn't match the regex, check if input is a positive number 
    // (and convert to integer).
    let parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      document.getElementById(source).classList.add("input-error");
    } else {
      totalSec = parsedValue;
    }
  }

  if (totalSec != null) {
    document.getElementById(source).value = formatTimeInput(totalSec);
    document.getElementById(source).classList.remove("input-error");
    
    if (source === "active-time-input") {
      activeSec = totalSec;
    } else if (source === "rest-time-input") {
      restSec = totalSec;
    }
    
    initialize();
  }
}

function formatTimeInput(totalSec) {
  let min = Math.floor(totalSec / 60);
  let sec = totalSec % 60;
  return (sec < 10) ? (min + ":0" + sec) : (min + ":" + sec);
}

function disableInputs(){
  let inputs = document.getElementsByTagName("input");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].setAttribute("disabled", true);
  }

  document.getElementById("interval-minus-btn").setAttribute("disabled", true);
  document.getElementById("interval-plus-btn").setAttribute("disabled", true);
}

function enableInputs(){
  let inputs = document.getElementsByTagName("input");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].removeAttribute("disabled");
  }

  document.getElementById("interval-minus-btn").removeAttribute("disabled");
  document.getElementById("interval-plus-btn").removeAttribute("disabled");
}

function formatClockOutput(totalSec) {
  let min = Math.floor(totalSec / 60);
  // Rounding *down* the seconds to first decimal place so that when a new 5.0 sec interval
  // show ups on the clock, it shows up as as 4.9 immediatelly instead of flickering as 5.0
  // for one tick.
  let sec = (Math.floor((totalSec % 60) * 10) / 10).toFixed(1);
  let time = "";

  if (min < 10) {
    time += ("0" + min);
  } else {
    time += min;
  }

  time += ":";

  if (sec < 10) {
    time += ("0" + sec);
  } else {
    time += sec;
  }

  let clockMinSec = time.substring(0, time.length -2);
  let clockMillisec = time.substring(time.length - 2, time.length);

  return [clockMinSec, clockMillisec];
}


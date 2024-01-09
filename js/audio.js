let context;
let bufferLoader;
let gainNode;
let audioPaused = false;
let vol;
let muted;
let audioAssets = [
      '../sounds/pacman_beginning.mp3',
      '../sounds/pacman_death.mp3',
      '../sounds/eat_down.mp3',
      '../sounds/eat_up.mp3',
      '../sounds/pacman_siren.mp3'
    ]

const DEATH_SOUND = 1;
const SIREN = 4;
const BEGINNING = 0;
const EAT_DOWN = 2;
const EAT_UP = 3;

function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  let request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  let loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        //console.log(`Loaded sound ${loader.loadCount+1} of ${loader.urlList.length}: ${loader.urlList[index]}`);
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i) {
    this.loadBuffer(this.urlList[i], i);
  }
}

function initSounds() {
  console.log("Loading Sounds");
  // Fix up prefixing
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
  gainNode = context.createGain();

  bufferLoader = new BufferLoader(
    context,
    audioAssets,
    finishedLoadingAudio
    );

  bufferLoader.load();
  gainNode.connect(context.destination);
}

function finishedLoadingAudio(bufferList) {
  if (!mute.muted)
    gainNode.gain.value = document.getElementById("volume").value/100;
}

function playPause() {
  if (audioPaused) {
    context.resume();
  } else {
    context.suspend();
  }
  audioPaused = !audioPaused;

}

function playSound(buffer, loop = false) {
  let audioBuffer;
  
  if (typeof buffer === 'number') {
    audioBuffer = bufferLoader.bufferList[buffer];
  } else {
    audioBuffer = buffer;
  }

  if (!audioPaused) {
    let source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(gainNode);
    source.loop = loop;
    source.start(0);
    return source;
  }
  
}

function mute() {
  if (!muted) {
    vol = gainNode.gain.value;
    gainNode.gain.value = 0;
    document.getElementById("mute").src = "../images/Mute.png";
  } else {
    gainNode.gain.value = vol;
    document.getElementById("mute").src = "../images/Volume.png";
  }
  
  muted = !muted;
  document.getElementById("volume").disabled = muted;

}

// Set the volume of the sounds as fraction of 100
function volume(value) {
  gainNode.gain.value = value*value;
}


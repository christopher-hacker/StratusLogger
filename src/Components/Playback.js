import React from "react";
import {
  Play,
  Pause,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Clock,
  Download,
} from "react-feather";

class PlaybackButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hover: false };
    this.onClick = (e) => {
      e.preventDefault();
      this.props.onClick();
    };
  }

  handleMouseIn() {
    this.setState({ hover: true });
  }

  handleMouseOut() {
    this.setState({ hover: false });
  }

  render() {
    const tooltipStyle = {
      display: this.state.hover ? "block" : "none",
    };

    let className = "editor-button";
    if (this.props.active) {
      className += " editor-active-button";
    }
    let Icon = this.props.icon;
    return (
      <div
        className="button-wrapper"
        onMouseOver={this.handleMouseIn.bind(this)}
        onMouseOut={this.handleMouseOut.bind(this)}
      >
        <div className="shortcut-help-tooltip" style={tooltipStyle}>
          <span className="shortcut-action">{this.props.shortcutAction}</span>
          {this.props.shortcutHelp ? (
            <div>
              <span className="shortcut-help">
                {this.state.hover ? "(" + this.props.shortcutHelp + ")" : null}
              </span>
            </div>
          ) : null}
        </div>
        <Icon className={className} onClick={this.onClick} />
      </div>
    );
  }
}

class PlaybackInterface {
  constructor() {
    var els = document.querySelectorAll(".btn-transport"),
      labels = [
        "back1",
        "back10",
        "rewind",
        "playPause",
        "fastForward",
        "forward10",
        "forward1",
      ];

    els.forEach((el) => {
      el.addEventListener("click", () => {
        this.broadcastStatus();
      });
    });

    this.buttons = {};
    this.actions = {};
    els.forEach((el, i) => {
      let label = labels[i];
      this.buttons[label] = el;
      this.actions[label] = () => {
        this.broadcastStatus();
        el.click();
      };
    });

    // override play button to skip back on play
    this.togglePlayback = this.actions.playPause;
    this.actions.playPause = () => {
      if (this.isPlaying() && !this.isAtStart()) {
        var timestampDate = this.getCurrentTimestampDate();
        timestampDate = new Date(timestampDate - 1000);
        var timestampString =
          "(" +
          String(timestampDate.getHours()).padStart(2, "0") +
          ":" +
          String(timestampDate.getMinutes()).padStart(2, "0") +
          ":" +
          String(timestampDate.getSeconds()).padStart(2, "0") +
          ",00" +
          ")";
        this.jumpToTime(timestampString);
        // await video load
        var loaded = setInterval(() => {
          if (document.querySelectorAll(".spinner-outer").length == 0) {
            this.togglePlayback();
            clearInterval(loaded);
          }
        }, 50);
      } else {
        this.togglePlayback();
      }
    };
  }

  jumpToTime(timestampString) {
    if (this.isPlaying()) {
      this.togglePlayback();
    }
    let el = this.getTimestampEl();
    // drop the parentheses
    el.value = timestampString.slice(1, -1);
    // blur event triggers jump in player
    el.dispatchEvent(new KeyboardEvent("blur"));
  }

  broadcastStatus() {
    if (this.isPlaying()) {
      window.postMessage({
        source: "__stratus_logger_extension__",
        playerStatus: "playing",
      });
    } else {
      window.postMessage({
        source: "__stratus_logger_extension__",
        playerStatus: "paused",
      });
    }
  }

  getCurrentTimestampDate(which = "playback") {
    var date = new Date(),
      timestampText = this.getTimestampText((which = which)),
      pat = /(\d\d):(\d\d):(\d\d)/g,
      m = pat.exec(timestampText),
      timestampVals = {
        h: Number(m[1]),
        m: Number(m[2]),
        s: Number(m[3]),
      };

    date.setHours(timestampVals.h);
    date.setMinutes(timestampVals.m);
    date.setSeconds(timestampVals.s);
    return date;
  }

  getTimestampEl(which = "playback") {
    if (which !== "playback" && which !== "start") {
      throw TypeError(
        "which must be 'playback' or 'start', not '" + which + "'"
      );
    }

    return document
      .querySelectorAll(".timecode-control")
      [which == "playback" ? 1 : 0].querySelector("input");
  }

  getTimestampText(which = "playback") {
    var text = this.getTimestampEl((which = which)).value,
      pat = /\d\d:\d\d:\d\d(?=\,\d\d)/,
      // drop the timestamp
      timestampText = pat.exec(text)[0];
    return timestampText;
  }

  isPlaying() {
    return document.querySelectorAll(".btn-play").length > 0;
  }

  isAtStart() {
    return (
      this.getTimestampEl("start").value ==
      this.getTimestampEl("playback").value
    );
  }
}

class PlayPause extends React.Component {
  constructor() {
    super();
    this.state = { paused: true, hover: false };
  }

  didReceiveMessage(event) {
    var msg = event.data;
    if (msg.source == "__stratus_logger_extension__") {
      switch (msg.playerStatus) {
        case "paused":
          this.setState({ paused: true });
          break;
        case "playing":
          this.setState({ paused: false });
          break;
        default:
          break;
      }
    }
  }

  componentDidMount() {
    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      this.didReceiveMessage(event);
    });
  }

  handleMouseIn() {
    this.setState({ hover: true });
  }

  handleMouseOut() {
    this.setState({ hover: false });
  }

  render() {
    let icon;
    if (this.state.paused) {
      icon = (
        <Play
          className="editor-button"
          onClick={this.props.playbackInterface.actions.playPause}
        />
      );
    } else {
      icon = (
        <Pause
          className="editor-button"
          onClick={this.props.playbackInterface.actions.playPause}
        />
      );
    }
    const tooltipStyle = {
      display: this.state.hover ? "block" : "none",
    };
    return (
      <div
        className="button-wrapper"
        onMouseOver={this.handleMouseIn.bind(this)}
        onMouseOut={this.handleMouseOut.bind(this)}
      >
        <div className="shortcut-help-tooltip" style={tooltipStyle}>
          <span className="shortcut-action">{this.props.shortcutAction}</span>
          <br />
          <span className="shortcut-help">
            {"(" + this.props.shortcutHelp + ")"}
          </span>
        </div>
        {icon}
      </div>
    );
  }
}

class PlaybackControls extends React.Component {
  constructor(props) {
    super(props);
    this.playbackInterface = new PlaybackInterface();
    this.getTimestamp = this.getTimestamp.bind(this);
  }

  componentDidMount() {
    // set up keyboard shortcuts
    document.addEventListener("keyup", (e) => {
      this.onKeyUp(e);
    });
  }

  getTimestamp() {
    var date = this.playbackInterface.getCurrentTimestampDate();
    if (!this.playbackInterface.isPlaying()) {
      date = date - 1000;
    } else {
      date = date - 0;
    }
    date = new Date(date);
    var destinationTimestamp =
      String(date.getHours()).padStart(2, "0") +
      ":" +
      String(date.getMinutes()).padStart(2, "0") +
      ":" +
      String(date.getSeconds()).padStart(2, "0");
    this.props.insertText("(" + destinationTimestamp + ") ");
  }

  onKeyUp(e) {
    var self = this;
    var capturedEvent = (function () {
      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        switch (e.keyCode) {
          case 74: // J
            self.getTimestamp();
            return true;
        }
      }
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        switch (e.keyCode) {
          case 49: // 1
            self.playbackInterface.actions.back10();
            return true;
          case 50: // 2
            self.playbackInterface.actions.rewind();
            return true;
          case 51: // 3
            self.playbackInterface.actions.fastForward();
            return true;
          case 52: // 4
            self.playbackInterface.actions.forward10();
            return true;
        }
      }
      if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.keyCode === 27) {
        self.playbackInterface.actions.playPause();
        return true;
      }
    })();
    if (capturedEvent === true) {
      return false;
    }
  }

  render() {
    return (
      <div className="playback-controls">
        <PlaybackButton
          icon={Download}
          onClick={this.props.downloadAsDoc}
          shortcutAction="download as word document"
        />
        <PlaybackButton
          icon={Clock}
          onClick={this.getTimestamp}
          shortcutHelp="ctrl + J"
          shortcutAction="insert timestamp"
        />
        <PlaybackButton
          icon={SkipBack}
          onClick={this.playbackInterface.actions.back10}
          shortcutHelp="alt + 1"
          shortcutAction="skip back"
        />
        <PlaybackButton
          icon={Rewind}
          onClick={this.playbackInterface.actions.rewind}
          shortcutHelp="alt + 2"
          shortcutAction="rewind"
        />
        <PlayPause
          playbackInterface={this.playbackInterface}
          shortcutHelp="esc"
          shortcutAction="play"
        />
        <PlaybackButton
          icon={FastForward}
          onClick={this.playbackInterface.actions.fastForward}
          shortcutHelp="alt + 3"
          shortcutAction="fast forward"
        />
        <PlaybackButton
          icon={SkipForward}
          onClick={this.playbackInterface.actions.forward10}
          shortcutHelp="alt + 4"
          shortcutAction="skip forward"
        />
      </div>
    );
  }
}

export { PlaybackControls, PlaybackInterface };

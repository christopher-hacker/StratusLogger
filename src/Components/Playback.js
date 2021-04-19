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
          <br />
          <span className="shortcut-help">
            {this.state.hover ? "(" + this.props.shortcutHelp + ")" : null}
          </span>
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
        this.checkStatus();
      });
    });

    this.buttons = {};
    this.actions = {};
    els.forEach((el, i) => {
      let label = labels[i];
      this.buttons[label] = el;
      this.actions[label] = () => {
        this.checkStatus();
        el.click();
      };
    });
  }

  checkStatus() {
    if (document.querySelectorAll(".btn-play").length > 0) {
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

  getTimestampEl() {
    return document
      .querySelectorAll(".timecode-control")[1]
      .querySelector("input");
  }

  getTimestampText() {
    var text = this.getTimestampEl().value,
      pat = /\d\d:\d\d:\d\d(?=\,\d\d)/,
      // drop the timestamp
      timestampText = pat.exec(text)[0];
    return timestampText;
  }

  jumpToTime(timestampString) {
    let el = this.getTimestampEl();
    // drop the parentheses
    el.value = timestampString.slice(1, -1);
    // trigger jump in player
    el.dispatchEvent(new KeyboardEvent("blur"));
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
    this.props.insertText(
      "(" + this.playbackInterface.getTimestampText() + ") "
    );
  }

  onKeyUp(e) {
    if (e.ctrlKey && e.keyCode == 74) {
      this.getTimestamp();
    } else if (e.ctrlKey && e.shiftKey && e.keyCode == 68) {
      this.props.downloadAsDoc();
    } else if (e.ctrlKey) {
      // no other shortcuts ust ctrl
      return;
    } else if (e.keyCode == 27) {
      this.playbackInterface.actions.playPause();
    } else if (e.altKey) {
      // all other shortcuts use alt
      if (e.keyCode == 49) {
        this.playbackInterface.actions.back10();
      } else if (e.keyCode == 50) {
        this.playbackInterface.actions.rewind();
      } else if (e.keyCode == 51) {
        this.playbackInterface.actions.fastForward();
      } else if (e.keyCode == 52) {
        this.playbackInterface.actions.forward10();
      }
    }
  }

  render() {
    return (
      <div className="playback-controls">
        <PlaybackButton
          icon={Download}
          onClick={this.props.downloadAsDoc}
          shortcutHelp="ctrl + shift + D"
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

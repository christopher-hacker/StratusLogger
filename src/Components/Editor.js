/*global chrome*/

import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
  CompositeDecorator,
} from "draft-js";
import React from "react";
import {
  Bold,
  Italic,
  Underline,
  Play,
  Pause,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Clock,
} from "react-feather";
import "./editor.css";
import "draft-js/dist/Draft.css";

class Logger extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = (editorState) => {
      const raw = convertToRaw(editorState.getCurrentContent());
      this.saveEditorContent(raw);
      this.setState({ editorState });
    };
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.insertText = this.insertText.bind(this);
    this.compositeDecorator = new CompositeDecorator([
      {
        strategy: timestampStrategy,
        component: TimestampSpan,
      },
    ]);

    this.state = {
      editorState: EditorState.createEmpty(this.compositeDecorator),
    };
  }

  componentDidMount() {
    var slug = this.getSlug();
    this.getSavedEditorData((savedData) => {
      if (Object.keys(savedData).includes(slug)) {
        var contentState = savedData[slug],
          editorState = EditorState.createWithContent(
            convertFromRaw(contentState)
          );

        editorState = EditorState.set(editorState, {
          decorator: this.compositeDecorator,
        });

        this.setState({
          editorState: editorState,
        });
      } else {
        return null;
      }
    });
  }

  saveEditorContent(data) {
    var slug = this.getSlug(),
      obj = {};

    obj[slug] = data;
    chrome.storage.local.set(obj, () => {});
  }

  getSavedEditorData(_callback) {
    var slug = this.getSlug();

    chrome.storage.local.get(slug, (savedData) => {
      if (savedData == null) {
        return null;
      } else {
        return _callback(savedData);
      }
    });
  }

  getSlug() {
    return document.querySelector("div.name-section > .ng-star-inserted")
      .innerText;
  }

  handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      this.onChange(newState);
      return "handled";
    }

    return "not-handled";
  }

  toggleInlineStyle = (inlineStyle) => {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle)
    );
  };

  insertText(text) {
    const newEditorState = EditorState.set(
      insertAtCursor(text, this.state.editorState),
      { decorator: this.compositeDecorator }
    );
    this.setState({
      editorState: newEditorState,
    });
  }

  render() {
    return (
      <div className="logger-wrapper">
        <div className="logger-toolbar">
          <div class="editor-controls">
            <InlineStyleControls
              editorState={this.state.editorState}
              onToggle={this.toggleInlineStyle}
            />
            <div class="editor-controls right">
              <PlaybackControls
                editorState={this.state.editorState}
                insertText={this.insertText}
              />
            </div>
          </div>
        </div>
        <div className="logger-editor-wrapper">
          <Editor
            editorState={this.state.editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
          />
        </div>
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

  getTimestamp() {
    this.props.insertText("(" + this.playbackInterface.getTimestamp() + ") ");
  }

  render() {
    return (
      <div className="playback-controls">
        <PlaybackButton icon={Clock} onClick={this.getTimestamp} />
        <PlaybackButton
          icon={SkipBack}
          onClick={this.playbackInterface.actions.back10}
        />
        <PlaybackButton
          icon={Rewind}
          onClick={this.playbackInterface.actions.rewind}
        />
        <PlayPause playbackInterface={this.playbackInterface} />
        <PlaybackButton
          icon={FastForward}
          onClick={this.playbackInterface.actions.fastForward}
        />
        <PlaybackButton
          icon={SkipForward}
          onClick={this.playbackInterface.actions.forward10}
        />
      </div>
    );
  }
}

class PlaybackButton extends React.Component {
  constructor() {
    super();
    this.onClick = (e) => {
      e.preventDefault();
      this.props.onClick();
    };
  }
  render() {
    let className = "editor-button";
    if (this.props.active) {
      className += " editor-active-button";
    }
    let Icon = this.props.icon;
    return <Icon className={className} onClick={this.onClick} />;
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

  getTimestamp() {
    return this.getTimestampEl().value;
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
    this.state = { paused: true };
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
  render() {
    if (this.state.paused) {
      return (
        <Play
          className="editor-button"
          onClick={this.props.playbackInterface.actions.playPause}
        />
      );
    } else {
      return (
        <Pause
          className="editor-button"
          onClick={this.props.playbackInterface.actions.playPause}
        />
      );
    }
  }
}

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }
  render() {
    let className = "editor-button";
    if (this.props.active) {
      className += " editor-active-button";
    }
    let Icon = this.props.icon;
    return <Icon className={className} onMouseDown={this.onToggle} />;
  }
}

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return INLINE_STYLES.map((type) => (
    <StyleButton
      key={type.label}
      active={currentStyle.has(type.style)}
      label={type.label}
      icon={type.icon}
      onToggle={props.onToggle}
      style={type.style}
    />
  ));
};

var INLINE_STYLES = [
  { label: "Bold", style: "BOLD", icon: Bold },
  { label: "Italic", style: "ITALIC", icon: Italic },
  { label: "Underline", style: "UNDERLINE", icon: Underline },
];

function insertAtCursor(text, editorState, data) {
  const currentContent = editorState.getCurrentContent(),
    currentSelection = editorState.getSelection();

  const newContent = Modifier.replaceText(
    currentContent,
    currentSelection,
    text
  );

  const newEditorState = EditorState.push(
    editorState,
    newContent,
    "insert-characters"
  );

  return EditorState.forceSelection(
    newEditorState,
    newContent.getSelectionAfter()
  );
}

const TIMESTAMP_REGEX = /\(\d\d:\d\d:\d\d,\d\d\)/g;

function timestampStrategy(contentBlock, callback, contentState) {
  findWithRegex(TIMESTAMP_REGEX, contentBlock, callback);
}

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

class TimestampSpan extends React.Component {
  constructor(props) {
    super(props);
    this.playbackInterface = new PlaybackInterface();
  }

  jumpToTime(timestampString) {
    this.playbackInterface.jumpToTime(timestampString);
  }

  render() {
    return (
      <span
        className="timestamp"
        data-offset-key={this.props.offsetKey}
        onClick={() => {
          let timestampString = this.props.children[0].props.text;
          this.jumpToTime(timestampString);
        }}
      >
        {this.props.children}
      </span>
    );
  }
}

export { Logger };

/*global chrome*/

import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import React from "react";
import { Bold, Chrome, Italic, Underline } from "react-feather";
import "./editor.css";
import "draft-js/dist/Draft.css";

class Logger extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editorState: EditorState.createEmpty() };
    this.onChange = (editorState) => {
      const raw = convertToRaw(editorState.getCurrentContent());
      this.saveEditorContent(raw);
      this.setState({ editorState });
    };
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
  }

  componentDidMount() {
    var slug = this.getSlug();
    this.getSavedEditorData((savedData) => {
      if (Object.keys(savedData).includes(slug)) {
        var contentState = savedData[slug];
        this.setState({
          editorState: EditorState.createWithContent(
            convertFromRaw(contentState)
          ),
        });
      } else {
        return null;
      }
      // if (rawEditorData !== null) {
      //   var contentState = convertFromRaw(rawEditorData),
      //   this.setState({
      //     editorState: EditorState.createWithContent(contentState),
      //   });
      // }
    });
  }

  saveEditorContent(data) {
    var slug = this.getSlug(),
      obj = {};

    obj[slug] = data;
    chrome.storage.local.set(obj, () => {});
    // localStorage.setItem("editorData", JSON.stringify(data));
  }

  getSavedEditorData(_callback) {
    // const savedData = localStorage.getItem("editorData");
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

  render() {
    return (
      <div className="logger-wrapper">
        <div className="logger-toolbar">
          <InlineStyleControls
            editorState={this.state.editorState}
            onToggle={this.toggleInlineStyle}
          />
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

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }
  render() {
    let className = "RichEditor-styleButton";
    if (this.props.active) {
      className += " RichEditor-activeButton";
    }
    let Icon = this.props.icon;
    return (
      // <span className={className} onMouseDown={this.onToggle}>
      //   {this.props.label}
      // </span>
      <Icon className={className} onMouseDown={this.onToggle} />
    );
  }
}

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map((type) => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          icon={type.icon}
          onToggle={props.onToggle}
          style={type.style}
        />
      ))}
    </div>
  );
};

var INLINE_STYLES = [
  { label: "Bold", style: "BOLD", icon: Bold },
  { label: "Italic", style: "ITALIC", icon: Italic },
  { label: "Underline", style: "UNDERLINE", icon: Underline },
];

export default Logger;

/*global chrome*/
import { PlaybackControls } from "./Playback";
import InlineStyleControls from "./InlineStyle";
import { TimestampSpan, timestampStrategy } from "./Timestamp";
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
import "./logger.css";
import "draft-js/dist/Draft.css";

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

function exportAsDoc(element, filename = "") {
  var preHtml =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>",
    postHtml = "</body></html>",
    html = preHtml + element.innerHTML + postHtml,
    blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });

  var url =
    "data:application/vnd.ms-word;charset=utf-8," + encodeURIComponent(html);

  filename = filename ? filename + ".doc" : "document.doc";

  var downloadLink = document.createElement("a");

  document.body.appendChild(downloadLink);

  if (navigator.msSaveOrOpenBlob) {
    navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    downloadLink.href = url;
    downloadLink.download = filename;
    downloadLink.click();
  }

  document.body.removeChild(downloadLink);
}

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
    this.downloadAsDoc = this.downloadAsDoc.bind(this);
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
        var contentState = savedData[slug];

        // replace any instances of old timestamp format with new one
        for (var i = 0; i < contentState.blocks.length; i++) {
          contentState.blocks[i].text = contentState.blocks[i].text.replaceAll(
            /(?<=\(\d\d:\d\d:\d\d)(,\d\d)(?=\))/g,
            ""
          );
        }

        var editorState = EditorState.createWithContent(
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

      document.addEventListener("keyup", (e) => {
        this.onKeyUp(e);
      });
    });
  }

  onKeyUp(e) {
    if (e.keyCode == 13) {
      var blocks = document
          .querySelector(".public-DraftEditor-content > div")
          .querySelectorAll(
            ".public-DraftStyleDefault-block.public-DraftStyleDefault-ltr"
          ),
        currentBlockIndex = this.state.editorState
          .getCurrentContent()
          .getBlockMap()
          .keySeq()
          .findIndex(
            (k) => k === this.state.editorState.getSelection().getStartKey()
          ),
        currentBlock = blocks[currentBlockIndex],
        wrapper = document.querySelector(".logger-editor-wrapper");

      if (
        currentBlock.getBoundingClientRect().bottom >
        wrapper.getBoundingClientRect().bottom
      ) {
        wrapper.scrollTop = wrapper.scrollHeight;
      }
    }
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
    // override cmd + j so I can use it for timestamps
    if (command == "code") {
      return;
    }

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

  downloadAsDoc() {
    exportAsDoc(document.querySelector(".DraftEditor-root"), this.getSlug());
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
                downloadAsDoc={this.downloadAsDoc}
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

export { Logger };

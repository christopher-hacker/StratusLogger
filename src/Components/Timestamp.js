import React from "react";
import { PlaybackInterface } from "./Playback";

const TIMESTAMP_REGEX = /\(\d\d:\d\d:\d\d,\d\d\)/g;

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

function timestampStrategy(contentBlock, callback, contentState) {
  findWithRegex(TIMESTAMP_REGEX, contentBlock, callback);
}

class TimestampSpan extends React.Component {
  constructor(props) {
    super(props);
    this.playbackInterface = new PlaybackInterface();
  }

  render() {
    return (
      <span
        className="timestamp"
        data-offset-key={this.props.offsetKey}
        onClick={() => {
          let timestampString = this.props.children[0].props.text;
          console.log(this.playbackInterface);
          this.playbackInterface.jumpToTime(timestampString);
        }}
      >
        {this.props.children}
      </span>
    );
  }
}

export { TimestampSpan, timestampStrategy };

import { Bold, Italic, Underline } from "react-feather";
import React from "react";

var INLINE_STYLES = [
  { label: "Bold", style: "BOLD", icon: Bold },
  { label: "Italic", style: "ITALIC", icon: Italic },
  { label: "Underline", style: "UNDERLINE", icon: Underline },
];

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

export default InlineStyleControls;

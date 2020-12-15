import React from "react";
import { X, Minimize2, Maximize2, Edit3 } from "react-feather";
import { Logger } from "./Components/Editor";
import "./App.css";

const iconSVG =
  "data:image/svg+xml;utf8,<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-pencil-square' fill='white' xmlns='http://www.w3.org/2000/svg'><path d='M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z'/><path fill-rule='evenodd' d='M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z'/></svg>";

class OpenButton extends React.Component {
  render() {
    return (
      <a
        href="#"
        className="ng-tns-c44-127 ng-star-inserted"
        style={{ padding: "4px 10px 2px" }}
        onClick={() => {
          window.postMessage({
            source: "__stratus_logger_extension__",
            action: "showOverlay",
          });
        }}
      >
        <div className="menu-item-content flex-row-centerd">
          <div className="menu-icon-outer">
            <img
              className="ng-tns-c44-127 ng-star-inserted"
              src={iconSVG}
              style={{
                width: "16px",
                height: "16px",
                verticalAlign: "initial",
                flexShrink: 0,
                display: "block",
              }}
            ></img>
          </div>
          <div className="menu-text flex-grow" style={{ padding: "0px 5px" }}>
            <span className="ng-tns-c44-127">Transcription</span>
          </div>
          <div class="menu-arrow" style={{ visibility: "hidden" }}>
            <span className="caret caret-right"></span>
          </div>
        </div>
      </a>
    );
  }
}

class PanelNavbarTitle extends React.Component {
  render() {
    return (
      <div className="transcription-navbar-title">
        <Edit3 />
        <span>Transcription</span>
      </div>
    );
  }
}

class PanelNavbar extends React.Component {
  render() {
    if (!this.props.minimized) {
      return (
        <div className="transcription-navbar">
          <PanelNavbarTitle />
          <X
            className="transcription-window-actions"
            onClick={() => {
              window.postMessage({
                source: "__stratus_logger_extension__",
                action: "closeOverlay",
              });
            }}
          />
          <Minimize2
            className="transcription-window-actions"
            onClick={() => {
              window.postMessage({
                source: "__stratus_logger_extension__",
                action: "minimizeOverlay",
              });
            }}
          />
        </div>
      );
    } else {
      return (
        <div className="transcription-navbar">
          <PanelNavbarTitle />
          <X
            className="transcription-window-actions"
            onClick={() => {
              window.postMessage({
                source: "__stratus_logger_extension__",
                action: "closeOverlay",
              });
            }}
          />
          <Maximize2
            className="transcription-window-actions"
            onClick={() => {
              window.postMessage({
                source: "__stratus_logger_extension__",
                action: "maximizeOverlay",
              });
            }}
          />
        </div>
      );
    }
  }
}

class OverlayPanel extends React.Component {
  constructor() {
    super();
    this.state = { open: false, minimized: false };
  }

  didReceiveMessage(event) {
    var msg = event.data;
    if (msg.source == "__stratus_logger_extension__") {
      switch (msg.action) {
        case "showOverlay":
          this.setState({ open: true });
          break;
        case "closeOverlay":
          this.setState({ open: false, minimized: false });
          break;
        case "minimizeOverlay":
          this.setState({ open: false, minimized: true });
          break;
        case "maximizeOverlay":
          this.setState({ open: true, minimized: false });
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
    if (this.state.open) {
      return (
        <div className="transcription-overlay-panel">
          <PanelNavbar minimized={false} />
          <Logger />
        </div>
      );
    } else if (this.state.minimized) {
      return (
        <div
          className="transcription-overlay-panel minimized"
          style={{
            top: this.props.parent.getBoundingClientRect().height - 32 + "px",
          }}
        >
          <PanelNavbar minimized={true} />
        </div>
      );
    } else {
      return null;
    }
  }
}

export { OpenButton, OverlayPanel };

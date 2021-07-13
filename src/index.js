import React from "react";
import ReactDOM from "react-dom";
import "./App.css";
import { OpenButton, OverlayPanel } from "./App.js";

window.addEventListener("load", () => {
  doSetup();
});

function doSetup() {
  var playerExists = setInterval(() => {
    if (document.querySelector("logon") === null) {
      // render if in a player window
      if (document.querySelector("dynamic-player") != null) {
        var actionsDropdown = document.querySelector(
          "button[automation-id='button-actions']"
        );
        actionsDropdown.addEventListener("click", () => {
          var openWithDropdown =
              document.querySelectorAll("ul.dropdown-menu")[1],
            li = document.createElement("li"),
            classes = ["menu-item", "ng-tns-c44-198", "ng-star-inserted"];
          li.classList.add(...classes);
          li.setAttribute("id", "open-transcription");
          openWithDropdown.appendChild(li);
          ReactDOM.render(<OpenButton />, li);
        });

        // render the overlay inside the asset list parent element
        var assetListContainer = document.querySelector(
            "div[automation-id='panel-assetlist']"
          ),
          container = document.createElement("div"),
          child = assetListContainer.childNodes[0];

        container.classList.add("transcription-panel-container");
        assetListContainer.removeChild(child);
        assetListContainer.appendChild(container);
        assetListContainer.appendChild(child);
        ReactDOM.render(
          <OverlayPanel parent={assetListContainer} />,
          container
        );
        clearInterval(playerExists);
      }
    }
  }, 100);
}

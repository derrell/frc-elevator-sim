/*
 * Copyright: 2021 Derrell Lipman
 *
 * License: MIT license
 *
 * Authors: Derrell Lipman (derrell) derrell.lipman@unwireduniverse.com
 */


/**
 * @asset(elevatorSim/*)
 * @asset(devEnv/*)
 * @ignore Blockly
 */
qx.Class.define("elevatorSim.Application",
{
  extend : qx.application.Standalone,

  members :
  {
    _blockly : null,

    main : function()
    {
      let             doc;
      let             font;
      let             label;
      let             container;
      let             scriptLoader;
      let             elevatorCanvas;

      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        let appender;

        appender = qx.log.appender.Native;
        appender = qx.log.appender.Console;
      }

      doc = this.getRoot();

      // Add the title
      label = new qx.ui.basic.Label("Elevator Subsystem Simulator");
      font = new qx.bom.Font();
      font.set(
        {
          size   : 20,
          bold   : true,
          family : [ "sans-serif" ]
        });
      label.setFont(font);
      doc.add(label, { top : 30, left : 10 });

      // Create the container to house the Blockly editor and elevator simulator
      container = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      doc.add(container, { edge : 10, top : 60 });

      // Await messages from Blockly
      window.addEventListener(
        "message",
        (event) =>
        {
          console.log("Application received message:", event);
        });

      // Add the Blockly editor
      this._blockly = new qx.ui.embed.Iframe("resource/devEnv/blockly.html");
      container.add(this._blockly, { flex : 1 });

      // Send a message to Blockly
      setTimeout(
        () =>
        {
          this._blockly.getWindow().postMessage("back at you!", "*");
        },
        1000);

      // Add the elevator simulator
      elevatorCanvas = new elevatorSim.Elevator();
      container.add(elevatorCanvas);
    }
  },

  statics :
  {
    TOOLBOX :
    {
      "kind": "categoryToolbox",
      "contents": [
        {
          "kind": "category",
          "name": "Control",
          "contents": [
            {
              "kind": "block",
              "type": "controls_if"
            },
            {
              "kind": "block",
              "type": "controls_whileUntil"
            },
            {
              "kind": "block",
              "type": "controls_for"
            }
          ]
        },
        {
          "kind": "category",
          "name": "Logic",
          "contents": [
            {
              "kind": "block",
              "type": "logic_compare"
            },
            {
              "kind": "block",
              "type": "logic_operation"
            },
            {
              "kind": "block",
              "type": "logic_boolean"
            }
          ]
        }
      ]
    }
  }
});

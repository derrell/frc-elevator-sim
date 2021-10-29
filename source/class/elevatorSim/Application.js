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
var enabledPeriodicInterval;  // global to allow eval()'ed code to use

qx.Class.define("elevatorSim.Application",
{
  extend : qx.application.Standalone,

  members :
  {
    _blockly : null,
    _enabled : null,

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

      // Create the Enabled checkbox
      this._enabled = new qx.ui.form.CheckBox("Enabled");
      this._enabled.addListener(
        "changeValue",
        (e) =>
        {
          this._blockly.getWindow().postMessage(
            {
              type  : "control",
              name  : "enabled",
              value : e.getData()
            },
            "*");

          if (! e.getData())
          {
            clearInterval(enabledPeriodicInterval);
            elevatorSim.Elevator.getInstance().setVelocity(0);
          }
        });
      doc.add(this._enabled, { top : 30, right : 320 });

      // Create the container to house the Blockly editor and elevator simulator
      container = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      doc.add(container, { edge : 10, top : 60 });

      // Await messages from Blockly
      window.addEventListener(
        "message",
        (event) =>
        {
          let             code;

          console.log("Application received message:", event);

          switch(event.data.type)
          {
          case "control" :
            switch(event.data.name)
            {
            case "run" :
              code =
                [
                  "elevatorSim.Elevator.getInstance().reinit();",
                  "do_initially();",
                  event.data.value,
                  "enabledPeriodicInterval = setInterval(do_periodically, 50);"
                ].join("\n");
              console.log("code to run: " + code);
              eval(code);
              break;
            }
            break;
          }
        });

      // Add the Blockly editor
      this._blockly = new qx.ui.embed.Iframe("resource/devEnv/blockly.html");
      container.add(this._blockly, { flex : 1 });

      // Add the elevator simulator
      elevatorCanvas = elevatorSim.Elevator.getInstance();
      container.add(elevatorCanvas);

      // Initially hide it
      elevatorCanvas.hide();
    },

    /**
     * Disable the simulator and Show an error message
     *
     * @param message {String}
     *   The message to be shown
     *
     * @ignore alert
     */
    error : function(message)
    {
      // Stop the simulator
      this._enabled.setValue(false);

      // Show the message
      alert(message + "\nSimulation disabled");
    }
  }
});

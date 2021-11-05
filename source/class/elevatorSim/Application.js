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
    _win        : null,
    _code       : null,
    _blockly    : null,
    _enabled    : null,
    _butExport  : null,
    _butImport  : null,
    _butShowLog : null,

    main : function()
    {
      let             doc;
      let             hBox;
      let             font;
      let             label;
      let             sheet;
      let             style;
      let             styles;
      let             appender;
      let             container;
      let             scriptLoader;
      let             elevatorCanvas;

      this.base(arguments);

      appender = qx.log.appender.Native;
      appender = qx.log.appender.Console; // this one must be last; used below
      qx.log.Logger.setLevel("info");

      // Show and then hide the console, so its styles get created
      appender.show();
      appender.toggle();

      // We need to fix up where the Console is displayed. Since the
      // Console code doesn't store the style element it creates,
      // we'll need to locate it.
      styles = document.getElementsByTagName("style");

      // The style we care about was just added, so is the last one in the list
      style = styles[styles.length - 1];

      // Get its sheet object
      sheet = style.sheet;

      // Delete the rule that places the console
      qx.bom.Stylesheet.removeRule(sheet, ".qxconsole");

      // Recreate that rule
      qx.bom.Stylesheet.addRule(
        sheet,
        ".qxconsole",
        "z-index:10000;width:600px;height:300px;bottom:0px;left:0px;position:absolute;border-right:1px solid black;color:black;border-bottom:1px solid black;color:black;font-family:Consolas,Monaco,monospace;font-size:11px;line-height:1.2;");

      // Get the top-level document root where we'll place all widgets
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

      // Create the buttons
      hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      doc.add(hBox, { top : 26, right : 450 });

      this._butExport = new qx.ui.form.Button("Export");
      hBox.add(this._butExport);
      this._butExport.addListener(
        "execute",
        () =>
        {
          const copyToClipboard =
            str =>
              {
                const el = document.createElement('textarea');
                el.value = str;
                el.setAttribute('readonly', '');
                el.style.position = 'absolute';
                el.style.left = '-9999px';
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
              };
          copyToClipboard(this._code);
          window.alert(
            "The code is now in your clipboard. " +
              "Save it someplace, and later you can Import it.");
        });

      this._butImport = new qx.ui.form.Button("Import");
      hBox.add(this._butImport);
      this._butImport.addListener("execute", this._import, this);

      // Add a spacer before the log button
      hBox.add(new qx.ui.core.Spacer(40, 1));

      this._butShowLog = new qx.ui.form.Button("Log");
      hBox.add(this._butShowLog);
      this._butShowLog.addListener(
        "execute",
        () =>
        {
          appender.toggle();
        });

      // Create the Enabled checkbox
      this._enabled = new qx.ui.form.CheckBox("Enabled");
      this._enabled.addListener(
        "changeValue",
        (e) =>
        {
          let             elevator = elevatorSim.Elevator.getInstance();

          this._blockly.getWindow().postMessage(
            {
              type  : "control",
              name  : "enabled",
              value : e.getData()
            },
            "*");

          // Enable or disable the elevator
          elevator.setEnabled(e.getData());

          if (! e.getData())
          {
            clearInterval(enabledPeriodicInterval);
            elevator.setVelocity(0);
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

          switch(event.data.type)
          {
          case "control" :
            switch(event.data.name)
            {
            case "run" :
              code =
                [
                  "console.clear();",
                  "elevatorSim.Elevator.getInstance().reinit();",
                  "do_initially();",
                  event.data.value,
                  "enabledPeriodicInterval = setInterval(do_periodically, 50);"
                ].join("\n");
              eval(code);
              break;

            case "setEnabled" :
              this._enabled.setValue(event.data.value);
              break;

            case "codeXML" :
              this._code = event.data.value;
              break;

            case "log" :
              qx.log.Logger.info(event.data.value);
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

      // Initially there is no code
      this._code = "";
    },

    /*
     * Show a window in which the user can paste code to be imported. This
     * code, following confirmation, will replace the existing block program.
     */
    _import : function()
    {
      let             hBox;
      let             label;
      let             textArea;
      let             butImport;
      let             butCancel;

      if (! this._win)
      {
        this._win = new qx.ui.window.Window("Import");
        this._win.setPadding(10);
        this._win.setLayout(new qx.ui.layout.VBox(10));
      }

      // Clean up from last time (if there was a last time)
      this._win.removeAll();

      // Create the form
      label = new qx.ui.basic.Label(
        "Paste the previously exported code to be imported here:");
      this._win.add(label);

      textArea = new qx.ui.form.TextArea("");
      textArea.set(
        {
          width  : 400,
          height : 200
        });
      this._win.add(textArea);

      hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      this._win.add(hBox);

      // We'll center the buttons. Add the left spacer
      hBox.add(new qx.ui.core.Spacer(), { flex : 1 });

      // Add the Import button
      butImport = new qx.ui.form.Button("Import");
      hBox.add(butImport);
      butImport.addListener(
        "execute",
        () =>
        {
          if (window.confirm(
              "Are you sure you want to import this code, " +
              "which will overwrite the existing block program?"))
          {
            this._blockly.getWindow().postMessage(
              {
                type  : "control",
                name  : "load",
                value : textArea.getValue()
              },
              "*");
          }

          this._win.close();
        });

      // Add the Cancel button
      butCancel = new qx.ui.form.Button("Cancel");
      hBox.add(butCancel);
      butCancel.addListener(
        "execute",
        () =>
        {
          this._win.close();
        });

      // We'll center the buttons. Add the right spacer
      hBox.add(new qx.ui.core.Spacer(), { flex : 1 });


      this._win.center();
      this._win.open();
    },

    /**
     * Disable the simulator and Show an error message
     *
     * @param message {String}
     *   The message to be shown
     *
     * @ignore alert
     */
    showError : function(message)
    {
      // Stop the simulator
      this._enabled.setValue(false);

      // Show the message
      alert(message + "\nSimulation disabled");
    }
  }
});

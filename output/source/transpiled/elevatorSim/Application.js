(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.application.Standalone": {
        "require": true
      },
      "qx.log.appender.Native": {},
      "qx.log.appender.Console": {},
      "qx.ui.basic.Label": {},
      "qx.bom.Font": {},
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.form.Button": {},
      "qx.ui.form.CheckBox": {},
      "elevatorSim.Elevator": {},
      "qx.ui.embed.Iframe": {},
      "qx.ui.window.Window": {},
      "qx.ui.layout.VBox": {},
      "qx.ui.form.TextArea": {},
      "qx.ui.core.Spacer": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

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
  var enabledPeriodicInterval; // global to allow eval()'ed code to use

  qx.Class.define("elevatorSim.Application", {
    extend: qx.application.Standalone,
    members: {
      _win: null,
      _code: null,
      _blockly: null,
      _enabled: null,
      _butExport: null,
      _butImport: null,
      main: function main() {
        var _this = this;

        var doc;
        var hBox;
        var font;
        var label;
        var container;
        var scriptLoader;
        var elevatorCanvas;
        elevatorSim.Application.prototype.main.base.call(this); // Enable logging in debug variant

        {
          var appender;
          appender = qx.log.appender.Native;
          appender = qx.log.appender.Console;
        }
        doc = this.getRoot(); // Add the title

        label = new qx.ui.basic.Label("Elevator Subsystem Simulator");
        font = new qx.bom.Font();
        font.set({
          size: 20,
          bold: true,
          family: ["sans-serif"]
        });
        label.setFont(font);
        doc.add(label, {
          top: 30,
          left: 10
        }); // Create the Export and Import buttons

        hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
        doc.add(hBox, {
          top: 26,
          right: 450
        });
        this._butExport = new qx.ui.form.Button("Export");
        hBox.add(this._butExport);

        this._butExport.addListener("execute", function () {
          var copyToClipboard = function copyToClipboard(str) {
            var el = document.createElement('textarea');
            el.value = str;
            el.setAttribute('readonly', '');
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
          };

          copyToClipboard(_this._code);
          window.alert("The code is now in your clipboard. Save it someplace, and later you can Import it.");
        });

        this._butImport = new qx.ui.form.Button("Import");
        hBox.add(this._butImport);

        this._butImport.addListener("execute", this._import, this); // Create the Enabled checkbox


        this._enabled = new qx.ui.form.CheckBox("Enabled");

        this._enabled.addListener("changeValue", function (e) {
          var elevator = elevatorSim.Elevator.getInstance();

          _this._blockly.getWindow().postMessage({
            type: "control",
            name: "enabled",
            value: e.getData()
          }, "*"); // Enable or disable the elevator


          elevator.setEnabled(e.getData());

          if (!e.getData()) {
            clearInterval(enabledPeriodicInterval);
            elevator.setVelocity(0);
          }
        });

        doc.add(this._enabled, {
          top: 30,
          right: 320
        }); // Create the container to house the Blockly editor and elevator simulator

        container = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
        doc.add(container, {
          edge: 10,
          top: 60
        }); // Await messages from Blockly

        window.addEventListener("message", function (event) {
          var code;

          switch (event.data.type) {
            case "control":
              switch (event.data.name) {
                case "run":
                  code = ["console.clear();", "elevatorSim.Elevator.getInstance().reinit();", "do_initially();", event.data.value, "enabledPeriodicInterval = setInterval(do_periodically, 50);"].join("\n");
                  eval(code);
                  break;

                case "setEnabled":
                  _this._enabled.setValue(event.data.value);

                  break;

                case "codeXML":
                  _this._code = event.data.value;
                  break;
              }

              break;
          }
        }); // Add the Blockly editor

        this._blockly = new qx.ui.embed.Iframe("resource/devEnv/blockly.html");
        container.add(this._blockly, {
          flex: 1
        }); // Add the elevator simulator

        elevatorCanvas = elevatorSim.Elevator.getInstance();
        container.add(elevatorCanvas); // Initially hide it

        elevatorCanvas.hide(); // Initially there is no code

        this._code = "";
      },

      /*
       * Show a window in which the user can paste code to be imported. This
       * code, following confirmation, will replace the existing block program.
       */
      _import: function _import() {
        var _this2 = this;

        var hBox;
        var label;
        var textArea;
        var butImport;
        var butCancel;

        if (!this._win) {
          this._win = new qx.ui.window.Window("Import");

          this._win.setPadding(10);

          this._win.setLayout(new qx.ui.layout.VBox(10));
        } // Clean up from last time (if there was a last time)


        this._win.removeAll(); // Create the form


        label = new qx.ui.basic.Label("Paste the previously exported code to be imported here:");

        this._win.add(label);

        textArea = new qx.ui.form.TextArea("");
        textArea.set({
          width: 400,
          height: 200
        });

        this._win.add(textArea);

        hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

        this._win.add(hBox); // We'll center the buttons. Add the left spacer


        hBox.add(new qx.ui.core.Spacer(), {
          flex: 1
        }); // Add the Import button

        butImport = new qx.ui.form.Button("Import");
        hBox.add(butImport);
        butImport.addListener("execute", function () {
          if (window.confirm("Are you sure you want to import this code, which will overwrite the existing block program?")) {
            _this2._blockly.getWindow().postMessage({
              type: "control",
              name: "load",
              value: textArea.getValue()
            }, "*");
          }

          _this2._win.close();
        }); // Add the Cancel button

        butCancel = new qx.ui.form.Button("Cancel");
        hBox.add(butCancel);
        butCancel.addListener("execute", function () {
          _this2._win.close();
        }); // We'll center the buttons. Add the right spacer

        hBox.add(new qx.ui.core.Spacer(), {
          flex: 1
        });

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
      showError: function showError(message) {
        // Stop the simulator
        this._enabled.setValue(false); // Show the message


        alert(message + "\nSimulation disabled");
      }
    }
  });
  elevatorSim.Application.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Application.js.map?dt=1635872823751
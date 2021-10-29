/*
 * Copyright: 2021 Derrell Lipman
 *
 * License: MIT license
 *
 * Authors: Derrell Lipman (derrell) derrell.lipman@unwireduniverse.com
 */

qx.Class.define("elevatorSim.Elevator",
{
  type   : "singleton",
  extend : qx.ui.container.Composite,

  construct : function()
  {
    let             grid;
    let             buttons;
    let             elevator;
    let             doorLeft;
    let             doorRight;
    let             opening;
    let             butUp;
    let             butDown;
    let             butFloor1;
    let             butFloor2;
    let             butFloor3;
    let             status;

    this.base(arguments);

    // Set overall elevator attributes
    this.set(
      {
        width           : 300,
        layout          : new qx.ui.layout.Canvas(),
        backgroundColor : "white"
      });

    //
    // Add the floors
    // Numbers are top pixel of each floor
    //
    [ 10, 135, 260, 385 ].forEach(
      (bottom, i) =>
      {
        let             floor = new qx.ui.core.Widget();

        floor.set(
          {
            height          : 10,
            width           : 180,
            backgroundColor : "black"
          });

        this.add(
          floor,
          {
            left   : 60,
            bottom : bottom
          });

        // Add the floor label
        if (i < 3)
        {
          let label = new qx.ui.basic.Label("" + (i + 1));
          label.setFont("bold");
          this.add(
            label,
            {
              left   : 20,
              bottom : bottom + 60
            });
        }
      });

    // Add the button container
    buttons = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 4));
    this.add(
      buttons,
      {
        left   : 20,
        top    : 0
      });

    //
    // Add the buttons
    //

    butFloor1 = new qx.ui.form.Button("1");
    butFloor1.addListener("pointerdown",
                          (e) => { this._state.button["1"] = true; });
    butFloor1.addListener("pointerup",
                          (e) => { this._state.button["1"] = false; });
    butFloor1.addListener("pointerout",
                          (e) => { this._state.button["1"] = false; });
    buttons.add(butFloor1, { row : 2, column : 1 });

    butFloor2 = new qx.ui.form.Button("2");
    butFloor2.addListener("pointerdown",
                          (e) => { this._state.button["2"] = true; });
    butFloor2.addListener("pointerup",
                          (e) => { this._state.button["2"] = false; });
    butFloor2.addListener("pointerout",
                          (e) => { this._state.button["2"] = false; });
    buttons.add(butFloor2, { row : 1, column : 1 });

    butFloor3 = new qx.ui.form.Button("3");
    butFloor3.addListener("pointerdown",
                          (e) => { this._state.button["3"] = true; });
    butFloor3.addListener("pointerup",
                          (e) => { this._state.button["3"] = false; });
    butFloor3.addListener("pointerout",
                          (e) => { this._state.button["3"] = false; });
    buttons.add(butFloor3, { row : 0, column : 1 });

    butUp = new qx.ui.form.Button("Up");
    butUp.addListener("pointerdown",
                          (e) => { this._state.button["Up"] = true; });
    butUp.addListener("pointerup",
                          (e) => { this._state.button["Up"] = false; });
    butUp.addListener("pointerout",
                          (e) => { this._state.button["Up"] = false; });
    buttons.add(butUp, { row : 0, column : 0 });

    butDown = new qx.ui.form.Button("Down");
    butDown.addListener("pointerdown",
                          (e) => { this._state.button["Down"] = true; });
    butDown.addListener("pointerup",
                          (e) => { this._state.button["Down"] = false; });
    butDown.addListener("pointerout",
                          (e) => { this._state.button["Down"] = false; });
    buttons.add(butDown, { row : 2, column : 0 });

    //
    // Add the status fields
    //
    grid = new qx.ui.layout.Grid(10, 4);
    status = new qx.ui.container.Composite(grid);
    this.add(
      status,
      {
        left   : 160,
        top    : 0
      });

    status.add(new qx.ui.basic.Label("Encoder:"), { row : 0, column : 0 });

    // Create the label where we'll place the "encoder" value
    this._statusElevatorEncoder = new qx.ui.basic.Label("20");
    status.add(this._statusElevatorEncoder, { row : 0, column : 1 });

    //
    // Add the elevator
    //

    // Create the elevator
    elevator = new qx.ui.container.Composite(new qx.ui.layout.HBox());
    elevator.set(
      {
        height          : 115,
        width           : 100,
        padding         : 10,
        backgroundColor : "#dddddd"
      });
    this._elevator = elevator;

    // Add the left door
    doorLeft = new qx.ui.basic.Atom();
    doorLeft.set(
      {
        width           : 5,
        minWidth        : 0,
        backgroundColor : "gray"
      });
    elevator.add(doorLeft, { flex : 1 });

    // Add the opening between the doors
    opening = new qx.ui.basic.Atom();
    opening.set(
      {
        width           : 2,
        minWidth        : 0,
        backgroundColor : "blue"
      });
    elevator.add(opening);

    // Add the right door
    doorRight = new qx.ui.basic.Atom();
    doorRight.set(
      {
        width           : 5,
        minWidth        : 0,
        backgroundColor : "gray"
      });
    elevator.add(doorRight, { flex : 1 });

    // Add the elevator to the graphics canvas
    this.add(
      elevator,
      {
        left   : 100,
        bottom : 20
      });
  },

  members :
  {
    _timer                 : null,
    _elevator              : null,
    _statusElevatorEncoder : null,
    _state                 :
    {
      velocity               : 0,
      encoder                : 20,
      button                 :
      {
        Up                     : false,
        Down                   : false,
        "1"                    : false,
        "2"                    : false,
        "3"                    : false
      }
    },
    _sensorAccessAllowed   :
    {
      motorController        : false,
      encoder                : false,
      floor                  :
      {
        "1B"                   : false, // floor 1 bottom
        "1T"                   : false, // floor 1 top
        "2B"                   : false,
        "2T"                   : false,
        "3B"                   : false,
        "3T"                   : false,
      },
      button                 :
      {
        Up                     : false,
        Down                   : false,
        "1"                    : false,
        "2"                    : false,
        "3"                    : false
      }
    },

    /**
     * Reinitialize the elevator to its initial location
     */
    reinit : function()
    {
      // Reinitialize sensor access
      this._sensorAccessAllowed =
      {
        motorController        : false,
        encoder                : false,
        floor                  :
        {
          "1B"                   : false, // floor 1 bottom
          "1T"                   : false, // floor 1 top
          "2B"                   : false,
          "2T"                   : false,
          "3B"                   : false,
          "3T"                   : false,
        },
        button                 :
        {
          Up                     : false,
          Down                   : false,
          "1"                    : false,
          "2"                    : false,
          "3"                    : false
        }
      };

      // Hide the elevator
      this.hide();

      // Reset the encoder to the initial position
      this._state.encoder = 20;

      // Move the elevator to the initial position
      this._elevator.setLayoutProperties(
        {
          bottom : this._state.encoder
        });

      // Reset the background color to indicate no crash
      this.setBackgroundColor("white");
    },

    /**
     * Return the specified button's state
     *
     * @param buttonId {String}
     *   The ID (label) of the button whose value is requested
     *
     * @return {Boolean}
     *   Whether the specified button is current pressed
     */
    isButtonPressed : function(buttonId)
    {
      // Ensure the button has been properly initialized
      if (! this._sensorAccessAllowed.button[buttonId])
      {
        qx.core.Init.getApplication().error(
          `Button ${buttonId} accessed without being Connected`);
        return false;
      }

      return this._state.button[buttonId];
    },

    /**
     * Get the current encoder value
     */
    getEncoder : function()
    {
      // Ensure the encoder has been properly initialized
      if (! this._sensorAccessAllowed.encoder)
      {
        qx.core.Init.getApplication().error(
          `Encoder accessed without being Connected`);
        return false;
      }

      return this._state.encoder;
    },

    /**
     * Get the most recently set velocity
     */
    getVelocity : function()
    {
      // Ensure the motor controller has been properly initialized
      if (! this._sensorAccessAllowed.motorController)
      {
        qx.core.Init.getApplication().error(
          `Motor Controller accessed without being Connected`);
        return false;
      }

      return this._state.velocity;
    },

    /**
     * Move the elevator up or down at a given velocity
     *
     * @param velocity {Number}
     *   Velocity, in the range [ -100, 100 ].
     *   Positive values cause the elevator to go down; negative, up.
     *   Velocity 0 means stop.
     */
    setVelocity : function(velocity)
    {
      let             distance = velocity > 0 ? -1 : 1;

      // Limit the velocity to range [ -100, 100 ] and we need only its
      // magnitude, as we've already pulled the sign off to use as the
      // distance to move on each timer expiration
      velocity = Math.abs(velocity);
      if (velocity > 100)
      {
        velocity = 100;
      }
      if (velocity < 0)
      {
        velocity = 0;
      }

      // Save the new velocity in the elevator state
      this._state.velocity = velocity;

      // Stop any existing timer
      if ( this._timer)
      {
        this._timer.dispose();
        this._timer = null;
      }

      // If we were asked to stop moving...
      if (velocity === 0)
      {
        // ... then there's nothing more to do
        return;
      }

      // Create a timer for the animation. The interval is the inverse
      // of velocity: a higher velocity means that the interval is smaller.
      this._timer = new qx.event.Timer(100 - velocity);

      // Handle each frame of the animation
      this._timer.addListener(
        "interval",
        function()
        {
          let             newBottom;
          let             bOutOfBounds = false;
            
          // Get the new bottom position of the elevator by adding the
          // positive or negative distance
          newBottom = this._elevator.getLayoutProperties().bottom + distance;
          
          // Don't get any lower than the minimum
          if (newBottom > 300)
          {
            newBottom = 300;
          }

          // Don't get any higher than the maximum
          if (newBottom < 0)
          {
            newBottom = 0;
          }

          if (newBottom > 290 || newBottom < 15)
          {
            bOutOfBounds = true;
          }

          // Set the background color to indicate out of bounds, if necessary
          this.setBackgroundColor(bOutOfBounds ? "red" : "white");

          // Update the "encoder" elevator state and readout
          this._statusElevatorEncoder.setValue(newBottom.toString());
          this._state.encoder = newBottom;

          // Cause the elevator to move in the canvas
          this._elevator.setLayoutProperties(
              {
                bottom : newBottom
              });
          
          // Have we reached our hard-stop ending point?
          if ((distance > 0 && newBottom >= 300) ||
              (distance < 0 && newBottom <= 0))
          {
            // Yup. Animation is complete
            this._timer.dispose();
            this._timer = null;
          }
        },
        this);
      
      // Begin the animation
      this._timer.start();
    },

    /**
     * Allow access to the encoder
     */
    allowAccessEncoder : function()
    {
      console.log("Providing access to encoder");
      this._sensorAccessAllowed.encoder = true;
    },

    /**
     * Allow access to the specified button
     *
     * @param button {String}
     *   The name of the button to provide access to:
     *   "Up", "Down", "1", "2", "3"
     */
    allowAccessButton : function(button)
    {
      console.log(`Providing access to button ${button}`);
      this._sensorAccessAllowed.button[button] = true;
    },

    /**
     * Allow access to the specified floor sensor
     *
     * @param sensor {String}
     *   The name of the sensor to provide access to:
     *   "1B", "1T", "2B", "2T", "3B", "3T"
     */
    allowAccessFloorSensor : function(sensor)
    {
      console.log(`Providing access to sensor ${sensor}`);
      this._sensorAccessAllowed.floor[sensor] = true;
    }
  }
});

/*
 * Copyright: 2021 Derrell Lipman
 *
 * License: MIT license
 *
 * Authors: Derrell Lipman (derrell) derrell.lipman@unwireduniverse.com
 */

qx.Class.define("elevatorSim.Elevator",
{
  extend : qx.ui.container.Composite,

  construct : function()
  {
    let             buttons;
    let             elevator;
    let             doorLeft;
    let             doorRight;
    let             opening;
    let             butFloor1;
    let             butFloor2;
    let             butFloor3;
    let             butDoorOpen;
    let             butDoorClose;

    this.base(arguments);

    // Set overall elevator attributes
    this.set(
      {
        width           : 400,
        maxHeight       : 420,
        layout          : new qx.ui.layout.Canvas(),
        backgroundColor : "white"
      });

    //
    // Add the floors
    // Numbers are top pixel of each floor
    //
    [ 10, 135, 260, 385 ].forEach(
      (top, i) =>
      {
        let             floor = new qx.ui.core.Widget();

        floor.set(
          {
            height          : 10,
            width           : 280,
            backgroundColor : "black"
          });

        this.add(
          floor,
          {
            left : 60,
            top  : top
          });

        // Add the floor label
        if (i > 0)
        {
          let label = new qx.ui.basic.Label("" + (4 - i));
          label.setFont("bold");
          this.add(
            label,
            {
              left : 20,
              top  : top - 70
            });
        }
      });


    //
    // Add the elevator
    //

    // Create the elevator
    elevator = new qx.ui.container.Composite(new qx.ui.layout.HBox());
    elevator.set(
      {
        height          : 100,
        width           : 200,
        padding         : 10,
        backgroundColor : "#dddddd"
      });
    this._elevator = elevator;

    // Add the button container
    buttons = new qx.ui.container.Composite(new qx.ui.layout.Grid(10,4));
    buttons.setMarginRight(10);
    elevator.add(buttons);

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
        left : 100,
        top  : 270
      });

    //
    // Add the buttons
    //

    butFloor1 = new qx.ui.form.Button("1");
    butFloor1.addListener(
      "execute",
      (e) =>
      {
        this.move(80);
      });
    buttons.add(butFloor1, { row : 2, column : 0 });

    butFloor2 = new qx.ui.form.Button("2");
    butFloor2.addListener(
      "execute",
      (e) =>
      {
        this.move(0);
      });
    buttons.add(butFloor2, { row : 1, column : 0 });

    butFloor3 = new qx.ui.form.Button("3");
    butFloor3.addListener(
      "execute",
      (e) =>
      {
        this.move(-80);
      });
    buttons.add(butFloor3, { row : 0, column : 0 });

    butDoorOpen = new qx.ui.form.Button("Open");
    butDoorOpen.addListener(
      "execute",
      (e) =>
      {
      });
    buttons.add(butDoorOpen, { row : 0, column : 1 });

    butDoorClose = new qx.ui.form.Button("Close");
    butDoorClose.addListener(
      "execute",
      (e) =>
      {
      });
    buttons.add(butDoorClose, { row : 1, column : 1 });
  },

  members :
  {
    _timer    : null,
    _state    : "doors-closed",
    _elevator : null,

    /**
     * Move the elevator up or down
     *
     * @param speed {Number}
     *   Speed, in the range [ -100, 100 ].
     *   Positive values cause the elevator to go down; negative, up.
     *   Speed 0 means stop.
     */
    move : function(speed)
    {
      let             distance = speed > 0 ? 1 : -1;

      // Limit the speed to range [ -100, 100 ] and we need only its
      // magnitude, as we've already pulled the sign off to use as the
      // distance to move on each timer expiration
      speed = Math.abs(speed);
      if (speed > 100)
      {
        speed = 100;
      }
      if (speed < 0)
      {
        speed = 0;
      }

      // Stop any existing timer
      if ( this._timer)
      {
        this._timer.dispose();
        this._timer = null;
      }

      // If we were asked to stop moving...
      if (speed === 0)
      {
        // ... then there's nothing more to do
        return;
      }

      // Create a timer for the animation. The interval is the inverse
      // of speed: a higher speed means that the interval is smaller.
      this._timer = new qx.event.Timer(100 - speed);

      // Handle each frame of the animation
      this._timer.addListener(
        "interval",
        function()
        {
          var   newTop;
            
          // Get the new top position of the elevator by adding the
          // positive or negative distance
          newTop = this._elevator.getLayoutProperties().top + distance;
          
          // Don't get any lower than the minimum
          if (newTop > 300)
          {
            newTop = 300;
          }

          // Don't get any higher than the maximum
          if (newTop < 5)
          {
            newTop = 5;
          }

          // Cause the elevator to move in the canvas
          this._elevator.setLayoutProperties(
              {
                top : newTop
              });
          
          // Have we reached our hard-stop ending point?
          if ((distance > 0 && newTop >= 300) ||
              (distance < 0 && newTop <= 5))
          {
            // Yup. Animation is complete
            this._timer.dispose();
            this._timer = null;

            // Change state
            this._state = "doors-closed";
          }
        },
        this);
      
      // Begin the animation
      this._timer.start();
      
    }
  }
});

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.UserAction": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.event.IEventHandler": {
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.lang.Function": {
        "construct": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.bom.Event": {},
      "qx.bom.client.OperatingSystem": {
        "require": true
      },
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Mouse": {},
      "qx.event.type.MouseWheel": {},
      "qx.event.type.Data": {},
      "qx.bom.client.Event": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.dom.Hierarchy": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
        },
        "engine.name": {
          "className": "qx.bom.client.Engine",
          "load": true
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This class provides an unified mouse event handler for Internet Explorer,
   * Firefox, Opera and Safari
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @require(qx.event.handler.UserAction)
   * @ignore(qx.event.handler.DragDrop)
   * @ignore(performance.now)
   */
  qx.Class.define("qx.event.handler.Mouse", {
    extend: qx.core.Object,
    implement: [qx.event.IEventHandler, qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Create a new instance
     *
     * @param manager {qx.event.Manager} Event manager for the window to use
     */
    construct: function construct(manager) {
      qx.core.Object.constructor.call(this); // Define shorthands

      this.__manager__P_125_0 = manager;
      this.__window__P_125_1 = manager.getWindow();
      this.__root__P_125_2 = this.__window__P_125_1.document;
      this.__onNativeListener__P_125_3 = qx.lang.Function.listener(this._onNative, this); // Initialize observers

      this._initButtonObserver();

      this._initMoveObserver();

      this._initWheelObserver();
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Integer} Priority of this handler */
      PRIORITY: qx.event.Registration.PRIORITY_NORMAL,

      /** @type {Map} Supported event types */
      SUPPORTED_TYPES: {
        auxclick: 1,
        click: 1,
        contextmenu: 1,
        dblclick: 1,
        mousedown: 1,
        mouseenter: 1,
        mouseleave: 1,
        mousemove: 1,
        mouseout: 1,
        mouseover: 1,
        mouseup: 1,
        mousewheel: 1
      },

      /** @type{Map} these event types cannot be attached to the root (the document), they must be attached to the element itself */
      NON_BUBBLING_EVENTS: {
        mouseenter: true,
        mouseleave: true
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE + qx.event.IEventHandler.TARGET_DOCUMENT + qx.event.IEventHandler.TARGET_WINDOW,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __onButtonEventWrapper__P_125_4: null,
      __onMoveEventWrapper__P_125_5: null,
      __onWheelEventWrapper__P_125_6: null,
      __lastEventType__P_125_7: null,
      __lastMouseDownTarget__P_125_8: null,
      __manager__P_125_0: null,
      __window__P_125_1: null,
      __root__P_125_2: null,
      __preventNextClick__P_125_9: null,

      /** @type{Function} wrapper for `_onNative`, bound as a native listener */
      __onNativeListener__P_125_3: null,

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},

      /**
       * @Override
       */
      registerEvent: function registerEvent(target, type, capture) {
        if (qx.event.handler.Mouse.NON_BUBBLING_EVENTS[type]) {
          qx.bom.Event.addNativeListener(target, type, this.__onNativeListener__P_125_3);
        } else if (qx.core.Environment.get("os.name") === "ios") {
          // The iPhone requires for attaching mouse events natively to every element which
          // should react on mouse events. As of version 3.0 it also requires to keep the
          // listeners as long as the event should work. In 2.0 it was enough to attach the
          // listener once.
          target["on" + type] = function () {
            return null;
          };
        }
      },

      /**
       * @Override
       */
      unregisterEvent: function unregisterEvent(target, type, capture) {
        if (qx.event.handler.Mouse.NON_BUBBLING_EVENTS[type]) {
          qx.bom.Event.removeNativeListener(target, type, this.__onNativeListener__P_125_3);
        } else if (qx.core.Environment.get("os.name") === "ios") {
          target["on" + type] = undefined;
        }
      },

      /**
       * Default event handler for events that do not bubble
       *
       * @signature function(domEvent, eventId)
       * @param domEvent {Event} Native event
       */
      _onNative: qx.event.GlobalError.observeMethod(function (domEvent) {
        var target = qx.bom.Event.getTarget(domEvent);
        qx.event.Registration.fireNonBubblingEvent(target, domEvent.type, qx.event.type.Mouse, [domEvent, target, undefined, undefined, domEvent.cancelable]);
      }),

      /*
      ---------------------------------------------------------------------------
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Fire a mouse event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String} type of the event
       * @param target {Element} event target
       */
      __fireEvent__P_125_10: function __fireEvent__P_125_10(domEvent, type, target) {
        if (!target) {
          target = qx.bom.Event.getTarget(domEvent);
        } // we need a true node for the fireEvent
        // e.g. when hovering over text of disabled textfields IE is returning
        // an empty object as "srcElement"


        if (target && target.nodeType) {
          qx.event.Registration.fireEvent(target, type || domEvent.type, type == "mousewheel" ? qx.event.type.MouseWheel : qx.event.type.Mouse, [domEvent, target, null, true, true]);
        } // Fire user action event


        qx.event.Registration.fireEvent(this.__window__P_125_1, "useraction", qx.event.type.Data, [type || domEvent.type]);
      },

      /**
       * Helper to prevent the next click.
       * @internal
       */
      preventNextClick: function preventNextClick() {
        this.__preventNextClick__P_125_9 = true;
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER INIT
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the native mouse button event listeners.
       *
       * @signature function()
       */
      _initButtonObserver: function _initButtonObserver() {
        this.__onButtonEventWrapper__P_125_4 = qx.lang.Function.listener(this._onButtonEvent, this);
        var Event = qx.bom.Event;
        Event.addNativeListener(this.__root__P_125_2, "mousedown", this.__onButtonEventWrapper__P_125_4);
        Event.addNativeListener(this.__root__P_125_2, "mouseup", this.__onButtonEventWrapper__P_125_4);
        Event.addNativeListener(this.__root__P_125_2, "click", this.__onButtonEventWrapper__P_125_4);
        Event.addNativeListener(this.__root__P_125_2, "auxclick", this.__onButtonEventWrapper__P_125_4);
        Event.addNativeListener(this.__root__P_125_2, "dblclick", this.__onButtonEventWrapper__P_125_4);
        Event.addNativeListener(this.__root__P_125_2, "contextmenu", this.__onButtonEventWrapper__P_125_4);
      },

      /**
       * Initializes the native mouse move event listeners.
       *
       * @signature function()
       */
      _initMoveObserver: function _initMoveObserver() {
        this.__onMoveEventWrapper__P_125_5 = qx.lang.Function.listener(this._onMoveEvent, this);
        var Event = qx.bom.Event;
        Event.addNativeListener(this.__root__P_125_2, "mousemove", this.__onMoveEventWrapper__P_125_5);
        Event.addNativeListener(this.__root__P_125_2, "mouseout", this.__onMoveEventWrapper__P_125_5);
        Event.addNativeListener(this.__root__P_125_2, "mouseover", this.__onMoveEventWrapper__P_125_5);
      },

      /**
       * Initializes the native mouse wheel event listeners.
       *
       * @signature function()
       */
      _initWheelObserver: function _initWheelObserver() {
        this.__onWheelEventWrapper__P_125_6 = qx.lang.Function.listener(this._onWheelEvent, this);
        var data = qx.bom.client.Event.getMouseWheel(this.__window__P_125_1);
        qx.bom.Event.addNativeListener(data.target, data.type, this.__onWheelEventWrapper__P_125_6);
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER STOP
      ---------------------------------------------------------------------------
      */

      /**
       * Disconnects the native mouse button event listeners.
       *
       * @signature function()
       */
      _stopButtonObserver: function _stopButtonObserver() {
        var Event = qx.bom.Event;
        Event.removeNativeListener(this.__root__P_125_2, "mousedown", this.__onButtonEventWrapper__P_125_4);
        Event.removeNativeListener(this.__root__P_125_2, "mouseup", this.__onButtonEventWrapper__P_125_4);
        Event.removeNativeListener(this.__root__P_125_2, "click", this.__onButtonEventWrapper__P_125_4);
        Event.removeNativeListener(this.__root__P_125_2, "dblclick", this.__onButtonEventWrapper__P_125_4);
        Event.removeNativeListener(this.__root__P_125_2, "contextmenu", this.__onButtonEventWrapper__P_125_4);
      },

      /**
       * Disconnects the native mouse move event listeners.
       *
       * @signature function()
       */
      _stopMoveObserver: function _stopMoveObserver() {
        var Event = qx.bom.Event;
        Event.removeNativeListener(this.__root__P_125_2, "mousemove", this.__onMoveEventWrapper__P_125_5);
        Event.removeNativeListener(this.__root__P_125_2, "mouseover", this.__onMoveEventWrapper__P_125_5);
        Event.removeNativeListener(this.__root__P_125_2, "mouseout", this.__onMoveEventWrapper__P_125_5);
      },

      /**
       * Disconnects the native mouse wheel event listeners.
       *
       * @signature function()
       */
      _stopWheelObserver: function _stopWheelObserver() {
        var data = qx.bom.client.Event.getMouseWheel(this.__window__P_125_1);
        qx.bom.Event.removeNativeListener(data.target, data.type, this.__onWheelEventWrapper__P_125_6);
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT OBSERVERS
      ---------------------------------------------------------------------------
      */

      /**
       * Global handler for all mouse move related events like "mousemove",
       * "mouseout" and "mouseover".
       *
       * @signature function(domEvent)
       * @param domEvent {Event} DOM event
       */
      _onMoveEvent: qx.event.GlobalError.observeMethod(function (domEvent) {
        this.__fireEvent__P_125_10(domEvent);
      }),

      /**
       * Global handler for all mouse button related events like "mouseup",
       * "mousedown", "click", "dblclick" and "contextmenu".
       *
       * @signature function(domEvent)
       * @param domEvent {Event} DOM event
       */
      _onButtonEvent: qx.event.GlobalError.observeMethod(function (domEvent) {
        var type = domEvent.type;
        var target = qx.bom.Event.getTarget(domEvent);

        if (type == "click" && this.__preventNextClick__P_125_9) {
          delete this.__preventNextClick__P_125_9;
          return;
        } // Safari (and maybe gecko) takes text nodes as targets for events
        // See: http://www.quirksmode.org/js/events_properties.html


        if (qx.core.Environment.get("engine.name") == "gecko" || qx.core.Environment.get("engine.name") == "webkit") {
          if (target && target.nodeType == 3) {
            target = target.parentNode;
          }
        } // prevent click events on drop during Drag&Drop [BUG #6846]


        var isDrag = qx.event.handler.DragDrop && this.__manager__P_125_0.getHandler(qx.event.handler.DragDrop).isSessionActive();

        if (isDrag && type == "click") {
          return;
        }

        if (this.__doubleClickFixPre__P_125_11) {
          this.__doubleClickFixPre__P_125_11(domEvent, type, target);
        }

        this.__fireEvent__P_125_10(domEvent, type, target);
        /*
         * In order to normalize middle button click events we
         * need to fire an artificial click event if the client
         * fires auxclick events for non primary buttons instead.
         * 
         * See https://github.com/qooxdoo/qooxdoo/issues/9268
         */


        if (type == "auxclick" && domEvent.button == 1) {
          this.__fireEvent__P_125_10(domEvent, "click", target);
        }

        if (this.__rightClickFixPost__P_125_12) {
          this.__rightClickFixPost__P_125_12(domEvent, type, target);
        }

        if (this.__differentTargetClickFixPost__P_125_13 && !isDrag) {
          this.__differentTargetClickFixPost__P_125_13(domEvent, type, target);
        }

        this.__lastEventType__P_125_7 = type;
      }),

      /**
       * Global handler for the mouse wheel event.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} DOM event
       */
      _onWheelEvent: qx.event.GlobalError.observeMethod(function (domEvent) {
        this.__fireEvent__P_125_10(domEvent, "mousewheel");
      }),

      /*
      ---------------------------------------------------------------------------
        CROSS BROWSER SUPPORT FIXES
      ---------------------------------------------------------------------------
      */

      /**
       * Normalizes the click sequence of right click events in Webkit and Opera.
       * The normalized sequence is:
       *
       *  1. mousedown  <- not fired by Webkit
       *  2. mouseup  <- not fired by Webkit
       *  3. contextmenu <- not fired by Opera
       *
       * @param domEvent {Event} original DOM event
       * @param type {String} event type
       * @param target {Element} event target of the DOM event.
       *
       * @signature function(domEvent, type, target)
       */
      __rightClickFixPost__P_125_12: qx.core.Environment.select("engine.name", {
        "opera": function opera(domEvent, type, target) {
          if (type == "mouseup" && domEvent.button == 2) {
            this.__fireEvent__P_125_10(domEvent, "contextmenu", target);
          }
        },
        "default": null
      }),

      /**
       * Normalizes the click sequence of double click event in the Internet
       * Explorer. The normalized sequence is:
       *
       *  1. mousedown
       *  2. mouseup
       *  3. click
       *  4. mousedown  <- not fired by IE
       *  5. mouseup
       *  6. click  <- not fired by IE
       *  7. dblclick
       *
       *  Note: This fix is only applied, when the IE event model is used, otherwise
       *  the fix is ignored.
       *
       * @param domEvent {Event} original DOM event
       * @param type {String} event type
       * @param target {Element} event target of the DOM event.
       *
       * @signature function(domEvent, type, target)
       */
      __doubleClickFixPre__P_125_11: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(domEvent, type, target) {
          // Do only apply the fix when the event is from the IE event model,
          // otherwise do not apply the fix.
          if (domEvent.target !== undefined) {
            return;
          }

          if (type == "mouseup" && this.__lastEventType__P_125_7 == "click") {
            this.__fireEvent__P_125_10(domEvent, "mousedown", target);
          } else if (type == "dblclick") {
            this.__fireEvent__P_125_10(domEvent, "click", target);
          }
        },
        "default": null
      }),

      /**
       * If the mouseup event happens on a different target than the corresponding
       * mousedown event the internet explorer dispatches a click event on the
       * first common ancestor of both targets. The presence of this click event
       * is essential for the qooxdoo widget system. All other browsers don't fire
       * the click event so it must be emulated.
       *
       * @param domEvent {Event} original DOM event
       * @param type {String} event type
       * @param target {Element} event target of the DOM event.
       *
       * @signature function(domEvent, type, target)
       */
      __differentTargetClickFixPost__P_125_13: qx.core.Environment.select("engine.name", {
        "mshtml": null,
        "default": function _default(domEvent, type, target) {
          switch (type) {
            case "mousedown":
              this.__lastMouseDownTarget__P_125_8 = target;
              break;

            case "mouseup":
              if (target !== this.__lastMouseDownTarget__P_125_8) {
                var commonParent = qx.dom.Hierarchy.getCommonParent(target, this.__lastMouseDownTarget__P_125_8);

                if (commonParent) {
                  this.__fireEvent__P_125_10(domEvent, "click", commonParent);
                }
              }

          }
        }
      })
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._stopButtonObserver();

      this._stopMoveObserver();

      this._stopWheelObserver();

      this.__manager__P_125_0 = this.__window__P_125_1 = this.__root__P_125_2 = this.__lastMouseDownTarget__P_125_8 = null;
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics);
    }
  });
  qx.event.handler.Mouse.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Mouse.js.map?dt=1636124297537
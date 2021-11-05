(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "elevatorSim.theme.Color": {
        "require": true
      },
      "elevatorSim.theme.Decoration": {
        "require": true
      },
      "elevatorSim.theme.Font": {
        "require": true
      },
      "qx.theme.icon.Tango": {
        "require": true
      },
      "elevatorSim.theme.Appearance": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     Copyright: 2021 Derrell Lipman
  
     License: MIT license
  
     Authors: Derrell Lipman (derrell) derrell.lipman@unwireduniverse.com
  
  ************************************************************************ */
  qx.Theme.define("elevatorSim.theme.Theme", {
    meta: {
      color: elevatorSim.theme.Color,
      decoration: elevatorSim.theme.Decoration,
      font: elevatorSim.theme.Font,
      icon: qx.theme.icon.Tango,
      appearance: elevatorSim.theme.Appearance
    }
  });
  elevatorSim.theme.Theme.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Theme.js.map?dt=1636124288563
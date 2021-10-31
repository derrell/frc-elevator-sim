(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.indigo.Appearance": {
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
  qx.Theme.define("elevatorSim.theme.Appearance", {
    extend: qx.theme.indigo.Appearance,
    appearances: {}
  });
  elevatorSim.theme.Appearance.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Appearance.js.map?dt=1635364917775
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.indigo.Color": {
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
  qx.Theme.define("elevatorSim.theme.Color", {
    extend: qx.theme.indigo.Color,
    colors: {}
  });
  elevatorSim.theme.Color.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Color.js.map?dt=1636124289951
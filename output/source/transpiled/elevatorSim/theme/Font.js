(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.indigo.Font": {
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
  qx.Theme.define("elevatorSim.theme.Font", {
    extend: qx.theme.indigo.Font,
    fonts: {}
  });
  elevatorSim.theme.Font.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Font.js.map?dt=1635364917747
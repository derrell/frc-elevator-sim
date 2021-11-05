(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.indigo.Decoration": {
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
  qx.Theme.define("elevatorSim.theme.Decoration", {
    extend: qx.theme.indigo.Decoration,
    decorations: {}
  });
  elevatorSim.theme.Decoration.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Decoration.js.map?dt=1636124289977
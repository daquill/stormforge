app.controller("PluginListController", PluginListController);
function PluginListController($scope, rconService) {
  $scope.Output = [];
  $scope.OrderBy = "-ConnectedSeconds";

  $scope.Refresh = function () {
    var force = true;
    rconService.getPlugins(
      $scope,
      function (plugins) {
        $scope.Plugins = plugins;
      },
      force
    );
  };

  $scope.togglePlugin = function (plugin) {
    if (plugin.status == "Loaded") {
      rconService.Request(`o.unload "${plugin.filename}"`);
    } else if (plugin.status == "Unloaded") {
      rconService.Request(`o.load "${plugin.filename}"`);
    }

    $scope.Refresh()
  };

  rconService.InstallService($scope, $scope.Refresh);
}

app.controller('MapController', MapController);

function MapController($scope, rconService) {
  const requiredPlugins = ['RustMapApi', 'ImgurApi'];
  const pluginsList = rconService.getPlugins($scope,
    function (plugins) {
      $scope.Plugins = plugins;
    },
    force);
  console.log(pluginsList);
  const pluginsInstalled = pluginsList.every(plugin => {
    const pluginName = plugin.filename;
    return requiredPlugins.includes(pluginName) && plugin.status === 'Loaded';
  });
  if (pluginsInstalled) {
    // Set the mapUrl when both required plugins are installed
    $scope.mapUrl = 'your_map_url_here';
    $scope.error = null;
  } else {
    // Set an error message when one or both plugins are missing
    $scope.mapUrl = null;
    $scope.error = 'Please install RustMapApi & ImgurApi to use the world map';
  }
}

app.controller("PlayerInfoController", PlayerInfoController);

function PlayerInfoController($scope, rconService, $routeParams) {
  $scope.userid = $routeParams.userid;

  $scope.info = null;
  $scope.refresh = function () {
    rconService.getPlayers($scope, function (players) {
      for (var i in players) {
        if (players[i].SteamID === $scope.userid) {
          // set player data
          $scope.info = players[i];

          // remove xp remnants
          if ($scope.info["CurrentLevel"] !== undefined)
            delete $scope.info["CurrentLevel"];
          if ($scope.info["UnspentXp"] !== undefined)
            delete $scope.info["UnspentXp"];

          if ($scope.info["ViolationLevel"] !== undefined) {
            var violationLevel = $scope.info["ViolationLevel"];
            delete $scope.info["ViolationLevel"];
            $scope.info["ViolationLevel"] = violationLevel;
          }
          return;
        }
      }
      console.log("Scope Info: " + $scope.info);

      $scope.info = null;
      if ($scope.userid === "TestUser") {
        $scope.info = [];
      }
      // player not found
      // reset data to null
    });
  };

  $scope.getUsername = function () {
    // try to find players name in info
    if ($scope.info && $scope.info.DisplayName) {
      return $scope.info.DisplayName;
    }

    // otherwise show the id
    return $scope.userid;
  };

  rconService.InstallService($scope, $scope.refresh);
}

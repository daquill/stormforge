app.controller("PlayerListController", PlayerListController);

function PlayerListController($scope, rconService) {
  $scope.Output = [];
  $scope.OrderBy = "-ConnectedSeconds";

  $scope.Refresh = function () {
    rconService.getPlayers($scope, function (players) {
      $scope.Players = players;
    });
  };

  $scope.Order = function (field) {
    if ($scope.OrderBy === field) {
      field = "-" + field;
    }

    $scope.OrderBy = field;
  };

  $scope.SortClass = function (field) {
    if ($scope.OrderBy === field) return "sorting";
    if ($scope.OrderBy === "-" + field) return "sorting descending";

    return null;
  };

  $scope.showModal = false;

  $scope.showActionDialog = function (player, action) {
    $scope.playerAction = action;
    $scope.selectedPlayer = player;
    $scope.showModal = true;
  };

  $scope.hideActionDialog = function () {
    $scope.showModal = false;
  };

  $scope.performAction = function (id, reason) {
    if ($scope.playerAction === "Kick") {
      console.log("Kicked " + id);
      rconService.Command("kick " + id + " " + reason);
    } else if ($scope.playerAction === "Ban") {
      console.log("Kicked " + id);
      rconService.Command("ban " + id + " " + reason);
    }

    // Close the modal
    $scope.hideActionDialog();
  };
  rconService.InstallService($scope, $scope.Refresh);
}

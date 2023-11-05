
app.controller('ToolsController', ToolsController);


function ToolsController($scope, rconService, $routeParams) {
    var items = fetch('js/items.json')
    .then((response) => response.json())
    .then((json) => console.log(json));
    $scope.filteredItems = [];
    $scope.selectedPlayer = null;
    $scope.giveToAll = false;
    $scope.searchText = '';
    $scope.itemRows = [{ selectedItem: '', amount: '' }];
    $scope.userid = $routeParams.userid;

    $scope.info = null;

    $scope.refresh = function () {
        rconService.getPlayers($scope, function (players) {

            for (var i in players) {
                if (players[i].SteamID === $scope.userid) {
                    // set player data
                    $scope.info = players[i];
                    console.log($scope.info)

                    // remove xp remnants
                    if ($scope.info['CurrentLevel'] !== undefined)
                        delete $scope.info['CurrentLevel'];
                    if ($scope.info['UnspentXp'] !== undefined)
                        delete $scope.info['UnspentXp'];

                    // fix violation level
                    if ($scope.info['ViolationLevel'] !== undefined) {
                        var violationLevel = $scope.info['ViolationLevel'];
                        delete $scope.info['ViolationLevel'];
                        $scope.info['ViolationLevel'] = violationLevel;
                    }

                    return;
                }
            }

            $scope.info = null;
        });
    }

    $scope.getUsername = function () {

        if ($scope.info && $scope.info.DisplayName) {
            return $scope.info.DisplayName;
        }

        return $scope.userid;
    }

$scope.giveItems = function () {

    var selectedPlayer = $scope.selectedPlayer;
    var itemRows = $scope.itemRows;

    var itemsData = [];
    for (var i = 0; i < itemRows.length; i++) {
        var itemRow = itemRows[i];
        var selectedItem = itemRow.selectedItem;
        var amount = itemRow.amount;
        if (selectedItem && amount) {
            itemsData.push({ item: selectedItem, amount: amount });
        }
    }

    rconService.giveItems(selectedPlayer, itemsData).then(function (response) {
        console.log('Items given successfully:', response);
    }).catch(function (error) {
        console.error('Error giving items:', error);
    });
};

$scope.filterItems = function () {
    $scope.filteredItems = [];

    if ($scope.searchText) {
        var searchText = $scope.searchText.toLowerCase();
        for (var i = 0; i < $scope.items.length; i++) {
            var itemName = $scope.items[i].name.toLowerCase();
            if (itemName.includes(searchText)) {
                $scope.filteredItems.push($scope.items[i]);
            }
        }
    }
};


$scope.addItemRow = function () {
    $scope.itemRows.push({ selectedItem: '', amount: '' });
};

$scope.removeItemRow = function (index) {
    $scope.itemRows.splice(index, 1);
};

    rconService.InstallService($scope, $scope.refresh)
}
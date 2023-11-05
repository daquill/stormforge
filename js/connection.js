
app.controller('ConnectionController', ConnectionController);

function ConnectionController ($scope, rconService, $routeParams, $timeout, $location)
{
	$scope.Address = "";
	$scope.Port = "";
	$scope.Password = "";
	$scope.Name = "RCON Rust Server " + Math.random().toString();
	$scope.SaveConnection = true;

	$scope.connectionsLimit = 5;

	function _loadFromLocalStorage ()
	{
		var connections = [];
		if (localStorage && localStorage.previousConnections)
		{
			console.log('localStorage.previousConnections exists');
			connections = angular.fromJson(localStorage.previousConnections);
			console.log('Connections loaded from localStorage:', connections);
		}
		if (!connections)
		{
			connections = [];
		}
		return connections;
	}

	function _addWithoutDuplicates (connections, connection)
	{
		var filteredConnections = [];
		for (var i in connections)
		{
			if (connections[i].Address !== connection.Address && connections[i].Password !== connection.Password)
			{
				filteredConnections.push(connections[i]);
			}
		}

		filteredConnections.push(connection);
		console.log('Filtered connections:', filteredConnections);
		return filteredConnections;
	}

	$scope.toggleConnectionsLimit = function ()
	{
		if ($scope.connectionsLimit === undefined)
		{
			$scope.connectionsLimit = 5;
		} else
		{
			$scope.connectionsLimit = undefined;
		}
	}


	$scope.Connect = function ()
	{
		if ($scope.Address && $scope.Password)
		{
			$scope.Address = $scope.Address.trim();
			$scope.Password = $scope.Password.trim();

			$scope.LastErrorMessage = null;
			rconService.Connect($scope.Address, $scope.Password);

			$location.path('/' + $scope.Address + '/info');
		} else
		{
			return null;
		}
	}

	$scope.addFakeConnection = function ()
	{

		var fakeConnection = {
			Name: "Fake Server",
			Address: "fake.server.com",
			Password: "fakepassword",
			date: new Date()
		};
		var connections = _loadFromLocalStorage();
		connections.push(fakeConnection);
		localStorage.previousConnections = angular.toJson(connections);
		$scope.PreviousConnects = connections;
	};


	$scope.ConnectTo = function (c)
	{
		$scope.SaveConnection = false;
		$scope.LastErrorMessage = null;
		rconService.Connect(c.Address, c.Password);
		$location.path('/' + c.Address + '/info')
	}

	$scope.StartServer = function ()
	{

		rconService.Command("start");
	};

	$scope.RestartServer = function ()
	{

		rconService.Command("restart");
	};

	$scope.StopServer = function ()
	{
		rconService.Command("quit");
	};

	$scope.Delete = function (connectionToDelete)
	{
		var connections = _loadFromLocalStorage();

		var indexToDelete = -1;
		for (var i = 0; i < connections.length; i++)
		{
			if (connections[i].Address === connectionToDelete.Address && connections[i].Password === connectionToDelete.Password)
			{
				indexToDelete = i;
				break;
			}
		}

		if (indexToDelete !== -1)
		{
			connections.splice(indexToDelete, 1);
			localStorage.previousConnections = angular.toJson(connections);
			$scope.PreviousConnects = connections;
		}
		if (connections.length === 0)
		{
			delete localStorage.previousConnections;
		}
	}

	$scope.ConnectTitle = "Connect";
	$scope.selectedGame = "Rust";

	$scope.gameOptions = [
		{ value: "Rust", label: "Rust" },
		{ value: "Minecraft JE", label: "Minecraft Java Edition" },
		{ value: "FiveM", label: "FiveM" },
	];

	$scope.$watch('selectedGame', function (newValue, oldValue)
	{
		if (newValue !== oldValue) $scope.ConnectTitle = "Connect to " + newValue + " Server";

	});


	$scope.toggleEditServerName = function (connection)
	{
		connection.editing = !connection.editing;
		if (connection.editing)
		{
			connection.editingName = connection.Name;
			connection.autofocus = true;
		} else
		{
			connection.editingName = connection.Name;
			connection.autofocus = false;
		}
	};


	$scope.saveServerName = function (connection)
	{
		connection.Name = connection.editingName;
		connection.editing = false;
		var connections = _loadFromLocalStorage();
		for (var i = 0; i < connections.length; i++)
		{
			if (connections[i].Address === connection.Address && connections[i].Password === connection.Password)
			{
				connections[i].Name = connection.editingName;
				break;
			}
		}
		localStorage.previousConnections = angular.toJson(connections);
	};

	$scope.onKeyPress = function ($event, connection)
	{
		if ($event.keyCode === 13)
		{
			$scope.saveServerName(connection);
		}
	};



	$scope.$on("OnDisconnected", function (x, ev)
	{
		console.log(ev);
		$scope.LastErrorMessage = "Connection was closed - Error " + ev.code;
		$scope.$digest();
	});

	$scope.$on("OnConnected", function (x, ev)
	{
		if ($scope.SaveConnection)
		{
			var connection = { Name: $scope.Name, Address: $scope.Address, Password: $scope.Password, date: new Date() };
			var connections = _addWithoutDuplicates(_loadFromLocalStorage(), connection);
			$scope.PreviousConnects = connections;
			localStorage.previousConnections = angular.toJson($scope.PreviousConnects);
		}
	});

	$scope.PreviousConnects = _loadFromLocalStorage();
	$timeout(function ()
	{
		$scope.Address = $routeParams.address;
		var pw = $location.search().password;
		if (pw)
		{
			$scope.Password = pw;
			$location.search("password", null);
		}
		if ($scope.Address != null)
		{
			if ($scope.Password != "")
			{
				$scope.Connect();
				return;
			}
			var foundAddress = Enumerable.From($scope.PreviousConnects).Where(function (x) { return x.Address == $scope.Address }).First();
			if (foundAddress != null)
			{
				$scope.ConnectTo(foundAddress);
			}

		}

	}, 20);

}

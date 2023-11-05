
app.controller('LogsController', LogsController);

function LogsController($scope, rconService) {
    $scope.Output = [];

    $scope.$on("OnMessage", function (event, msg) { $scope.OnMessage(msg); });

    $scope.OnMessage = function (msg) {

        if (!msg.Message.startsWith("[Admin Logger]")) {
            return;
        }


		switch (msg.Type) {
			case 'Generic':
			case 'Log':
			case 'Error':
			case 'Warning':
				$scope.addOutput(msg);
				break;

			default:
				console.log(msg);
				return;
		}
    }

    $scope.ScrollToBottom = function () {
        var element = $("#LogsController .Output");

        $timeout(function () {
            element.scrollTop(element.prop('scrollHeight'));
        }, 50);
    }

    $scope.isOnBottom = function () {

        var element = $("#LogsController .Logs");
        var height = element.height();
        var scrollTop = element.scrollTop();
        var scrollHeight = element.prop('scrollHeight');

        if ((scrollTop + height) > (scrollHeight - 10)) {
            return true;
        }

        return false;
    }
    
    $scope.addOutput = function (msg) {
        msg.Class = msg.Type;
        msg.Message = stripHtml(msg.Message);

        $scope.Logs.push(msg);

        if ($scope.isOnBottom()) {
            $scope.ScrollToBottom();
        }
    }

    rconService.InstallService($scope, $scope.Refresh)

}
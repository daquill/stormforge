function RconService() {
  var ConnectionStatus = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  };
  var Service = {
    Socket: null,
    Address: null,
    Callbacks: {},
  };
  var LastIndex = 1001;
  Service.Connect = function (addr, pass) {
    this.Socket = new WebSocket("ws://" + addr + "/" + pass);
    this.Address = addr;
    this.Socket.onmessage = function (e) {
      var data = angular.fromJson(e.data);
      if (data.Identifier > 1000) {
        var cb = Service.Callbacks[data.Identifier];
        if (cb != null) {
          cb.scope.$apply(function () {
            cb.callback(data);
          });
        }
        Service.Callbacks[data.Identifier] = null;
        return;
      }
      if (Service.OnMessage != null) {
        Service.OnMessage(data);
      }
    };
    this.Socket.onopen = this.OnOpen;
    this.Socket.onclose = this.OnClose;
    this.Socket.onerror = this.OnError;
  };

  Service.Disconnect = function () {
    if (this.Socket) {
      this.Socket.close();
      this.Socket = null;
    }
    this.Callbacks = {};
  };

  Service.Command = function (msg, identifier) {
    if (this.Socket === null) return;
    if (!this.IsConnected()) return;
    if (identifier === null) identifier = -1;
    var packet = {
      Identifier: identifier,
      Message: msg,
      Name: "WebRcon",
    };
    this.Socket.send(JSON.stringify(packet));
  };

  Service.Request = function (msg, scope, callback) {
    LastIndex++;
    this.Callbacks[LastIndex] = {
      scope: scope,
      callback: callback,
    };
    Service.Command(msg, LastIndex);
  };

  Service.IsConnected = function () {
    if (this.Socket == null) return false;

    return this.Socket.readyState === ConnectionStatus.OPEN;
  };
  Service.InstallService = function (scope, func) {
    scope.$on("OnConnected", function () {
      func();
    });
    if (this.IsConnected()) {
      func();
    }
  };
  Service.getPlayers = function (scope, success) {
    this.Request("playerlist", scope, function (response) {
      var players = JSON.parse(response.Message);

      if (typeof success === "function") {
        success.call(scope, players);
      }
    });
  };

  // Define a variable to store the plugins list
  var pluginsList = [];

  Service.getPlugins = function (scope, success, force) {
    if (pluginsList.length === 0 || force) {
      console.log("No plugins found. Using RCONCMD: 'o.plugins'");
      // Only fetch the plugins if the list is empty
      this.Request("o.plugins", scope, function (response) {
        const rawplugins = response.Message;
        console.log(rawplugins);
        const lines = rawplugins.split("\n").slice(1);

        const plugins = lines
          .map((line) => {
            const parts = line.match(
              /(\d+)\s+"(.+)"\s+\(([\d.]+)\)\s+by\s+([^\s]+)\s+\(([\d.]+)s\)\s+-\s+(.+)/
            );
            if (parts) {
              let status;
              if (parts[6].startsWith("Failed to compile")) {
                status = "Error";
              } else if (parts[6].endsWith("- Unloaded")) {
                status = "Unloaded";
              } else {
                status = "Loaded";
              }
              const oldfile = parts[6];
              const newfile = oldfile.substring(0, oldfile.length - 3);
              return {
                id: parseInt(parts[1]),
                name: parts[2],
                version: parts[3],
                author: parts[4],
                compileTime: parseFloat(parts[5]),
                filename: newfile,
                status: status,
              };
            } else {
              // return null; // Handle lines that don't match the pattern
            }
          })
          .filter(Boolean); // Remove null entries
        // Store the plugins list in the variable
        pluginsList = plugins;
        console.log(plugins);

        if (typeof success === "function") {
          success.call(scope, plugins);
          return pluginsList;
        }
      });
    } else {
      // Use the cached plugins list if available
      if (typeof success === "function") {
        console.log("Plugins previously found.");
        success.call(scope, pluginsList);
        return pluginsList;
      }
    }
  };

  Service.getMap = function (scope, success) {
    // this.Request("", scope, function(response) {
    //   var players = JSON.parse(response.Message);
    //   if (typeof success === 'function') {
    //     success.call(scope, map);
    //   }
    // });
  };

  return Service;
}

var myApp = angular.module('myApp', []);
myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {
	console.log('hi');

	var refresh = function() {
		$http.get('/api/users')
			.success(function(res) {

				$scope.contactlist = res;
				$scope.contact = "";
			});

		$http.get('/api/users/1')
			.success(function(res) {
				$scope.person = res;
			});
	};

	refresh();

	//Create user
	$scope.createUser = function() {
		console.log($scope.contact);

		$http.post('/api/users', $scope.contact)
			.success(function(res) {
				console.log(res);
				refresh();

			})
			refresh();
	}

}]);
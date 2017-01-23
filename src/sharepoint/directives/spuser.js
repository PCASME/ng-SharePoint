/*
	SPUser - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



/////////////////////////////////////////////////////////////////////////////
//	SPUser
//	This directive adds specific user information to then current context
/////////////////////////////////////////////////////////////////////////////

;(function() {

	angular
		.module('ngSharePoint')
		.directive('spuser', spuser_DirectiveFactory);

	spuser_DirectiveFactory.$inject = ['SharePoint'];


	/* @ngInject */
	function spuser_DirectiveFactory(SharePoint) {

		var directive = {

			restrict: 'A',
			replace: false,
			scope: {
				UserData: '=spuser'
			},
			link: postLink

		};

		return directive;



		///////////////////////////////////////////////////////////////////////////////



		function postLink(scope, element, attrs) {

			SharePoint.getCurrentWeb().then(function(web) {

				$scope.currentWeb = web;

				if ($element[0].attributes['user-id'] === void 0) {

					// current user
					$scope.currentWeb.getCurrentUser().then(function(user) {

						$scope.UserData = user;
					});

				} else {

					// Have userId attribute with the specified userId or LoginName
					$scope.$watch(function() {
						return $scope.$eval($attrs.userId);
					}, function(newValue) {

						if (newValue === void 0) return;

						$scope.currentWeb.getUserById(newValue).then(function(user) {

							$scope.UserData = user;
						});

					});

				}
			});

		} // postLink

	} // Directive factory function

})();
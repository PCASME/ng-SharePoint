/*
	SPFieldCurrency - directive

	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldCurrency
///////////////////////////////////////

;(function() {

	angular
		.module('ngSharePoint')
		.directive('spfieldCurrency', spfieldCurrency_DirectiveFactory);

	spfieldCurrency_DirectiveFactory.$inject = ['SPFieldDirective'];


    /* @ngInject */
	function spfieldCurrency_DirectiveFactory(SPFieldDirective) {

		var spfieldCurrency_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {


					var directive = {

						fieldTypeName: 'currency',
						replaceAll: false,

						init: function() {

							$scope.currencyLocaleId = $scope.schema.CurrencyLocaleId;
							// TODO: Get the CultureInfo object based on the field schema 'CurrencyLocaleId' property.
							$scope.cultureInfo = (typeof __cultureInfo == 'undefined' ? Sys.CultureInfo.CurrentCulture : __cultureInfo);

							// TODO: Currency could also have the 'Decimal' value in the 'SchemaXml' property.
							//		 (See SPFieldNumber)

						},

						formatterFn: function(modelValue) {

							if (typeof modelValue === 'string') {
								modelValue = parseFloat(modelValue);
								if (isNaN(modelValue)) modelValue = undefined;
							}

							$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, modelValue, $scope.lastValue);
							$scope.lastValue = modelValue;

							return modelValue;
						},

						parserFn: function(viewValue) {

							if ($scope.lastValue !== parseFloat(viewValue)) {
								// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
								$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, parseFloat(viewValue), $scope.lastValue);
								$scope.lastValue = parseFloat(viewValue);
							}

							return parseFloat(viewValue);
						}

					};


					SPFieldDirective.baseLinkFn.apply(directive, arguments);

					$scope.modelCtrl.$validators.number = function(modelValue, viewValue) {

						return (viewValue === undefined) || (!isNaN(viewValue) && isFinite(viewValue));
					};

				} // link

		}; // Directive definition object


		return spfieldCurrency_DirectiveDefinitionObject;

	} // Directive factory

})();
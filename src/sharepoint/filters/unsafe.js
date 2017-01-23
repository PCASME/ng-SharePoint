/*
	unsafe - filter
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//  unsafe
///////////////////////////////////////

;(function() {
    angular
        .module('ngSharePoint')
        .filter('unsafe', unsafe_Filter);

    unsafe_Filter.$inject = ['$sce'];


    /* @ngInject */
    function unsafe_Filter($sce) {

        return function(val) {

            return $sce.trustAsHtml(val);
        };

    }

})();
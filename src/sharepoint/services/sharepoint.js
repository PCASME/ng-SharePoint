
/**
 * @ngdoc object
 * @name ngSharePoint.SharePoint
 *
 * @description
 * Provides top level access to SharePoint web sites api. Through this provider it is possible to access to any SharePoint web.
 *
 * @requires ngSharePoint.SPUtils
 * @requires ngSharePoint.SPWeb
 */


angular.module('ngSharePoint').provider('SharePoint', 

	[

	function SharePoint_Provider() {

		'use strict';

		var SharePoint = function($cacheFactory, $q, SPUtils, SPWeb) {


			/**
			 * @ngdoc function
			 * @name ngSharePoint.SharePoint#getCurrentWeb
			 * @methodOf ngSharePoint.SharePoint
			 * 
			 * @description
			 * Returns an {@link ngSharePoint.SPWeb SPWeb} object initialized with the 
			 * current SharePoint web. That means, the web context where 
			 * this sentence is executed
			 * 
			 * @returns {promise} Promise with a new {@link ngSharePoint.SPWeb SPWeb} object that allows access to
			 * web methods and properties
			 * 
			 * @example
			 * <pre>
			 *	SharePoint.getCurrentWeb().then(function(web) {
			 *	  // ... do something with the web object
			 *	});
			 * </pre>
			 */
			this.getCurrentWeb = function() {
				return this.getWeb();
			};


			/**
			 * @ngdoc function
			 * @name ngSharePoint.SharePoint#getWeb
			 * @methodOf ngSharePoint.SharePoint
			 * 
			 * @description
			 * Returns the {@link ngSharePoint.SPWeb SPWeb} specified by the required url
			 * 
			 * @param {string} url The url of the web that you want to retrieve
			 * @returns {promise} Promise with a new {@link ngSharePoint.SPWeb SPWeb} object that allows access to
			 * web methods and properties
			 * 
			 * @example
			 * <pre>
			 *	SharePoint.getWeb('/sites/rrhh').then(function(web) {
			 *	  // ... do something with the 'rrhh' web object
			 *	});
			 * </pre>
			 */
			this.getWeb = function(url) {
				var def = $q.defer();

				SPUtils.SharePointReady().then(function() {

					new SPWeb(url).then(function(web) {
						def.resolve(web);
					});

				});

				return def.promise;
			};



			/**
			 * @ngdoc function
			 * @name ngSharePoint.SharePoint#get
			 * @methodOf ngSharePoint.SharePoint
			 * 
			 * @description
			 * Returns the results of the query to the SharePoint API REST specified by the required url.
			 * 
			 * @param {string} webServerRelativeUrl The web server relative url of the web where to perform the query.
			 * @param {string} queryUrl The url of the complete query to perform. It refers to the query part after /<webServerRelativeUrl>/_api/web/...
			 * @returns {promise} Promise with results of the query.
			 * 
			 * @example
			 * <pre>
			 *	SharePoint.get("/sites/rrhh/_api/web/Lists/GetByTitle('MyList')/RoleAssignments/GetByPrincipalId(35)").then(function(results) {
			 *	  // ... do something with the 'rrhh' web object
			 *	});
			 * </pre>
			 */
			this.get = function(webServerRelativeUrl, queryUrl) {

				var def = $q.defer();

				SPUtils.SharePointReady().then(function() {

					var executor = new SP.RequestExecutor(webServerRelativeUrl);
	                var endpoint = '/' + webServerRelativeUrl.trimS('/') + "/_api/web/" + queryUrl.trimS('/');


					executor.executeAsync({

						url: endpoint,
						method: 'GET', 
						headers: { 
							"Accept": "application/json; odata=verbose"
						}, 

						success: function(data) {

							var d = utils.parseSPResponse(data);
							utils.cleanDeferredProperties(d);
							
							def.resolve(d);
							
						}, 

						error: function(data, errorCode, errorMessage) {

							var err = utils.parseError({
								data: data,
								errorCode: errorCode,
								errorMessage: errorMessage
							});

							def.reject(err);
						}
					});
				});


				return def.promise;

			}; // getProperties

		};


		
		this.$get = function($cacheFactory, $q, SPUtils, SPWeb) {
			return new SharePoint($cacheFactory, $q, SPUtils, SPWeb);
		};

	}
]);

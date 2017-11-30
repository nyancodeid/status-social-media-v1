(function() {
	this.myApp = new Framework7({
		modalTitle: 'Status Social Media #1',
		// Enable Material theme
		material: true,
	});
	$$ = Dom7;
	this.mainView = this.myApp.addView('.view-main', {});
	this.deviceId = null;

	// Debug
	var imageDemo = "images/goulash.jpg";

	var Status = [];
	var Key = "ny4nD3vStu10";
	var nyanStorage = new nyanStorageContructor();
	var viewNow;

	$$.ajax({
		url: 'vendors/thumbnail/category.dat',
		cache: true,
		success: function(data) {
			var category = CryptoJS.AES.decrypt(data, Key).toString(CryptoJS.enc.Utf8);
				category = JSON.parse(category);

			nyanStorage.put('dataCategory', category);
		}
	});

	var Util = {
		setUrl: function(imageUrl) {
			return 'https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy'
				+ '?container=focus'
				+ '&url=' + imageUrl
				;
		},
		makeIntro: function(resep) {
			var servingType = resep.servings.split(' ')[1];
			var intro = "";

			switch(servingType) {
				case 'porsi':
					intro = "Ayo dilihat mom's cara bikin " + resep.name + " untuk " + resep.servings;
					break;
				case 'gelas':
					intro = "Bikin " + resep.name + " seperti nya enak nih, Bikin minuman untuk " + resep.servings + " untuk teman atau keluarga.";
					break;
				case 'buah':
					intro = "Membuat " + resep.name + " memang mudah, yuk ikuti langkah langkah nya.";
					break;
				case 'bungkus':
					intro = "Mungkin kamu tertarik untuk bikin " + resep.name + " untuk " + resep.servings;
					break;
				default:
					intro = "Hari ini bikin apa ya? Bikin " + resep.name + " aja.";
					break;
			}

			return intro;
		},
		showNotif: function(message, timeout) {
			var timeout = timeout || 3000;

			var notifAdded = myApp.addNotification({
				message: message
			});

			setTimeout(function() {
				myApp.closeNotification(notifAdded);
			}, timeout);
		},
		addViewKey: function(Arrays, callback) {
			var lengthArrays = (Arrays.length - 1);

			Arrays.forEach(function(Status, $index) {
				Arrays[$index].viewer = 0;

				if ($index == lengthArrays) {
					callback(Arrays);
				}
			});
		}
	};
	var Controller = {
		listOfStatus: function($scope) {
			var Category = [];

			$scope.index = 0;
			$scope.view = 8;
			
			if (!nyanStorage.isAvailable('dataStatus')) {
				$$.ajax({
					url: 'vendors/thumbnail/status.dat',
					cache: true,
					success: function(data) {
						var status = CryptoJS.AES.decrypt(data, Key).toString(CryptoJS.enc.Utf8);
						nyanStorage.put('dataStatus', status);	
						status = JSON.parse(status);

						setTimeout(function() {
							$$('#overlay-preloader').hide();
						}, 500);
					}
				});
			} else {
				Category = nyanStorage.get('dataCategory');

				$scope.dataCategory = Category;

				setTimeout(function() {
					$$('#overlay-preloader').hide();
				}, 500);
			}

			$scope.action = {
				LoadMore: function() {
					myApp.showIndicator();

					var wantToPush = Status.splice($scope.index, $scope.view);

					wantToPush.forEach(function(objectPush, $index) {
						$scope.reseps.push(objectPush);

						if ($index == (wantToPush.length - 1)) {
							myApp.hideIndicator();
						}
					});	
				},
				addReadLeter: function($data, $index) {
					delete $data.$$hashKey;
					nyanStorage.update('readLeter', $data);

					$scope.reseps[$index].readLeter = true;

					var tempStatus = nyanStorage.get('dataStatus');
					tempStatus.forEach(function(resepData, index) {
						if (resepData.id == $data.id) {
							tempStatus[index].readLeter = true;

							nyanStorage.put('dataStatus', tempStatus);
							Util.showNotif("Berhasil di tambahkan ke Baca nanti");
						}
					});
				},
				openCategory: function($data) {
					delete $data.$$hashKey;

					viewNow = $data;

					mainView.router.loadPage('status.html');
				}
			}
		},
		listOfLaterStatus: function($scope) {
			$scope.reseps = nyanStorage.get('readLeter');
			
			setTimeout(function() {
				$scope.$apply(function() {
					if (nyanStorage.isAvailable('readLeter')) {
						$scope.isReadLeterEmpty = ($scope.reseps.length == 0) ? true : false;
					} else {
						$scope.isReadLeterEmpty = true;
					}
				});
			}, 1000);

			$scope.getImage = function(image) {
				return Util.setUrl(image);
			}
			$scope.action = {
				addFavorite: function($data, $index) {
					delete $data.$$hashKey;
					$scope.reseps[$index].favorit = true;

					var tempStatus = nyanStorage.get('dataStatus');
					tempStatus.forEach(function(resepData, index) {
						if (resepData.id == $data.id) {
							tempStatus[index].favorit = true;

							nyanStorage.put('dataStatus', tempStatus);
							Util.showNotif('Berhasil di tambahkan ke Favorit');
						}
					});
				}
			}
		},
		resepView: function($scope) {
			$scope.resep = Status[nyanStorage.get('viewStatusId')];
		}
	};
	var Events = {
		onDeviceReady: function() {
			var admobid = {
				banner: 'ca-app-pub-3940256099942544/6300978111',
				interstitial: 'ca-app-pub-3940256099942544/1033173712'
			};

			AdMob.createBanner( {
				adId: admobid.banner,
				position: AdMob.AD_POSITION.BOTTOM_CENTER,
				isTesting: false, // TODO: remove this line when release
				overlap: false,
				offsetTopBar: false,
				bgColor: 'black'
			});
			AdMob.prepareInterstitial({
				adId: admobid.interstitial,
				autoShow:false
			});
		},
		resepTabRefresh: function(e) {
			var elemn = document.querySelector('[ng-controller=listOfStatus]');
			var $scope = angular.element(elemn).scope();

			$scope.$apply(function() {
				var dataStatus = nyanStorage.get('dataStatus');
				$scope.reseps = dataStatus.splice($scope.index, $scope.view);
			});

			myApp.pullToRefreshDone();
		},
		readLeterRefresh: function(e) {
			var elemn = document.querySelector('[ng-controller=listOfLaterStatus]');
			var $scope = angular.element(elemn).scope();

			$scope.$apply(function() {
				$scope.reseps = nyanStorage.get('readLeter');
				if (nyanStorage.isAvailable('readLeter')) {
					$scope.isReadLeterEmpty = ($scope.reseps.length == 0) ? true : false;
				} else {
					$scope.isReadLeterEmpty = true;
				}
			});

			myApp.pullToRefreshDone();
		},
		statusViewLoaded: function(page) {
			$$(page.container).find('#backButton').click(function () {
				mainView.router.back();
			});

			var dataStatus = nyanStorage.get('dataStatus');
			var dataCategory = nyanStorage.get('dataCategory');

			var Status = _.where(dataStatus, {cat_id: viewNow.cat_id});
				Status = _.shuffle(Status);

			selectedStatus = Status.splice(0, 10);

			//push status to ul#ListOfStatus DOM
			selectedStatus.forEach(function(status) {
				_.templateSettings = {
					interpolate: /\{\{(.+?)\}\}/g
				};
				var templateDOM = _.template("<div class='card statusCard'><div class='card-body'><p>{{ status }}</p><div class='card-footer' style='padding-right:0;'><a class='link icon-only' data-id='{{ status_id }}'><i class='icon iconNonFavorite'></i></a><a class='link icon-only buttonCopy' data-status='{{ status }}'><i class='icon iconCopy'></i></a></div></div></div>");

				$$(page.container).find('#ListOfStatus').append(templateDOM(status));
			});	

			$$(page.container).find('#title').text(viewNow.cat_name);
			$$(page.container).find('#loadMore').click(function() {
				selectedStatus = Status.splice(0, 10);

				selectedStatus.forEach(function(status) {
					_.templateSettings = {
						interpolate: /\{\{(.+?)\}\}/g
					};
					var templateDOM = _.template("<div class='card statusCard'><div class='card-body' align='right'><p>{{ status }}</p><button data-status='{{ status }}' class='buttonCopy icon iconCopy'></button></div></div>");

					$$(page.container).find('#ListOfStatus').append(templateDOM(status));
				});
			});
				
			$$(page.container).find('.buttonCopy').on('click', function() {
				var status = $$(this).data('status');

				window.cordova.plugins.clipboard.copy(status, function() {
					Util.showNotif("Copied to clipboard", 3000);
				});
			});
		}
	};

	document.addEventListener("deviceready", Events.onDeviceReady, false);

	$$('#resepTab').on('refresh', Events.resepTabRefresh);	
	$$('#bacaNantiTab').on('refresh', Events.readLeterRefresh);

	myApp.onPageInit('statusView', Events.statusViewLoaded);


	var apps = angular.module('statusSocialMedia', ['ngMdIcons']);
	apps.controller('listOfStatus', ['$scope', Controller.listOfStatus]);
	apps.controller('listOfLaterStatus', ['$scope', Controller.listOfLaterStatus]);	
})();

// Outside EventCall
var errorImageCallback = function(imageDom) {
	imageDom.src = "images/goulash.jpg";
}
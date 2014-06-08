// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngResource', 'hmTouchEvents', "angularFileUpload"])

.run(function($ionicPlatform, $http) {
  $http.defaults.withCredentials = true;

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('landing', {
      url: '/',
      templateUrl: "templates/landing.html", 
      controller: "LandingController"
    })

    .state('wall', {
      url: '/wall',
      templateUrl: "templates/wall.html", 
      controller: "WallController"
    })

    .state('snap', {
      url: '/snaps/:id',
      templateUrl: "templates/snap.html",
      controller: "SnapController"
    })

    .state('profile', {
      url: '/profile',
      templateUrl: "templates/profile.html",
      controller: "ProfileController"
    })

  $urlRouterProvider.otherwise('/');
})

.factory('User', function($resource) {
  return $resource('http://localhost:3000/api/users/:_id', {_id: "@_id"}, {'update': {method: 'PUT'}})
})

.factory('Snap', function($resource) {
  return $resource('http://localhost:3000/api/snaps/:_id', {_id: "@_id"}, {'update': {method: 'PUT'}})
})

.factory('Me', function($resource) {
  return $resource( 'http://localhost:3000/api/users/:_id', {_id: "@_id"}, {'update': {  method: 'PUT' }, 'get': {method: 'GET', url: 'http://localhost:3000/me'} });
})

.controller('WallController', function(User, Snap, Me, $upload, $scope, $location) {
  $scope.me = Me.get(function(me) {
    $scope.users = User.query()
    $scope.snaps = Snap.query({conditions: {to: me._id}, populate: "to from"})
  })

  $scope.loadSnap = function(_id) {
    for (var userIndex = 0; userIndex < $scope.users.length; userIndex++) {
      if ($scope.users[userIndex].snaps.length != 0 && $scope.users[userIndex]._id == _id) {
        $location.url('/snaps/' + _id)
      }
    }
  }

  $scope.onFileSelect = function($files, _id) {
    var file = $files[0];
    $scope.upload = $upload.upload({
      url: 'http://localhost:3000/upload',
      method: 'POST',
      file: file, 
    }).success(function(data, status, headers, config) {
      s = new Snap({
        path: data,
        to: _id,
        from: $scope.me._id
      })
      s.$save()
    });
  }

  $scope.snap = function(_id) {
    console.log("SNAP DAT ASS")
    s = new Snap({
      path: "http://localhost:3000/uploads/cookie.jpg",
      to: _id,
      from: $scope.me._id
    })
    s.$save()
  }
})

.controller('SnapController', function(Me, Snap, $stateParams, $scope) { 
  
  $scope.snap = Snap.get({_id: $stateParams.id})

  $scope.clickHandler = function() {
    $scope.snap.seen = true
    $scope.snap.$update()
    window.history.back()
  }
})

.controller('ProfileController', function(Me, Snap, $upload, $scope) {
  $scope.me = Me.get(function(me) {
    $scope.snaps = Snap.query({conditions: {to: me._id}, populate: "to from"})
  })
  $scope.imageIndex = 0

  $scope.save = function() {
    $scope.me.$update()
  }

  $scope.onFileSelect = function($files) {
    console.log($files)
    var file = $files[0];
    $scope.upload = $upload.upload({
      url: 'http://localhost:3000/upload',
      method: 'POST',
      file: file, 
    }).success(function(data, status, headers, config) {
      console.log($scope.me)
      $scope.me.profile.push(data)
      $scope.me.$update()
      $scope.imageIndex = $scope.me.profile.length - 1
    });
  }

  $scope.remove = function() {
    $scope.me.profile.splice($scope.imageIndex, 1)
    $scope.me.$update()
    $scope.imageIndex = 0
  }
})

.controller('LandingController', function(Me, $http, $scope) {

  $scope.signinCallback = function(authResult) {
    if (authResult.code) {
      $.post('http://localhost:3000/auth/google/return', { code: authResult.code})
      .done(function(data) {
        console.log("HAIHAI,", data)
        $scope.me = Me.get(function() {
          $location.url('/wall')
        })
      })
      .error(function() {
        console.log(arguments)
      }); 
    } else if (authResult.error) {

      console.log('There was an error: ' + authResult.error);
    }
  }
  window.signinCallback = $scope.signinCallback;

})


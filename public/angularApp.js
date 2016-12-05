var app = angular.module('storyParser', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

	$stateProvider.state('home', {
		url : '/home',
		templateUrl : '/home.html',
		controller : 'MainCtrl',
		resolve : {
			storyPromise : ['stories',
			function(stories) {
				return stories.getAll();
			}]

		}
	}).state('stories', {
		url : '/stories/:id',
		templateUrl : '/stories.html',
		controller : 'StoriesCtrl',
		resolve : {
			story : ['$stateParams', 'stories',
			function($stateParams, stories) {
				return stories.get($stateParams.id);
			}]

		}
	}).state('login', {
		url : '/login',
		templateUrl : '/login.html',
		controller : 'AuthCtrl',
		onEnter : ['$state', 'auth',
		function($state, auth) {
			if (auth.isLoggedIn()) {
				$state.go('home');
			}
		}]

	}).state('register', {
		url : '/register',
		templateUrl : '/register.html',
		controller : 'AuthCtrl',
		onEnter : ['$state', 'auth',
		function($state, auth) {
			if (auth.isLoggedIn()) {
				$state.go('home');
			}
		}]

	});

	$urlRouterProvider.otherwise('home');
}]);

app.factory('auth', ['$http', '$window',
function($http, $window) {
	var auth = {};

	auth.saveToken = function(token) {
		$window.localStorage['story-parser-token'] = token;
	};

	auth.getToken = function() {
		return $window.localStorage['story-parser-token'];
	}

	auth.isLoggedIn = function() {
		var token = auth.getToken();

		if (token) {
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentUser = function() {
		if (auth.isLoggedIn()) {
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	auth.register = function(user) {
		return $http.post('/register', user).success(function(data) {
			auth.saveToken(data.token);
		});
	};

	auth.logIn = function(user) {
		return $http.post('/login', user).success(function(data) {
			auth.saveToken(data.token);
		});
	};

	auth.logOut = function() {
		$window.localStorage.removeItem('story-parser-token');
	};

	return auth;
}]);

app.factory('stories', ['$http', 'auth',
function($http, auth) {
	var o = {
		stories : []
	};

	o.getAll = function() {
		return $http.get('/stories').success(function(data) {
			angular.copy(data, o.stories);
		});
	};
	//now we'll need to create new stories
	//uses the router.story in index.js to story a new Story mongoose model to mongodb
	//when $http gets a success back, it adds this story to the stories object in
	//this local factory, so the mongodb and angular data is the same
	//sweet!
	o.create = function(story) {
	  return $http.post('/stories', story, {
	    headers: {Authorization: 'Bearer '+auth.getToken()}
	  }).success(function(data){
	    o.stories.push(data);
	  });
	};
	
	o.upvote = function(story) {
	  return $http.put('/stories/' + story._id + '/upvote', null, {
	    headers: {Authorization: 'Bearer '+auth.getToken()}
	  }).success(function(data){
	    story.upvotes += 1;
	  });
	};
	//downvotes
	o.downvote = function(story) {
	  return $http.put('/stories/' + story._id + '/downvote', null, {
	    headers: {Authorization: 'Bearer '+auth.getToken()}
	  }).success(function(data){
	    story.upvotes -= 1;
	  });
	};
	//grab a single story from the server
	o.get = function(id) {
		//use the express route to grab this story and return the response
		//from that route, which is a json of the story data
		//.then is a promise, a kind of newly native thing in JS that upon cursory research
		//looks friggin sweet; TODO Learn to use them like a boss.  First, this.
		return $http.get('/stories/' + id).then(function(res) {
			return res.data;
		});
	};
	//lines, once again using express
	o.addLine = function(id, line) {
	  return $http.post('/stories/' + id + '/lines', line, {
	    headers: {Authorization: 'Bearer '+auth.getToken()}
	  });
	};
	
	o.upvoteLine = function(story, line) {
	  return $http.put('/stories/' + story._id + '/lines/'+ line._id + '/upvote', null, {
	    headers: {Authorization: 'Bearer '+auth.getToken()}
	  }).success(function(data){
	    line.upvotes += 1;
	  });
	};	
	//downvote lines
	//I should really consolidate these into one voteHandler function
	o.downvoteLine = function(story, line) {
	  return $http.put('/stories/' + story._id + '/lines/'+ line._id + '/downvote', null, {
	    headers: {Authorization: 'Bearer '+auth.getToken()}
	  }).success(function(data){
	    line.upvotes -= 1;
	  });
	};	
	return o;
}]);



app.controller('MainCtrl', ['$scope', 'stories', 'auth',
function($scope, stories, auth) {
	$scope.stories = stories.stories;
	$scope.isLoggedIn = auth.isLoggedIn;
	//setting title to blank here to prevent empty stories
	$scope.title = '';

	$scope.addStory = function() {
		if ($scope.title === '') {
			return;
		}
		stories.create({
			title : $scope.title,
			Description: $scope.Description,
		});
		//clear the values
		$scope.title = '';
		$scope.Description = '';
	};

	$scope.upvote = function(story) {
		//our story factory has an upvote() function in it
		//we're just calling this using the story we have
		console.log('Upvoting:' + story.title + "votes before:" + story.upvotes);
		stories.upvote(story);
	};
	$scope.downvote = function(story) {
		stories.downvote(story);
	};
}]);

app.controller('StoriesCtrl', ['$scope', 'stories', 'story', 'auth',
function($scope, stories, story, auth) {
	$scope.story = story;
	$scope.isLoggedIn = auth.isLoggedIn;

	$scope.addLine = function() {
		if ($scope.body === '') {
			return;
		}
		stories.addLine(story._id, {
			body : $scope.body,
			author : 'user'
		}).success(function(line) {
			$scope.story.lines.push(line);
		});
		$scope.body = '';
	};
	$scope.upvote = function(line) {
		stories.upvoteLine(story, line);
	};

	$scope.downvote = function(line) {
		stories.downvoteLine(story, line);
	};

}]);

app.controller('AuthCtrl', ['$scope', '$state', 'auth',
function($scope, $state, auth) {
	$scope.user = {};

	$scope.register = function() {
		auth.register($scope.user).error(function(error) {
			$scope.error = error;
		}).then(function() {
			$state.go('home');
		});
	};

	$scope.logIn = function() {
		auth.logIn($scope.user).error(function(error) {
			$scope.error = error;
		}).then(function() {
			$state.go('home');
		});
	};
}]);

app.controller('NavCtrl', ['$scope', 'auth',
function($scope, auth) {
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser;
	$scope.logOut = auth.logOut;
}]);


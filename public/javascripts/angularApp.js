
angular.module('weatherNews', ['ui.router'])

.factory('postHandler', ['$http', function($http){
    var o = {
        posts: [],
        curPost: {}
    };

    o.getAll = function() {
        return $http.get('/posts').success( function(data) {
            angular.copy(data, o.posts);
        });
    };

    o.create = function(post) {
        return $http.post('/posts', post).success(function(data) {
            o.posts.push(data);
        });
    };

    o.upvote = function(post) {
        return $http.put('/posts/' + post._id + '/upvote')
        .success( function(data) {
            post.upvotes ++;
        });
    };

    o.getPost = function(id) {
        return $http.get('/posts/' + id) .success( function(data) {
            angular.copy(data, o.curPost);
        });
    }

    o.addComment = function(id, commentArray, comment) {
        return $http.post('/posts/' + id + '/comments', comment);
    };

    o.upvoteComment = function(id, comment) {
        return $http.put('/posts/' + id + '/comments/' + comment._id + '/upvote')
        .success( function(data) {
            comment.upvotes ++;
        });
    }

    return o;
}])

.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider

        .state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'MainCtrl'
        })

        .state('posts', {
            url: '/posts/{id}',
            templateUrl: '/posts.html',
            controller: 'PostCtrl'
        });

        $urlRouterProvider.otherwise('home');
    }
])

.controller('MainCtrl', [
    '$scope',
    'postHandler',
    function($scope, postHandler) {
        postHandler.getAll();
        $scope.posts = postHandler.posts;

        $scope.addPost = function() {
            if ($scope.formContent === '') return;
            postHandler.create({title: $scope.formContent, upvotes: 0});
            $scope.formContent = '';
        };

        $scope.upvote = function(post) {
            postHandler.upvote(post);
        }
    }
])

.controller('PostCtrl', [
    '$scope',
    '$stateParams',
    'postHandler',
    function($scope, $stateParams, postHandler){
        var curPost = postHandler.posts[$stateParams.id];
        if (curPost == undefined) return;
        postHandler.getPost(curPost._id);
        $scope.post = postHandler.curPost;

        $scope.addComment = function() {
            if ($scope.body === '') return;
            postHandler.addComment(curPost._id, curPost.comments, {
                body: $scope.body,
                upvotes: 0
            })
            .success( function(comment) {
                postHandler.curPost.comments.push(comment);
                curPost.comments.push(comment);
            });
            $scope.body = '';
        };

        $scope.upvote = function(comment) {
            postHandler.upvoteComment(curPost._id, comment);
        };
    }
])

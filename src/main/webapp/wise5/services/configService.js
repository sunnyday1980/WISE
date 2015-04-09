define(['angular'], function(angular) {

    angular.module('ConfigService', [])
	
	.service('ConfigService', ['$http', function($http) {
		this.config = null;
		
		this.retrieveConfig = function(configUrl) {
			return $http.get(configUrl).then(angular.bind(this, function(result) {
				var config = result.data;
				
				// hard-coding these values here for now. They should really come from the server.
				/*
				config.textDirection = 'rtl';
				config.projectURL = 'http://localhost:8080/wise/curriculumWISE5/4/project.json';
				config.projectBaseURL = config.projectURL.replace('project.json','');
                config.getStudentDataUrl = 'http://localhost:8080/wise/vle5/student/studentData.json';
                config.projectId = 1;
                config.authorURL = 'http://localhost:8080/wise/authorWISE5.html';
                config.layoutLogic = function(vle) {
                    
                };
                */
				this.config = config;
				return config;
			}));
		};
		
		this.getConfig = function() {
			return this.config;
		};
	
		this.getConfigParam = function(urlName) {
			if (this.config !== null) {
				return this.config[urlName];
			} else {
	            return null;
			}
		}; 
		
		this.getWorkgroupId = function() {
		    var workgroupId = null;
		    var userInfo = this.getConfigParam('userInfo');
		    if (userInfo != null) {
	            var myUserInfo = userInfo.myUserInfo;
	            if (myUserInfo != null) {
	                workgroupId = myUserInfo.workgroupId;
	            }
		    }
		    return workgroupId;
		};
		
		this.getPeriodId = function() {
            var periodId = null;
            var userInfo = this.getConfigParam('userInfo');
            if (userInfo != null) {
                var myUserInfo = userInfo.myUserInfo;
                if (myUserInfo != null) {
                    periodId = myUserInfo.periodId;
                }
            }
            return periodId;
        };
        
        this.getWebSocketURL = function() {
          return this.getConfigParam('webSocketURL');  
        };
		
		this.getRunId = function() { 
			return this.getConfigParam('runId');
		};
	}]);
});
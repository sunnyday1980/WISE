define(['app'], 
        function(app) {
    app.$controllerProvider.register('VLEController', 
            function($scope, ConfigService, NodeApplicationService, ProjectService, NodeService, StudentDataService) {
        this.mode = 'student';
        this.globalTools = ['hideNavigation', 'showNavigation', 'next', 'prev', 'portfolio', 'home', 'sign out'];
        this.currentNode = null;
        this.callbackListeners = [];
        this.wiseMessageId = 0;

        this.globalToolButtonClicked = function(globalToolName) {
            if (globalToolName === 'hideNavigation') {
                $('#navigation').hide();
                $('#nodeIFrame').show();
            } else if (globalToolName === 'showNavigation') {
                $('#navigation').show();
                $('#nodeIFrame').hide();
            }
        }
        var wiseBaseURL = ConfigService.getConfigParam('wiseBaseURL');
        
        $scope.$on('$messageIncoming', angular.bind(this, function(event, data) {
            console.log('received message in viewMapController.js');
            var msg = data;
            console.log('in student vle controller, received message:'+JSON.stringify(msg));
            
            //getWISEStudentDataRequest
            //getWISEStudentDataResponse
            //postWISEStudentDataRequest
            //postWISEStudentDataResponse
            
            //getWISENodeContentRequest
            //getWISENodeContentResponse
            //postWISENodeContentRequest
            //postWISENodeContentResponse
            
            //getWISEDataRequest
            //getWISEDataResponse
            //postWISEDataRequest
            //postWISEDataResponse
            var wiseMessageId = msg.wiseMessageId;
            if (wiseMessageId != null) {
                for (var i = 0; i < this.callbackListeners.length; i++) {
                    var callbackListener = this.callbackListeners[i];
                    if (callbackListener && callbackListener.wiseMessageId === wiseMessageId) {
                        callbackListener.callback(callbackListener.callbackArgs);
                    }
                }
            }
            
            var action = msg.action;
            
            if (action === 'getWISEDataRequest') {
                var nodeId = msg.nodeId;
                var loadingParams = msg.loadingParams;
                
                var studentData = null;
                
                if (loadingParams && loadingParams.loadAllNodeStates) {
                    studentData = StudentDataService.getAllNodeStatesByNodeId(nodeId);
                } else if (loadingParams && loadingParams.loadLatestState) {
                    studentData = [StudentDataService.getLatestNodeStateByNodeId(nodeId)];
                }
                
                var nodeSrc = ProjectService.getNodeSrcByNodeId(nodeId);
                
                var newNodeVisit = StudentDataService.createNodeVisit(nodeId);
                
                NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
                    var wiseData = {};
                    wiseData.nodeContent = nodeContent;
                    wiseData.studentData = studentData;
                    wiseData.globalStyle = '#title {color:purple;} body {background-color:yellow}';
                    var postMessage = {
                        'action': 'getWISEDataResponse',
                        'wiseData': wiseData,
                        'viewType': 'teacher'
                    };
                    this.postMessageToNodeIFrame(postMessage);
                }));

            } else if (action === 'getWISEProjectRequest') {
                var project = ProjectService.project;

                var wiseData = {};
                wiseData.project = project;
                
                var postMessage = {
                    'viewType': 'studentNavigation',
                    'action': 'getWISEProjectResponse',
                    'wiseData': wiseData,
                    'globalStyle': '#title {color:purple;} body {background-color:yellow}'
                };
                
                this.postMessageToNavigationIFrame(postMessage);
            } else if (action === 'postWISEStudentDataRequest') {
                var nodeId = msg.nodeId;
                var wiseData = msg.wiseData;
                var studentData = wiseData.studentData;
                
                StudentDataService.addNodeStateToLatestNodeVisit(nodeId, studentData);
                
                var postMessage = {
                    'action': 'postWISEStudentDataResponse',
                    'viewType': 'student'
                }
                
                this.postMessageToNodeIFrame(postMessage);
            } else if (action === 'getWISEStudentDataResponse') {
                var nodeId = msg.nodeId;
                var wiseData = msg.wiseData;
                var studentData = wiseData.studentData;
                
                StudentDataService.addNodeStateToLatestNodeVisit(nodeId, studentData);
            } else if (action === 'navigation_moveToNode') {
                var nodeId = msg.nodeId;
                var mode = this.mode;
                this.loadNode(nodeId, mode);
            } else if (action === 'postNodeStatusRequest') {
                var nodeStatus = msg.nodeStatus;
                var nodeId = msg.nodeId;
                
                var currentNodeId = this.currentNode.id;
                
                if (nodeId === currentNodeId) {
                    var isLoadingComplete = nodeStatus.isLoadingComplete;
                    
                    if (isLoadingComplete) {
                        /*
                        setInterval(angular.bind(this, function() {
                            console.log('hello');
                            
                            var postMessage = {
                                'viewType': 'student',
                                'action': 'getWISEStudentDataRequest',
                                'saveTriggeredBy': 'wiseIntermediate'
                            };
                            
                            this.postMessageToNodeIFrame(postMessage);
                        }), 5000);
                        */
                    }
                }
                
            }
        }));
        
        $scope.sendMessage = function() {
            this.$emit('$messageOutgoing', angular.toJson({"response": "hi"}))
        };
        
        this.loadNode = function(nodeId, mode) {
            /*
             * wiseOnExit
             * wiseIntermediate
             * node
             */
            
            var postMessage = {
                'viewType': 'student',
                'action': 'getWISEStudentDataRequest',
                'saveTriggeredBy': 'wiseOnStepExit',
                'callbackArgs': {'nodeId':nodeId}
            };
            
            var moveToNode = angular.bind(this, function() {
                var node = ProjectService.getNodeByNodeId(nodeId);
                
                if(node !== null) {
                    this.currentNode = node;
                    var nodeType = node.type
                    var nodeIFrameSrc = NodeApplicationService.getNodeURL(nodeType) + '?nodeId=' + nodeId + '&mode=' + this.mode;
                    $('#nodeIFrame').attr('src', nodeIFrameSrc);
                    $('#navigation').hide();
                    $('#nodeIFrame').show();
                };
            });
            if (this.currentNode != null) {
                this.postMessageToNodeIFrame(postMessage, moveToNode);
            } else {
                moveToNode();
            }
            
        };
        
        this.postMessageToIFrame = function(iFrameId, message, callback) {
            if (callback != null) {
                message.wiseMessageId = this.wiseMessageId;
                this.callbackListeners.push({wiseMessageId:this.wiseMessageId, callback:callback});
                this.wiseMessageId++;
            }
            var iFrame = $('#' + iFrameId);
            iFrame[0].contentWindow.postMessage(message, '*');
        };
        
        this.postMessageToNodeIFrame = function(message, callback) {
            this.postMessageToIFrame('nodeIFrame', message, callback);
        };
        
        this.postMessageToNavigationIFrame = function(message, callback) {
            this.postMessageToIFrame('navigationIFrame', message, callback);
        };
        var knownNavigationApplications = ConfigService.getConfigParam('navigationApplications');
        var projectNavigationApplications = ProjectService.project.navigationApplications;
        var defaultNavigationApplication = projectNavigationApplications[0];
        for (var i = 0; i < knownNavigationApplications.length; i++) {
            var knownNavigationApplication = knownNavigationApplications[i];
            if (knownNavigationApplication.name === defaultNavigationApplication) {
                var navigationApplicationURL = knownNavigationApplication.url;
                $('#navigation').html('<iframe id="navigationIFrame" ' + 
                    'src="' + navigationApplicationURL + '"></iframe>');
            }
        }
    });
});
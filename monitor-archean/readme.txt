k8s events
deployemnt: ADDED name {}
deployment MODIFIED name {
             "conditions": [
               {
                 "type": "Progressing",
                 "status": "True",
                 "lastUpdateTime": "2020-01-28T06:57:52Z",
                 "lastTransitionTime": "2020-01-28T06:57:52Z",
                 "reason": "NewReplicaSetCreated",
                 "message": "Created new replica set \"unnamed-8b444b857\""
               }
             ]
           }
pods ADDED unnamed unnamed-8b444b857-lkqvn
{
  "phase": "Pending",
  "qosClass": "Burstable"
}

deployment MODIFIED name
{
  "observedGeneration": 1,
  "unavailableReplicas": 1,
  "conditions": [
    {
      "type": "Progressing",
      "status": "True",
      "lastUpdateTime": "2020-01-28T06:57:52Z",
      "lastTransitionTime": "2020-01-28T06:57:52Z",
      "reason": "NewReplicaSetCreated",
      "message": "Created new replica set \"unnamed-8b444b857\""
    },
    {
      "type": "Available",
      "status": "False",
      "lastUpdateTime": "2020-01-28T06:57:52Z",
      "lastTransitionTime": "2020-01-28T06:57:52Z",
      "reason": "MinimumReplicasUnavailable",
      "message": "Deployment does not have minimum availability."
    }
  ]
}

pods MODIFIED unnamed unnamed-8b444b857-lkqvn
{
  "phase": "Pending",
  "conditions": [
    {
      "type": "PodScheduled",
      "status": "True",
      "lastProbeTime": null,
      "lastTransitionTime": "2020-01-28T06:57:52Z"
    }
  ],
  "qosClass": "Burstable"
}

depl mod name
{
  "observedGeneration": 1,
  "replicas": 1,
  "updatedReplicas": 1,
  "unavailableReplicas": 1,
  "conditions": [
    {
      "type": "Available",
      "status": "False",
      "lastUpdateTime": "2020-01-28T06:57:52Z",
      "lastTransitionTime": "2020-01-28T06:57:52Z",
      "reason": "MinimumReplicasUnavailable",
      "message": "Deployment does not have minimum availability."
    },
    {
      "type": "Progressing",
      "status": "True",
      "lastUpdateTime": "2020-01-28T06:57:52Z",
      "lastTransitionTime": "2020-01-28T06:57:52Z",
      "reason": "ReplicaSetUpdated",
      "message": "ReplicaSet \"unnamed-8b444b857\" is progressing."
    }
  ]
}

pods
{
  "phase": "Pending",
  "conditions": [
    {
      "type": "Initialized",
      "status": "True",
      "lastProbeTime": null,
      "lastTransitionTime": "2020-01-28T06:57:52Z"
    },
    {
      "type": "Ready",
      "status": "False",
      "lastProbeTime": null,
      "lastTransitionTime": "2020-01-28T06:57:52Z",
      "reason": "ContainersNotReady",
      "message": "containers with unready status: [unnamed]"
    },
    {
      "type": "ContainersReady",
      "status": "False",
      "lastProbeTime": null,
      "lastTransitionTime": "2020-01-28T06:57:52Z",
      "reason": "ContainersNotReady",
      "message": "containers with unready status: [unnamed]"
    },
    {
      "type": "PodScheduled",
      "status": "True",
      "lastProbeTime": null,
      "lastTransitionTime": "2020-01-28T06:57:52Z"
    }
  ],
  "hostIP": "192.168.65.3",
  "startTime": "2020-01-28T06:57:52Z",
  "containerStatuses": [
    {
      "name": "unnamed",
      "state": {
        "waiting": {
          "reason": "ContainerCreating"
        }
      },
      "lastState": {},
      "ready": false,
      "restartCount": 0,
      "image": "unnamed:4b4ad7b8a53c58784d930f3af9517ca5fee06d3d8e58201929a74409ef7d0631",
      "imageID": ""
    }
  ],
  "qosClass": "Burstable"
}

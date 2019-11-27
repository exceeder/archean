---
to: <%= name %>/k8s/job.yaml
unless_exists: true
---
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: <%= name %>
  labels:
    app: <%= name %>
    repo: archean-micros
spec:
  schedule: "*/1 * * * *"
  successfulJobsHistoryLimit: 3
#  suspend: false
#  concurrencyPolicy: "Replace"
#  startingDeadlineSeconds: 5
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: <%= name %>
              image: "<%= name %>"
              imagePullPolicy: IfNotPresent
              env:
              - name: MY_POD_IP
                valueFrom:
                  fieldRef:
                    fieldPath: status.podIP
              resources:
                requests:
                  memory: "40Mi"
                  cpu: "10m"
          restartPolicy: OnFailure




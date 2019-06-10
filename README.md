# Cloud Run Unsupported Syscall

Codes for reproducing https://issuetracker.google.com/issues/134694204

## Running the code locally works:

    docker build -t felixhalim/cloud-run .

    docker run -d --privileged --name "cloud_run" -p 8080:8080 felixhalim/cloud-run

Visiting http://localhost:8080/ in the browser shows:

    Hello


## Running in Cloud Run fails:

### Build the container image using Cloud Build:

    gcloud builds submit --tag gcr.io/cloud-run-134694204/hello

Output:

    latest: digest: sha256:c39ec2bd857c6bf769c27670519f1115432d755b217a45cb3881acc8221117eb size: 3469
    DONE
    ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    ID                                    CREATE_TIME                DURATION  SOURCE                                                                                         IMAGES                                      STATUS
    89f1444f-cc60-40e4-b17c-ce0973599425  2019-06-10T04:33:25+00:00  1M24S     gs://cloud-run-134694204_cloudbuild/source/1560141176.12-dbdfbc52ff334d03954eca85e754e983.tgz  gcr.io/cloud-run-134694204/hello (+1 more)  SUCCESS


### Deploy to cloud run:

    gcloud beta run deploy --image gcr.io/cloud-run-134694204/hello

Output:

    API [run.googleapis.com] not enabled on project [550454218791]. Would 
    you like to enable and retry (this will take a few minutes)? (y/N)?  y

    Enabling service [run.googleapis.com] on project [550454218791]...
    Waiting for async operation operations/acf.6644456f-2d60-408e-9131-d701f4c5dfab to complete...
    Operation finished successfully. The following command can describe the Operation details:
     gcloud services operations describe operations/tmo-acf.6644456f-2d60-408e-9131-d701f4c5dfab
    Please specify a region:
     [1] us-central1
     [2] cancel
    Please enter your numeric choice:  1

    To make this the default region, run `gcloud config set run/region us-central1`.

    Service name (hello):  
    Allow unauthenticated invocations to [hello] (y/N)?  y

    Deploying container to Cloud Run service [hello] in project [cloud-run-134694204] region [us-central1]
    ✓ Deploying new service... Done.                                                                                                                                                                                                   
      ✓ Creating Revision...                                                                                                                                                                                                           
      ✓ Routing traffic...                                                                                                                                                                                                             
      ✓ Setting IAM Policy...                                                                                                                                                                                                          
    Done.                                                                                                                                                                                                                              
    Service [hello] revision [hello-00001] has been deployed and is serving traffic at https://hello-26brsdd2pq-uc.a.run.app

Visiting https://hello-26brsdd2pq-uc.a.run.app/ in the browser shows:

    judge failed Command failed: (cd /app/workdir; bash judge.sh)

The [Cloud Console Log Viewer](https://console.cloud.google.com/logs/viewer?project=cloud-run-134694204&minLogLevel=0&expandAll=false&timestamp=2019-06-10T04:44:13.206000000Z&customFacets=&limitCustomFacetWidth=true&dateRangeStart=2019-06-10T03:41:46.370Z&interval=PT1H&resource=cloud_run_revision%2Fservice_name%2Fhello%2Frevision_name%2Fhello-00001&scrollTimestamp=2019-06-10T04:41:01.474977227Z&dateRangeUnbound=forwardInTime) shows:

    Container Sandbox Limitation: Unsupported syscall statx(0xffffff9c,0x3ea89202f148,0x0,0xfff,0x3ea89202ed30,0x3ea89202ee50)

![Log Viewer](https://raw.githubusercontent.com/felix-halim/cloud-run-unsupported-syscall/master/log.png)

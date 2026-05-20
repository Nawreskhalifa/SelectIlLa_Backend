pipeline {

```
agent any

environment {

    SONAR_TOKEN = credentials('sonarqube')

    SONAR_HOST_URL = 'http://sonarqube:9000'

    AWS_REGION = 'us-east-1'

    ECR_REPO = '289835834707.dkr.ecr.us-east-1.amazonaws.com/selectilla-backend'

    IMAGE_TAG = "${BUILD_NUMBER}"

    HELM_CHART_PATH = '/home/nawres/projetPFE/selectitla-chart'

    PATH = "/opt/sonar-scanner/bin:${env.PATH}"

    EMAIL_DEST = 'nawreskhalifa17@gmail.com'
}

stages {

    stage('SCM') {
        steps {

            deleteDir()

            git branch: 'main',
                url: 'https://github.com/Nawreskhalifa/SelectIlLa_Backend.git'
        }
    }

    stage('Install npm') {
        steps {

            sh 'npm install'
        }
    }

    stage('SonarQube Analysis') {
        steps {

            withSonarQubeEnv('SonarQube') {

                sh '''
                    sonar-scanner \
                    -Dsonar.projectKey=SelectIlLa_Backend \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=${SONAR_HOST_URL} \
                    -Dsonar.login=${SONAR_TOKEN}
                '''
            }
        }
    }

    stage('Quality Gate') {
        steps {

            timeout(time: 5, unit: 'MINUTES') {

                waitForQualityGate abortPipeline: true
            }
        }
    }

    stage('Build Docker Image') {
        steps {

            sh '''
                docker build \
                -t selectilla-backend:${IMAGE_TAG} .
            '''
        }
    }

    stage('Tag Docker Image') {
        steps {

            sh '''
                docker tag \
                selectilla-backend:${IMAGE_TAG} \
                ${ECR_REPO}:${IMAGE_TAG}
            '''
        }
    }

    stage('Login to AWS ECR') {
        steps {

            withCredentials([
                string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
            ]) {

                sh '''
                    export AWS_PAGER=""

                    aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID

                    aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY

                    aws configure set region $AWS_REGION

                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS \
                    --password-stdin 289835834707.dkr.ecr.us-east-1.amazonaws.com
                '''
            }
        }
    }

    stage('Push Docker Image') {
        steps {

            sh '''
                docker push ${ECR_REPO}:${IMAGE_TAG}
            '''
        }
    }

    stage('Connect to EKS') {
        steps {

            withCredentials([
                string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
            ]) {

                sh '''
                    export AWS_PAGER=""

                    aws eks update-kubeconfig \
                    --region us-east-1 \
                    --name selectilla-cluster

                    kubectl get nodes
                '''
            }
        }
    }

    stage('Deploy to EKS') {
        steps {

            sh '''
                helm upgrade --install selectitla \
                ${HELM_CHART_PATH} \
                --namespace default \
                --create-namespace \
                --set backend.image.repository=${ECR_REPO} \
                --set backend.image.tag=${IMAGE_TAG}

                kubectl rollout status deployment/backend-deployment
            '''
        }
    }
}

post {

    success {

        emailext(
            subject: "OK: Backend Pipeline #${env.BUILD_NUMBER} deploye",

            body: """
```

============================================
BACKEND CI/CD — SUCCES
======================

Projet : ${env.JOB_NAME}

Build : #${env.BUILD_NUMBER}

Image ECR :
${env.ECR_REPO}:${env.BUILD_NUMBER}

Namespace : default

---

Console :
${env.BUILD_URL}

SonarQube :
http://sonarqube:9000/dashboard?id=SelectIlLa_Backend

============================================
""",

```
            to: "${env.EMAIL_DEST}",
            mimeType: 'text/plain'
        )
    }

    failure {

        emailext(
            subject: "FAILED: Backend Pipeline #${env.BUILD_NUMBER}",

            body: """
```

============================================
BACKEND CI/CD — ECHEC
=====================

Projet : ${env.JOB_NAME}

Build : #${env.BUILD_NUMBER}

Branche : main

Statut : ECHEC

---

Console :
${env.BUILD_URL}console

SonarQube :
http://sonarqube:9000/dashboard?id=SelectIlLa_Backend

---

Verifier :

* Quality Gate
* Docker Build
* Helm Deployment
* Kubernetes Pods

============================================
""",

```
            to: "${env.EMAIL_DEST}",
            mimeType: 'text/plain'
        )
    }

    always {

        cleanWs()
    }
}
```

}

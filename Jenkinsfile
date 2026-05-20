pipeline {
agent any

```
environment {

    SONAR_TOKEN = credentials('sonarqube')
    SONAR_HOST_URL = 'http://sonarqube:9000'

    AWS_REGION = 'us-east-1'

    ECR_REPO = '289835834707.dkr.ecr.us-east-1.amazonaws.com/selectilla-backend'

    IMAGE_TAG = "${BUILD_NUMBER}"

    PATH = "/opt/sonar-scanner/bin:${env.PATH}"
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

            sh '''
                sonar-scanner \
                    -Dsonar.projectKey=SelectIlLa_Backend \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=${SONAR_HOST_URL} \
                    -Dsonar.login=${SONAR_TOKEN}
            '''
        }
    }

    stage('Build Docker Image') {
        steps {

            sh '''
                docker build -t selectilla-backend:${IMAGE_TAG} .
            '''
        }
    }

    stage('Tag Docker Image') {
        steps {

            sh '''
                docker tag selectilla-backend:${IMAGE_TAG} \
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
                helm upgrade --install selectilla-backend \
                ./helm/selectilla-backend \
                --namespace default \
                --create-namespace \
                --set image.repository=${ECR_REPO} \
                --set image.tag=${IMAGE_TAG}

                kubectl rollout status deployment/selectilla-backend
            '''
        }
    }
}
```

}

pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonarqube')
        SONAR_HOST_URL = 'http://sonarqube:9000'

        AWS_REGION = 'eu-north-1'
        ECR_REPO = '289835834707.dkr.ecr.eu-north-1.amazonaws.com/selectilla-backend'
        IMAGE_TAG = 'latest'
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

        stage('Wait for SonarQube') {
            steps {
                script {
                    echo "Attente que SonarQube soit prêt..."
                    def maxRetries = 30
                    def retryCount = 0
                    def ready = false

                    while (!ready && retryCount < maxRetries) {
                        try {
                            def status = sh(
                                script: "curl -s http://sonarqube:9000/api/system/status",
                                returnStdout: true
                            ).trim()

                            if (status.contains("UP")) {
                                echo "SonarQube est prêt !"
                                ready = true
                            } else {
                                echo "SonarQube pas encore prêt..."
                                sleep 10
                                retryCount++
                            }
                        } catch (Exception e) {
                            echo "Connexion échouée..."
                            sleep 10
                            retryCount++
                        }
                    }

                    if (!ready) {
                        error("SonarQube n'est pas prêt !")
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                sh '''
                    /opt/sonar-scanner/bin/sonar-scanner \
                        -Dsonar.projectKey=SelectIlLa_Backend \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=${SONAR_HOST_URL} \
                        -Dsonar.login=${SONAR_TOKEN}
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t selectilla-backend .'
            }
        }

        stage('Tag Image') {
            steps {
                sh '''
                    docker tag selectilla-backend:latest $ECR_REPO:$IMAGE_TAG
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
                        aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
                        aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
                        aws configure set region $AWS_REGION

                        aws ecr get-login-password --region $AWS_REGION | \
                        docker login --username AWS --password-stdin $ECR_REPO
                    '''
                }
            }
        }

        stage('Push to ECR') {
            steps {
                sh '''
                    docker push $ECR_REPO:$IMAGE_TAG
                '''
            }
        }
    }
}
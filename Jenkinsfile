pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonarqube')
        SONAR_HOST_URL = 'http://sonarqube:9000'
        PATH = "/opt/sonar-scanner/bin:${env.PATH}"
        DOCKERHUB_USERNAME = 'nawreskhalifa'                 
        IMAGE_BACKEND      = "${DOCKERHUB_USERNAME}/selectilla-backend"
        IMAGE_TAG          = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('SCM') {
            steps {
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
                                echo "SonarQube pas encore prêt, attente 10s..."
                                sleep 10
                                retryCount++
                            }
                        } catch (Exception e) {
                            echo "Connexion échouée, attente 10s..."
                            sleep 10
                            retryCount++
                        }
                    }

                    if (!ready) {
                        error("SonarQube n'est pas prêt après ${maxRetries * 10} secondes !")
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
   
    
      stage('Login DockerHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials', 
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage('Build Backend') {
            steps {
                echo 'Build image backend...'
                sh """
                    docker build -t ${IMAGE_BACKEND}:${IMAGE_TAG} .
                    docker tag ${IMAGE_BACKEND}:${IMAGE_TAG} ${IMAGE_BACKEND}:latest
                """
            }
        }

        stage('Push Backend') {
            steps {
                echo 'Push backend sur DockerHub...'
                sh """
                    docker push ${IMAGE_BACKEND}:${IMAGE_TAG}
                    docker push ${IMAGE_BACKEND}:latest
                """
            }
        }

        stage('Cleanup') {
            steps {
                echo 'Nettoyage...'
                sh "docker rmi ${IMAGE_BACKEND}:${IMAGE_TAG} || true"
            }
        }
        }
   
    post {
        success {
            echo ' Pipeline terminé avec succès !'
        }
        failure {
            echo 'Pipeline échoué !'
        }
    }

    
 }

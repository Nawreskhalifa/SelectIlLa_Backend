pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonarqube')
        SONAR_HOST_URL = 'http://sonarqube:9000'
        PATH = "/opt/sonar-scanner/bin:${env.PATH}"
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
    //    stage('Run Tests') {
      //      steps {
        //        sh 'npm test'
          //  }
    //    }
        stage('Test SonarQube') {
            steps {
                sh 'curl -I http://sonarqube:9000'
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
    }

    post {
        always {
            echo 'Pipeline terminé.'
        }
        success {
            echo 'Pipeline exécuté avec succès !'
        }
        failure {
            echo 'Pipeline échoué !'
        }
    }
}

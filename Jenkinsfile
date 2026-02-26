pipeline {
    agent any

    environment {
        // Nom du credential que tu as créé dans Jenkins pour le token SonarQube
        SONAR_TOKEN = credentials('sonar-token')
        // URL de ton serveur SonarQube
        SONAR_HOST_URL = 'http://localhost:9000'
    }

    stages {

        stage('SCM') {
            steps {
                echo '🔄 Récupération du code depuis GitHub...'
                git branch: 'main', url: 'https://github.com/Nawreskhalifa/SelectIlLa_Backend.git'
            }
        }

        stage('Install npm') {
            steps {
                echo '📦 Installation des dépendances npm...'
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                echo '🧪 Exécution des tests unitaires (Jest)...'
                sh 'npm test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo '🔍 Analyse SonarQube...'
                withSonarQubeEnv('SonarQube') {
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=SelectIlLa_Backend \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=${SONAR_HOST_URL} \
                        -Dsonar.login=${SONAR_TOKEN}
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline terminé.'
        }
        success {
            echo ' Pipeline exécuté avec succès !'
        }
        failure {
            echo 'Pipeline échoué !'
        }
    }
}

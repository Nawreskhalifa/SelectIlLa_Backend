pipeline {
    agent any

    environment {
        // Credential Jenkins pour le token SonarQube
        SONAR_TOKEN = credentials('sonarqube')
        // URL du serveur SonarQube (Docker ou localhost selon ton setup)
        SONAR_HOST_URL = 'http://sonarqube:9000'
        PATH = "/opt/sonar-scanner/bin:${env.PATH}"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                echo "Récupération du code source..."
                git branch: 'main',
                    url: 'https://github.com/Nawreskhalifa/SelectIlLa_Backend.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "Installation des dépendances npm..."
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
                                script: "curl -s ${SONAR_HOST_URL}/api/system/status",
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

        stage('Run SonarQube Analysis') {
            steps {
                echo "Lancement de l'analyse SonarQube..."
                withSonarQubeEnv('sonarqube') {
                    // Le scanner lira ton sonar-project.properties automatiquement
                    sh 'sonar-scanner'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    script {
                        def qg = waitForQualityGate(abortPipeline: true)
                        echo "Status Quality Gate: ${qg.status}"
                    }
                }
            }
        }

        // Optionnel : tests unitaires si tu veux
        stage('Run Tests') {
            steps {
                echo "Lancement des tests unitaires..."
                sh 'npm test'
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
            emailext(
                subject: "Échec du pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """<p>Le pipeline a échoué.</p>
                         <p>Vérifier Jenkins ici : <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>""",
                to: 'nawreskhalifa17@gmail.com'
            )
        }
    }
}
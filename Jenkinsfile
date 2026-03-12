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
      //  stage('Quality Gate') {
       //     steps {
         //       timeout(time: 10, unit: 'MINUTES') {
           //         script {
             //           def qg = waitForQualityGate(abortPipeline: true)
               //         echo "Status Quality Gate: ${qg.status}"
                 //   }
               // }
         //      }
      //     }
  //     }

  //     post {
      //     always {
           //    echo 'Pipeline terminé.'
  //         }
       //    success {
       //        echo 'Pipeline exécuté avec succès !'
      //     }
      //     failure {
          //     echo 'Pipeline échoué !'
         //      emailext(
            //       subject: "Échec du pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER}",
         //          body: """<p>Le pipeline a échoué.</p>
          //                  <p>Vérifier Jenkins ici : <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>""",
         //          to: 'nawreskhalifa17@gmail.com'
        //       )
     //      }
     }
}
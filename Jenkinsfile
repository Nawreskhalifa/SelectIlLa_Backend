pipeline {

    agent any

    environment {

        SONAR_TOKEN    = credentials('sonar-token1')
        SONAR_HOST_URL = 'http://sonarqube:9000'

        AWS_REGION     = 'us-east-1'
        ECR_REPO       = '289835834707.dkr.ecr.us-east-1.amazonaws.com/selectilla-backend'
        IMAGE_TAG      = "${BUILD_NUMBER}"

        // Chart dans repo infra
        HELM_CHART_PATH = "infra/selectitla-chart"

        PATH = "/opt/sonar-scanner/bin:${env.PATH}"

        EMAIL_DEST = 'nawreskhalifa17@gmail.com'

        TRIVY_TXT  = "trivy-backend-${BUILD_NUMBER}.txt"
        TRIVY_HTML = "trivy-backend-${BUILD_NUMBER}.html"
        TRIVY_PDF  = "trivy-backend-${BUILD_NUMBER}.pdf"
    }

    stages {

     
        stage('SCM') {

            steps {

                deleteDir()

                // Backend
                git branch: 'main',
                    credentialsId: 'github-token1',
                    url: 'https://github.com/Nawreskhalifa/SelectIlLa_Backend.git'

                // Infra repo
                dir('infra') {

                    git branch: 'main',
                        credentialsId: 'github-token1',
                        url: 'https://github.com/Nawreskhalifa/projetPFE.git'
                }

                sh '''
                    echo "=== Workspace ==="
                    pwd

                    echo "=== Files ==="
                    ls -la

                    echo "=== Infra ==="
                    ls -la infra || true

                    echo "=== Helm Chart ==="
                    ls -la infra/selectitla-chart || true
                '''
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

  
        stage('Quality Gate') {

            steps {

                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {

                    timeout(time: 10, unit: 'MINUTES') {

                        waitForQualityGate abortPipeline: false
                    }
                }
            }
        }

        // ============================================================
        // DOCKER BUILD
        // ============================================================

        stage('Build Docker Image') {

            steps {

                sh """
                    docker build \
                    -t selectilla-backend:${IMAGE_TAG} .
                """
            }
        }

        // ============================================================
        // TAG IMAGE
        // ============================================================

        stage('Tag Docker Image') {

            steps {

                sh """
                    docker tag \
                    selectilla-backend:${IMAGE_TAG} \
                    ${ECR_REPO}:${IMAGE_TAG}
                """
            }
        }

        // ============================================================
        // LOGIN ECR
        // ============================================================

        stage('Login to AWS ECR') {

            steps {

                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {

                    sh '''
                        aws ecr get-login-password \
                        --region us-east-1 | \
                        docker login \
                        --username AWS \
                        --password-stdin 289835834707.dkr.ecr.us-east-1.amazonaws.com
                    '''
                }
            }
        }

        // ============================================================
        // PUSH IMAGE
        // ============================================================

        stage('Push Docker Image') {

            steps {

                sh "docker push ${ECR_REPO}:${IMAGE_TAG}"
            }
        }

        // ============================================================
        // TRIVY
        // ============================================================
        stage('Trivy Image Scan') {
        
            steps {
        
                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
        
            sh """
                    mkdir -p /tmp/trivy-templates
                    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/html.tpl \
                    -o /tmp/trivy-templates/html.tpl
                
                    trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 0 \
                        --no-progress \
                        --format table \
                        --output ${TRIVY_TXT} \
                        ${ECR_REPO}:${IMAGE_TAG}
                
                    trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 0 \
                        --no-progress \
                        --format template \
                        --template "@/tmp/trivy-templates/html.tpl" \
                        --output ${TRIVY_HTML} \
                        ${ECR_REPO}:${IMAGE_TAG}
                
                    wkhtmltopdf ${TRIVY_HTML} ${TRIVY_PDF} || true
                """
                }
            }
        
            post {
        
                always {
        
                    archiveArtifacts artifacts: "trivy-backend-*.txt,trivy-backend-*.html,trivy-backend-*.pdf",
                                     allowEmptyArchive: true
        
                    publishHTML(target: [
                        allowMissing         : true,
                        alwaysLinkToLastBuild: true,
                        keepAll              : true,
                        reportDir            : '.',
                        reportFiles          : "${TRIVY_HTML}",
                        reportName           : 'Trivy Security Report'
                    ])
        
                    emailext(
                        subject: "Trivy Security Report - Build #${BUILD_NUMBER}",
                        body: """
        Trivy scan completed for build #${BUILD_NUMBER}.
        
        Image: ${ECR_REPO}:${BUILD_NUMBER}
        
        Please find the security report attached.
        
        Console: ${BUILD_URL}
        """,
                        attachmentsPattern: "trivy-backend-${BUILD_NUMBER}.pdf",
                        to: "${EMAIL_DEST}"
                    )
                }
            }
        }
        // ============================================================
        // DEPLOY EKS
        // ============================================================

        stage('Deploy to EKS') {
    steps {
        withCredentials([
            string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
        ]) {
            sh '''
                set -e

                aws eks update-kubeconfig \
                    --name selectilla-cluster \
                    --region us-east-1

                kubectl get nodes

                echo "=== HELM CHART ==="
                ls -la infra/selectitla-chart

                helm upgrade --install selectilla infra/selectitla-chart \
                    --namespace default \
                    --create-namespace \
                    --set backend.image.repository=$ECR_REPO \
                    --set backend.image.tag=$BUILD_NUMBER

                kubectl rollout status deployment/backend-deployment
            '''
        }
    }
}
    }

    // ============================================================
    // POST
    // ============================================================

    post {

        always {

            deleteDir()
        }

        success {

            emailext(
                subject: "SUCCESS Backend Pipeline #${BUILD_NUMBER}",
                body: """
Pipeline SUCCESS

Build:
${BUILD_NUMBER}

Image:
${ECR_REPO}:${BUILD_NUMBER}

Console:
${BUILD_URL}
""",
                to: "${EMAIL_DEST}"
            )
        }

        failure {

            emailext(
                subject: "FAILURE Backend Pipeline #${BUILD_NUMBER}",
                body: """
Pipeline FAILED

Console:
${BUILD_URL}console
""",
                to: "${EMAIL_DEST}"
            )
        }
    }
}
pipeline {

    agent any

    environment {
        SONAR_TOKEN       = credentials('sonar-token1')
        SONAR_HOST_URL    = 'http://sonarqube:9000'
        AWS_REGION        = 'us-east-1'
        ECR_REPO          = '289835834707.dkr.ecr.us-east-1.amazonaws.com/selectilla-backend'
        IMAGE_TAG         = "${BUILD_NUMBER}"
        HELM_CHART_PATH   = '/home/nawres/projetPFE/selectitla-chart'
        PATH              = "/opt/sonar-scanner/bin:${env.PATH}"
        EMAIL_DEST        = 'nawreskhalifa17@gmail.com'
        TRIVY_TXT         = "trivy-backend-${BUILD_NUMBER}.txt"
        TRIVY_HTML        = "trivy-backend-${BUILD_NUMBER}.html"
        TRIVY_PDF         = "trivy-backend-${BUILD_NUMBER}.pdf"
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
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=SelectIlLa_Backend \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=${SONAR_HOST_URL} \
                        -Dsonar.login=\${SONAR_TOKEN}
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

        stage('Build Docker Image') {
            steps {
                sh "docker build -t selectilla-backend:${IMAGE_TAG} ."
            }
        }

        stage('Tag Docker Image') {
            steps {
                sh "docker tag selectilla-backend:${IMAGE_TAG} ${ECR_REPO}:${IMAGE_TAG}"
            }
        }

        stage('Login to AWS ECR') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
                        AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
                        AWS_DEFAULT_REGION=us-east-1 \
                        aws ecr get-login-password --region us-east-1 | \
                        docker login --username AWS \
                        --password-stdin 289835834707.dkr.ecr.us-east-1.amazonaws.com
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh "docker push ${ECR_REPO}:${IMAGE_TAG}"
            }
        }

        // ─────────────────────────────────────────────────────────────
        //  Trivy — scan + rapport TXT + HTML + PDF
        // ─────────────────────────────────────────────────────────────
        stage('Trivy Image Scan') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                        sh """
                            set -e

                            # Re-login ECR
                            AWS_ACCESS_KEY_ID=\$AWS_ACCESS_KEY_ID \
                            AWS_SECRET_ACCESS_KEY=\$AWS_SECRET_ACCESS_KEY \
                            AWS_DEFAULT_REGION=us-east-1 \
                            aws ecr get-login-password --region us-east-1 | \
                            docker login --username AWS \
                            --password-stdin 289835834707.dkr.ecr.us-east-1.amazonaws.com

                            # Template HTML officiel Trivy
                            mkdir -p /tmp/trivy-templates
                            curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/html.tpl \
                                -o /tmp/trivy-templates/html.tpl

                            # 1. Rapport TEXT
                            trivy image \
                                --severity HIGH,CRITICAL \
                                --exit-code 0 \
                                --no-progress \
                                --format table \
                                --output ${TRIVY_TXT} \
                                ${ECR_REPO}:${IMAGE_TAG}

                            # 2. Rapport HTML
                            trivy image \
                                --severity HIGH,CRITICAL \
                                --exit-code 1 \
                                --no-progress \
                                --format template \
                                --template "@/tmp/trivy-templates/html.tpl" \
                                --output ${TRIVY_HTML} \
                                ${ECR_REPO}:${IMAGE_TAG}

                            # 3. Convertir HTML → PDF avec wkhtmltopdf
                            wkhtmltopdf \
                                --page-size A4 \
                                --orientation Landscape \
                                --margin-top 10mm \
                                --margin-bottom 10mm \
                                --margin-left 10mm \
                                --margin-right 10mm \
                                --title "Trivy Security Report - Build ${IMAGE_TAG}" \
                                ${TRIVY_HTML} ${TRIVY_PDF} || \
                                echo "PDF generation skipped (wkhtmltopdf not available)"
                        """
                    }
                }
            }
            post {
                always {
                    // Afficher le rapport texte dans la console
                    sh """
                        echo '========================================='
                        echo '      TRIVY SECURITY REPORT - BUILD ${BUILD_NUMBER}    '
                        echo '========================================='
                        cat ${TRIVY_TXT} || echo 'Rapport texte non disponible'
                        echo '========================================='
                    """

                    // Archiver TXT + HTML + PDF
                    archiveArtifacts artifacts: "trivy-backend-*.txt, trivy-backend-*.html, trivy-backend-*.pdf",
                                     allowEmptyArchive: true

                    // Publier rapport HTML dans Jenkins UI
                    publishHTML(target: [
                        allowMissing         : true,
                        alwaysLinkToLastBuild: true,
                        keepAll              : true,
                        reportDir            : '.',
                        reportFiles          : "${TRIVY_HTML}",
                        reportName           : 'Trivy Security Report',
                        reportTitles         : 'Trivy Image Scan - Backend'
                    ])
                }
            }
        }

        // ─────────────────────────────────────────────────────────────
        //  Deploy — token EKS généré juste avant utilisation
        // ─────────────────────────────────────────────────────────────
        stage('Deploy to EKS') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        set -e

                        # 1. Infos cluster
                        CLUSTER_ENDPOINT=$(AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
                            AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
                            AWS_DEFAULT_REGION=us-east-1 \
                            aws eks describe-cluster \
                            --name selectilla-cluster \
                            --query "cluster.endpoint" \
                            --output text)

                        CLUSTER_CA=$(AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
                            AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
                            AWS_DEFAULT_REGION=us-east-1 \
                            aws eks describe-cluster \
                            --name selectilla-cluster \
                            --query "cluster.certificateAuthority.data" \
                            --output text)

                        # 2. Token FRAIS généré juste avant usage
                        EKS_TOKEN=$(AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
                            AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
                            AWS_DEFAULT_REGION=us-east-1 \
                            aws eks get-token \
                            --cluster-name selectilla-cluster \
                            --query "status.token" \
                            --output text)

                        # 3. Kubeconfig avec token inline
                        cat > /tmp/kubeconfig-selectilla << KUBEEOF
apiVersion: v1
kind: Config
clusters:
- cluster:
    server: ${CLUSTER_ENDPOINT}
    certificate-authority-data: ${CLUSTER_CA}
  name: selectilla-cluster
contexts:
- context:
    cluster: selectilla-cluster
    user: jenkins
  name: selectilla-context
current-context: selectilla-context
users:
- name: jenkins
  user:
    token: ${EKS_TOKEN}
KUBEEOF

                        chmod 600 /tmp/kubeconfig-selectilla

                        # 4. Vérifier connexion
                        KUBECONFIG=/tmp/kubeconfig-selectilla kubectl get nodes

                        # 5. Déployer avec Helm
                        KUBECONFIG=/tmp/kubeconfig-selectilla \
                        helm upgrade --install selectitla /var/jenkins_home/workspace/App_ SelectIlLa_Backend/selectitla-chart \
                        --namespace default \
                        --create-namespace \
                        --set backend.image.repository=$ECR_REPO \
                        --set backend.image.tag=$BUILD_NUMBER

                        # 6. Vérifier le rollout
                        KUBECONFIG=/tmp/kubeconfig-selectilla \
                        kubectl rollout status deployment/backend-deployment
                    '''
                }
            }
        }
    }

    post {

        success {
            emailext(
                subject: " Backend Pipeline #${env.BUILD_NUMBER} — SUCCES",
                body: """
============================================
BACKEND CI/CD — SUCCES

Projet   : ${env.JOB_NAME}
Build    : #${env.BUILD_NUMBER}
Image    : ${ECR_REPO}:${env.BUILD_NUMBER}
Namespace: default

Console   : ${env.BUILD_URL}
SonarQube : ${SONAR_HOST_URL}/dashboard?id=SelectIlLa_Backend
Trivy HTML: ${env.BUILD_URL}Trivy_20Security_20Report/
Trivy PDF : ${env.BUILD_URL}artifact/${TRIVY_PDF}
============================================
""",
                to: "${env.EMAIL_DEST}",
                mimeType: 'text/plain'
            )
        }

        unstable {
            emailext(
                subject: " Backend Pipeline #${env.BUILD_NUMBER} — INSTABLE",
                body: """
============================================
BACKEND CI/CD — INSTABLE

Projet   : ${env.JOB_NAME}
Build    : #${env.BUILD_NUMBER}
Image    : ${ECR_REPO}:${env.BUILD_NUMBER}
Namespace: default

Le pipeline a réussi MAIS :
  - Quality Gate SonarQube a échoué OU
  - Trivy a détecté des vulnérabilités HIGH/CRITICAL

Console   : ${env.BUILD_URL}
SonarQube : ${SONAR_HOST_URL}/dashboard?id=SelectIlLa_Backend
Trivy HTML: ${env.BUILD_URL}Trivy_20Security_20Report/
Trivy PDF : ${env.BUILD_URL}artifact/${TRIVY_PDF}
============================================
""",
                to: "${env.EMAIL_DEST}",
                mimeType: 'text/plain'
            )
        }

        failure {
            emailext(
                subject: "❌ Backend Pipeline #${env.BUILD_NUMBER} — ECHEC",
                body: """
============================================
BACKEND CI/CD — ECHEC

Projet  : ${env.JOB_NAME}
Build   : #${env.BUILD_NUMBER}
Branche : main
Statut  : ECHEC

Console   : ${env.BUILD_URL}console
SonarQube : ${SONAR_HOST_URL}/dashboard?id=SelectIlLa_Backend

Verifier :
  - Connexion SonarQube
  - Quality Gate
  - Docker Build
  - Trivy Scan
  - Connexion EKS (token expiré ?)
  - Helm Deployment
  - Kubernetes Pods
============================================
""",
                to: "${env.EMAIL_DEST}",
                mimeType: 'text/plain'
            )
        }

        always {
            sh 'rm -f /tmp/kubeconfig-selectilla'
            deleteDir()
        }
    }
}
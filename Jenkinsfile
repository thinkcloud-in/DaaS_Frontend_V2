pipeline { 
    agent any

    environment {
        TARGET_SERVER = '172.16.0.103'
        TARGET_USER = 'root'
        TARGET_PASSWORD = 'Teamw0rk@1'
        DEPLOY_PATH = 'Horizan_reports'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/poojitha']],  // ✅ Correct syntax
                    userRemoteConfigs: [[
                        url: 'https://github.com/thinkcloud-in/DaaS_Frontend_2025.git',
                        credentialsId: 'rcv-git'
                    ]]
                ])
            }
        }

        stage('Docker Build & Tag') {
            steps {
                script {
                    withDockerRegistry([credentialsId: 'dokcer-id']) {
                        sh 'docker build -t arpits2931/rcv_daas_frontend:latest -f Dockerfile.dev .'
                    }
                }
            }
        }

        stage('Docker Push') {
            steps {
                script {
                    withDockerRegistry([credentialsId: 'dokcer-id']) {
                        sh 'docker push arpits2931/rcv_daas_frontend:latest'
                    }
                }
            }
        }

        stage('Stop & Remove Existing Containers') {
            steps {
                script {
                    sh """
                        sshpass -p '${TARGET_PASSWORD}' ssh -T -o StrictHostKeyChecking=no ${TARGET_USER}@${TARGET_SERVER} '
                            docker ps -a --filter "ancestor=arpits2931/rcv_daas_frontend:latest" --format "{{.ID}}" | xargs -r docker stop;
                            docker ps -a --filter "ancestor=arpits2931/rcv_daas_frontend:latest" --format "{{.ID}}" | xargs -r docker rm;
                            docker images "arpits2931/rcv_daas_frontend:latest" --format "{{.ID}}" | xargs -r docker rmi -f;
                        '
                    """
                }
            }
        }

        stage('Deploy on Target Server') {
            steps {
                script {
                    sh """
                        sshpass -p '${TARGET_PASSWORD}' ssh -T -o StrictHostKeyChecking=no ${TARGET_USER}@${TARGET_SERVER} '
                            cd ${DEPLOY_PATH} && docker-compose up -d
                        '
                    """
                }
            }
        }

        stage('Final') {
            steps {
                echo '✅ Deployment pipeline executed successfully!'
            }
        }
    }
}

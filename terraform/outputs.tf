# KaiTech Infrastructure Outputs

# Network Information
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

# Load Balancer Information
output "load_balancer_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "load_balancer_zone_id" {
  description = "Canonical hosted zone ID of the load balancer"
  value       = aws_lb.main.zone_id
}

output "load_balancer_arn" {
  description = "ARN of the load balancer"
  value       = aws_lb.main.arn
}

# Application URLs
output "application_url" {
  description = "Main application URL"
  value       = "https://${aws_lb.main.dns_name}"
}

output "news_api_url" {
  description = "News API endpoint URL"
  value       = "https://${aws_lb.main.dns_name}/api/news"
}

output "ai_api_url" {
  description = "AI API endpoint URL"
  value       = "https://${aws_lb.main.dns_name}/api/ai"
}

output "health_check_url" {
  description = "Health check endpoint URL"
  value       = "https://${aws_lb.main.dns_name}/health"
}

# ECS Information
output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.main.arn
}

output "web_service_name" {
  description = "Name of the web service"
  value       = aws_ecs_service.web.name
}

output "news_api_service_name" {
  description = "Name of the news API service"
  value       = aws_ecs_service.news_api.name
}

output "ai_api_service_name" {
  description = "Name of the AI API service"
  value       = aws_ecs_service.ai_api.name
}

# Container Registry Information
output "web_ecr_repository_url" {
  description = "URL of the web ECR repository"
  value       = aws_ecr_repository.web.repository_url
}

output "news_api_ecr_repository_url" {
  description = "URL of the news API ECR repository"
  value       = aws_ecr_repository.news_api.repository_url
}

output "ai_api_ecr_repository_url" {
  description = "URL of the AI API ECR repository"
  value       = aws_ecr_repository.ai_api.repository_url
}

# Database Information
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.postgres.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.postgres.db_name
}

output "database_username" {
  description = "Database username"
  value       = aws_db_instance.postgres.username
  sensitive   = true
}

# Redis Information
output "redis_primary_endpoint" {
  description = "Address of the primary Redis node"
  value       = aws_elasticache_replication_group.redis.configuration_endpoint_address
}

output "redis_port" {
  description = "Port of the Redis cluster"
  value       = aws_elasticache_replication_group.redis.port
}

# Security Group Information
output "alb_security_group_id" {
  description = "ID of the ALB security group"
  value       = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  description = "ID of the ECS security group"
  value       = aws_security_group.ecs_tasks.id
}

output "rds_security_group_id" {
  description = "ID of the RDS security group"
  value       = aws_security_group.rds.id
}

output "redis_security_group_id" {
  description = "ID of the Redis security group"
  value       = aws_security_group.redis.id
}

# IAM Information
output "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution_role.arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task_role.arn
}

# SSL Certificate Information
output "acm_certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = aws_acm_certificate.main.arn
}

output "acm_certificate_status" {
  description = "Status of the ACM certificate"
  value       = aws_acm_certificate.main.status
}

# Auto Scaling Information
output "news_api_autoscaling_target_arn" {
  description = "ARN of the news API autoscaling target"
  value       = aws_appautoscaling_target.news_api.arn
}

output "ai_api_autoscaling_target_arn" {
  description = "ARN of the AI API autoscaling target"
  value       = aws_appautoscaling_target.ai_api.arn
}

# CloudWatch Log Groups
output "web_log_group_name" {
  description = "Name of the web service log group"
  value       = aws_cloudwatch_log_group.web.name
}

output "news_api_log_group_name" {
  description = "Name of the news API service log group"
  value       = aws_cloudwatch_log_group.news_api.name
}

output "ai_api_log_group_name" {
  description = "Name of the AI API service log group"
  value       = aws_cloudwatch_log_group.ai_api.name
}

# SSM Parameter Information
output "database_password_parameter_name" {
  description = "Name of the database password SSM parameter"
  value       = aws_ssm_parameter.db_password.name
  sensitive   = true
}

output "news_api_key_parameter_name" {
  description = "Name of the news API key SSM parameter"
  value       = aws_ssm_parameter.news_api_key.name
  sensitive   = true
}

output "openai_api_key_parameter_name" {
  description = "Name of the OpenAI API key SSM parameter"
  value       = aws_ssm_parameter.openai_api_key.name
  sensitive   = true
}

output "grok_api_key_parameter_name" {
  description = "Name of the Grok API key SSM parameter"
  value       = aws_ssm_parameter.grok_api_key.name
  sensitive   = true
}

# Environment Information
output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "project_name" {
  description = "Project name"
  value       = var.project_name
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

# Deployment Commands
output "docker_login_command" {
  description = "Command to login to ECR"
  value       = "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${split("/", aws_ecr_repository.web.repository_url)[0]}"
}

output "web_docker_build_command" {
  description = "Command to build and push web service Docker image"
  value       = "docker build -t ${aws_ecr_repository.web.repository_url}:latest ./frontend && docker push ${aws_ecr_repository.web.repository_url}:latest"
}

output "news_api_docker_build_command" {
  description = "Command to build and push news API Docker image"
  value       = "docker build -t ${aws_ecr_repository.news_api.repository_url}:latest ./services/news-service && docker push ${aws_ecr_repository.news_api.repository_url}:latest"
}

output "ai_api_docker_build_command" {
  description = "Command to build and push AI API Docker image"
  value       = "docker build -t ${aws_ecr_repository.ai_api.repository_url}:latest ./services/ai-service && docker push ${aws_ecr_repository.ai_api.repository_url}:latest"
}

# Monitoring Information
output "cloudwatch_dashboard_url" {
  description = "URL to the CloudWatch dashboard"
  value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${var.project_name}-${var.environment}"
}

output "ecs_console_url" {
  description = "URL to the ECS console"
  value       = "https://${var.aws_region}.console.aws.amazon.com/ecs/home?region=${var.aws_region}#/clusters/${aws_ecs_cluster.main.name}"
}

# DNS Configuration
output "route53_nameservers" {
  description = "Route 53 name servers for domain configuration"
  value       = "Configure your domain ${var.domain_name} to point to the load balancer: ${aws_lb.main.dns_name}"
}
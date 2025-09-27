# KaiTech Production Infrastructure - Terraform Configuration
# Complete AWS infrastructure setup with ECS, RDS, ElastiCache, ALB, and monitoring

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
  
  backend "s3" {
    # Configure your S3 backend
    bucket = "kaitech-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-west-2"
    
    # Enable state locking
    dynamodb_table = "kaitech-terraform-locks"
    encrypt        = true
  }
}

# Provider configuration
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "KaiTech"
      Environment = var.environment
      Owner       = "DevOps"
      Terraform   = "true"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

# Random password generation
resource "random_password" "rds_password" {
  length  = 32
  special = true
}

resource "random_password" "redis_password" {
  length  = 32
  special = false
}

# VPC and Networking
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "${var.project_name}-igw"
  }
}

# Public subnets
resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "${var.project_name}-public-${count.index + 1}"
    Type = "Public"
  }
}

# Private subnets
resource "aws_subnet" "private" {
  count = length(var.private_subnet_cidrs)
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "${var.project_name}-private-${count.index + 1}"
    Type = "Private"
  }
}

# NAT Gateways
resource "aws_eip" "nat" {
  count = length(aws_subnet.public)
  
  domain = "vpc"
  
  tags = {
    Name = "${var.project_name}-nat-eip-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "main" {
  count = length(aws_subnet.public)
  
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  tags = {
    Name = "${var.project_name}-nat-${count.index + 1}"
  }
  
  depends_on = [aws_internet_gateway.main]
}

# Route tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table" "private" {
  count = length(aws_nat_gateway.main)
  
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
  
  tags = {
    Name = "${var.project_name}-private-rt-${count.index + 1}"
  }
}

# Route table associations
resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)
  
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = length(aws_subnet.private)
  
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Security Groups
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_name}-ecs-tasks-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 80
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.project_name}-ecs-tasks-sg"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }
  
  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

resource "aws_security_group" "redis" {
  name        = "${var.project_name}-redis-sg"
  description = "Security group for ElastiCache Redis"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }
  
  tags = {
    Name = "${var.project_name}-redis-sg"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  
  enable_deletion_protection = var.environment == "prod"
  
  access_logs {
    bucket  = aws_s3_bucket.alb_logs.bucket
    prefix  = "alb-logs"
    enabled = true
  }
  
  tags = {
    Name = "${var.project_name}-alb"
  }
}

# S3 bucket for ALB logs
resource "aws_s3_bucket" "alb_logs" {
  bucket = "${var.project_name}-alb-logs-${random_password.rds_password.id}"
}

resource "aws_s3_bucket_versioning" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id
  
  rule {
    id     = "log_lifecycle"
    status = "Enabled"
    
    expiration {
      days = 90
    }
    
    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# ACM Certificate
resource "aws_acm_certificate" "main" {
  domain_name       = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name = "${var.project_name}-cert"
  }
}

# Target Groups
resource "aws_lb_target_group" "web" {
  name        = "${var.project_name}-web-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    protocol            = "HTTP"
    port                = "traffic-port"
  }
  
  tags = {
    Name = "${var.project_name}-web-tg"
  }
}

resource "aws_lb_target_group" "news_api" {
  name        = "${var.project_name}-news-api-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    protocol            = "HTTP"
    port                = "traffic-port"
  }
  
  tags = {
    Name = "${var.project_name}-news-api-tg"
  }
}

resource "aws_lb_target_group" "ai_api" {
  name        = "${var.project_name}-ai-api-tg"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
    path                = "/health"
    matcher             = "200"
    protocol            = "HTTP"
    port                = "traffic-port"
  }
  
  tags = {
    Name = "${var.project_name}-ai-api-tg"
  }
}

# ALB Listeners
resource "aws_lb_listener" "web_https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.main.arn
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

resource "aws_lb_listener" "web_http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"
  
  default_action {
    type = "redirect"
    
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ALB Listener Rules for API routing
resource "aws_lb_listener_rule" "news_api" {
  listener_arn = aws_lb_listener.web_https.arn
  priority     = 100
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.news_api.arn
  }
  
  condition {
    path_pattern {
      values = ["/api/news*"]
    }
  }
}

resource "aws_lb_listener_rule" "ai_api" {
  listener_arn = aws_lb_listener.web_https.arn
  priority     = 101
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ai_api.arn
  }
  
  condition {
    path_pattern {
      values = ["/api/ai*"]
    }
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
  
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
  
  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = {
    Name = "${var.project_name}-cluster"
  }
}

# ECS Task Execution Role
resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-ecs-task-execution-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_task_execution_logs" {
  name = "${var.project_name}-ecs-logs-policy"
  role = aws_iam_role.ecs_task_execution.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "web" {
  name              = "/ecs/${var.project_name}/web"
  retention_in_days = 30
  
  tags = {
    Name = "${var.project_name}-web-logs"
  }
}

resource "aws_cloudwatch_log_group" "news_api" {
  name              = "/ecs/${var.project_name}/news-api"
  retention_in_days = 30
  
  tags = {
    Name = "${var.project_name}-news-api-logs"
  }
}

resource "aws_cloudwatch_log_group" "ai_api" {
  name              = "/ecs/${var.project_name}/ai-api"
  retention_in_days = 30
  
  tags = {
    Name = "${var.project_name}-ai-api-logs"
  }
}

# ECS Task Definitions
resource "aws_ecs_task_definition" "web" {
  family                   = "${var.project_name}-web"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  
  container_definitions = jsonencode([
    {
      name  = "nginx"
      image = "${aws_ecr_repository.web.repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 80
          protocol      = "tcp"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.web.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      environment = [
        {
          name  = "ENVIRONMENT"
          value = var.environment
        }
      ]
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost/health || exit 1"]
        interval = 30
        timeout = 5
        retries = 3
      }
    }
  ])
}

resource "aws_ecs_task_definition" "news_api" {
  family                   = "${var.project_name}-news-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  
  container_definitions = jsonencode([
    {
      name  = "news-api"
      image = "${aws_ecr_repository.news_api.repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.news_api.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      environment = [
        {
          name  = "ENVIRONMENT"
          value = var.environment
        },
        {
          name  = "DATABASE_URL"
          value = "postgresql://${aws_db_instance.main.username}:${random_password.rds_password.result}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
        },
        {
          name  = "REDIS_URL"
          value = "redis://${aws_elasticache_replication_group.main.primary_endpoint_address}:6379"
        }
      ]
      
      secrets = [
        {
          name      = "NEWS_API_KEY"
          valueFrom = aws_ssm_parameter.news_api_key.arn
        },
        {
          name      = "OPENAI_API_KEY"
          valueFrom = aws_ssm_parameter.openai_api_key.arn
        }
      ]
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
        interval = 30
        timeout = 10
        retries = 3
      }
    }
  ])
}

resource "aws_ecs_task_definition" "ai_api" {
  family                   = "${var.project_name}-ai-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 2048
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  
  container_definitions = jsonencode([
    {
      name  = "ai-api"
      image = "${aws_ecr_repository.ai_api.repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 3001
          protocol      = "tcp"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ai_api.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      environment = [
        {
          name  = "ENVIRONMENT"
          value = var.environment
        },
        {
          name  = "REDIS_URL"
          value = "redis://${aws_elasticache_replication_group.main.primary_endpoint_address}:6379"
        }
      ]
      
      secrets = [
        {
          name      = "OPENAI_API_KEY"
          valueFrom = aws_ssm_parameter.openai_api_key.arn
        },
        {
          name      = "GROK_API_KEY"
          valueFrom = aws_ssm_parameter.grok_api_key.arn
        }
      ]
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"]
        interval = 30
        timeout = 15
        retries = 3
      }
    }
  ])
}

# ECS Services
resource "aws_ecs_service" "web" {
  name            = "${var.project_name}-web"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = var.web_desired_count
  
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 100
  }
  
  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private[*].id
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "nginx"
    container_port   = 80
  }
  
  depends_on = [aws_lb_listener.web_https]
}

resource "aws_ecs_service" "news_api" {
  name            = "${var.project_name}-news-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.news_api.arn
  desired_count   = var.api_desired_count
  
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 100
  }
  
  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private[*].id
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.news_api.arn
    container_name   = "news-api"
    container_port   = 3000
  }
  
  depends_on = [aws_lb_listener.web_https]
}

resource "aws_ecs_service" "ai_api" {
  name            = "${var.project_name}-ai-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.ai_api.arn
  desired_count   = var.ai_desired_count
  
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 100
  }
  
  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private[*].id
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.ai_api.arn
    container_name   = "ai-api"
    container_port   = 3001
  }
  
  depends_on = [aws_lb_listener.web_https]
}

# ECR Repositories
resource "aws_ecr_repository" "web" {
  name = "${var.project_name}/web"
  
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "news_api" {
  name = "${var.project_name}/news-api"
  
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "ai_api" {
  name = "${var.project_name}/ai-api"
  
  image_scanning_configuration {
    scan_on_push = true
  }
}

# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id
  
  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-postgres"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.rds_instance_class
  
  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  
  db_name  = "kaitech"
  username = "postgres"
  password = random_password.rds_password.result
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = var.environment == "prod" ? 7 : 1
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot       = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "${var.project_name}-final-snapshot" : null
  
  performance_insights_enabled = var.environment == "prod"
  monitoring_interval         = var.environment == "prod" ? 60 : 0
  
  tags = {
    Name = "${var.project_name}-postgres"
  }
}

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-redis-subnet-group"
  subnet_ids = aws_subnet.private[*].id
  
  tags = {
    Name = "${var.project_name}-redis-subnet-group"
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.project_name}-redis"
  description                = "Redis cluster for KaiTech"
  
  node_type            = var.redis_node_type
  port                 = 6379
  parameter_group_name = "default.redis7"
  
  num_cache_clusters = var.redis_num_cache_nodes
  
  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = random_password.redis_password.result
  
  automatic_failover_enabled = var.redis_num_cache_nodes > 1
  multi_az_enabled          = var.redis_num_cache_nodes > 1
  
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis.name
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }
  
  tags = {
    Name = "${var.project_name}-redis"
  }
}

resource "aws_cloudwatch_log_group" "redis" {
  name              = "/elasticache/${var.project_name}/redis"
  retention_in_days = 30
  
  tags = {
    Name = "${var.project_name}-redis-logs"
  }
}

# SSM Parameters for secrets
resource "aws_ssm_parameter" "rds_password" {
  name  = "/${var.project_name}/database/password"
  type  = "SecureString"
  value = random_password.rds_password.result
  
  tags = {
    Name = "${var.project_name}-rds-password"
  }
}

resource "aws_ssm_parameter" "redis_password" {
  name  = "/${var.project_name}/redis/password"
  type  = "SecureString"
  value = random_password.redis_password.result
  
  tags = {
    Name = "${var.project_name}-redis-password"
  }
}

resource "aws_ssm_parameter" "news_api_key" {
  name  = "/${var.project_name}/api/news-api-key"
  type  = "SecureString"
  value = "REPLACE_WITH_ACTUAL_KEY"
  
  tags = {
    Name = "${var.project_name}-news-api-key"
  }
  
  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "openai_api_key" {
  name  = "/${var.project_name}/api/openai-api-key"
  type  = "SecureString"
  value = "REPLACE_WITH_ACTUAL_KEY"
  
  tags = {
    Name = "${var.project_name}-openai-api-key"
  }
  
  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "grok_api_key" {
  name  = "/${var.project_name}/api/grok-api-key"
  type  = "SecureString"
  value = "REPLACE_WITH_ACTUAL_KEY"
  
  tags = {
    Name = "${var.project_name}-grok-api-key"
  }
  
  lifecycle {
    ignore_changes = [value]
  }
}

# Auto Scaling
resource "aws_appautoscaling_target" "news_api" {
  max_capacity       = var.api_max_capacity
  min_capacity       = var.api_min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.news_api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "news_api_cpu" {
  name               = "${var.project_name}-news-api-cpu-policy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.news_api.resource_id
  scalable_dimension = aws_appautoscaling_target.news_api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.news_api.service_namespace
  
  target_tracking_scaling_policy_configuration {
    target_value = 70.0
    
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

resource "aws_appautoscaling_target" "ai_api" {
  max_capacity       = var.ai_max_capacity
  min_capacity       = var.ai_min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.ai_api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ai_api_cpu" {
  name               = "${var.project_name}-ai-api-cpu-policy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ai_api.resource_id
  scalable_dimension = aws_appautoscaling_target.ai_api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ai_api.service_namespace
  
  target_tracking_scaling_policy_configuration {
    target_value = 60.0
    
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}
# KaiTech Infrastructure Variables

# Project Configuration
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "kaitech"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "domain_name" {
  description = "Primary domain name for the application"
  type        = string
  default     = "kaitech.example.com"
}

# Network Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

# ECS Configuration
variable "web_desired_count" {
  description = "Desired number of web service tasks"
  type        = number
  default     = 2
}

variable "api_desired_count" {
  description = "Desired number of API service tasks"
  type        = number
  default     = 2
}

variable "ai_desired_count" {
  description = "Desired number of AI service tasks"
  type        = number
  default     = 1
}

# Auto Scaling Configuration
variable "api_min_capacity" {
  description = "Minimum capacity for API services"
  type        = number
  default     = 1
}

variable "api_max_capacity" {
  description = "Maximum capacity for API services"
  type        = number
  default     = 10
}

variable "ai_min_capacity" {
  description = "Minimum capacity for AI service"
  type        = number
  default     = 1
}

variable "ai_max_capacity" {
  description = "Maximum capacity for AI service"
  type        = number
  default     = 5
}

# RDS Configuration
variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
  
  validation {
    condition = can(regex("^db\\.(t3|t4g|m5|m6i|r5|r6i)\\.(micro|small|medium|large|xlarge|2xlarge|4xlarge|8xlarge|12xlarge|16xlarge|24xlarge)$", var.rds_instance_class))
    error_message = "RDS instance class must be a valid AWS RDS instance type."
  }
}

variable "rds_allocated_storage" {
  description = "Initial storage for RDS instance (GB)"
  type        = number
  default     = 20
  
  validation {
    condition     = var.rds_allocated_storage >= 20 && var.rds_allocated_storage <= 65536
    error_message = "RDS allocated storage must be between 20 and 65536 GB."
  }
}

variable "rds_max_allocated_storage" {
  description = "Maximum storage for RDS instance (GB)"
  type        = number
  default     = 100
  
  validation {
    condition     = var.rds_max_allocated_storage >= 20 && var.rds_max_allocated_storage <= 65536
    error_message = "RDS max allocated storage must be between 20 and 65536 GB."
  }
}

# Redis Configuration
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
  
  validation {
    condition = can(regex("^cache\\.(t3|t4g|m5|m6i|r5|r6i|r6g)\\.(nano|micro|small|medium|large|xlarge|2xlarge|4xlarge|8xlarge|12xlarge|16xlarge|24xlarge)$", var.redis_node_type))
    error_message = "Redis node type must be a valid AWS ElastiCache node type."
  }
}

variable "redis_num_cache_nodes" {
  description = "Number of cache nodes in the Redis cluster"
  type        = number
  default     = 2
  
  validation {
    condition     = var.redis_num_cache_nodes >= 1 && var.redis_num_cache_nodes <= 6
    error_message = "Number of Redis cache nodes must be between 1 and 6."
  }
}

# API Keys (will be stored in SSM Parameter Store)
variable "news_api_key" {
  description = "API key for news service"
  type        = string
  default     = ""
  sensitive   = true
}

variable "openai_api_key" {
  description = "OpenAI API key for AI services"
  type        = string
  default     = ""
  sensitive   = true
}

variable "grok_api_key" {
  description = "Grok API key for AI services"
  type        = string
  default     = ""
  sensitive   = true
}

# Feature Flags
variable "enable_deletion_protection" {
  description = "Enable deletion protection for production resources"
  type        = bool
  default     = false
}

variable "enable_performance_insights" {
  description = "Enable RDS Performance Insights"
  type        = bool
  default     = false
}

variable "enable_enhanced_monitoring" {
  description = "Enable enhanced monitoring for RDS"
  type        = bool
  default     = false
}

variable "enable_multi_az" {
  description = "Enable Multi-AZ deployment for RDS"
  type        = bool
  default     = false
}

# Cost Optimization
variable "use_spot_instances" {
  description = "Use Spot instances for cost optimization (dev/staging only)"
  type        = bool
  default     = false
}

variable "backup_retention_days" {
  description = "Number of days to retain RDS backups"
  type        = number
  default     = 7
  
  validation {
    condition     = var.backup_retention_days >= 0 && var.backup_retention_days <= 35
    error_message = "Backup retention days must be between 0 and 35."
  }
}

# Monitoring Configuration
variable "log_retention_days" {
  description = "CloudWatch log retention period in days"
  type        = number
  default     = 30
  
  validation {
    condition = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.log_retention_days)
    error_message = "Log retention days must be one of the valid CloudWatch values."
  }
}

variable "enable_container_insights" {
  description = "Enable CloudWatch Container Insights for ECS"
  type        = bool
  default     = true
}

# Security Configuration
variable "enable_waf" {
  description = "Enable AWS WAF for the Application Load Balancer"
  type        = bool
  default     = false
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# SSL Configuration
variable "ssl_policy" {
  description = "SSL policy for the ALB"
  type        = string
  default     = "ELBSecurityPolicy-TLS-1-2-2017-01"
  
  validation {
    condition = contains([
      "ELBSecurityPolicy-TLS-1-0-2015-04",
      "ELBSecurityPolicy-TLS-1-1-2017-01",
      "ELBSecurityPolicy-TLS-1-2-2017-01",
      "ELBSecurityPolicy-TLS-1-2-Ext-2018-06",
      "ELBSecurityPolicy-FS-2018-06",
      "ELBSecurityPolicy-FS-1-1-2019-08",
      "ELBSecurityPolicy-FS-1-2-2019-08",
      "ELBSecurityPolicy-FS-1-2-Res-2019-08"
    ], var.ssl_policy)
    error_message = "SSL policy must be a valid ELB security policy."
  }
}

# Resource Tags
variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# Development Configuration
variable "enable_debug_logging" {
  description = "Enable debug logging for development"
  type        = bool
  default     = false
}

variable "enable_cors_all_origins" {
  description = "Enable CORS for all origins (development only)"
  type        = bool
  default     = false
}

# Database Configuration
variable "database_name" {
  description = "Name of the main database"
  type        = string
  default     = "kaitech"
  
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.database_name))
    error_message = "Database name must start with a letter and contain only letters, numbers, and underscores."
  }
}

variable "database_username" {
  description = "Database master username"
  type        = string
  default     = "postgres"
  
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.database_username))
    error_message = "Database username must start with a letter and contain only letters, numbers, and underscores."
  }
}

# Scaling Thresholds
variable "cpu_scale_up_threshold" {
  description = "CPU utilization threshold to scale up"
  type        = number
  default     = 70
  
  validation {
    condition     = var.cpu_scale_up_threshold > 0 && var.cpu_scale_up_threshold <= 100
    error_message = "CPU scale up threshold must be between 1 and 100."
  }
}

variable "cpu_scale_down_threshold" {
  description = "CPU utilization threshold to scale down"
  type        = number
  default     = 30
  
  validation {
    condition     = var.cpu_scale_down_threshold > 0 && var.cpu_scale_down_threshold <= 100
    error_message = "CPU scale down threshold must be between 1 and 100."
  }
}

# Health Check Configuration
variable "health_check_path" {
  description = "Health check path for services"
  type        = string
  default     = "/health"
}

variable "health_check_interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 30
  
  validation {
    condition     = var.health_check_interval >= 5 && var.health_check_interval <= 300
    error_message = "Health check interval must be between 5 and 300 seconds."
  }
}

variable "health_check_timeout" {
  description = "Health check timeout in seconds"
  type        = number
  default     = 5
  
  validation {
    condition     = var.health_check_timeout >= 2 && var.health_check_timeout <= 120
    error_message = "Health check timeout must be between 2 and 120 seconds."
  }
}

variable "healthy_threshold" {
  description = "Number of consecutive successful health checks required"
  type        = number
  default     = 2
  
  validation {
    condition     = var.healthy_threshold >= 2 && var.healthy_threshold <= 10
    error_message = "Healthy threshold must be between 2 and 10."
  }
}

variable "unhealthy_threshold" {
  description = "Number of consecutive failed health checks required"
  type        = number
  default     = 2
  
  validation {
    condition     = var.unhealthy_threshold >= 2 && var.unhealthy_threshold <= 10
    error_message = "Unhealthy threshold must be between 2 and 10."
  }
}
# Terraform Provider Configuration

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

  # Uncomment and configure for remote state management
  # backend "s3" {
  #   bucket         = "kaitech-terraform-state"
  #   key            = "infrastructure/terraform.tfstate"
  #   region         = "us-west-2"
  #   encrypt        = true
  #   dynamodb_table = "kaitech-terraform-locks"
  # }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region

  # Default tags to apply to all resources
  default_tags {
    tags = merge({
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Owner       = "kaitech"
      CreatedBy   = "terraform"
      Repository  = "ai-website-project"
    }, var.additional_tags)
  }
}

# Random provider for generating passwords and other random values
provider "random" {
  # No configuration needed
}

# Data source for AWS availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Data source for current AWS caller identity
data "aws_caller_identity" "current" {}

# Data source for current AWS region
data "aws_region" "current" {}

# Data source for AWS partition
data "aws_partition" "current" {}
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}
provider "aws" { region = "ap-northeast-1" }

resource "aws_s3_bucket" "site" {
  bucket = "terminal-prompt-customizer"
}

import {
  to = aws_s3_bucket.site
  id = "terminal-prompt-customizer"
}

# バケットへの直接の公開アクセスを全面ブロック(配信はCloudFront経由のみ)
resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

import {
  to = aws_s3_bucket_public_access_block.site
  id = "terminal-prompt-customizer"
}

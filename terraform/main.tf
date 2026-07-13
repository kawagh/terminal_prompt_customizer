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

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "oac-terminal-prompt-customizer.s3.ap-northeast-1.ama-mrhektuat4q"
  description                       = "Created by CloudFront"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

import {
  to = aws_cloudfront_origin_access_control.site
  id = "E2FQ0IX92W3P8O"
}

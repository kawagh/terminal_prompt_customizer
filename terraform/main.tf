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

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  comment             = "terminal-prompt-customizerのDistribution"
  default_root_object = "index.html"
  is_ipv6_enabled     = true
  tags = {
    "Name" = "terminal-prompt-customizer Distribution"
  }
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  origin {
    domain_name                 = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id    = aws_cloudfront_origin_access_control.site.id
    origin_id                   = "terminal-prompt-customizer.s3.ap-northeast-1.amazonaws.com-mrhei2h2naq"
    origin_path                 = "/dist"
    response_completion_timeout = 0
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  default_cache_behavior {
    target_origin_id = "terminal-prompt-customizer.s3.ap-northeast-1.amazonaws.com-mrhei2h2naq"
    allowed_methods  = ["GET", "HEAD"]
    # https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-caching-optimized
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }
}

import {
  to = aws_cloudfront_distribution.site
  id = "E22IE47AH08JW3"
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version = "2008-10-17"
    Id      = "PolicyForCloudFrontPrivateContent"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.site.arn}/*"
        Condition = {
          ArnLike = {
            "AWS:SourceArn" = aws_cloudfront_distribution.site.arn
          }
        }
      }
    ]
  })
}

import {
  to = aws_s3_bucket_policy.site
  id = "terminal-prompt-customizer"
}

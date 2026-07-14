terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
  backend "s3" {
    bucket       = "kawagh-tfstate"
    key          = "terminal-prompt-customizer/terraform.tfstate"
    region       = "ap-northeast-1"
    use_lockfile = true
  }
}
provider "aws" { region = "ap-northeast-1" }

# CloudFront用のACM証明書はus-east-1で発行する
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# ホストゾーンは他サイトと共用するので参照のみ
data "aws_route53_zone" "kawagh_net" {
  name = "kawagh.net"
}

locals {
  domain_name = "terminal-prompt-customizer.kawagh.net"
}

resource "aws_acm_certificate" "site" {
  provider          = aws.us_east_1
  domain_name       = local.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# ACMのDNS検証用レコード
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => dvo
  }

  zone_id = data.aws_route53_zone.kawagh_net.zone_id
  name    = each.value.resource_record_name
  type    = each.value.resource_record_type
  records = [each.value.resource_record_value]
  ttl     = 300
}

resource "aws_route53_record" "site" {
  zone_id = data.aws_route53_zone.kawagh_net.zone_id
  name    = local.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "site_ipv6" {
  zone_id = data.aws_route53_zone.kawagh_net.zone_id
  name    = local.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_s3_bucket" "site" {
  bucket = "terminal-prompt-customizer"
}

# バケットへの直接の公開アクセスを全面ブロック(配信はCloudFront経由のみ)
resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "oac-terminal-prompt-customizer.s3.ap-northeast-1.ama-mrhektuat4q"
  description                       = "Created by CloudFront"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

locals {
  s3_origin_id = "terminal-prompt-customizer.s3.ap-northeast-1.amazonaws.com-mrhei2h2naq"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  comment             = "terminal-prompt-customizerのDistribution"
  default_root_object = "index.html"
  is_ipv6_enabled     = true
  tags = {
    "Name" = "terminal-prompt-customizer Distribution"
  }
  aliases = [local.domain_name]
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.site.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.3_2025"
  }
  origin {
    domain_name                 = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id    = aws_cloudfront_origin_access_control.site.id
    origin_id                   = local.s3_origin_id
    origin_path                 = "/dist"
    response_completion_timeout = 0
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  default_cache_behavior {
    target_origin_id = local.s3_origin_id
    allowed_methods  = ["GET", "HEAD"]
    # https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-caching-optimized
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }
}

output "bucket_name" {
  value       = aws_s3_bucket.site.bucket
  description = "デプロイ先のS3バケット名"
}

output "distribution_id" {
  value       = aws_cloudfront_distribution.site.id
  description = "デプロイ時のキャッシュ削除に使うDistribution ID"
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

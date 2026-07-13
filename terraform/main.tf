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

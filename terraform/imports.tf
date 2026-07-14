data "aws_caller_identity" "current" {}

import {
  to = aws_acm_certificate.site
  id = "arn:aws:acm:us-east-1:${data.aws_caller_identity.current.account_id}:certificate/980b13b7-a644-4952-83a3-a531df3087a7"
}

import {
  to = aws_route53_record.cert_validation["terminal-prompt-customizer.kawagh.net"]
  id = "Z02617644EYNJZFO3AHP__d42e7e40c24b46dabf6e20858cfc9d15.terminal-prompt-customizer.kawagh.net_CNAME"
}

import {
  to = aws_route53_record.site
  id = "Z02617644EYNJZFO3AHP_terminal-prompt-customizer.kawagh.net_A"
}

import {
  to = aws_route53_record.site_ipv6
  id = "Z02617644EYNJZFO3AHP_terminal-prompt-customizer.kawagh.net_AAAA"
}

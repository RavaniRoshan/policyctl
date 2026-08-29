# typed: false
# frozen_string_literal: true
#
# Homebrew formula for policyctl — provider-agnostic policy runtime for coding agents.
# Repository: https://github.com/policyctl/policyctl
# Tap: https://github.com/policyctl/homebrew-tap
class Policyctl < Formula
  desc "Provider-agnostic policy runtime for coding agents"
  homepage "https://github.com/RavaniRoshan/policyctl"
  url "https://registry.npmjs.org/@policyctl/cli/-/cli-0.1.0.tgz"
  sha256 "REPLACE_AT_RELEASE"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.local_npm_args(libexec)
    libexec.install Dir["*"]
    bin.install_symlink libexec/"bin/policyctl"
  end

  test do
    assert_match "policyctl", shell_output("#{bin}/policyctl --help")
  end
end

# frozen_string_literal: true

require 'minitest/autorun'
require_relative 'autorca'

class TestAutoRCARubySDK < Minitest::Test
  def setup
    @client = AutoRCA::Client.new(
      endpoint: 'https://autorca.company.com',
      api_key: 'rb-token-999',
      tenant_id: 'org-rails',
      project_id: 'proj-api',
      target_repo: 'acme/rails-api'
    )
  end

  def test_initialization_defaults
    assert_equal 'https://autorca.company.com', @client.endpoint
    assert_equal 'rb-token-999', @client.api_key
    assert_equal 'org-rails', @client.tenant_id
  end
end

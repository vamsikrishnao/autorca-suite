# frozen_string_literal: true

require 'net/http'
require 'json'
require 'uri'

module AutoRCA
  class Client
    attr_reader :endpoint, :api_key, :tenant_id, :project_id, :target_repo, :target_branch

    def initialize(endpoint:, api_key: nil, tenant_id: 'org-acme-corp', project_id: 'proj-main', target_repo: '', target_branch: 'main')
      @endpoint = endpoint.chomp('/')
      @api_key = api_key || ENV['AUTORCA_API_KEY']
      @tenant_id = tenant_id || ENV['AUTORCA_TENANT_ID'] || 'org-acme-corp'
      @project_id = project_id || ENV['AUTORCA_PROJECT_ID'] || 'proj-main'
      @target_repo = target_repo || ENV['AUTORCA_TARGET_REPO'] || ''
      @target_branch = target_branch || ENV['AUTORCA_TARGET_BRANCH'] || 'main'
    end

    def dispatch_investigation(title:, error_message:, stack_trace: nil, harness_command: 'bundle exec rake test', metadata: {})
      uri = URI.parse("#{@endpoint}/api/worktree/dispatch")
      payload = {
        bugId: "RUBY-#{Time.now.to_i}",
        title: title,
        errorMessage: error_message,
        stackTrace: stack_trace,
        repoUrl: @target_repo,
        branchName: @target_branch,
        tenantId: @tenant_id,
        projectId: @project_id,
        harnessCommand: harness_command,
        metadata: metadata
      }

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = (uri.scheme == 'https')
      http.open_timeout = 5
      http.read_timeout = 5

      request = Net::HTTP::Post.new(uri.path, {
        'Content-Type' => 'application/json',
        'x-tenant-id' => @tenant_id,
        'x-project-id' => @project_id
      })
      request['Authorization'] = "Bearer #{@api_key}" if @api_key

      request.body = payload.to_json
      response = http.request(request)

      JSON.parse(response.body) rescue { 'success' => false, 'code' => response.code }
    rescue StandardError => e
      warn "[AutoRCA Ruby SDK] Failed to dispatch investigation: #{e.message}"
      { 'success' => false, 'error' => e.message }
    end
  end

  # Rack / Rails Exception Handler Middleware
  class RackMiddleware
    def initialize(app, options = {})
      @app = app
      @client = options[:client] || AutoRCA::Client.new(endpoint: ENV.fetch('AUTORCA_ENDPOINT', 'http://localhost:3000'))
    end

    def call(env)
      @app.call(env)
    rescue StandardError => exception
      Thread.new do
        @client.dispatch_investigation(
          title: exception.class.name,
          error_message: exception.message,
          stack_trace: exception.backtrace&.join("\n"),
          metadata: { path: env['PATH_INFO'], method: env['REQUEST_METHOD'] }
        )
      end
      raise exception
    end
  end
end

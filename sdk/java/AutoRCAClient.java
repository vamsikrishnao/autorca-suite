package com.autorca.sdk;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * AutoRCA Lightweight Java SDK Client
 * Plug-and-play client for Spring Boot / Java microservices to dispatch automated RCA investigations.
 */
public class AutoRCAClient {

    private final String endpoint;
    private final String apiKey;
    private final String tenantId;
    private final String projectId;
    private final String targetRepo;
    private final String targetBranch;
    private final HttpClient httpClient;

    public AutoRCAClient(String endpoint, String apiKey, String tenantId, String projectId, String targetRepo, String targetBranch) {
        this.endpoint = endpoint.replaceAll("/$", "");
        this.apiKey = apiKey;
        this.tenantId = tenantId != null ? tenantId : "org-acme-corp";
        this.projectId = projectId != null ? projectId : "proj-main";
        this.targetRepo = targetRepo != null ? targetRepo : "";
        this.targetBranch = targetBranch != null ? targetBranch : "main";
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public boolean dispatchIncident(String title, String errorMessage, String stackTrace, String harnessCommand) {
        try {
            String jsonPayload = String.format(
                "{\"bugId\":\"JAVA-%d\",\"title\":\"%s\",\"errorMessage\":\"%s\",\"stackTrace\":\"%s\",\"repoUrl\":\"%s\",\"branchName\":\"%s\",\"tenantId\":\"%s\",\"projectId\":\"%s\",\"harnessCommand\":\"%s\"}",
                System.currentTimeMillis(),
                escapeJson(title),
                escapeJson(errorMessage),
                escapeJson(stackTrace),
                escapeJson(this.targetRepo),
                escapeJson(this.targetBranch),
                escapeJson(this.tenantId),
                escapeJson(this.projectId),
                escapeJson(harnessCommand != null ? harnessCommand : "mvn test")
            );

            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(this.endpoint + "/api/worktree/dispatch"))
                    .header("Content-Type", "application/json")
                    .header("x-tenant-id", this.tenantId)
                    .header("x-project-id", this.projectId)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload));

            if (this.apiKey != null && !this.apiKey.isBlank()) {
                builder.header("Authorization", "Bearer " + this.apiKey);
            }

            HttpResponse<String> response = this.httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            return response.statusCode() >= 200 && response.statusCode() < 300;
        } catch (Exception e) {
            System.err.println("[AutoRCA Java SDK] Error dispatching incident: " + e.getMessage());
            return false;
        }
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }
}

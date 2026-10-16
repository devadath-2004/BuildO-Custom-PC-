package com.buildo.dto;

public class CompatibilityIssue {
    public enum Severity {
        ERROR,
        WARNING
    }

    private Severity severity;
    private String title;
    private String message;
    private String componentA;
    private String componentB;
    private String suggestion;

    public CompatibilityIssue() {}

    public CompatibilityIssue(Severity severity, String title, String message, String componentA, String componentB, String suggestion) {
        this.severity = severity;
        this.title = title;
        this.message = message;
        this.componentA = componentA;
        this.componentB = componentB;
        this.suggestion = suggestion;
    }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getComponentA() { return componentA; }
    public void setComponentA(String componentA) { this.componentA = componentA; }

    public String getComponentB() { return componentB; }
    public void setComponentB(String componentB) { this.componentB = componentB; }

    public String getSuggestion() { return suggestion; }
    public void setSuggestion(String suggestion) { this.suggestion = suggestion; }
}

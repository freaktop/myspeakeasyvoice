## Java CI matrix explanation

This repository now runs builds using a Java matrix (Java 17 and Java 21) in the Android GitHub Actions workflow.

What this does:
- Each CI job runs twice (once with Java 17 and once with Java 21) so we maintain compatibility and verify Java 21 works as the primary target.
- We intentionally keep Gradle toolchains enabled in the project so that Gradle can auto-provision JDK 21 for the build when necessary.

Local action items:
- If you want to run the same builds locally with the current wrapper configuration, update your Gradle wrapper using `scripts/upgrade-gradle-wrapper.ps1` (Windows) or the equivalent Gradle invocation.
- Ensure `JAVA_HOME` is set if you want a specific JDK (17 vs 21) locally. The Gradle toolchain and the `org.gradle.java.installations.auto-download` property will also try to provision toolchains automatically.
